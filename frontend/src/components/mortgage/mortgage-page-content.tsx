"use client";

import { useCallback, useState } from "react";

import { MortgageCalculatorFull } from "@/components/mortgage/mortgage-calculator-full";
import { MortgageProgramsSection } from "@/components/mortgage/mortgage-programs-section";
import { MortgageTrustFooter } from "@/components/mortgage/mortgage-trust-footer";
import type { MortgageProgramRow } from "@/lib/mortgage-data";
import type { MortgagePageSettings } from "@/lib/mortgage-settings-schema";

export function MortgagePageContent({ settings }: { settings: MortgagePageSettings }) {
  const [presetProgram, setPresetProgram] = useState<MortgageProgramRow | null>(null);

  const handleProgramCalculate = useCallback((program: MortgageProgramRow) => {
    setPresetProgram(program);
    requestAnimationFrame(() => {
      document.getElementById("mortgage-calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <>
      <MortgageProgramsSection
        programs={settings.programs}
        programsFootnote={settings.programsFootnote}
        onCalculate={handleProgramCalculate}
      />
      <MortgageCalculatorFull settings={settings} presetProgram={presetProgram} />
      <MortgageTrustFooter settings={settings} />
    </>
  );
}
