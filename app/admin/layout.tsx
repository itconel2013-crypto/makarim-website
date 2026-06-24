import { loadContent } from '@/lib/db';
import { CMSProvider } from '@/components/cms/CMSProvider';
import { CMSSidebar } from '@/components/cms/CMSSidebar';

export const metadata = { title: 'Makarim CMS' };

// Admin is auth-gated and shows live drafts — never statically cache it.
// (Also avoids prerendering pages that use useSearchParams, e.g. /admin/login.)
export const dynamic = 'force-dynamic';

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
