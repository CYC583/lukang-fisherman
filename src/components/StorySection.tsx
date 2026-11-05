import { getStories, type Story } from "@/lib/content";
import { CastInteraction } from "./CastInteraction";
import { BlogCta } from "./BlogCta";

function StoryMedia({ media }: { media: NonNullable<Story["media"]> }) {
  if (media.type === "video") {
    return (
      <video
        src={media.src}
        aria-label={media.alt}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.src} alt={media.alt} className="h-full w-full object-cover" loading="lazy" />;
}

export function StorySection() {
  const stories = getStories();
  return (
    <section id="story" className="scroll-mt-4">
      {stories.map((s, i) => (
        <article key={s.id} className="relative">
          {s.media && (
            <div className="relative aspect-[9/16] max-h-[85dvh] w-full overflow-hidden bg-black">
              <StoryMedia media={s.media} />
              {/* broadcast-style lower third, not a title card */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <span className="absolute left-4 top-4 text-[10px] tracking-[0.4em] text-white/80">
                CH.{String(i + 1).padStart(2, "0")} ・ 鹿港漁人
              </span>
            </div>
          )}
          <div className="px-6 py-10">
            <h2 className="mb-4 border-l-4 border-[var(--color-gold)] pl-3 text-2xl font-bold tracking-widest">{s.title}</h2>
            <p className="leading-loose">{s.body}</p>
          </div>
          {i === 0 && <CastInteraction />}
        </article>
      ))}
      <BlogCta />
    </section>
  );
}
