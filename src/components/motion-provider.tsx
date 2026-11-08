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

    // useEffect runs after React has hydrated the server-rendered markup.
    // This prevents GSAP from changing inline styles before hydration completes.
    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const header = scope.querySelector<HTMLElement>(".site-header");
        const hero = scope.querySelector<HTMLElement>(".hero");
        const progress = scope.querySelector<HTMLElement>(".scroll-progress");

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (header) {
          intro.fromTo(header, { y: -14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.48 });
        }

        if (hero) {
          const eyebrow = hero.querySelector(".eyebrow");
          const heading = hero.querySelector("h1");
          const copy = hero.querySelector(".lead");
          const actions = hero.querySelector(".button-row");
          const helper = hero.querySelector(".helper");
          const visual = hero.querySelector<HTMLElement>(".hero-visual");

          if (eyebrow) intro.fromTo(eyebrow, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, "-=0.18");
          if (heading) intro.fromTo(heading, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.62 }, "-=0.18");
          if (copy) intro.fromTo(copy, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.48 }, "-=0.28");
          if (actions) intro.fromTo(actions, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42 }, "-=0.22");
          if (helper) intro.fromTo(helper, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.32 }, "-=0.14");
          if (visual) {
            intro.fromTo(
              visual,
              { clipPath: "inset(7% 7% 7% 7% round 16px)", scale: 0.975, autoAlpha: 0.82 },
              { clipPath: "inset(0% 0% 0% 0% round 12px)", scale: 1, autoAlpha: 1, duration: 0.82, ease: "power2.out" },
              "-=0.62"
            );
          }
        }

        const revealSelectors = [
          ".page-intro", ".section-heading", ".info-card", ".category-card",
          ".product-card", ".cta-band", ".portfolio-feature", ".about-feature",
          ".form-section", ".summary-card", ".summary-aside", ".faq-layout > *",
          ".contact-grid > *", ".notice",
        ];

        revealSelectors.forEach((selector) => {
          gsap.utils.toArray<HTMLElement>(selector, scope).forEach((element, index) => {
            if (element.closest(".hero")) return;
            gsap.fromTo(
              element,
              { y: 18, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.56,
                delay: Math.min((index % 4) * 0.045, 0.13),
                ease: "power2.out",
                scrollTrigger: { trigger: element, start: "top 91%", once: true },
              }
            );
          });
        });

        gsap.utils.toArray<HTMLElement>(".feature-image, .detail-image", scope).forEach((image) => {
          gsap.fromTo(
            image,
            { clipPath: "inset(5% 5% 5% 5% round 12px)", scale: 0.985 },
            {
              clipPath: "inset(0% 0% 0% 0% round 10px)",
              scale: 1,
              duration: 0.72,
              ease: "power2.out",
              scrollTrigger: { trigger: image, start: "top 90%", once: true },
            }
          );
        });

        if (progress) {
          gsap.fromTo(
            progress,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.25 },
            }
          );
        }

      });

      return () => media.revert();
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div ref={root} className="motion-root">
      <div className="scroll-progress" aria-hidden="true" />
      {children}
    </div>
  );
}
