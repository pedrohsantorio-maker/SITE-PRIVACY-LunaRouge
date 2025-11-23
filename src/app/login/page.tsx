import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';

export default function LoginPage() {
    const loginImage = {
        imageUrl: "https://i.imgur.com/Xwd7qSZ.jpeg",
        description: "Woman in a futuristic setting",
        imageHint: "futuristic woman"
    };

  async function login(formData: FormData) {
    'use server';
    // Here you would implement your actual Firebase login logic
    // For now, we'll just redirect to the dashboard
    redirect('/dashboard');
  }

  return (
     <div className="w-full min-h-screen relative">
        <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            fill
            className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
            <div className="mx-auto w-full max-w-md space-y-8">
                <div className="text-center text-white">
                    <Logo className="text-5xl font-bold inline-block mb-4" />
                    <h1 className="text-3xl font-headline font-bold">Acessar Conteúdo</h1>
                    <p className="text-balance font-light mt-2">
                      Entre com seu email para acessar o conteúdo exclusivo.
                    </p>
                </div>

                <div className="bg-black/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl space-y-6">
                  <form action={login}>
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white font-light">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input
                              id="email"
                              type="email"
                              name="email"
                              placeholder="seu@email.com"
                              required
                              className="bg-white/10 text-white border-white/20 pl-10 focus:ring-orange-500"
                            />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password" className="text-white font-light">Senha</Label>
                          <Link
                            href="#"
                            className="ml-auto inline-block text-sm underline text-white/70 hover:text-white"
                          >
                            Esqueceu sua senha?
                          </Link>
                        </div>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input id="password" name="password" type="password" required className="bg-white/10 text-white border-white/20 pl-10 focus:ring-orange-500"/>
                        </div>
                      </div>
                      <Button type="submit" className="w-full font-bold text-lg h-12 bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                        Login
                      </Button>
                    </div>
                  </form>
                </div>
                
                <div className="mt-4 text-center text-sm text-white">
                  Não tem uma conta?{' '}
                  <Link href="/signup" className="underline font-bold text-orange-500 hover:text-orange-400">
                    Cadastre-se
                  </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
