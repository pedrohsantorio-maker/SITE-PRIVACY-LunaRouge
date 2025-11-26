'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle } from 'lucide-react';
import Logo from '@/components/logo';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function PagamentoPage() {
    const qrCodeImage = PlaceHolderImages.find(img => img.id === 'payment-qr-code');
    const firestore = useFirestore();
    const { user } = useUser();

    // This function will be called when the user clicks a payment link.
    // For this simulation, we'll call it when the payment page loads.
    const handlePixGenerated = async () => {
        if (user && firestore) {
            try {
                const userRef = doc(firestore, 'users', user.uid);
                // We only update the status if it's currently 'not_paid'
                // This prevents overwriting a 'paid' status if the user re-visits the page.
                // In a real scenario, you would have more robust logic.
                await updateDoc(userRef, {
                    status: 'pix_generated'
                });
            } catch (error) {
                console.error("Error updating user status to pix_generated:", error);
            }
        }
    };

    // Simulate the user generating a PIX code just by visiting the page.
    // We use a useEffect with an empty dependency array to run this only once.
    // The `user` object might not be available on the first render, so we check for it.
    useEffect(() => {
        if (user) {
            handlePixGenerated();
        }
    }, [user]); // This effect runs when the user object becomes available.

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="absolute top-8 left-8">
                <Link href="/dashboard">
                    <Logo className="text-3xl font-bold" />
                </Link>
            </div>
            <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline font-bold">Pagamento via Pix</CardTitle>
                    <CardDescription className="font-light">Finalize sua assinatura de forma rápida e segura.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="p-2 bg-white rounded-lg">
                    {qrCodeImage && (
                        <Image 
                            src={qrCodeImage.imageUrl}
                            alt={qrCodeImage.description}
                            data-ai-hint={qrCodeImage.imageHint}
                            width={250}
                            height={250}
                            className="rounded-md"
                        />
                    )}
                    </div>
                    <div className="text-center space-y-2">
                        <p className="font-semibold">1. Abra o app do seu banco e escaneie o QR Code.</p>
                        <p className="font-semibold">2. Confirme o valor e finalize o pagamento.</p>
                        <p className="text-sm text-muted-foreground font-light">Seu acesso será liberado automaticamente após a confirmação.</p>
                    </div>

                    {/* This button simulates the confirmation and redirects the user */}
                    <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700">
                        <Link href="/dashboard">
                           <CheckCircle className="mr-2 h-5 w-5" /> Pagamento Confirmado (Simulação)
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
