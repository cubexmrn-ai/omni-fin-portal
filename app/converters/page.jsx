import ConvertersWorkspace from "@/components/ConvertersWorkspace";
import ConvertersHero from "@/components/ConvertersHero";

export const metadata = {
  title: "Currency, Crypto, Metals & Commodities, Unit Converter | OmniFin Portal",
  description:
    "Convert between fiat currencies, crypto and metals & commodities (gold, silver, platinum, palladium, copper, crude oil), and worldwide units (length, area, weight, volume, speed, temperature) — including Tola, Maund, Marla and Kanal — instantly and for free.",
};

export default function ConvertersPage() {
  return (
    <>
      <ConvertersHero />

      {/* Every category card, tool tab, and "Popular" pill below is
          wired to one shared selection — clicking any of them updates
          the converter window in place, with no page reload. */}
      <ConvertersWorkspace />
    </>
  );
}
