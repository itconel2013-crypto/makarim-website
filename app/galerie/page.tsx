import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { GalleryItem } from '@/lib/content-schema';
import { youtubeId, galleryImages } from '@/lib/utils';
import { GallerySlider } from '@/components/website/GallerySlider';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return {
    title: `Galerie — Eindrücke unserer Reisen | ${content.c.seo.siteName}`,
    description: 'Bilder und Videos von unseren Umrah- und Hajj-Reisen — echte Eindrücke unserer Pilgergruppen.',
  };
}

export default async function GaleriePage() {
  const content = await loadContent();
  const items: GalleryItem[] = (content.c.gallery ?? []).filter((i) => i.published !== false);

  return (
    <main className="min-h-screen bg-page">
      {/* Kopfbereich — unten bewusst weniger Luft, damit die Medien näher anschließen */}
      <section className="py-section" style={{ backgroundColor: '#F4F1EA', paddingBottom: '48px' }}>
        <div className="container-max" style={{ maxWidth: '1000px' }}>
          <p className="font-mono uppercase mb-4" style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}>
            Galerie
          </p>
          <h1 className="font-serif font-normal text-ink mb-5" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.15' }}>
            Eindrücke unserer Reisen
          </h1>
          <p className="text-body" style={{ fontSize: '17px', lineHeight: 1.7, maxWidth: '640px' }}>
            Bilder und Videos von unseren Pilgergruppen — damit du siehst, was dich erwartet.
          </p>
        </div>
      </section>

      <section className="py-section" style={{ paddingTop: '32px' }}>
        <div className="container-max" style={{ maxWidth: '1000px' }}>
          {items.length === 0 ? (
            <div className="rounded-card bg-white p-10 text-center" style={{ border: '1px solid #EAE3D8' }}>
              <p className="text-body-light">Hier erscheinen bald Bilder und Videos unserer Reisen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {items.map((item) => {
                const vid = item.type === 'video' ? youtubeId(item.url) : null;
                const imgs = galleryImages(item);
                return (
                  <figure
                    key={item.id}
                    className="overflow-hidden rounded-card bg-white m-0"
                    style={{ border: '1px solid #EAE3D8', boxShadow: '0 6px 22px rgba(40,30,20,0.05)' }}
                  >
                    {item.type === 'video' ? (
                      vid ? (
                        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${vid}`}
                            title={item.title || 'Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-page" style={{ aspectRatio: '16 / 9' }}>
                          <span className="text-body-light text-sm">Video-Link nicht erkannt</span>
                        </div>
                      )
                    ) : imgs.length > 0 ? (
                      <GallerySlider images={imgs} alt={item.title || 'Eindruck unserer Reise'} />
                    ) : (
                      <div className="flex items-center justify-center bg-page" style={{ aspectRatio: '4 / 3' }}>
                        <span className="text-body-light text-sm">Noch kein Bild</span>
                      </div>
                    )}

                    {(item.title || item.caption) && (
                      <figcaption className="p-5">
                        {item.title && (
                          <h2 className="font-serif font-normal text-ink mb-1" style={{ fontSize: '19px', lineHeight: 1.3 }}>
                            {item.title}
                          </h2>
                        )}
                        {item.caption && (
                          <p className="text-body" style={{ fontSize: '14.5px', lineHeight: 1.6 }}>
                            {item.caption}
                          </p>
                        )}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
