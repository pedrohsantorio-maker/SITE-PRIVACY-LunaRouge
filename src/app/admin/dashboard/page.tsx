'use client';

import { useState } from 'react';
import { Users, UserCheck, UserX, Target, Percent, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { UsersTable } from '@/components/admin/users-table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import StatCard from '@/components/admin/stat-card';
import Link from 'next/link';


export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const { stats, isLoading } = useDashboardStats(date);

  return (
    <div className="flex flex-col gap-8 py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard de Monitoramento</h1>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className="w-full sm:w-[240px] justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Selecione a data</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard title="Leads Totais" value={stats.totalLeads} icon={Users} isLoading={isLoading} />
            <StatCard title="Leads na Data" value={stats.leadsOnDate} icon={UserCheck} isLoading={isLoading} />
            <StatCard title="Leads Pagos" value={stats.leadsPaid} icon={UserCheck} isLoading={isLoading} />
            <StatCard title="Não Pagos" value={stats.leadsUnpaid} icon={UserX} isLoading={isLoading} />
            <StatCard title="Taxa de Conversão" value={`${stats.conversionRate.toFixed(2)}%`} icon={Percent} isLoading={isLoading} />
            <StatCard title="Leads Online" value={stats.leadsOnline} icon={Target} isLoading={isLoading} note="Últimos 5 minutos" />
            <StatCard title="Acessos ao Site" value={stats.siteAccesses} icon={Eye} isLoading={isLoading} />
        </div>
        
        <div className="space-y-4">
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
              <h2 className="text-xl sm:text-2xl font-bold">Leads do Dia</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/users">Ver todos os leads</Link>
              </Button>
            </div>
            <UsersTable date={date} />
        </div>
    </div>
  );
}
