import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { sisterHouses, type SisterHouse } from "../../config/contact";
import studioLogo from "../../assets/sisters/the-studio.svg";
import performanceLogo from "../../assets/sisters/360-performance.svg";
import bazaarLogo from "../../assets/sisters/the-bazaar.png";

// The sister houses' own wordmarks, taken from their sites and reduced to one
// colour: each is used as a MASK over a token fill (`.house-mark` in theme.css),
// so the row is cream at rest and platinum on hover like everything else here,
// instead of three brand palettes (360's red) fighting the hero. Heights are set
// by eye so the three read as one optical size, not one pixel size; 360 sits a
// step smaller because its solid box carries more ink than the other two.
const LOGOS: Record<SisterHouse["id"], { src: string; ratio: number; hero: string; band: string }> = {
  studio: { src: studioLogo, ratio: 810.838 / 93.08, hero: "h-[13px] lg:h-[15px]", band: "h-[14px]" },
  performance: { src: performanceLogo, ratio: 1600 / 244, hero: "h-[14px] lg:h-[16px]", band: "h-[15px]" },
  bazaar: { src: bazaarLogo, ratio: 918 / 135, hero: "h-[16px] lg:h-[19px]", band: "h-[17px]" },
};

// Staggered once-only glint: when the row first comes into view, light runs
// across each wordmark in turn. It is the reward a phone visitor gets (a phone
// has no hover), and on desktop it hints that the marks answer to the pointer.
const GLINT_STAGGER_MS = 140;
const LAST = sisterHouses("hero").length - 1;

function useIntroGlint(ref: React.RefObject<Element | null>, delayMs: number) {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || typeof IntersectionObserver === "undefined") return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => setPlaying(true), delayMs);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [ref, reduce, delayMs]);
  // The class comes off when the last glint ends, so it can never fight the
  // hover glint (same pseudo-element) or replay when the pointer leaves.
  const onGlintEnd = (index: number) => {
    if (index === LAST) setPlaying(false);
  };
  return { playing, onGlintEnd };
}

function Mark({
  house,
  size,
  align,
  playing,
  index,
  onGlintEnd,
}: {
  house: SisterHouse;
  size: "hero" | "band";
  align: "center" | "left";
  playing: boolean;
  index: number;
  onGlintEnd: (index: number) => void;
}) {
  const logo = LOGOS[house.id];
  if (!logo) return null;
  const mask = `url("${logo.src}")`;
  const position = align === "left" ? "left center" : "center";
  return (
    <span
      aria-hidden
      className={`house-mark block max-w-full ${playing ? "is-playing" : ""} ${logo[size]}`}
      onAnimationEnd={() => onGlintEnd(index)}
      style={{
        aspectRatio: String(logo.ratio),
        ["--glint-delay" as string]: `${index * GLINT_STAGGER_MS}ms`,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: position,
        WebkitMaskPosition: position,
      }}
    />
  );
}

function Label() {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-cream/14" aria-hidden />
      <span className="text-[0.66rem] uppercase tracking-[0.16em] text-cream/74">Also under our roof</span>
      <span className="h-px flex-1 bg-cream/14" aria-hidden />
    </div>
  );
}

const FOCUS =
  "outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

/**
 * Desktop and tablet: along the hero's foot, three columns split by hairlines,
 * like a colophon. Hover is one gesture: light runs once across the wordmark as
 * it settles from cream to platinum, a silver rule draws out beneath it, and the
 * line and "Visit" brighten. Opens in a new tab: on a desktop the visitor keeps
 * The Collection open behind it.
 */
export function SisterHousesHero({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLUListElement>(null);
  // Wait for the nav's own fade-in (0.8s delay + 0.6s) before the glint runs.
  const { playing, onGlintEnd } = useIntroGlint(ref, 1500);
  return (
    <motion.nav
      aria-label="Our sister houses"
      className={`relative z-10 ${className}`}
      initial={reduce ? false : { opacity: 0, transform: "translateY(8px)" }}
      animate={reduce ? undefined : { opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="mx-auto max-w-[960px] px-10 pb-6 lg:pb-8">
        <Label />
        <ul ref={ref} className="mt-2 grid grid-cols-3">
          {sisterHouses("hero").map((h, i) => (
            <li key={h.id} className="border-l border-cream/10 first:border-l-0">
              <a
                href={h.url}
                target="_blank"
                rel="noopener"
                aria-label={`${h.name}: ${h.trade}. Opens in a new tab.`}
                className={`group flex h-full flex-col items-center px-4 pt-5 pb-3 text-center transition-transform duration-[90ms] ease-out active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS}`}
              >
                {/* A fixed, full-width slot, so the three lines below share a
                    baseline whatever each wordmark's height, and a wordmark can
                    never grow past its column. */}
                <span className="flex h-[19px] w-full items-center justify-center">
                  <Mark house={h} size="hero" align="center" playing={playing} index={i} onGlintEnd={onGlintEnd} />
                </span>
                <span
                  aria-hidden
                  className="hairline mt-3 block w-3/5 max-w-[140px] origin-center scale-x-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                />
                <span
                  aria-hidden
                  className="mt-2.5 block text-[0.75rem] leading-snug text-cream/72 transition-colors duration-300 group-hover:text-cream/92"
                >
                  {h.trade}
                </span>
                {/* Says out loud that this is a link: at rest, a row of logos
                    alone reads as decoration. */}
                <span
                  aria-hidden
                  className="mt-2 inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.18em] text-cream/65 transition-colors duration-300 group-hover:text-[var(--accent)]"
                >
                  Visit
                  <ArrowUpRight className="size-3 shrink-0 transition-[translate] duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}

/**
 * Phones: a hero this tall has no room for the row (it needs ~200px of a ~600px
 * in-app browser), so it gets its own band directly beneath. Full-width rows a
 * thumb can't miss; the reward is the glint running down the three wordmarks as
 * the band scrolls in, and an instant lit state under the finger. Same tab: a
 * new tab inside the Instagram / Facebook browser strands the visitor, while
 * Back brings them straight here.
 */
export function SisterHousesBand({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const { playing, onGlintEnd } = useIntroGlint(ref, 150);
  return (
    <nav aria-label="Our sister houses" className={`bg-[var(--surface-deep)] px-6 pt-10 pb-8 ${className}`}>
      <Label />
      <ul ref={ref} className="mt-4 divide-y divide-cream/10 border-y border-cream/10">
        {sisterHouses("band").map((h, i) => (
          <li key={h.id}>
            <a
              href={h.url}
              aria-label={`${h.name}: ${h.trade}.`}
              // iOS Safari only applies :active to an element with a touch listener.
              onTouchStart={() => {}}
              className={`group flex min-h-16 items-center gap-4 py-4 transition-colors duration-150 active:bg-cream/[0.06] ${FOCUS}`}
            >
              <span className="min-w-0 flex-1">
                <span className="flex h-[17px] w-full items-center">
                  <Mark house={h} size="band" align="left" playing={playing} index={i} onGlintEnd={onGlintEnd} />
                </span>
                <span aria-hidden className="mt-2 block text-[0.85rem] leading-snug text-cream/75">
                  {h.trade}
                </span>
              </span>
              <span
                aria-hidden
                className="inline-flex shrink-0 items-center gap-1 text-[0.66rem] uppercase tracking-[0.18em] text-cream/70 transition-colors duration-150 group-active:text-[var(--accent)]"
              >
                Visit
                <ArrowUpRight className="size-3.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
