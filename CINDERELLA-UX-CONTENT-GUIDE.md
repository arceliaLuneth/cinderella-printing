# Cinderella Printing — UX & Content Guide

## Product purpose
The public website helps visitors understand the business, explore product categories, review inspiration references, prepare their requirements, and continue the discussion with Cinderella Printing. The consultation summary is not an order submission, payment, or confirmed transaction.

## Content principles
- Use clear Indonesian and explain unfamiliar terms.
- Prefer "bahan" over "material" and "jumlah minimum pemesanan" over "MOQ" in customer-facing copy.
- State what is known; do not invent prices, minimum quantities, production capacity, certifications, customer names, delivery coverage, or turnaround times.
- Keep "Inspirasi Produk" distinct from a real project portfolio until approved photos and project details are available.
- Keep descriptions specific to the category and avoid repeating generic filler text.

## Contact configuration
Create/update `.env.local` only after the business owner confirms the details:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx
NEXT_PUBLIC_BUSINESS_EMAIL=
NEXT_PUBLIC_BUSINESS_ADDRESS=
NEXT_PUBLIC_BUSINESS_HOURS=
```

Use the WhatsApp number in international format with digits only. Do not commit `.env.local` if it contains private configuration.

## Consultation form limitations before backend integration
- The form creates a temporary summary in the current browser session.
- The form does not create an order and does not write to a database.
- The selected reference file name is recorded, but the file itself is not uploaded. The visitor must attach it manually in WhatsApp.
- When the WhatsApp number is configured, the summary can be opened as a pre-filled WhatsApp message. The visitor still reviews and sends it themselves.

## Business facts to confirm before public launch
- Official business description and service scope.
- Product names and currently available categories.
- Materials, sizes, finishing options, and minimum quantities per product.
- Contact number, email, address, and operating hours.
- Actual photos and permission to publish them.
- Production estimates, delivery terms, and other operational conditions.

## Usability checks
Test keyboard-only navigation, visible focus, form labels, error/empty states, search/filter feedback, mobile layout, image alternatives, and reduced-motion behavior. WCAG conformance must be checked against the applicable success criteria; this guide is not a conformance claim.
