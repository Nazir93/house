import { Suspense } from "react";
import { AdminLeadsClient } from "./leads-client";

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white/30 text-sm">Загрузка...</div>}>
      <AdminLeadsClient />
    </Suspense>
  );
}
