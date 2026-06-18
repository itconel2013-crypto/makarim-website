import { loadContent } from '@/lib/db';
import { CMSProvider } from '@/components/cms/CMSProvider';
import { CMSSidebar } from '@/components/cms/CMSSidebar';

export const metadata = { title: 'Makarim CMS' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const initialStore = await loadContent();

  return (
    <CMSProvider initialStore={initialStore}>
      <div className="flex min-h-screen" style={{ fontFamily: "'Schibsted Grotesk', sans-serif" }}>
        <CMSSidebar />
        <div className="flex flex-col flex-1 min-w-0" style={{ backgroundColor: '#F4F1EA' }}>
          {children}
        </div>
      </div>
    </CMSProvider>
  );
}
