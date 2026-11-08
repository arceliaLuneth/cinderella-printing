"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function MotionProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = root.current;
        if (!scope) return;

        const header = scope.querySelector<HTMLElement>(".site-header");
        const hero = scope.querySelector<HTMLElement>(".hero");
        const progress = scope.querySelector<HTMLElement>(".scroll-progress");

        // Small page-load sequence. If this page has no hero, only the header animates.
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (header) {
          intro.fromTo(header, { y: -18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 });
        }

        if (hero) {
          const eyebrow = hero.querySelector(".eyebrow");
          const heading = hero.querySelector("h1");
          const copy = hero.querySelector(".lead");
          const actions = hero.querySelector(".button-row");
          const helper = hero.querySelector(".helper");
          const visual = hero.querySelector<HTMLElement>(".hero-visual");

          if (eyebrow) intro.fromTo(eyebrow, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45 }, "-=0.24");
          if (heading) intro.fromTo(heading, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.72 }, "-=0.22");
          if (copy) intro.fromTo(copy, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 }, "-=0.34");
          if (actions) intro.fromTo(actions, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.48 }, "-=0.28");
          if (helper) intro.fromTo(helper, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.38 }, "-=0.2");
          if (visual) {
            intro.fromTo(
              visual,
              { clipPath: "inset(10% 10% 10% 10% round 18px)", scale: 0.96, autoAlpha: 0.7 },
              { clipPath: "inset(0% 0% 0% 0% round 12px)", scale: 1, autoAlpha: 1, duration: 0.95, ease: "power2.out" },
              "-=0.8"
            );
          }
        }

        // Section and card reveals for all nine routes.
        const revealSelectors = [
          ".page-intro",
          ".section-heading",
          ".info-card",
          ".category-card",
          ".product-card",
          ".cta-band",
          ".portfolio-feature",
          ".about-feature",
          ".form-section",
          ".summary-card",
          ".summary-aside",
          ".faq-layout > *",
          ".contact-grid > *",
          ".notice",
        ];

        revealSelectors.forEach((selector) => {
          gsap.utils.toArray<HTMLElement>(selector, scope).forEach((element, index) => {
            if (element.closest(".hero")) return;
            gsap.fromTo(
              element,
              { y: 24, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.68,
                delay: Math.min((index % 4) * 0.055, 0.16),
                ease: "power2.out",
                scrollTrigger: { trigger: element, start: "top 89%", once: true },
              }
            );
          });
        });

        // Subtle image reveal for feature and product imagery.
        gsap.utils.toArray<HTMLElement>(".feature-image, .detail-image", scope).forEach((image) => {
          gsap.fromTo(
            image,
            { clipPath: "inset(7% 7% 7% 7% round 14px)", scale: 0.98 },
            {
              clipPath: "inset(0% 0% 0% 0% round 10px)",
              scale: 1,
              duration: 0.85,
              ease: "power2.out",
              scrollTrigger: { trigger: image, start: "top 88%", once: true },
            }
          );
        });

        // Thin reading-progress line at the top of the viewport.
        if (progress) {
          gsap.to(progress, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.25 },
          });
        }

        // Card hover is intentionally subtle and does not change layout dimensions.
        const cardCleanups: Array<() => void> = [];
        gsap.utils.toArray<HTMLElement>(".category-card, .product-card, .info-card", scope).forEach((card) => {
          const enter = () => gsap.to(card, { y: -4, duration: 0.22, ease: "power2.out", overwrite: "auto" });
          const leave = () => gsap.to(card, { y: 0, duration: 0.28, ease: "power2.out", overwrite: "auto" });
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          cardCleanups.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
          });
        });

        return () => cardCleanups.forEach((cleanup) => cleanup());
      });

      return () => media.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="motion-root">
      <div className="scroll-progress" aria-hidden="true" />
      {children}
    </div>
  );
}
