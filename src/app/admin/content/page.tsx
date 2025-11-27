'use client';
import { useState } from 'react';
import Image from 'next/image';
import { modelData } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PlayCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

type VideoItem = {
    id: string;
    url: string;
    thumbnailUrl: string;
    hint: string;
    width: number;
    height: number;
};

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState('photos');
    const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold mb-4">Gerenciamento de Conteúdo</h1>
            <p className="text-muted-foreground mb-8">Visualize as mídias que estão disponíveis para os assinantes.</p>

            <Alert className="mb-8">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Como Adicionar/Remover Mídias</AlertTitle>
                <AlertDescription>
                    Para adicionar ou remover fotos e vídeos, você deve editar diretamente o arquivo <code className="font-mono text-sm bg-muted text-foreground px-1 py-0.5 rounded-sm">src/lib/data.ts</code>.
                    Basta adicionar ou remover os links nos arrays `photoLinks` e `videoLinks`.
                </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="photos">Fotos ({modelData.photos.length})</TabsTrigger>
                    <TabsTrigger value="videos">Vídeos ({modelData.videos.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="photos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fotos Exclusivas</CardTitle>
                            <CardDescription>Esta é a galeria de fotos que os assinantes podem ver.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {modelData.photos.map(photo => (
                                <div key={photo.id} className="rounded-lg overflow-hidden border shadow-sm">
                                    <Image
                                        src={photo.url}
                                        alt={photo.hint}
                                        width={photo.width}
                                        height={photo.height}
                                        className="object-cover w-full h-auto aspect-square"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="videos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vídeos Exclusivos</CardTitle>
                            <CardDescription>Esta é a galeria de vídeos que os assinantes podem ver.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {modelData.videos.map(video => (
                                <div key={video.id} onClick={() => setPlayingVideo(video)} className="rounded-lg overflow-hidden border shadow-sm cursor-pointer group relative">
                                    <Image
                                        src={video.thumbnailUrl}
                                        alt={video.hint}
                                        width={video.width}
                                        height={video.height}
                                        className="object-cover w-full h-auto aspect-square"
                                    />
                                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle size={48} className="text-white" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             {playingVideo && (
                <Dialog open={!!playingVideo} onOpenChange={(isOpen) => !isOpen && setPlayingVideo(null)}>
                    <DialogContent className="p-0 bg-black border-0 max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl w-auto h-auto max-h-[90vh]">
                         <DialogTitle className="sr-only">Player de Vídeo</DialogTitle>
                         <div className="relative flex items-center justify-center">
                            <video 
                                src={playingVideo.url} 
                                controls 
                                autoPlay 
                                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                                style={{
                                    aspectRatio: `${playingVideo.width}/${playingVideo.height}`
                                }}
                            />
                         </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}