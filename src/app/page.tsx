import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

export default function LandingPage() {
  const heroImage = {
      imageUrl: "https://i.imgur.com/Xwd7qSZ.jpeg",
      description: "Woman in a futuristic setting",
      imageHint: "futuristic woman"
  };

  return (
    <div className="relative min-h-screen w-full">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover object-center"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white p-4">
        <div className="mb-8">
          <Logo className="text-6xl md:text-8xl font-bold tracking-tighter" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Conteúdo Exclusivo. Conexão Real.
        </h1>
        <p className="max-w-2xl text-lg md:text-xl font-light mb-8">
          Acesse o universo privado da sua modelo favorita. Assine agora para ter acesso a fotos, vídeos e atualizações exclusivas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
           <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold">
            <Link href="/signup">Criar Conta</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="text-lg bg-gray-900 text-orange-500 hover:bg-gray-800 font-bold">
            <Link href="/login">Acessar Conteúdo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
