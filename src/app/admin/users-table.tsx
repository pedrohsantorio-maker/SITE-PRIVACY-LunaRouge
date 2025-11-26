'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';

interface UsersTableProps {
  date: Date;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'paid' | 'not_paid' | 'pix_generated';
  plan: string;
  lastActive: { seconds: number };
}

function StatusBadge({ status }: { status: Lead['status'] }) {
    switch (status) {
        case 'paid':
            return <Badge className="bg-green-600 hover:bg-green-700">Pago</Badge>;
        case 'pix_generated':
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Gerou PIX</Badge>;
        case 'not_paid':
        default:
            return <Badge variant="secondary">Não Pago</Badge>;
    }
}


const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export function UsersTable({ date }: UsersTableProps) {
  const firestore = useFirestore();
  const [dailyLeads, setDailyLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !date) return;
    setIsLoading(true);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const leadsRef = collection(firestore, 'users');
    const q = query(leadsRef, where('createdAt', '>=', startTimestamp), where('createdAt', '<=', endTimestamp));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setDailyLeads(leadsData);
      setIsLoading(false);
    }, (error) => {
        const contextualError = new FirestorePermissionError({
          path: 'users',
          operation: 'list',
        });
        console.error("Error fetching daily leads:", error, contextualError);
        errorEmitter.emit('permission-error', contextualError);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, date]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Atividade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))
            ) : dailyLeads.length > 0 ? (
              dailyLeads.map(lead => {
                const isOnline = lead.lastActive && (Date.now() - new Date(lead.lastActive.seconds * 1000).getTime()) < FIVE_MINUTES_IN_MS;
                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">{lead.email}</div>
                    </TableCell>
                    <TableCell>
                        <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="capitalize">{lead.plan || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Nenhum lead encontrado para esta data.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
