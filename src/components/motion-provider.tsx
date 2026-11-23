"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MotionProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    let firstFrame = 0;
    let secondFrame = 0;
    let context: ReturnType<typeof gsap.context> | undefined;
    let media: ReturnType<typeof gsap.matchMedia> | undefined;

    const initializeAnimations = () => {
      if (!scope.isConnected) return;

      context = gsap.context(() => {
        media = gsap.matchMedia();

        media.add("(prefers-reduced-motion: no-preference)", () => {
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          const hero = scope.querySelector<HTMLElement>(".hero");

          if (hero) {
            const eyebrow = hero.querySelector<HTMLElement>(".eyebrow");
            const words = hero.querySelectorAll<HTMLElement>(".motion-word");
            const copy = hero.querySelector<HTMLElement>(".lead");

            if (eyebrow) {
              intro.fromTo(
                eyebrow,
                { y: 10, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.34 }
              );
            }

            if (words.length) {
              intro.fromTo(
                words,
                { yPercent: 110, autoAlpha: 0 },
                {
                  yPercent: 0,
                  autoAlpha: 1,
                  duration: 0.62,
                  stagger: 0.085,
                  ease: "power3.out",
                },
                "-=0.1"
              );
            }

            if (copy) {
              intro.fromTo(
                copy,
                { y: 16, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.46 },
                "-=0.3"
              );
            }
          }

          const hasInteractiveDescendant = (element: HTMLElement) =>
            Boolean(element.querySelector("a, button, input, select, textarea, summary, [role='button'], [contenteditable='true']"));

          gsap
            .utils
            .toArray<HTMLElement>("[data-motion='reveal']", scope)
            .forEach((element) => {
              if (
                element.closest(".hero, a, button, input, select, textarea, summary, [contenteditable='true']") ||
                hasInteractiveDescendant(element)
              ) return;

              gsap.fromTo(
                element,
                { y: 22, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.58,
                  ease: "power2.out",
                  scrollTrigger: { trigger: element, start: "top 88%", once: true },
                }
              );
            });

          gsap
            .utils
            .toArray<HTMLElement>("[data-motion-group]", scope)
            .forEach((group) => {
              const items = Array.from(
                group.querySelectorAll<HTMLElement>("[data-motion-item]")
              ).filter((item) => !hasInteractiveDescendant(item));
              if (!items.length || hasInteractiveDescendant(group)) return;

              gsap.fromTo(
                items,
                { y: 24, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.52,
                  stagger: 0.075,
                  ease: "power2.out",
                  scrollTrigger: { trigger: group, start: "top 86%", once: true },
                }
              );
            });

          gsap
            .utils
            .toArray<HTMLElement>("[data-motion-image]", scope)
            .forEach((image) => {
              if (image.closest("a, button, summary") || image.querySelector("a, button, input, select, textarea")) return;

              gsap.fromTo(
                image,
                {
                  clipPath: "inset(5% 5% 5% 5% round 14px)",
                  scale: 0.985,
                },
                {
                  clipPath: "inset(0% 0% 0% 0% round 12px)",
                  scale: 1,
                  duration: 0.7,
                  ease: "power2.out",
                  scrollTrigger: { trigger: image, start: "top 90%", once: true },
                }
              );
            });

          gsap
            .utils
            .toArray<HTMLElement>("[data-motion-step]", scope)
            .forEach((step) => {
              if (
                step.closest("a, button, input, select, textarea, summary, [contenteditable='true']") ||
                hasInteractiveDescendant(step)
              ) return;

              gsap.fromTo(
                step,
                { x: 18, autoAlpha: 0.45 },
                {
                  x: 0,
                  autoAlpha: 1,
                  duration: 0.55,
                  ease: "power2.out",
                  scrollTrigger: { trigger: step, start: "top 78%", once: true },
                }
              );
            });

          gsap
            .utils
            .toArray<HTMLElement>("[data-motion-timeline]", scope)
            .forEach((timeline) => {
              const line = timeline.querySelector<HTMLElement>(".process-timeline__progress");
              if (!line) return;

              gsap.fromTo(
                line,
                { scaleY: 0 },
                {
                  scaleY: 1,
                  transformOrigin: "top center",
                  ease: "none",
                  scrollTrigger: {
                    trigger: timeline,
                    start: "top 72%",
                    end: "bottom 70%",
                    scrub: 0.35,
                  },
                }
              );
            });

          const progress = scope.querySelector<HTMLElement>(".scroll-progress");
          if (progress) {
            gsap.fromTo(
              progress,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: document.documentElement,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: 0.25,
                },
              }
            );
          }

        });
      }, scope);

      ScrollTrigger.refresh();
    };

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(initializeAnimations);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      media?.revert();
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
