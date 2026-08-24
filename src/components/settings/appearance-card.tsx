"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const active = hydrated ? theme : undefined;

  return (
    <Card id="preferences" className="scroll-mt-20">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Applies to this browser and is remembered between visits.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid max-w-md grid-cols-3 gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={active === option.value}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 text-xs transition-colors",
                active === option.value
                  ? "border-foreground/30 bg-muted"
                  : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              <option.icon className="size-4" />
              {option.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
