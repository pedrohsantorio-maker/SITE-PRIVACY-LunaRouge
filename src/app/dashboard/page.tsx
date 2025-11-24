'use client';
import { modelData } from '@/lib/data';
import { DashboardClient } from './dashboard-client';

// This is a server component that fetches initial data
export default function DashboardPage() {

  // In a real app, you'd fetch this data from an API
  const model = modelData;

  return <DashboardClient model={model} />;
}
