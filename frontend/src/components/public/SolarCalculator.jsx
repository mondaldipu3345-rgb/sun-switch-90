import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Zap, Home as HomeIcon, IndianRupee, Maximize, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TARIFF = 8; // ₹ per unit (estimate)
const UNITS_PER_KW_DAY = 4; // generation estimate
const PANEL_WATT = 400;
const SQFT_PER_KW = 100;

export default function SolarCalculator() {
  const [mode, setMode] = useState("bill");
  const [bill, setBill] = useState("3000");
  const [units, setUnits] = useState("400");

  const result = useMemo(() => {
    const monthlyUnits = mode === "bill"
      ? (parseFloat(bill) || 0) / TARIFF
      : (parseFloat(units) || 0);
    if (monthlyUnits <= 0) return null;
    const dailyUnits = monthlyUnits / 30;
    const capacity = Math.max(1, Math.round((dailyUnits / UNITS_PER_KW_DAY) * 10) / 10);
    const panels = Math.ceil((capacity * 1000) / PANEL_WATT);
    const generation = Math.round(capacity * UNITS_PER_KW_DAY * 30);
    const roofArea = Math.round(capacity * SQFT_PER_KW);
    const savings = Math.round(Math.min(generation, monthlyUnits) * TARIFF);
    return { capacity, panels, generation, roofArea, savings };
  }, [mode, bill, units]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="bill" data-testid="calc-mode-bill">Monthly Bill</TabsTrigger>
            <TabsTrigger value="units" data-testid="calc-mode-units">Monthly Units</TabsTrigger>
          </TabsList>
          <TabsContent value="bill" className="space-y-2">
            <Label className="font-medium text-slate-700">Average Monthly Electricity Bill (₹)</Label>
            <Input type="number" value={bill} onChange={(e) => setBill(e.target.value)} className="text-lg" data-testid="calc-bill-input" />
          </TabsContent>
          <TabsContent value="units" className="space-y-2">
            <Label className="font-medium text-slate-700">Average Monthly Consumption (Units/kWh)</Label>
            <Input type="number" value={units} onChange={(e) => setUnits(e.target.value)} className="text-lg" data-testid="calc-units-input" />
          </TabsContent>
        </Tabs>
        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          Assumptions: ₹{TARIFF}/unit tariff, {UNITS_PER_KW_DAY} units/kW/day generation, {PANEL_WATT}W panels. These are approximate and configurable.
        </p>
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ResultCard icon={Sun} label="Recommended Capacity" value={`${result.capacity} kW`} />
              <ResultCard icon={Zap} label="Approx. Panels" value={`${result.panels}`} />
              <ResultCard icon={HomeIcon} label="Est. Generation / month" value={`${result.generation} units`} />
              <ResultCard icon={Maximize} label="Approx. Roof Area" value={`${result.roofArea} sq.ft`} />
            </div>
            <div className="bg-eco/10 border border-eco/30 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 flex items-center gap-1"><IndianRupee className="w-4 h-4 text-eco" /> Estimated Monthly Savings</div>
                <div className="font-heading text-3xl font-bold text-eco-dark mt-1">₹{result.savings.toLocaleString("en-IN")}</div>
              </div>
              <span className="text-xs text-slate-400 max-w-[120px] text-right">Estimate only, not a guarantee</span>
            </div>
            <Button asChild className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold w-full">
              <Link to="/quote" data-testid="calc-quote-btn">GET A QUOTE</Link>
            </Button>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6" /> Enter a value to see your estimate.
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <Icon className="w-5 h-5 text-navy mb-3" />
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-heading text-2xl font-bold text-navy-dark mt-1">{value}</div>
    </div>
  );
}
