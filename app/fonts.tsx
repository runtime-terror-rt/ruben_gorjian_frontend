import { Poppins, Stack_Sans_Notch, Sora } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const stack_sans_notch = Stack_Sans_Notch({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  fallback: ["sora", "sans-serif"],
  adjustFontFallback: false,
});
