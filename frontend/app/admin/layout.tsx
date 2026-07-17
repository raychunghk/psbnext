import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Financial Statements - Report Management System',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
