'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface Stats {
  totalLeads: number;
  leadsOnDate: number;
  leadsOnline: number;
  leadsPaid: number;
  leadsUnpaid: number;
  conversionRate: number;
  siteAccesses: number;
  subscriptionClicks: number;
}

const FIVE_MINUTES_AGO_IN_MS = Date.now() - (5 * 60 * 1000);

export function useDashboardStats(date: Date) {
  const firestore = useFirestore();
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    leadsOnDate: 0,
    leadsOnline: 0,
    leadsPaid: 0,
    leadsUnpaid: 0,
    conversionRate: 0,
    siteAccesses: 0,
    subscriptionClicks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    setIsLoading(true);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const usersRef = collection(firestore, 'users');
    const accessLogsRef = collection(firestore, 'site_access_logs');

    const unsubscribeUsers = onSnapshot(query(usersRef), (snapshot) => {
      const allLeads = snapshot.docs.map(doc => doc.data());
      const paidLeadsCount = allLeads.filter(lead => lead.status === 'paid').length;
      const totalLeadsCount = allLeads.length;
      const subscriptionClicksCount = allLeads.filter(lead => lead.hasClickedSubscription).length;

      const leadsOnDate = allLeads.filter(lead => {
        if (!lead.createdAt || typeof lead.createdAt.toDate !== 'function') return false;
        const createdAt = lead.createdAt.toDate();
        return createdAt >= startOfDay && createdAt <= endOfDay;
      }).length;
      
      const onlineLeads = allLeads.filter(lead => lead.lastActive && lead.lastActive.toDate() > new Date(FIVE_MINUTES_AGO_IN_MS)).length;

      setStats(prev => ({
        ...prev,
        totalLeads: totalLeadsCount,
        leadsOnDate: leadsOnDate,
        leadsPaid: paidLeadsCount,
        leadsUnpaid: totalLeadsCount - paidLeadsCount,
        conversionRate: totalLeadsCount > 0 ? (paidLeadsCount / totalLeadsCount) * 100 : 0,
        leadsOnline: onlineLeads,
        subscriptionClicks: subscriptionClicksCount,
      }));
      setIsLoading(false);
    }, (error) => {
      const contextualError = new FirestorePermissionError({
        path: 'users',
        operation: 'list',
      });
      console.error("Error fetching user stats:", error, contextualError);
      errorEmitter.emit('permission-error', contextualError);
      setIsLoading(false);
    });
    
    const unsubscribeAccess = onSnapshot(query(accessLogsRef), (snapshot) => {
        setStats(prev => ({ ...prev, siteAccesses: snapshot.size }));
    }, (error) => {
        const contextualError = new FirestorePermissionError({
            path: 'site_access_logs',
            operation: 'list',
        });
        console.error("Error fetching site access stats:", error, contextualError);
        errorEmitter.emit('permission-error', contextualError);
    });


    return () => {
      unsubscribeUsers();
      unsubscribeAccess();
    };
  }, [firestore, date]);

  return { stats, isLoading };
}
