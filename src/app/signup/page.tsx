import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Logo from '@/components/logo';

export default function SignupPage() {
    const signupImage = {
        imageUrl: "https://i.imgur.com/Xwd7qSZ.jpeg",
        description: "Woman in a futuristic setting",
        imageHint: "futuristic woman"
    };

    async function signup(formData: FormData) {
        'use server';
        // Here you would implement your actual Firebase signup logic
        // For now, we'll just redirect to the dashboard
        redirect('/dashboard');
    }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block relative">
      {signupImage && (
             <Image
                src={signupImage.imageUrl}
                alt={signupImage.description}
                data-ai-hint={signupImage.imageHint}
                fill
                className="object-cover"
              />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white">
            <Logo className="text-5xl font-bold font-headline" />
            <p className="text-lg mt-2">Comece sua jornada exclusiva.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Criar Conta</h1>
            <p className="text-balance text-muted-foreground">
              Preencha os campos abaixo para criar sua conta.
            </p>
          </div>
          <form action={signup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nome</Label>
                <Input id="first-name" name="first-name" placeholder="Max" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Criar Conta
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
