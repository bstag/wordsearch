import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// Chrome for the content pages. The builder at /create sits outside this group
// because its full-height sidebar layout has no room for a header.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
