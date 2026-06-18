import { loadContent } from '@/lib/db';

export default async function WhatsAppButton() {
  const store = await loadContent();
  const whatsapp = store?.c?.brand?.whatsapp ?? '';
  const number = whatsapp.replace(/[^0-9]/g, '');

  return (
    <a
      href={number ? `https://wa.me/${number}` : '#'}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp schreiben"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#25D366',
        boxShadow: '0 8px 24px rgba(37,211,102,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      {/* WhatsApp icon SVG */}
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 2C8.268 2 2 8.268 2 16c0 2.462.655 4.77 1.8 6.765L2 30l7.47-1.764A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
          fill="white"
          opacity="0.15"
        />
        <path
          d="M16 3.5C8.82 3.5 3 9.32 3 16.5c0 2.34.628 4.54 1.726 6.43L3 29.5l6.82-1.74A12.43 12.43 0 0016 29.5c7.18 0 13-5.82 13-13s-5.82-13-13-13zm6.18 18.6c-.26.73-1.52 1.4-2.08 1.46-.56.06-1.08.28-3.64-.76-3.08-1.24-5.06-4.32-5.22-4.52-.16-.2-1.28-1.7-1.28-3.24 0-1.54.8-2.3.88-2.62.08-.32.44-.48.6-.5.16-.02.32 0 .46 0 .16 0 .36-.06.54.42.2.5.68 1.72.74 1.84.06.12.1.28.02.44-.08.16-.12.26-.24.42-.12.16-.26.34-.36.46-.12.14-.24.28-.1.52.14.24.62.97 1.34 1.57.92.8 1.7 1.05 1.94 1.17.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.2 1.31z"
          fill="white"
        />
      </svg>
    </a>
  );
}
