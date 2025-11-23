'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Users, Rss, ChevronDown, ChevronUp, MoreVertical, Image as ImageIcon, Video, Lock, Check, Newspaper, Bookmark, DollarSign, Eye, X, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Inline SVG for social icons to avoid installing a new library
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
);

const CommentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

type Post = {
    id: string;
    isLocked: boolean;
    stats: {
        images: number;
        videos: number;
        likes: number;
    }
}

type GalleryItem = {
    id: string;
    url: string;
    thumbnailUrl?: string;
    hint: string;
    width: number;
    height: number;
    type: 'image' | 'video';
};

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
        media: number;
        likes: number;
        previews: number;
    };
    socials: {
        instagram: string;
    };
    subscriptions: {
        name: string;
        price: string;
        id: string;
    }[];
    promotions: {
        name: string;
        price: string;
        discount: string;
        id: string;
    }[];
    posts: Post[];
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

function UrgencyPopup({ count, isVisible, onClose, onOpen, isMinimized }: { count: number; isVisible: boolean; onClose: () => void; onOpen: () => void; isMinimized: boolean; }) {
    if (!isVisible) return null;

    if (isMinimized) {
        return (
            <div className="popup-minimized-message">
                <p>Aproveite a oportunidade, só mais <span id="remaining-count-minimized">{count}</span> assinaturas!</p>
                <button onClick={onClose} className="popup-button">Fechar</button>
            </div>
        );
    }
    
    return (
        <div className="popup-container animate-pulse-popup">
            <div className="popup-content animate-glow">
                <span onClick={onClose} className="popup-close">&times;</span>
                <h2>As assinaturas estão acabando!</h2>
                <p>Só mais <span id="popup-count">{count}</span> assinaturas com este valor.</p>
            </div>
        </div>
    );
}

function UrgencyPromotion() {
    const [remainingCount, setRemainingCount] = useState(11);
    const [isBlinking, setIsBlinking] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isPopupMinimized, setIsPopupMinimized] = useState(false);

    useEffect(() => {
        const hasBeenMinimized = sessionStorage.getItem('popupMinimized') === 'true';
        if (hasBeenMinimized) {
            setShowPopup(true);
            setIsPopupMinimized(true);
        } else {
             const initialTimeout = setTimeout(() => {
                const interval = setInterval(() => {
                    setRemainingCount(prevCount => {
                        const newCount = prevCount > 4 ? prevCount - 1 : prevCount;

                        if ((newCount === 4 || newCount === 3) && !isPopupMinimized && !sessionStorage.getItem('popupMinimized')) {
                            setShowPopup(true);
                        }
                        
                        setIsBlinking(true);
                        setTimeout(() => setIsBlinking(false), 1000);

                        if (newCount <= 3) {
                            clearInterval(interval);
                        }

                        return newCount;
                    });
                }, Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000);

                return () => clearInterval(interval);
            }, Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000);
            
            return () => clearTimeout(initialTimeout);
        }
    }, [isPopupMinimized]);

    const handleClosePopup = () => {
        if (!isPopupMinimized) {
            setIsPopupMinimized(true);
            sessionStorage.setItem('popupMinimized', 'true');
        } else {
            setShowPopup(false);
        }
    };

    const handleOpenPopup = () => {
        setIsPopupMinimized(false);
        sessionStorage.removeItem('popupMinimized'); 
    };

    return (
        <>
            <UrgencyPopup 
                count={remainingCount} 
                isVisible={showPopup} 
                onClose={handleClosePopup}
                onOpen={handleOpenPopup}
                isMinimized={isPopupMinimized}
            />
            <p className="text-sm text-neutral-400 mt-1">
                Só mais <span id="remaining-count" className={isBlinking ? 'animate-blink' : ''}>{remainingCount}</span> assinaturas com este valor.
            </p>
        </>
    );
}


export function DashboardClient({ model }: { model: ModelData }) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4">
                <Card className="bg-[#121212] rounded-2xl overflow-hidden border-neutral-800">
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
                                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-black" />
                                    </div>
                                }
                            </div>
                            <p className="text-sm text-neutral-400">@{model.handle}</p>
                            
                            <p className="mt-2 text-sm text-neutral-300">
                                {model.bio}
                                <button className="text-orange-400 ml-1 font-semibold">Ler mais</button>
                            </p>

                            <div className="flex items-center gap-3 mt-4">
                               <a href={model.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><InstagramIcon className="w-5 h-5"/></a>
                            </div>
                        </div>

                        {/* Subscriptions & Promotions */}
                        <div className="px-4 pb-4 space-y-4">
                            <div className="mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-orange-400 text-lg animate-pulse-orange uppercase">aproveite a oportunidade</h3>
                                </div>
                                <UrgencyPromotion />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-neutral-400 mb-2">Assinaturas</h2>
                                {model.subscriptions.map(sub => (
                                    <Button key={sub.id} asChild className="w-full justify-between h-12 text-md font-semibold bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl">
                                        <Link href="/pagamento">
                                          <span>{sub.name}</span>
                                          <span>R$ {sub.price}</span>
                                        </Link>
                                    </Button>
                                ))}
                            </div>

                            <Accordion type="single" collapsible defaultValue='item-1' className="w-full">
                              <AccordionItem value="item-1" className="border-none">
                                <AccordionTrigger className="text-sm font-semibold text-neutral-400 hover:no-underline [&[data-state=open]>svg]:text-orange-400">
                                  Promoções
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                   {model.promotions.map(promo => (
                                    <Button key={promo.id} asChild variant="secondary" className="w-full justify-between h-12 text-md font-semibold bg-[#27272A] text-white rounded-xl hover:bg-neutral-700">
                                        <Link href="/pagamento">
                                          <span>{promo.name} ({promo.discount})</span>
                                          <span>R$ {promo.price}</span>
                                        </Link>
                                    </Button>
                                   ))}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                        </div>
                    </CardContent>
                </Card>

                {/* Posts Section */}
                 <Tabs defaultValue="previews" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-[#121212] rounded-xl h-12">
                        <TabsTrigger value="previews" className="flex items-center gap-2 data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg text-neutral-400">
                            <Eye size={16} /> {model.stats.previews} Prévias
                        </TabsTrigger>
                        <TabsTrigger value="posts" className="flex items-center gap-2 data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg text-neutral-400">
                           <Newspaper size={16} /> {model.stats.posts} Postagens
                        </TabsTrigger>
                        <TabsTrigger value="media" className="flex items-center gap-2 data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg text-neutral-400">
                            <ImageIcon size={16} /> {model.stats.media} Mídias
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="previews" className="mt-4">
                        <div className="grid grid-cols-2 gap-2">
                            {model.previewsGallery.map(item => (
                                <Card key={item.id} onClick={() => item.type === 'video' && setPlayingVideoUrl(item.url)} className="bg-[#121212] rounded-xl overflow-hidden border-neutral-800 shadow-md aspect-square cursor-pointer">
                                    <div className="relative w-full h-full group">
                                        <Image 
                                            src={item.type === 'video' ? item.thumbnailUrl! : item.url}
                                            alt={item.hint}
                                            data-ai-hint={item.hint}
                                            fill
                                            className="object-cover"
                                        />
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle size={48} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="posts">
                        {model.posts.map(post => (
                        <div key={post.id}>
                          <Card className="bg-[#121212] rounded-2xl overflow-hidden border-neutral-800 mt-4">
                              <CardContent className="p-0">
                                  <div className="p-4 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <Image src={model.avatarUrl} alt={model.avatarHint} width={40} height={40} className="rounded-full"/>
                                          <div>
                                              <div className="flex items-center gap-1">
                                                  <p className="font-bold">{model.name}</p>
                                                   {model.isVerified &&
                                                      <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                                                          <Check size={10} className="text-black" />
                                                      </div>
                                                  }
                                              </div>
                                              <p className="text-sm text-neutral-400">@{model.handle}</p>
                                          </div>
                                      </div>
                                      <MoreVertical className="text-neutral-400"/>
                                  </div>
                                  
                                  {post.isLocked && (
                                      <div className="bg-[#F3EFEA] aspect-square w-full flex flex-col items-center justify-center text-neutral-500">
                                          <Lock size={64} className="mb-4"/>
                                          <div className="flex items-center gap-4 text-sm">
                                              <div className="flex items-center gap-1"><ImageIcon size={16}/> {post.stats.images}</div>
                                              <div className="flex items-center gap-1"><Video size={16}/> {post.stats.videos}</div>
                                              <div className="flex items-center gap-1"><Heart size={16}/> <FormattedStat value={post.stats.likes} /></div>
                                          </div>
                                      </div>
                                  )}

                                  <div className="p-4 flex justify-between items-center text-neutral-400">
                                      <div className="flex items-center gap-4">
                                          <Heart size={24} />
                                          <CommentIcon className="w-6 h-6"/>
                                          <DollarSign size={24} />
                                      </div>
                                      <Bookmark size={24}/>
                                  </div>
                              </CardContent>
                          </Card>
                        </div>
                        ))}
                    </TabsContent>
                    <TabsContent value="media">
                         <Card className="bg-[#121212] rounded-2xl border-neutral-800 mt-4 h-48 flex items-center justify-center">
                            <CardContent>
                                <p className="text-neutral-400">Conteúdo de mídia desbloqueado aqui.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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

            {playingVideoUrl && (
                <Dialog open={!!playingVideoUrl} onOpenChange={(isOpen) => !isOpen && setPlayingVideoUrl(null)}>
                    <DialogContent className="p-0 bg-black border-0 max-w-screen-sm w-full">
                         <DialogTitle className="sr-only">Player de Vídeo</DialogTitle>
                         <div className="relative aspect-video">
                            <video src={playingVideoUrl} controls autoPlay className="w-full h-full rounded-lg" />
                         </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
