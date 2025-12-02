'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, Users, Rss, ChevronDown, ChevronUp, MoreVertical, Image as ImageIcon, Video, Lock, Check, Newspaper, Bookmark, DollarSign, Eye, X, PlayCircle, Camera, VideoOff, ArrowRight, Sparkles, Crown, Flame, AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { DocumentData } from 'firebase/firestore';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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

type Plan = {
  id: string;
  name: string;
  price: string;
  paymentUrl?: string;
  tags?: string[];
  isFeatured?: boolean;
  icon?: string;
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
    subscriptions: Plan[];
    promotions: Plan[];
    photos: Photo[];
    videos: VideoItem[];
    previewsGallery: GalleryItem[];
};

const faqData = [
    {
        question: "É sigiloso? Vai aparecer na fatura?",
        answer: "Sim, 100% sigiloso. A cobrança virá em sua fatura com um nome discreto relacionado a serviços digitais, sem nenhuma menção ao conteúdo."
    },
    {
        question: "Quando tenho acesso depois do pagamento?",
        answer: "O acesso é imediato! Assim que seu pagamento for confirmado (o que geralmente leva segundos), todo o conteúdo exclusivo já estará liberado para você."
    },
    {
        question: "Posso cancelar quando quiser? A assinatura renova?",
        answer: "Fique tranquilo, o pagamento é único e não há renovação automática. Você paga uma vez e tem acesso pelo período escolhido, sem surpresas ou cobranças futuras."
    },
    {
        question: "Posso pedir conteúdo personalizado?",
        answer: "No momento, não trabalhamos com pedidos de conteúdo personalizado. No entanto, o acervo é atualizado com frequência com novidades exclusivas para os assinantes."
    }
];


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

const getTagClass = (tag: string) => {
    switch (tag.toLowerCase()) {
        case 'mais popular':
            return 'tag-hot';
        case 'melhor oferta':
            return 'tag-best';
        case 'exclusivo':
            return 'tag-exclusive';
        default:
            return 'tag-promo';
    }
};

// --- Social Proof Popup Data and Logic ---
const socialProofNames = ["Miguel", "Arthur", "Heitor", "Bernardo", "Davi", "Lucas", "Gabriel", "Pedro", "Enzo", "Matheus", "Rafael", "Guilherme", "Nicolas", "João", "Gustavo"];
const socialProofPlans = ["30 Dias", "3 Meses", "1 Ano", "Vitalício"];

type SocialProofNotification = {
    id: number;
    name: string;
    plan: string;
    time: number; // Time in seconds ago
};
// --- End Social Proof Data ---

export function DashboardClient({ model }: { model: ModelData }) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [playingVideo, setPlayingVideo] = useState<VideoItem | GalleryItem | null>(null);
    const [revealedPreviews, setRevealedPreviews] = useState<string[]>([]);
    const [watchedPreviews, setWatchedPreviews] = useState<string[]>([]);
    const [timedOutPreviews, setTimedOutPreviews] = useState<string[]>([]);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('previews');
    const [socialProof, setSocialProof] = useState<SocialProofNotification | null>(null);
    const [remainingCount, setRemainingCount] = useState(11);
    const [isUrgencyPopupOpen, setIsUrgencyPopupOpen] = useState(false);
    const [isRejectionPopupOpen, setIsRejectionPopupOpen] = useState(false);
    const [hasUrgencyPopupBeenShown, setHasUrgencyPopupBeenShown] = useState(false);
    const [isUpsellPopupOpen, setIsUpsellPopupOpen] = useState(false);
    const [selectedPlanForUpsell, setSelectedPlanForUpsell] = useState<Plan | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pageTopRef = useRef<HTMLDivElement>(null);
    const subscriptionsRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // --- Remaining Subscriptions Counter & Popup---
     useEffect(() => {
        const interval = setInterval(() => {
            setRemainingCount(prevCount => {
                const nextCount = prevCount - 1;
                if (nextCount <= 4) {
                    if (!hasUrgencyPopupBeenShown) {
                        setIsUrgencyPopupOpen(true);
                        setHasUrgencyPopupBeenShown(true);
                    }
                    clearInterval(interval);
                    return 4;
                }
                return nextCount;
            });
        }, 7000); // 7 seconds

        return () => clearInterval(interval);
    }, [hasUrgencyPopupBeenShown]);


    // --- Subscription & User Logic ---
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    // Create a stable reference to the user document
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    
    // Use the useDoc hook to get real-time user data and loading status
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
    
    const lifetimePlan = model.promotions.find(p => p.id === 'lifetime');
    const discountedLifetimePrice = (parseFloat(lifetimePlan?.price.replace(',', '.') || '89.90') * 0.40).toFixed(2).replace('.', ',');


    // --- Social Proof Popup Logic ---
    const scheduleNextPopup = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const randomInterval = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000; // 5s to 10s
        
        timeoutRef.current = setTimeout(() => {
            const randomName = socialProofNames[Math.floor(Math.random() * socialProofNames.length)];
            const randomPlan = socialProofPlans[Math.floor(Math.random() * socialProofPlans.length)];
            const randomTime = Math.floor(Math.random() * 5) + 1; // 1 to 5 minutes ago

            setSocialProof({
                id: Date.now(),
                name: randomName,
                plan: randomPlan,
                time: randomTime,
            });

            // Hide the popup after 5 seconds and schedule the next one
            setTimeout(() => {
                setSocialProof(null);
                scheduleNextPopup();
            }, 5000);

        }, randomInterval);
    };

    useEffect(() => {
        scheduleNextPopup();
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    // --- End Social Proof Popup Logic ---

    const redirectToPayment = (plan: Plan) => {
        if (userDocRef) {
            // Use a non-blocking update to track the click
            updateDocumentNonBlocking(userDocRef, {
                hasClickedSubscription: true,
                plan: plan.id, // Store the plan id
            });
        }
        if (plan.paymentUrl) {
            window.open(plan.paymentUrl, '_blank');
        }
    };
    
    const handleSubscriptionClick = (plan: Plan) => {
        // Condition to bypass upsell: if the plan is 'lifetime' or if we don't have a user context yet.
        if (plan.id === 'lifetime' || isLoadingSubscription || !firestore || !user || !lifetimePlan) {
            redirectToPayment(plan);
            return;
        }

        // Otherwise, set state to show the upsell popup.
        setSelectedPlanForUpsell(plan);
        setIsUpsellPopupOpen(true);
    };
    
    const handleUpsellAccept = () => {
        const discountedLifetimeUrl = 'https://compraseguraonline.org.ua/c/48a282623d';
        if (userDocRef) {
            updateDocumentNonBlocking(userDocRef, {
                hasClickedSubscription: true,
                plan: 'lifetime-upsell', // Custom ID for the upsell plan
            });
        }
        window.open(discountedLifetimeUrl, '_blank');
        setIsUpsellPopupOpen(false);
    };

    const handleUpsellDecline = () => {
        if (selectedPlanForUpsell) {
            redirectToPayment(selectedPlanForUpsell);
        }
        setIsUpsellPopupOpen(false);
    };


    const handleUnlockClick = () => {
        subscriptionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleGuaranteeVagaClick = () => {
        setIsUrgencyPopupOpen(false);
        setIsRejectionPopupOpen(false);
        subscriptionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleLeaveForLater = () => {
        setIsUrgencyPopupOpen(false);
        setIsRejectionPopupOpen(true);
    };

    const handleLoseOpportunity = () => {
        setIsRejectionPopupOpen(false);
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
        if (timedOutPreviews.includes(item.id)) {
            toast({
                title: "Prévia expirada!",
                description: "Assine um plano para ver este e outros conteúdos quantas vezes quiser.",
                variant: "destructive"
            });
            return;
        }

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
            // Start a 7-second timer to re-blur the preview
            setTimeout(() => {
                setRevealedPreviews(prev => prev.filter(id => id !== item.id));
                setTimedOutPreviews(prev => [...prev, item.id]);
            }, 7000);
        }
    };

    const handleVideoEnded = (item: GalleryItem | VideoItem | null) => {
        if (item && item.id.startsWith('gallery-preview-')) {
            setWatchedPreviews(prev => [...prev, item.id]);
        }
        setPlayingVideo(null); // Close player
    };
    
    const mainPlan = model.subscriptions.find(p => p.isFeatured);

    const bioShort = model.bio.substring(0, 150) + '...';

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-0 sm:p-4">
            {isUpsellPopupOpen && selectedPlanForUpsell && lifetimePlan && (
                <div className="fullscreen-popup">
                    <div className="popup-content upsell-popup">
                        <button onClick={() => setIsUpsellPopupOpen(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-yellow-400">VOCÊ LIBEROU UM DESCONTO DE 60%!</h2>
                        <p className="mt-2 text-lg text-foreground">PARA LEVAR O PLANO COMPLETO!</p>
                        <p className="mt-4 text-base text-muted-foreground">DE <span className="line-through">R$ {lifetimePlan.price}</span> POR APENAS:</p>
                        <p className="text-6xl font-bold text-green-400 my-2">R$ {discountedLifetimePrice.replace('.',',')}</p>
                        <p className="text-center text-sm font-semibold text-foreground">VOCÊ VAI RECEBER TODOS OS BÔNUS, ATUALIZAÇÕES E ACESSO VITALÍCIO. APROVEITE! 🙌</p>
                        <Button onClick={handleUpsellAccept} size="lg" className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white text-lg font-bold">
                            VOU APROVEITAR O DESCONTO!
                        </Button>
                        <Button onClick={handleUpsellDecline} variant="link" size="lg" className="w-full mt-2 text-muted-foreground hover:text-foreground">
                            Não, quero o básico de R$ {selectedPlanForUpsell.price}
                        </Button>
                    </div>
                </div>
            )}
             {isUrgencyPopupOpen && (
                <div className="fullscreen-popup">
                    <div className="popup-content">
                        <AlertTriangle className="h-16 w-16 text-yellow-400 animate-pulse" />
                        <h2 className="text-3xl font-bold mt-4">ÚLTIMA CHANCE!</h2>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Restam apenas <span className="font-bold text-white">{remainingCount}</span> assinaturas promocionais. Garanta seu acesso exclusivo por apenas <span className="font-bold text-white">R$ 19,90</span>!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm">
                            <Button onClick={handleGuaranteeVagaClick} size="lg" className="w-full btn-glow text-lg">
                                Garantir Minha Vaga
                            </Button>
                            <Button onClick={handleLeaveForLater} size="lg" variant="ghost" className="w-full text-lg">
                                Recusar Oferta
                            </Button>
                        </div>
                    </div>
                </div>
            )}
             {isRejectionPopupOpen && (
                <div className="fullscreen-popup-final">
                    <div className="popup-content">
                        <Flame className="h-16 w-16 text-red-500 animate-pulse" />
                        <h2 className="text-3xl font-bold mt-4 text-red-400">TEM CERTEZA?</h2>
                        <p className="text-muted-foreground mt-2 text-lg">
                           Esta é uma oferta única. Você realmente deseja perder a chance de ter acesso a todo o conteúdo por um valor tão baixo?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
                            <Button onClick={handleGuaranteeVagaClick} size="lg" className="w-full btn-glow text-lg">
                                Não, quero garantir meu plano!
                            </Button>
                            <Button onClick={handleLoseOpportunity} size="lg" variant="destructive" className="w-full text-lg">
                                Sim, quero perder
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
                                {isBioExpanded ? model.bio : bioShort}
                                <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="text-primary ml-1 font-semibold">
                                    {isBioExpanded ? 'Ler menos' : 'Ler mais'}
                                </button>
                            </p>

                            <div className="flex items-center gap-3 mt-4">
                               <a href={model.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><InstagramIcon className="w-5 h-5"/></a>
                            </div>
                        </div>

                    </CardContent>
                </Card>
                
                 {/* Subscriptions & Promotions */}
                <div ref={subscriptionsRef} className="px-4 sm:px-0 py-4">
                   <Card className="bg-card border-none p-6 rounded-2xl">
                        <h2 className="text-xl font-bold mb-4 uppercase">PLANOS</h2>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            
                            <span className="inline-flex items-center gap-1.5 tag-promo px-3 py-1.5 text-lg font-bold">
                               <Flame className="h-5 w-5" /> Promocional
                            </span>
                        </div>
                        {remainingCount > 0 && (
                             <p className="text-center text-sm text-muted-foreground mb-4">
                                Restam apenas <span id="remaining-count" className="animate-blink">{remainingCount}</span> vagas com o valor promocional!
                            </p>
                        )}
                        {model.subscriptions.filter(p => p.isFeatured).map(plan => (
                            <div key={plan.id}>
                                <Button 
                                    className="w-full h-auto text-left justify-between p-4 bg-primary hover:bg-primary/90 rounded-lg shadow-lg mb-2 btn-glow" 
                                    size="lg" 
                                    onClick={() => handleSubscriptionClick(plan)}
                                    disabled={isLoadingSubscription}
                                >
                                    {isLoadingSubscription ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-lg font-bold uppercase">{plan.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold">R$ {plan.price}</span>
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </>
                                    )}
                                </Button>
                                {plan.tags?.map(tag => (
                                <div key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 text-primary-foreground px-3 py-1 text-xs font-bold mb-4">
                                    {tag}
                                </div>
                                ))}
                            </div>
                        ))}

                        <div className="flex items-center justify-around text-lg font-bold mt-4 mb-6">
                            <div className="flex items-center gap-2 text-green-400">
                                <Lock size={20} />
                                <span>Pagamento 100% seguro</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <Sparkles size={20} />
                                <span>Acesso imediato</span>
                            </div>
                        </div>

                        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                            <AccordionItem value="item-1" className="border-b-0">
                                <AccordionTrigger className="font-bold text-lg py-2 hover:no-underline">
                                    Outras Opções
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col gap-3 pt-2">
                                    {model.promotions.map(plan => (
                                        <Button 
                                            key={plan.id} 
                                            variant="outline" 
                                            className="w-full h-auto justify-between p-3 rounded-lg border border-primary/50 bg-card hover:bg-primary/10" 
                                            onClick={() => handleSubscriptionClick(plan)}
                                            disabled={isLoadingSubscription}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isLoadingSubscription ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    plan.icon === 'Crown' && <Crown className="h-5 w-5 text-yellow-400" />
                                                )}
                                                <span className="font-bold uppercase">{plan.name}</span>
                                                {plan.tags?.map(tag => (
                                                    <span key={tag} className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', getTagClass(tag))}>
                                                        {tag} {tag === 'Mais popular' && '🔥'}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="font-bold text-lg">R$ {plan.price}</span>
                                        </Button>
                                    ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Card className="mt-6 bg-transparent border-primary/30 text-center">
                            <CardContent className="p-3">
                                <p className="text-sm font-bold text-primary animate-pulse-orange">
                                    🔥 RESTAM APENAS <span id="remaining-count" className="animate-blink">{remainingCount}</span> ASSINATURAS PROMOCIONAIS!
                                </p>
                            </CardContent>
                        </Card>
                    </Card>
                </div>

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
                        <TabsTrigger value="videos" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg text-neutral-400 text-xs sm:text_sm">
                            <Video size={16} /> {model.stats.videos} Vídeos
                             {!isSubscribed && <Lock className="w-3 h-3 ml-1" />}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="previews" className="mt-4">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                             {model.previewsGallery.map(item => {
                                const isRevealed = revealedPreviews.includes(item.id);
                                const isWatched = item.type === 'video' && watchedPreviews.includes(item.id);
                                const isTimedOut = timedOutPreviews.includes(item.id);
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
                                                    'object-cover w-full h-auto transition-all duration-500',
                                                    !isRevealed ? 'blur-lg' : 'blur-none',
                                                    (isWatched || isTimedOut) ? 'grayscale blur-lg' : ''
                                                )}
                                            />
                                            {/* Not Revealed Overlay */}
                                            {!isRevealed && !isTimedOut && (
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
                                             {/* Watched or TimedOut Video/Image Overlay */}
                                            {(isWatched || isTimedOut) && (
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
                             <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg mt-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <h3 className="mt-4 text-xl font-bold">Verificando seu acesso...</h3>
                                <p className="mt-2 text-muted-foreground">Aguarde um instante.</p>
                            </div>
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
                                                className="object-cover w-full h-auto"
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
                            <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg mt-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <h3 className="mt-4 text-xl font-bold">Verificando seu acesso...</h3>
                                <p className="mt-2 text-muted-foreground">Aguarde um instante.</p>
                            </div>
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
                                                className="object-cover w-full h-auto"
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
                
                 {/* FAQ Section */}
                <div className="px-4 sm:px-0 py-8">
                    <h2 className="text-3xl font-bold text-center mb-8 text-primary">Perguntas Frequentes</h2>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqData.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index+1}`} className="bg-card rounded-lg border-border">
                                <AccordionTrigger className="text-left font-semibold p-4 hover:no-underline">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0">
                                    <p className="text-muted-foreground">{faq.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                     {mainPlan && (
                        <div className="mt-8">
                            <Button 
                                className="w-full h-auto text-left justify-center p-4 bg-primary hover:bg-primary/90 rounded-lg shadow-lg btn-glow" 
                                size="lg" 
                                onClick={() => handleSubscriptionClick(mainPlan)}
                                disabled={isLoadingSubscription}
                            >
                                {isLoadingSubscription ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center">
                                        <span className="text-sm font-normal">Veja tudo por apenas</span>
                                        <span className="text-xl font-bold">R$ {mainPlan.price}</span>
                                        </div>
                                        <ArrowRight className="h-5 w-5 ml-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

            </div>
             {/* --- Social Proof Popup --- */}
             {socialProof && (
                <div key={socialProof.id} className="social-proof-popup">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 animate-pulse-orange"></div>
                        <div>
                            <p className="font-bold text-sm text-foreground">
                                {socialProof.name} <span className="font-normal text-muted-foreground">assinou</span> <span className="text-primary">{socialProof.plan}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">há {socialProof.time} minuto{socialProof.time > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                     <button onClick={() => setSocialProof(null)} className="absolute top-1 right-1 text-muted-foreground hover:text-foreground">
                        <X size={14} />
                    </button>
                </div>
            )}
            {/* --- End Social Proof Popup --- */}

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
