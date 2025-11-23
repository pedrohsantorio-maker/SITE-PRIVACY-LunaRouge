'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, Users, Rss, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type ModelData = {
    name: string;
    avatarUrl: string;
    avatarHint: string;
    bio_short: string;
    bio_long:string;
    stats: {
        subscribers: number;
        likes: number;
        followers: number;
    };
    subscriptionPlans: {
        name: string;
        price: string;
        discount: string | null;
        id: string;
    }[];
};

// Client-side component to format numbers and prevent hydration mismatch
function FormattedStat({ value }: { value: number }) {
    const [formattedValue, setFormattedValue] = useState<string | number>(value);

    useEffect(() => {
        // This runs only on the client, after hydration
        setFormattedValue(value.toLocaleString('pt-BR'));
    }, [value]);

    return <span>{formattedValue}</span>;
}

export function DashboardClient({ model }: { model: ModelData }) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Profile Header */}
        <section className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <Dialog>
                <DialogTrigger asChild>
                    <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full overflow-hidden cursor-pointer ring-4 ring-primary/50 hover:ring-primary transition-all duration-300">
                        <Image
                            src={model.avatarUrl}
                            alt={`Foto de perfil de ${model.name}`}
                            width={192}
                            height={192}
                            className="w-full h-full object-cover"
                            priority
                            data-ai-hint={model.avatarHint}
                        />
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 border-0">
                     <DialogTitle className="sr-only">Foto de perfil de {model.name} em tamanho ampliado</DialogTitle>
                     <DialogDescription className="sr-only">A imagem a seguir é uma versão ampliada da foto de perfil da modelo {model.name}.</DialogDescription>
                     <Image
                        src={model.avatarUrl}
                        alt={`Foto de perfil de ${model.name}`}
                        width={1080}
                        height={1350}
                        className="w-full h-auto object-contain rounded-lg"
                        data-ai-hint={model.avatarHint}
                    />
                </DialogContent>
            </Dialog>


          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-headline font-bold">{model.name}</h1>
            <div className="flex justify-center sm:justify-start items-center gap-6 mt-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <FormattedStat value={model.stats.subscribers} /> Assinantes
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent" />
                <FormattedStat value={model.stats.likes} /> Likes
              </div>
              <div className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-accent" />
                <FormattedStat value={model.stats.followers} /> Seguidores
              </div>
            </div>
          </div>
        </section>

        {/* Bio Section */}
        <section className="mb-10">
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-6">
              <p className="text-foreground/80 leading-relaxed font-light">
                {isBioExpanded ? model.bio_long : model.bio_short}
              </p>
              <Button variant="link" onClick={() => setIsBioExpanded(!isBioExpanded)} className="px-0 mt-2 text-accent">
                {isBioExpanded ? 'Ler menos' : 'Ler mais'}
                {isBioExpanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Subscription Plans */}
        <section className="mb-10">
            <h2 className="text-3xl font-headline font-bold text-center mb-6">Planos de Assinatura</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {model.subscriptionPlans.map((plan, index) => (
                <Card key={plan.id} className={`flex flex-col border-2 ${index === 1 ? 'border-primary' : 'border-border'} hover:border-primary transition-colors`}>
                    {plan.discount && (
                        <Badge variant="default" className="w-fit self-center -mt-3 bg-accent text-accent-foreground">{plan.discount}</Badge>
                    )}
                    <CardHeader className="text-center pt-6">
                        <CardTitle className="text-2xl font-headline font-bold">{plan.name}</CardTitle>
                        <CardDescription>R$ <span className="text-4xl font-bold text-foreground">{plan.price.split(',')[0]}</span>,{(plan.price.split(',')[1] || '00')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Button asChild className={`w-full ${index === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                        <Link href="/pagamento">Assinar Agora</Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
            </div>
        </section>
      </main>
    </div>
  );
}
