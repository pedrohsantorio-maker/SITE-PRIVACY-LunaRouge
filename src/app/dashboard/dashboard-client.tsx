'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useActionState } from 'react';
import { Heart, Users, Rss, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { getAiSuggestionsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Gerando Sugestões...' : <> <Wand2 className="mr-2 h-4 w-4" /> Gerar Sugestões </>}
    </Button>
  );
}

export function DashboardClient({ model }: { model: ModelData }) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [aiState, formAction] = useActionState(getAiSuggestionsAction, { descriptionSuggestions: '', imageSuggestions: '', subscriptionPlanSuggestions: '' });

  const subscriptionPlansAsString = model.subscriptionPlans.map(p => `${p.name}: R$${p.price} ${p.discount ? `(${p.discount})` : ''}`).join('\n');

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
                <span>{model.stats.subscribers.toLocaleString()} Assinantes</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent" />
                <span>{model.stats.likes.toLocaleString()} Likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-accent" />
                <span>{model.stats.followers.toLocaleString()} Seguidores</span>
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
        
        <Separator className="my-12" />

        {/* AI Profile Optimizer */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-headline font-bold">Otimizador de Perfil com IA</h2>
            <p className="text-muted-foreground mt-2 font-light">Receba sugestões para melhorar seu perfil e atrair mais assinantes.</p>
          </div>
          <Card className="bg-secondary/50">
            <CardContent className="p-6">
              <form action={formAction}>
                 {/* Hidden inputs to pass current data to the server action */}
                 <input type="hidden" name="profileDescription" value={model.bio_long} />
                 <input type="hidden" name="profileImage" value={model.avatarUrl} />
                 <input type="hidden" name="subscriptionPlans" value={subscriptionPlansAsString} />

                <div className="mb-6">
                    <p className="text-muted-foreground font-light">Clique no botão abaixo para analisar a descrição, imagem e planos de assinatura atuais e receber sugestões de otimização da nossa IA.</p>
                </div>

                <SubmitButton />
              </form>

              {(aiState.descriptionSuggestions || aiState.imageSuggestions || aiState.subscriptionPlanSuggestions) && (
                <div className="mt-6 space-y-6">
                    <Separator />
                    <h3 className="text-xl font-semibold">Sugestões da IA</h3>
                    {aiState.descriptionSuggestions && (
                        <Alert>
                            <Wand2 className="h-4 w-4" />
                            <AlertTitle className="font-bold">Descrição do Perfil</AlertTitle>
                            <AlertDescription className="font-light">{aiState.descriptionSuggestions}</AlertDescription>
                        </Alert>
                    )}
                    {aiState.imageSuggestions && (
                        <Alert>
                            <Wand2 className="h-4 w-4" />
                            <AlertTitle className="font-bold">Imagem do Perfil</AlertTitle>
                            <AlertDescription className="font-light">{aiState.imageSuggestions}</AlertDescription>
                        </Alert>
                    )}
                    {aiState.subscriptionPlanSuggestions && (
                        <Alert>
                            <Wand2 className="h-4 w-4" />
                            <AlertTitle className="font-bold">Planos de Assinatura</AlertTitle>
                            <AlertDescription className="font-light">{aiState.subscriptionPlanSuggestions}</AlertDescription>
                        </Alert>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
