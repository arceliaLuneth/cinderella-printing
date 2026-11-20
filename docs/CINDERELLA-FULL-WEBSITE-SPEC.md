# Cinderella Printing — Full Company Website Specification

## 1. Product direction

A full company website for Cinderella Printing, built with the existing Next.js App Router project. The public experience combines company information, a digital product catalogue, real product photography, a guided discovery flow, a consultation summary, portfolio, and contact information.

The visual direction is **Corporate + Editorial**: clear information architecture, generous spacing, strong but restrained typography, real product photography, and the existing Cinderella brand palette.

## 2. Public information architecture

- `/` — Home: positioning, key service categories, selected product photographs, process overview, consultation CTA.
- `/cari-produk` — Guided Discovery: two-step category and readiness selection.
- `/produk` — Catalogue: seven business categories, search/filter, six supplied product records.
- `/produk/[slug]` — Product detail: real photograph, description, consultation CTA, specifications explicitly marked for confirmation.
- `/portofolio` — Product documentation gallery with native horizontal carousel.
- `/tentang` — Company overview, material guide, order process and re-stock explanation.
- `/konsultasi` — Customer requirement preparation form.
- `/konfirmasi` — Local consultation summary and pre-filled WhatsApp handoff.
- `/faq-kontak` — FAQ, WhatsApp, Instagram, and appointment-only meeting point.

Legacy public routes `/kontak`, `/layanan`, and `/pesan` redirect to the canonical pages rather than showing duplicate placeholder content.

## 3. Catalogue taxonomy

The seven category labels follow the supplied digital catalogue:

1. Packaging
2. Branding
3. Promosi
4. Office
5. Kemasan Khusus
6. Label & Sleeve
7. Lainnya

Six photographs supplied by the owner are used as actual product documentation. All six are categorized under Packaging because they depict food packaging. No photos are fabricated for the other categories; those categories remain discoverable and can be asked about through consultation.

## 4. Owner-supplied product assets

The six supplied photos are converted to optimized WebP while retaining their visual content and aspect ratio:

- `roti-bakar-katalji-rasa.webp`
- `neko-gurintik-fried-chicken.webp`
- `martabak-boland-kubang.webp`
- `pizza-panjang.webp`
- `pizza-delicious.webp`
- `martabak-aa.webp`

Descriptions avoid inventing dimensions, material grades, MOQ, finishing, unit prices, or production capacity. The website treats photographs as visual examples, not technical specification sheets.

## 5. Owner information

- WhatsApp: `6281511693137`
- Instagram: `@cinderella.printing`
- Instagram URL: `https://www.instagram.com/cinderella.printing/`
- Office & Meeting Point: `Komp. GBA Barat A6 No. 15, Bojongsoang, Kab. Bandung`
- Appointment note: meetings and consultations are by appointment.

No email address or operating hours are shown because they were not supplied in the digital catalogue.

## 6. Motion specification

Existing dependencies are used; no new animation dependency is required.

- Split-text reveal: authored word/line spans in the home hero, animated after hydration by GSAP.
- Scroll image reveal: clipped image reveal with subtle scale movement.
- Sticky storytelling: CSS sticky material panel with sequential material descriptions; GSAP reveals each step.
- Product carousel: accessible native horizontal scrolling with scroll snap and previous/next controls; no third-party carousel dependency.
- Hover micro-interactions: restrained card lift, image zoom, and CTA feedback in CSS.
- Timeline animation: GSAP ScrollTrigger animates progress along the ten-stage order/re-stock timeline.
- Guided discovery transitions: two-step client-side wizard with visible progress and stateful category/readiness choice.

Animations are initialized in `useEffect` after React hydration. The `prefers-reduced-motion` media preference disables the GSAP motion layer. Content remains visible without animation.

## 7. Consultation and business-process boundaries

The consultation form creates a temporary browser-session summary. It does not create an order, submit to a database, or accept payment. The selected reference file name is shown in the summary, but the file itself must be attached manually in WhatsApp until a backend upload endpoint exists. Customers review and send the pre-filled WhatsApp message themselves.

Order creation, customer records, payment status, invoices, and admin authentication remain backend responsibilities. The current admin panel in the supplied ZIP is a local demonstration using session storage/mock data; it is not production-secure or database-integrated.

## 8. Implementation stack

- Next.js App Router (existing repository version)
- React and TypeScript (existing versions)
- Tailwind CSS plus existing project CSS
- GSAP + ScrollTrigger (already installed in the ZIP)
- Native CSS scroll snap for the portfolio carousel
- Next/Image for local product assets

No Lenis, Three.js, WebGL, or additional carousel library is added in this iteration to avoid extra payload and complexity.

## 9. QA checklist

- Check all public routes and internal links.
- Test search and category filters, including categories without supplied photographs.
- Test guided discovery back/next and query handoff to consultation.
- Test form persistence, summary values, WhatsApp message, and manual attachment notice.
- Test carousel controls and keyboard horizontal scrolling.
- Test mobile, tablet, and desktop layouts.
- Test keyboard focus, visible focus indicators, image alt text, and reduced motion.
- Run `npm run lint` and `npm run build` after dependencies are installed.
- Confirm the official address/contact details with the owner before public deployment.

## 10. Important operational confirmations

The supplied catalogue is the source for the category list, material descriptions, restock flow, example quantity split, pre-production-cost note, and contact details. Confirm material technical suitability, any food-contact claim, free/waived pre-production terms, restock conditions, address, and permission to publish product/customer marks with the business owner before launch.
