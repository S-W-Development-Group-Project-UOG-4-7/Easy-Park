"use client";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const occupiedSlots = new Set(["A4", "B7", "C3", "D5", "F2", "H8", "J1"]);
const carWashSlots = ["CW1", "CW2", "CW3", "CW4"];
const evSlotsTop = ["K1", "K2", "K3", "K4", "K5", "K6"];
const evSlotsBottom = ["L1", "L2", "L3", "L4", "L5", "L6"];

function SlotTile({
  code,
  occupied,
}: {
  code: string;
  occupied?: boolean;
}) {
  return (
    <button
      type="button"
      className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-semibold transition ${
        occupied ? "bg-[#1E293B] text-slate-300" : "bg-[#0F172A] text-slate-400 hover:bg-white/5"
      } border border-white/5`}
    >
      {occupied ? (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-400" />
      ) : null}
      {code}
    </button>
  );
}

export default function SlotGrid() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-200">
            Entrance
          </span>
          <span>— Drive lane</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Total: 106</span>
          <span className="text-lime-400">Available: 74</span>
          <span className="text-red-400">Occupied: 32</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-white/5 bg-[#0B1220]/80 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Parking Area</span>
            <span>Normal slots</span>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <div className="flex flex-col gap-3 text-[10px] text-slate-500">
              {rows.map((row) => (
                <span key={row} className="h-8 w-6 text-center">
                  {row}
                </span>
              ))}
            </div>
            <div className="grid gap-3">
              {rows.map((row) => (
                <div key={row} className="grid grid-cols-9 gap-2">
                  {cols.map((col) => {
                    const code = `${row}${col}`;
                    return (
                      <SlotTile
                        key={code}
                        code={code}
                        occupied={occupiedSlots.has(code)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#0B1220]/80 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Car Wash</span>
              <span>CW slots</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {carWashSlots.map((code) => (
                <SlotTile key={code} code={code} occupied={code === "CW2"} />
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-white/5 bg-[#0F172A]/80 px-4 py-6 text-center text-xs font-semibold text-slate-400">
              WASHING AREA
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0B1220]/80 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">EV Charging</span>
              <span>EV slots</span>
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-6 gap-2">
                {evSlotsTop.map((code) => (
                  <SlotTile key={code} code={code} occupied={code === "K4"} />
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {evSlotsBottom.map((code) => (
                  <SlotTile key={code} code={code} occupied={code === "L2"} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
