'use client';
import { AccessTable } from "@/components/admin/access-table";

export default function AccessLogsPage() {

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Logs de Acesso ao Site</h1>
      <AccessTable />
    </div>
  );
}
