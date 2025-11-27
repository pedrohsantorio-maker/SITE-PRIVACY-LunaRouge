'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, Users, Rss, ChevronDown, ChevronUp, MoreVertical, Image as ImageIcon, Video, Lock, Check, Newspaper, Bookmark, DollarSign, Eye, X, PlayCircle, Camera, VideoOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentData, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Inline SVG for social icons to avoid installing a new library
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
);

const CommentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

type Photo = {
    id: string;
    url: string;
    hint: string;
    width: number;
    height: number;
}

type VideoItem = {
    id: string;
    url: string;
    thumbnailUrl: string;
    hint: string;
    width: number;
    height: number;
};

type GalleryItem = {
    id: string;
    url: string;
    thumbnailUrl?: string;
    hint: string;
    width: number;
    height: number;
    type: 'image' | 'video';
};

type SubscriptionPlan = {
  name: string;
  price: string;
  id: string;
  paymentUrl?: string;
  duration: string;
  equivalentPrice?: string;
  discountTag?: string;
  isFeatured?: boolean;
}

type ModelData = {
    name: string;
    handle: string;
    isVerified: boolean;
    avatarUrl: string;
    avatarHint: string;
    bannerUrl: string;
    bannerHint: string;
    bio: string;
    stats: {
        posts: number;
        videos: number;
        likes: number;
        previews: number;
        photos: number;
    };
    socials: {
        instagram: string;
    };
    subscriptions: SubscriptionPlan[];
    promotions: SubscriptionPlan[];
    photos: Photo[];
    videos: VideoItem[];
    previewsGallery: GalleryItem[];
};

function FormattedStat({ value }: { value: number }) {
    const [formattedValue, setFormattedValue] = useState<string | number>(value);

    useEffect(() => {
        if (typeof value === 'number') {
            if (value >= 1000) {
                setFormattedValue((value / 1000).toFixed(1) + 'K');
            } else {
                setFormattedValue(value.toLocaleString('pt-BR'));
            }
        }
    }, [value]);

    return <span>{formattedValue}</span>;
}

const LockedContent = ({ onUnlockClick }: { onUnlockClick: () => void }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg mt-4">
        <Lock className="w-12 h-12 text-primary" />
        <h3 className="mt-4 text-xl font-bold">Conteúdo Exclusivo</h3>
        <p className="mt-2 text-muted-foreground">Assine um de nossos planos para desbloquear fotos e vídeos exclusivos.</p>
        <Button onClick={onUnlockClick} className="mt-6 font-bold btn-glow">
            Ver Planos de Assinatura
        </Button>
    </div>
);


export function DashboardClient({ model }: { model: ModelData }) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [playingVideo, setPlayingVideo] = useState<VideoItem | GalleryItem | null>(null);
    const [revealedPreviews, setRevealedPreviews] = useState<string[]>([]);
    const [watchedPreviews, setWatchedPreviews] = useState<string[]>([]);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('previews');
    const pageTopRef = useRef<HTMLDivElement>(null);
    const subscriptionsRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();


    // --- Subscription Logic ---
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    // Anonymous User Handling
    useEffect(() => {
        if (!isUserLoading && user && user.isAnonymous && firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            getDoc(userDocRef).then(async (docSnap) => {
                if (!docSnap.exists()) {
                     await setDoc(userDocRef, {
                        id: user.uid,
                        name: 'Visitante',
                        email: `${user.uid}@anon.com`, 
                        subscriptionId: 'null',
                        status: 'not_paid',
                        createdAt: serverTimestamp(),
                        lastActive: serverTimestamp()
                    }, { merge: true });
                }
            });
        }
    }, [isUserLoading, user, firestore]);

    // Get user data to find the subscriptionId
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

    // Get subscription data using the subscriptionId from the user data
    const subscriptionDocRef = useMemoFirebase(() => {
        if (!firestore || !userData?.subscriptionId || userData.subscriptionId === 'null') {
            return null;
        }
        return doc(firestore, 'subscriptions', userData.subscriptionId);
    }, [firestore, userData]);

    const { data: subscriptionData, isLoading: isSubLoading } = useDoc(subscriptionDocRef);
    
    const isSubscribed = subscriptionData?.status === 'active';
    const isLoadingSubscription = isUserLoading || isUserDocLoading || isSubLoading;
    // --- End Subscription Logic ---

    const handleUnlockClick = () => {
        subscriptionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const overlayTexts = [
        "Um gostinho do que você vai receber...",
        "Se aqui já está assim, imagina no conteúdo exclusivo!",
        "Curioso? assine para ver mais",
        "Isso é só o começo. O melhor está lá dentro.",
    ];

    const getOverlayText = (id: string) => {
        const index = parseInt(id.replace('gallery-preview-', ''), 10) % overlayTexts.length;
        return overlayTexts[index];
    };

    const handlePreviewClick = (item: GalleryItem) => {
        if (item.type === 'video' && watchedPreviews.includes(item.id)) {
            toast({
                title: "Prévia já assistida!",
                description: "Assine um plano para ver este e outros vídeos quantas vezes quiser.",
                variant: "destructive"
            });
            return;
        }

        if (revealedPreviews.includes(item.id)) {
            if (item.type === 'video') {
                setPlayingVideo(item);
            }
        } else {
            setRevealedPreviews(prev => [...prev, item.id]);
        }
    };

    const handleVideoEnded = (item: GalleryItem | VideoItem | null) => {
        if (item && item.id.startsWith('gallery-preview-')) {
            setWatchedPreviews(prev => [...prev, item.id]);
        }
        setPlayingVideo(null); // Close player
    };


    const allPlans = [...model.subscriptions, ...model.promotions];
    const durationMap: { [key: string]: number } = { '1 mês': 1, '3 meses': 3, '6 meses': 6 };


    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-2xl space-y-4">
                <div ref={pageTopRef} />
                <Card className="bg-[#121212] rounded-none sm:rounded-2xl overflow-hidden border-none sm:border-neutral-800">
                    <CardContent className="p-0">
                        {/* Header with Banner */}
                        <div className="relative">
                            <div className="absolute top-4 left-4 font-bold text-lg">{model.name}</div>
                            <div className="absolute top-4 right-4">
                                <MoreVertical />
                            </div>
                            <Image
                                src={model.bannerUrl}
                                alt={model.bannerHint}
                                data-ai-hint={model.bannerHint}
                                width={448}
                                height={150}
                                className="w-full h-[150px] object-cover"
                                style={{ objectPosition: 'center 60%' }}
                            />
                            <div className="absolute -bottom-12 left-4">
                                <button onClick={() => setIsProfileModalOpen(true)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#121212]">
                                    <Image
                                        src={model.avatarUrl}
                                        alt={`Foto de perfil de ${model.name}`}
                                        data-ai-hint={model.avatarHint}
                                        width={100}
                                        height={100}
                                        className="rounded-full border-4 border-[#121212] cursor-pointer"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="px-4 pb-4 pt-14">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold">{model.name}</h1>
                                {model.isVerified &&
                                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-black" />
                                    </div>
                                }
                            </div>
                            <p className="text-sm text-neutral-400">@{model.handle}</p>
                            
                            <p className="mt-2 text-sm text-neutral-300">
                                {model.bio}
                                <button className="text-primary ml-1 font-semibold">Ler mais</button>
                            </p>

                            <div className="flex items-center gap-3 mt-4">
                               <a href={model.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><InstagramIcon className="w-5 h-5"/></a>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                 {/* Tabs Section */}
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-4 sm:px-0">
                    <TabsList className="grid w-full grid-cols-3 bg-card rounded-xl h-12">
                        <TabsTrigger value="previews" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg text-neutral-400 text-xs sm:text-sm">
                            <Eye size={16} /> {model.stats.previews} Prévias
                        </TabsTrigger>
                        <TabsTrigger value="photos" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg text-neutral-400 text-xs sm:text-sm">
                           <Camera size={16} /> {model.stats.photos} Fotos
                           {!isSubscribed && <Lock className="w-3 h-3 ml-1" />}
                        </TabsTrigger>
                        <TabsTrigger value="videos" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg text-neutral-400 text-xs sm:text-sm">
                            <Video size={16} /> {model.stats.videos} Vídeos
                             {!isSubscribed && <Lock className="w-3 h-3 ml-1" />}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="previews" className="mt-4">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                             {model.previewsGallery.map(item => {
                                const isRevealed = revealedPreviews.includes(item.id);
                                const isWatched = item.type === 'video' && watchedPreviews.includes(item.id);
                                return (
                                    <Card key={item.id} onClick={() => handlePreviewClick(item)} className="bg-card rounded-xl overflow-hidden border-border shadow-lg cursor-pointer transition-all duration-300 hover:shadow-primary/40 hover:scale-105">
                                        <div className="relative group">
                                            <Image 
                                                src={item.type === 'video' ? item.thumbnailUrl! : item.url}
                                                alt={item.hint}
                                                data-ai-hint={item.hint}
                                                width={item.width}
                                                height={item.height}
                                                className={cn(
                                                    'object-cover w-full h-auto aspect-square transition-all duration-500',
                                                    !isRevealed ? 'blur-lg' : 'blur-none',
                                                    isWatched ? 'grayscale' : ''
                                                )}
                                            />
                                            {/* Not Revealed Overlay */}
                                            {!isRevealed && (
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-2 sm:p-4 transition-opacity duration-300">
                                                    <p className="text-white font-semibold text-xs sm:text-sm">{getOverlayText(item.id)}</p>
                                                    <p className="text-primary font-bold text-xs mt-2 uppercase animate-pulse-reveal">Clique para revelar</p>
                                                </div>
                                            )}
                                            {/* Revealed Video - Not Watched */}
                                            {isRevealed && !isWatched && item.type === 'video' && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <PlayCircle size={48} className="text-white" />
                                                </div>
                                            )}
                                             {/* Watched Video Overlay */}
                                            {isWatched && (
                                                 <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4">
                                                    <Lock className="w-10 h-10 text-primary" />
                                                    <p className="text-white font-bold text-sm mt-2">Assine para ver mais</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>
                    <TabsContent value="photos" className="mt-4">
                        {isLoadingSubscription ? (
                            <div className="flex items-center justify-center p-8"><p>Verificando acesso...</p></div>
                        ) : isSubscribed ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                                {model.photos.map(photo => (
                                    <Card key={photo.id} onClick={() => setSelectedPhotoUrl(photo.url)} className="bg-card rounded-xl overflow-hidden border-border shadow-lg cursor-pointer transition-transform hover:scale-105">
                                        <div className="relative">
                                            <Image 
                                                src={photo.url}
                                                alt={photo.hint}
                                                data-ai-hint={photo.hint}
                                                width={photo.width}
                                                height={photo.height}
                                                className="object-cover w-full h-auto aspect-square"
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <LockedContent onUnlockClick={handleUnlockClick} />
                        )}
                    </TabsContent>
                    <TabsContent value="videos" className="mt-4">
                         {isLoadingSubscription ? (
                            <div className="flex items-center justify-center p-8"><p>Verificando acesso...</p></div>
                        ) : isSubscribed ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                                {model.videos.map(video => (
                                    <Card key={video.id} onClick={() => setPlayingVideo(video)} className="bg-card rounded-xl overflow-hidden border-border shadow-lg cursor-pointer transition-all duration-300 hover:shadow-primary/40 hover:scale-105">
                                        <div className="relative group">
                                            <Image 
                                                src={video.thumbnailUrl}
                                                alt={video.hint}
                                                data-ai-hint={video.hint}
                                                width={video.width}
                                                height={video.height}
                                                className="object-cover w-full h-auto aspect-square"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle size={48} className="text-white" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                             <LockedContent onUnlockClick={handleUnlockClick} />
                        )}
                    </TabsContent>
                </Tabs>
                
                {/* Subscriptions & Promotions */}
                <div ref={subscriptionsRef} className="px-4 sm:px-0 py-8">
                  <Card className="bg-card border-border p-6 rounded-2xl">
                      <h2 className="text-xl font-bold text-center mb-2">OFERTA LIMITADA</h2>
                      <p className="text-center text-muted-foreground mb-6">Acesso imediato ao conteúdo pago!</p>
                      <div className="flex flex-col gap-4">
                          {allPlans.sort((a,b) => durationMap[a.duration] - durationMap[b.duration]).map(plan => (
                              <div 
                                  key={plan.id}
                                  className={cn(
                                      "relative bg-[#1c1c1c] rounded-xl p-4 text-center border transition-all duration-300",
                                      plan.isFeatured ? "border-primary shadow-lg shadow-primary/20" : "border-neutral-800"
                                  )}
                              >
                                  {plan.discountTag && (
                                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                          <div className="bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                                              {plan.discountTag}
                                          </div>
                                      </div>
                                  )}
                                  <p className="font-semibold text-base mb-1">{plan.duration}</p>
                                  <p className="text-3xl font-bold mb-1">
                                      R$ {plan.price}
                                  </p>
                                  {plan.equivalentPrice && (
                                    <p className="text-muted-foreground text-xs mb-4">{plan.equivalentPrice}</p>
                                  )}
                                  <Button asChild className="w-full font-bold btn-glow" size="lg">
                                     <Link href={plan.paymentUrl || "/pagamento"} target={plan.paymentUrl ? "_blank" : "_self"}>
                                        Escolha o Plano
                                     </Link>
                                  </Button>
                              </div>
                          ))}
                      </div>
                  </Card>
                </div>
            </div>

            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogContent className="p-0 bg-transparent border-0 max-w-lg w-full">
                    <DialogTitle className="sr-only">Foto de Perfil de {model.name}</DialogTitle>
                    <div className="relative">
                        <Image
                            src={model.avatarUrl}
                            alt={`Foto de perfil de ${model.name}`}
                            width={512}
                            height={512}
                            className="rounded-lg w-full h-auto"
                        />
                         <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 text-white">
                            <X size={20} />
                            <span className="sr-only">Fechar</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {playingVideo && (
                <Dialog open={!!playingVideo} onOpenChange={(isOpen) => !isOpen && setPlayingVideo(null)}>
                    <DialogContent className="p-0 bg-black border-0 max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl w-auto h-auto max-h-[90vh]">
                         <DialogTitle className="sr-only">Player de Vídeo</DialogTitle>
                         <div className="relative flex items-center justify-center">
                            <video 
                                src={playingVideo.url} 
                                controls 
                                autoPlay 
                                onEnded={() => handleVideoEnded(playingVideo)}
                                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                                style={{
                                    aspectRatio: `${playingVideo.width}/${playingVideo.height}`
                                }}
                            />
                         </div>
                    </DialogContent>
                </Dialog>
            )}

            {selectedPhotoUrl && (
                 <Dialog open={!!selectedPhotoUrl} onOpenChange={(isOpen) => !isOpen && setSelectedPhotoUrl(null)}>
                    <DialogContent className="p-0 bg-transparent border-0 max-w-lg w-full">
                         <DialogTitle className="sr-only">Visualizador de Foto</DialogTitle>
                         <div className="relative">
                            <Image
                                src={selectedPhotoUrl}
                                alt="Foto em tamanho real"
                                width={800}
                                height={1000}
                                className="rounded-lg w-full h-auto object-contain max-h-[90vh]"
                            />
                         </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
