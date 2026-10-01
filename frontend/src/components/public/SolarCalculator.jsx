import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Zap, Home as HomeIcon, Maximize, TrendingUp, ArrowRight, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TARIFF = 8;
const UNITS_PER_KW_DAY = 4;
const PANEL_WATT = 400;
const SQFT_PER_KW = 100;

export default function SolarCalculator() {
  const [mode, setMode] = useState("bill");
  const [bill, setBill] = useState("3000");
  const [units, setUnits] = useState("400");

  const result = useMemo(() => {
    const monthlyUnits = mode === "bill" ? (parseFloat(bill) || 0) / TARIFF : (parseFloat(units) || 0);
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
    <div className="grid lg:grid-cols-5 gap-6 items-stretch">
      {/* Input panel */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-7 sm:p-8 premium-shadow flex flex-col">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-solar mb-5">
          <Sun className="w-4 h-4" /> Solar Estimator
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-full mb-6">
          <button onClick={() => setMode("bill")} className={`py-2.5 rounded-full text-sm font-semibold transition-all ${mode === "bill" ? "bg-navy text-white shadow" : "text-slate-500"}`} data-testid="calc-mode-bill">Monthly Bill</button>
          <button onClick={() => setMode("units")} className={`py-2.5 rounded-full text-sm font-semibold transition-all ${mode === "units" ? "bg-navy text-white shadow" : "text-slate-500"}`} data-testid="calc-mode-units">Monthly Units</button>
        </div>

        {mode === "bill" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Average Monthly Electricity Bill</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
              <Input type="number" value={bill} onChange={(e) => setBill(e.target.value)} className="pl-8 h-14 text-2xl font-bold text-navy-dark num-animate" data-testid="calc-bill-input" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Average Monthly Consumption</label>
            <div className="relative">
              <Input type="number" value={units} onChange={(e) => setUnits(e.target.value)} className="pr-16 h-14 text-2xl font-bold text-navy-dark num-animate" data-testid="calc-units-input" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">units</span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <p className="text-xs text-slate-400 leading-relaxed">
            Based on ₹{TARIFF}/unit, {UNITS_PER_KW_DAY} units/kW/day and {PANEL_WATT}W panels. Figures are approximate estimates, not guaranteed results.
          </p>
        </div>
      </div>

      {/* Result panel */}
      <div className="lg:col-span-3 gradient-navy rounded-3xl p-7 sm:p-9 text-white relative overflow-hidden premium-shadow">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-solar/25 blur-3xl" />
        <div className="relative">
          <div className="text-sm text-slate-300">Recommended system capacity</div>
          <div className="flex items-end gap-3 mt-1">
            <span className="font-heading text-6xl font-extrabold num-animate">{result ? result.capacity : "—"}</span>
            <span className="text-2xl font-bold text-solar mb-2">kW</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-7">
            <Tile icon={Zap} label="Panels" value={result ? result.panels : "—"} />
            <Tile icon={HomeIcon} label="Units / month" value={result ? result.generation : "—"} />
            <Tile icon={Maximize} label="Roof sq.ft" value={result ? result.roofArea : "—"} />
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-solar to-amber-400 p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white/90 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Est. monthly savings</div>
              <div className="font-heading text-3xl font-extrabold num-animate flex items-center"><IndianRupee className="w-6 h-6" />{result ? result.savings.toLocaleString("en-IN") : "—"}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/80">per year approx.</div>
              <div className="font-heading text-xl font-bold num-animate">₹{result ? (result.savings * 12).toLocaleString("en-IN") : "—"}</div>
            </div>
          </div>

          <Button asChild className="btn-solar text-white rounded-full font-semibold w-full mt-6 h-12 text-base border-0">
            <Link to="/quote" data-testid="calc-quote-btn">GET A FREE QUOTE <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value }) {
  return (
    <div className="glass-dark rounded-2xl p-4 text-center">
      <Icon className="w-5 h-5 text-solar mx-auto mb-2" />
      <div className="font-heading text-2xl font-bold num-animate">{value}</div>
      <div className="text-[11px] text-slate-300 mt-0.5">{label}</div>
    </div>
  );
}
