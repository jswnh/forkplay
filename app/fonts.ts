import { Russo_One } from "next/font/google";
import localFont from "next/font/local";

export const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const minecrafter = localFont({
  src: "../public/fonts/Minecrafter.Alt.ttf",
  variable: "--font-brand",
  display: "swap",
});
