import { PrivacyNotice } from '@/components/ui/PrivacyNotice';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface PdfToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PdfToolLayout({ title, description, children, breadcrumbs }: PdfToolLayoutProps) {
  const crumbs = breadcrumbs ?? [
    { label: 'PDF Tools', href: '/pdf-tools' },
    { label: title },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <PrivacyNotice />
      {children}
    </div>
  );
}
