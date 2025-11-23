'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Heart, Users, Rss, ChevronDown, ChevronUp, MoreVertical, Image as ImageIcon, Video, Lock, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Inline SVG for social icons to avoid installing a new library
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4 1.4-2.8 2.1c.2 2.2-2.3 4.6-4.2 5.5-1.4.7-4.6 1.4-6.2-1.9-1.4-2.8-2.2-4.2-2.2-4.2s-4.6-.7-6.2-3.4c-1.4-2.8-.7-5.5.7-6.9.7-.7 1.4-1.4 2.8-1.4.7 0 1.4.7 1.4.7s-1.4.7-2.1 2.1c-.7 1.4 0 2.8.7 3.5.7.7 2.1.7 2.1.7s-.7-1.4-.7-2.1c0-1.4.7-2.1 2.1-2.8 1.4-.7 2.8-.7 4.2 0 1.4.7 2.1 2.1 2.1 2.8s.7 2.1 2.1 2.8c1.4.7 2.8 0 3.5-.7.7-.7 1.4-2.1 1.4-2.1s-1.4 0-2.8-.7c-1.4-.7-2.1-2.1-2.1-3.5 0-.7.7-1.4 1.4-1.4h.7z"></path></svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 12a4 4 0 1 0 4 4V8a8 8 0 1 1-8-8"></path></svg>
);


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
        photos: number;
        videos: number;
        locked: number;
        likes: number;
    };
    socials: {
        instagram: string;
        twitter: string;
        tiktok: string;
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

export function DashboardClient({ model }: { model: ModelData }) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#121212] rounded-2xl overflow-hidden border-neutral-800">
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
                        />
                        <div className="absolute -bottom-12 left-4">
                            <Image
                                src={model.avatarUrl}
                                alt={`Foto de perfil de ${model.name}`}
                                data-ai-hint={model.avatarHint}
                                width={100}
                                height={100}
                                className="rounded-full border-4 border-[#121212]"
                            />
                        </div>
                    </div>

                    {/* Stats section */}
                    <div className="flex justify-end items-center gap-4 px-4 pt-2 text-sm text-neutral-400">
                        <div className="flex items-center gap-1"><ImageIcon size={16}/> <FormattedStat value={model.stats.photos} /></div>
                        <div className="flex items-center gap-1"><Video size={16}/> <FormattedStat value={model.stats.videos} /></div>
                        <div className="flex items-center gap-1"><Lock size={16}/> <FormattedStat value={model.stats.locked} /></div>
                        <div className="flex items-center gap-1"><Heart size={16}/> <FormattedStat value={model.stats.likes} /></div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 pb-4 pt-8">
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
                           <a href={model.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><TwitterIcon className="w-5 h-5"/></a>
                           <a href={model.socials.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><TikTokIcon className="w-5 h-5"/></a>
                        </div>
                    </div>

                    {/* Subscriptions & Promotions */}
                    <div className="px-4 pb-4 space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-400 mb-2">Assinaturas</h2>
                            {model.subscriptions.map(sub => (
                                <Button key={sub.id} className="w-full justify-between h-12 text-md font-semibold bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl">
                                    <span>{sub.name}</span>
                                    <span>R$ {sub.price}</span>
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
                                <Button key={promo.id} variant="secondary" className="w-full justify-between h-12 text-md font-semibold bg-[#27272A] text-white rounded-xl hover:bg-neutral-700">
                                    <span>{promo.name} ({promo.discount})</span>
                                    <span>R$ {promo.price}</span>
                                </Button>
                               ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
