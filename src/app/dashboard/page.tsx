import { modelData } from '@/lib/data';
import { DashboardClient } from './dashboard-client';

export default function DashboardPage() {
  // In a real application, this data would come from a database based on the logged-in user
  // and which model's page they are viewing.
  return <DashboardClient model={modelData} />;
}
