export const COMPANY_PROFILE = {
  name: "Cinderella Printing",
  tagline: "Custom Printing & Packaging",
  address:
    process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ||
    "2MF2+RRV, Lengkong, Kec. Bojongsoang, Kabupaten Bandung, Jawa Barat 40287",
  phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, "")}`
    : "+62 815-1169-3137",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "halo@cinderellaprinting.id",
  website: "cinderellaprinting.id",
  paymentNote:
    "Pembayaran melalui transfer bank. Konfirmasi bukti transfer kepada admin sebelum jatuh tempo.",
};

export const DEMO_ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_PASSWORD ?? "printcinderella";
