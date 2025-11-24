'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FirestorePermissionError } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';

interface AccessLog {
  id: string;
  userId?: string;
  accessTime: { seconds: number; nanoseconds: number };
  page: string;
  ip?: string;
}

export function AccessTable() {
  const firestore = useFirestore();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const logsRef = collection(firestore, 'site_access_logs');
    const q = query(logsRef, orderBy('accessTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessLog));
      setLogs(logsData);
      setIsLoading(false);
    }, (error) => {
      const contextualError = new FirestorePermissionError({
        path: 'site_access_logs',
        operation: 'list',
      });
      console.error("Error fetching access logs:", error, contextualError);
      errorEmitter.emit('permission-error', contextualError);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Logs de Acesso</CardTitle>
        <CardDescription>Atividade recente de acesso ao site.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário ID</TableHead>
              <TableHead>Página Acessada</TableHead>
              <TableHead>Endereço IP</TableHead>
              <TableHead>Data do Acesso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : logs.length > 0 ? (
              logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{log.userId || 'Visitante'}</TableCell>
                  <TableCell>{log.page}</TableCell>
                  <TableCell>{log.ip || 'N/A'}</TableCell>
                  <TableCell>{log.accessTime ? format(new Date(log.accessTime.seconds * 1000), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }) : 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Nenhum log de acesso encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
