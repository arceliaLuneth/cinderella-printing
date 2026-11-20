"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * All animation setup happens in useEffect, after hydration.
 * Content remains visible without JavaScript and when reduced motion is requested.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    let firstFrame = 0;
    let secondFrame = 0;
    let context: ReturnType<typeof gsap.context> | undefined;

    const initializeAnimations = () => {
      if (!scope.isConnected) return;
      context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        const header = scope.querySelector<HTMLElement>(".site-header");
        const hero = scope.querySelector<HTMLElement>(".hero");

        if (header) {
          intro.fromTo(header, { y: -12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42 });
        }

        if (hero) {
          const eyebrow = hero.querySelector<HTMLElement>(".eyebrow");
          const words = hero.querySelectorAll<HTMLElement>(".motion-word");
          const copy = hero.querySelector<HTMLElement>(".lead");
          const actions = hero.querySelector<HTMLElement>(".button-row");
          const visual = hero.querySelector<HTMLElement>(".hero-visual");

          if (eyebrow) intro.fromTo(eyebrow, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.34 }, "-=0.12");
          if (words.length) {
            intro.fromTo(words, { yPercent: 110, autoAlpha: 0 }, {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.62,
              stagger: 0.085,
              ease: "power3.out",
            }, "-=0.10");
          }
          if (copy) intro.fromTo(copy, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.46 }, "-=0.30");
          if (actions) intro.fromTo(actions, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.38 }, "-=0.22");
          if (visual) intro.fromTo(visual, {
            clipPath: "inset(6% 6% 6% 6% round 18px)",
            scale: 0.975,
            autoAlpha: 0.82,
          }, {
            clipPath: "inset(0% 0% 0% 0% round 14px)",
            scale: 1,
            autoAlpha: 1,
            duration: 0.82,
            ease: "power2.out",
          }, "-=0.56");
        }

        // Generic scroll reveal for semantic content blocks.
        gsap.utils.toArray<HTMLElement>("[data-motion='reveal']", scope).forEach((element) => {
          if (element.closest(".hero")) return;
          gsap.fromTo(element, { y: 22, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.58,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          });
        });

        // Stagger children without rewriting React-managed text nodes.
        gsap.utils.toArray<HTMLElement>("[data-motion-group]", scope).forEach((group) => {
          const items = group.querySelectorAll<HTMLElement>("[data-motion-item]");
          if (!items.length) return;
          gsap.fromTo(items, { y: 24, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.52,
            stagger: 0.075,
            ease: "power2.out",
            scrollTrigger: { trigger: group, start: "top 86%", once: true },
          });
        });

        // Product photographs reveal with a restrained clip-path transition.
        gsap.utils.toArray<HTMLElement>("[data-motion-image]", scope).forEach((image) => {
          gsap.fromTo(image, {
            clipPath: "inset(5% 5% 5% 5% round 14px)",
            scale: 0.985,
          }, {
            clipPath: "inset(0% 0% 0% 0% round 12px)",
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: image, start: "top 90%", once: true },
          });
        });

        // Sticky material storytelling: reveal each explanation as it enters view.
        gsap.utils.toArray<HTMLElement>("[data-motion-step]", scope).forEach((step) => {
          gsap.fromTo(step, { x: 18, autoAlpha: 0.45 }, {
            x: 0,
            autoAlpha: 1,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: { trigger: step, start: "top 78%", once: true },
          });
        });

        // The process line animates from top to bottom as the visitor reads it.
        gsap.utils.toArray<HTMLElement>("[data-motion-timeline]", scope).forEach((timeline) => {
          const line = timeline.querySelector<HTMLElement>(".process-timeline__progress");
          if (!line) return;
          gsap.fromTo(line, { scaleY: 0 }, {
            scaleY: 1,
            transformOrigin: "top center",
            ease: "none",
            scrollTrigger: {
              trigger: timeline,
              start: "top 72%",
              end: "bottom 70%",
              scrub: 0.35,
            },
          });
        });

        const progress = scope.querySelector<HTMLElement>(".scroll-progress");
        if (progress) {
          gsap.fromTo(progress, { scaleX: 0 }, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.25,
            },
          });
        }

      });

      return () => media.revert();
      }, scope);
      ScrollTrigger.refresh();
    };

    // Let React finish hydrating nested client components before GSAP mutates inline styles.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(initializeAnimations);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      context?.revert();
    };
  }, []);

  return (
    <div ref={root} className="motion-root">
      <div className="scroll-progress" aria-hidden="true" />
      {children}
    </div>
  );
}
