'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, User, Calendar } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { signupAction } from './actions';
import { useUser } from '@/firebase';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold text-lg h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-100">
      {pending ? 'Criando conta...' : 'Criar Conta'}
    </Button>
  );
}

export default function SignupPage() {
    const signupImage = {
        imageUrl: "https://i.imgur.com/Xwd7qSZ.jpeg",
        description: "Woman in a futuristic setting",
        imageHint: "futuristic woman"
    };

    const { user, isUserLoading } = useUser();
    const [state, formAction] = useActionState(signupAction, { message: '' });

    // This handles redirecting the user if they are ALREADY logged in
    // and just navigate to the signup page.
    useEffect(() => {
        if (user && !isUserLoading) {
             redirect('/dashboard');
        }
    }, [user, isUserLoading]);


  return (
    <div className="w-full min-h-screen relative">
        <Image
            src={signupImage.imageUrl}
            alt={signupImage.description}
            data-ai-hint={signupImage.imageHint}
            fill
            className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
            <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8 fade-in">
                <div className="text-center text-white">
                    <Logo className="text-5xl font-bold inline-block mb-4" />
                    <h1 className="text-3xl font-headline font-bold">Crie sua Conta</h1>
                    <p className="text-balance font-light mt-2 text-sm sm:text-base">
                        Preencha os campos abaixo para criar sua conta.
                    </p>
                </div>

                <div className="bg-black/50 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-2xl shadow-primary/20 space-y-6">
                    <form action={formAction}>
                        <div className="grid gap-4 sm:gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-white font-light">Nome</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                    <Input id="name" name="name" placeholder="Seu nome" required className="bg-white/10 text-white border-white/20 pl-10 focus:ring-primary focus:border-primary transition-all duration-300" />
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="age" className="text-white font-light">Idade</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                    <Input id="age" name="age" type="number" placeholder="Sua idade" required className="bg-white/10 text-white border-white/20 pl-10 focus:ring-primary focus:border-primary transition-all duration-300" />
                                </div>
                            </div>
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
                                        className="bg-white/10 text-white border-white/20 pl-10 focus:ring-primary focus:border-primary transition-all duration-300"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-white font-light">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                    <Input id="password" name="password" type="password" required className="bg-white/10 text-white border-white/20 pl-10 focus:ring-primary focus:border-primary transition-all duration-300" />
                                </div>
                                {state?.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
                            </div>
                           <SubmitButton />
                        </div>
                    </form>
                </div>
                
                <div className="mt-4 text-center text-sm text-white">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="underline font-bold text-primary hover:text-primary/80">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
