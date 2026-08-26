import { BookOpen, HelpCircle } from "lucide-react";
import { DashboardSidebar } from "@/pages/AdminDashboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpManualContent } from "@/features/help/components/HelpManualContent";
import { HelpVisualMockup } from "@/features/help/components/HelpVisualMockup";
import { getManualsForRole } from "@/features/help/lib/helpRoutes";

type Role = "admin" | "buyer" | "seller" | "agent";

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  buyer: "Buyer",
  seller: "Seller",
  agent: "Agent",
};

export default function DashboardHelp({ role }: { role: Role }) {
  const manuals = getManualsForRole(role);

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Help" role={role} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {roleLabels[role]} Help Center
              </h1>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                Guides for every feature in your dashboard — with step-by-step instructions and
                visual previews. You can also click the{" "}
                <HelpCircle className="w-4 h-4 inline text-primary align-text-bottom" /> button on
                any page for context-specific help.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <HelpVisualMockup type="help-fab" />
          </div>

          <Accordion type="multiple" className="space-y-3">
            {manuals.map((manual) => (
              <AccordionItem
                key={manual.id}
                value={manual.id}
                className="border border-border rounded-xl bg-background px-4 shadow-sm"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="text-left">
                    <p className="font-medium text-foreground">{manual.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">{manual.summary}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-0">
                  <HelpManualContent manual={manual} compact />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}
