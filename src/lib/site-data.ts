// Public business contact supplied for this project; local environment can override it.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281511693137").replace(/\D/g, "");
export const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "";
export const BUSINESS_ADDRESS =
  process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ??
  "2MF2+RRV, Lengkong, Kec. Bojongsoang, Kabupaten Bandung, Jawa Barat 40287";
export const BUSINESS_HOURS = process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? "";
