'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lead {
  id: string;
  name: string;
  age: number;
  email: string;
  createdAt: { seconds: number; nanoseconds: number };
  status: 'paid' | 'not_paid' | 'pix_generated';
  plan: string;
  lastActive: { seconds: number; nanoseconds: number };
  endDate?: { seconds: number; nanoseconds: number } | string;
}

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

function StatusBadge({ status }: { status: Lead['status'] }) {
    switch (status) {
        case 'paid':
            return <Badge className="bg-green-600">Pago</Badge>;
        case 'pix_generated':
            return <Badge className="bg-yellow-500 text-black">Gerou PIX</Badge>;
        case 'not_paid':
        default:
            return <Badge variant="secondary">Não Pago</Badge>;
    }
}


function LeadRow({ lead }: { lead: Lead }) {
    const isOnline = lead.lastActive && (Date.now() - new Date(lead.lastActive.seconds * 1000).getTime()) < FIVE_MINUTES_IN_MS;
    const createdAtDate = lead.createdAt ? new Date(lead.createdAt.seconds * 1000) : new Date();
    
    let endDateText = 'N/A';
    if (lead.endDate) {
      if (typeof lead.endDate === 'string') {
        endDateText = format(new Date(lead.endDate), "dd/MM/yyyy", { locale: ptBR });
      } else if (lead.endDate.seconds) {
        endDateText = format(new Date(lead.endDate.seconds * 1000), "dd/MM/yyyy", { locale: ptBR });
      }
    }

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{lead.name}</div>
                <div className="text-sm text-muted-foreground">{lead.email}</div>
                {lead.age && <div className="text-sm text-muted-foreground">{lead.age} anos</div>}
            </TableCell>
            <TableCell>
                <StatusBadge status={lead.status} />
            </TableCell>
            <TableCell className="capitalize">{lead.plan || 'N/A'}</TableCell>
            <TableCell>{format(createdAtDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
            <TableCell>{endDateText}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
            </TableCell>
        </TableRow>
    );
}


export default function AllLeadsPage() {
    const firestore = useFirestore();
    const [allLeads, setAllLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!firestore) return;
        
        const leadsRef = collection(firestore, 'users');
        const q = query(leadsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
            setAllLeads(leadsData);
            setFilteredLeads(leadsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching all leads:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = allLeads.filter(lead => {
            return lead.name.toLowerCase().includes(lowercasedFilter) ||
                   lead.email.toLowerCase().includes(lowercasedFilter);
        });
        setFilteredLeads(filtered);
    }, [searchTerm, allLeads]);

    return (
        <div className="py-8">
            <Card>
                <CardHeader className="px-7">
                    <CardTitle>Todos os Leads</CardTitle>
                    <CardDescription>Uma lista de todos os leads cadastrados no sistema.</CardDescription>
                    <Input 
                        placeholder="Buscar por nome ou email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm mt-4"
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                <TableHead>Vencimento do Plano</TableHead>
                                <TableHead>Atividade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredLeads.length > 0 ? (
                                filteredLeads.map(lead => <LeadRow key={lead.id} lead={lead} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Nenhum lead encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
