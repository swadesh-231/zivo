import { CallToAction } from "@/components/marketing/call-to-action";
import { Capabilities } from "@/components/marketing/capabilities";
import { GridBackdrop } from "@/components/marketing/grid-backdrop";
import { Hero } from "@/components/marketing/hero";
import { Models } from "@/components/marketing/models";
import { PreviewShowcase } from "@/components/marketing/preview-showcase";
import { Workflow } from "@/components/marketing/workflow";

export default function LandingPage() {
  return (
    <div className="relative">
      <GridBackdrop />
      <Hero />
      <PreviewShowcase />
      <Capabilities />
      <Workflow />
      <Models />
      <CallToAction />
    </div>
  );
}
