'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, BarChart, Eye, LayoutDashboard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Leads' },
  { href: '/admin/access-logs', icon: Eye, label: 'Acessos' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-card sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link href="/dashboard" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
            <Logo className="h-4 w-4 text-primary-foreground" />
            <span className="sr-only">ModelMuse Admin</span>
          </Link>
          <TooltipProvider>
            {navItems.map(item => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                      pathname.startsWith(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
