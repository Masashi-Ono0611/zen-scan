// Zen Scan - Route Entry Point

import type { Route } from "./+types/zen-scan";
import { ZenScanApp } from "../zen-scan/ZenScanApp";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Zen Scan - TON Contract Security" },
    { name: "description", content: "Mindful blockchain security through Zen meditation. Scan TON contracts with AI-powered risk analysis and achieve a clear Zen mind." },
  ];
}

export default function ZenScanRoute() {
  return <ZenScanApp />;
}
