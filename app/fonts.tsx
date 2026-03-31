import { Poppins, Stack_Sans_Notch, Sora } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
<<<<<<< HEAD
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
=======
  variable: "--font-poppins",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
  variable: "--font-poppins",
>>>>>>> 1481ac94701442bff06c3a5237848e67723f65c9
});

export const stack_sans_notch = Stack_Sans_Notch({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
<<<<<<< HEAD
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
=======
  variable: "--font-stack-sans-notch",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
  variable: "--font-stack-sans-notch",
>>>>>>> 1481ac94701442bff06c3a5237848e67723f65c9
});

export const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
<<<<<<< HEAD
  fallback: ["sora", "sans-serif"],
  adjustFontFallback: false,
=======
  variable: "--font-sora",
  fallback: ["sora", "sans-serif"],
  adjustFontFallback: false,
  variable: "--font-sora",
>>>>>>> 1481ac94701442bff06c3a5237848e67723f65c9
});
