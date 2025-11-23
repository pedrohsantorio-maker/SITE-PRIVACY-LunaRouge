import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

export default function LandingPage() {
  const heroImage = {
      imageUrl: "https://imgur.com/Xwd7qSZ.jpeg",
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
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white p-4">
        <div className="mb-8" style={{ animation: 'fadeInUp 0.8s ease-out forwards' }}>
          <Logo className="text-6xl md:text-8xl font-bold tracking-tighter" />
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s forwards', opacity: 0 }}>
          <span className="transition-all duration-300 ease-in-out hover:text-primary hover:scale-105 inline-block cursor-pointer">Conteúdo Exclusivo.</span> <span className="transition-all duration-300 ease-in-out hover:text-primary hover:scale-105 inline-block cursor-pointer">Conexão Real.</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl font-light mb-8" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s forwards', opacity: 0 }}>
          Acesse o universo privado da sua modelo favorita. Assine agora para ter acesso a fotos, vídeos e atualizações exclusivas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4" style={{ animation: 'fadeInUp 0.8s ease-out 0.6s forwards', opacity: 0 }}>
           <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold transition-transform duration-300 ease-in-out hover:scale-105 active:scale-100">
            <Link href="/signup">Criar Conta</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg bg-black/50 text-white border-white/30 hover:bg-white/10 hover:text-white font-bold transition-all duration-300 ease-in-out hover:scale-105 active:scale-100">
            <Link href="/login">Acessar Conteúdo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
