import { FinancialShell } from '@/components/financial/FinancialShell';

export const metadata = {
  title: 'Financial Statements - Report Management System',
};

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  return <FinancialShell>{children}</FinancialShell>;
}
