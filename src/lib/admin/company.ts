export const COMPANY_PROFILE = {
  name: "Cinderella Printing",
  tagline: "Custom Printing & Packaging",
  address:
    process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ||
    "Komp. GBA Barat A6 No. 15, Bojongsoang, Kab. Bandung",
  phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, "")}`
    : "+62 815-1169-3137",
  // Leave blank until the business owner supplies an official email address.
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
  // Do not publish an unverified domain in customer invoices.
  website: process.env.NEXT_PUBLIC_SITE_URL || "",
  paymentNote:
    "Pembayaran dan konfirmasi dilakukan sesuai rincian pesanan yang telah disepakati bersama admin.",
};

// This is a local demonstration credential only, not production authentication.
// Replace it with server-side authentication before exposing the admin panel publicly.
export const DEMO_ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_PASSWORD ?? "printcinderella";
