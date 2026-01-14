import { useState, useEffect } from 'react';
import { Building2, MapPin, Trash2, Eye, EyeOff, Plus, Zap, Car, Droplets } from 'lucide-react';
import { propertiesApi } from '../services/api';

interface Slot {
  id: string | number;
  number: string;
  type: string;
  status: string;
}

interface Property {
  id: string | number;
  name: string;
  address: string;
  description?: string;
  totalSlots: number;
  normalSlots?: number;
  evSlots?: number;
  carWashSlots?: number;
  availableSlots: number;
  slots: Slot[];
  createdAt: string | Date;
}

export default function ManagePropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProperty, setExpandedProperty] = useState<string | number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertiesApi.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await propertiesApi.delete(id);
      setProperties(properties.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const toggleExpand = (id: string | number) => {
    setExpandedProperty(expandedProperty === id ? null : id);
  };

  // Group slots by type
  const groupSlotsByType = (slots: Slot[]) => {
    const normal: Slot[] = [];
    const ev: Slot[] = [];
    const carWash: Slot[] = [];

    slots.forEach(slot => {
      if (slot.type === 'Normal') normal.push(slot);
      else if (slot.type === 'EV Slot' || slot.type === 'EV') ev.push(slot);
      else if (slot.type === 'Car Washing') carWash.push(slot);
    });

    return { normal, ev, carWash };
  };

  // Generate visual grid for normal slots (rows A-J, columns 1-9)
  const renderNormalSlotsGrid = (slots: Slot[]) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = 9;
    let slotIndex = 0;

    return (
      <div className="space-y-2">
        {rows.map((row, rowIdx) => {
          if (slotIndex >= slots.length) return null;
          const rowSlots: (Slot | null)[] = [];
          for (let col = 1; col <= cols && slotIndex < slots.length; col++) {
            rowSlots.push(slots[slotIndex]);
            slotIndex++;
          }
          // Pad with nulls if needed
          while (rowSlots.length < cols) {
            rowSlots.push(null);
          }

          return (
            <div key={row} className="flex items-center gap-1">
              <span className="w-6 text-xs font-medium text-amber-400">{row}</span>
              <div className="flex gap-1">
                {rowSlots.map((slot, colIdx) => (
                  <div
                    key={colIdx}
                    className={`w-9 h-8 rounded border text-xs flex items-center justify-center font-medium transition-colors ${
                      slot
                        ? slot.status === 'available'
                          ? 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          : 'border-amber-500/50 bg-amber-500/20 text-amber-400'
                        : 'border-transparent'
                    }`}
                  >
                    {slot ? `${row}${colIdx + 1}` : ''}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Car Wash slots grid
  const renderCarWashGrid = (slots: Slot[]) => {
    const rows = Math.ceil(slots.length / 4);
    let slotIndex = 0;

    return (
      <div className="space-y-3">
        <div className="space-y-1">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {Array.from({ length: 4 }).map((_, colIdx) => {
                const slot = slots[slotIndex];
                slotIndex++;
                if (!slot) return <div key={colIdx} className="w-12 h-8" />;
                return (
                  <div
                    key={slot.id}
                    className={`w-12 h-8 rounded border text-xs flex items-center justify-center font-medium ${
                      slot.status === 'available'
                        ? 'border-slate-600 bg-slate-800/50 text-slate-300'
                        : 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    CW{colIdx + 1 + rowIdx * 4}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Washing Area Visual */}
        <div className="border border-dashed border-slate-600 rounded-lg p-4">
          <div className="text-center text-xs text-slate-500 mb-2">WASHING AREA</div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-16 h-10 rounded border border-slate-700 bg-slate-800/30" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render EV Charging slots grid
  const renderEVGrid = (slots: Slot[]) => {
    const halfLength = Math.ceil(slots.length / 2);
    const row1 = slots.slice(0, halfLength);
    const row2 = slots.slice(halfLength);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="w-6 text-xs font-medium text-amber-400">K</span>
          <div className="flex gap-1">
            {row1.map((slot, idx) => (
              <div
                key={slot.id}
                className={`w-12 h-8 rounded border text-xs flex items-center justify-center font-medium ${
                  slot.status === 'available'
                    ? 'border-slate-600 bg-slate-800/50 text-slate-300'
                    : 'border-orange-500/50 bg-orange-500/20 text-orange-400'
                }`}
              >
                EVK{idx + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-6 text-xs font-medium text-amber-400">L</span>
          <div className="flex gap-1">
            {row2.map((slot, idx) => (
              <div
                key={slot.id}
                className={`w-12 h-8 rounded border text-xs flex items-center justify-center font-medium ${
                  slot.status === 'available'
                    ? 'border-slate-600 bg-slate-800/50 text-slate-300'
                    : 'border-orange-500/50 bg-orange-500/20 text-orange-400'
                }`}
              >
                EVL{idx + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">Manage Properties</h1>
          <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
            View, manage, and remove parking properties
          </p>
        </div>
        <a
          href="/admin/properties/add"
          className="flex items-center gap-2 rounded-lg bg-linear-to-r from-[#84CC16] to-[#BEF264] px-4 py-2.5 font-medium text-slate-950 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </a>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6]"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 rounded-xl border dark:border-slate-800/60 border-slate-200/60 bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6]">
          <Building2 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium dark:text-[#E5E7EB] text-[#111827]">No Properties Yet</h3>
          <p className="text-sm dark:text-[#94A3B8] text-[#6B7280] mt-2">
            Add your first parking property to get started
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => {
            const { normal, ev, carWash } = groupSlotsByType(property.slots || []);
            const isExpanded = expandedProperty === property.id;
            
            // Use slot counts from property if available, otherwise count from slots array
            const normalCount = property.normalSlots ?? normal.length;
            const evCount = property.evSlots ?? ev.length;
            const carWashCount = property.carWashSlots ?? carWash.length;

            return (
              <div
                key={property.id}
                className="rounded-xl border bg-linear-to-br dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6] overflow-hidden"
              >
                {/* Property Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-linear-to-br from-[#84CC16] to-[#BEF264]">
                        <Building2 className="w-6 h-6 text-slate-950" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold dark:text-[#E5E7EB] text-[#111827]">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-sm dark:text-[#94A3B8] text-[#6B7280]">
                          <MapPin className="w-4 h-4" />
                          {property.address}
                        </div>
                        <div className="flex gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="w-4 h-4 text-blue-400" />
                            <span className="dark:text-[#94A3B8] text-[#6B7280]">
                              Normal: <span className="text-blue-400 font-medium">{normalCount}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Droplets className="w-4 h-4 text-cyan-400" />
                            <span className="dark:text-[#94A3B8] text-[#6B7280]">
                              Car Wash: <span className="text-cyan-400 font-medium">{carWashCount}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-4 h-4 text-orange-400" />
                            <span className="dark:text-[#94A3B8] text-[#6B7280]">
                              EV: <span className="text-orange-400 font-medium">{evCount}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(property.id)}
                        className="p-2 rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'Hide slots' : 'View slots'}
                      >
                        {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {deleteConfirm === property.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-2 rounded-lg border dark:border-slate-700 border-slate-200 text-sm font-medium dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(property.id)}
                          className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete property"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Slots View */}
                {isExpanded && (
                  <div className="border-t dark:border-slate-800/60 border-slate-200/60 p-6 bg-slate-950/50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Normal Parking Area */}
                      {normal.length > 0 && (
                        <div className="lg:col-span-2">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium dark:text-[#E5E7EB] text-[#111827]">Parking Area</h4>
                            <span className="text-xs dark:text-[#94A3B8] text-[#6B7280]">Normal slots</span>
                          </div>
                          <div className="p-4 rounded-lg border dark:border-slate-800 border-slate-200 bg-slate-900/50">
                            {renderNormalSlotsGrid(normal)}
                          </div>
                        </div>
                      )}

                      {/* Right Column - Car Wash & EV */}
                      <div className="space-y-6">
                        {/* Car Wash */}
                        {carWash.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium dark:text-[#E5E7EB] text-[#111827]">Car Wash</h4>
                              <span className="text-xs text-cyan-400">CW slots</span>
                            </div>
                            <div className="p-4 rounded-lg border dark:border-slate-800 border-slate-200 bg-slate-900/50">
                              {renderCarWashGrid(carWash)}
                            </div>
                          </div>
                        )}

                        {/* EV Charging */}
                        {ev.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium dark:text-[#E5E7EB] text-[#111827]">EV Charging</h4>
                              <div className="flex items-center gap-1 text-xs text-orange-400">
                                <Zap className="w-3 h-3" />
                                EV slots
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border dark:border-slate-800 border-slate-200 bg-slate-900/50">
                              {renderEVGrid(ev)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
