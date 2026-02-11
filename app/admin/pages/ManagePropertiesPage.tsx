'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, MapPin, Trash2, Eye, EyeOff, Plus, Zap, Car, Droplets, Power, DollarSign, Edit2, Save, X } from 'lucide-react';
import { propertiesApi, type PropertySummary, type PropertySlot } from '../../services/api';
import { adminCard, adminInputCompact, adminPrimaryButton, adminSecondaryButton, adminIconButton } from '../components/adminTheme';

type Slot = PropertySlot;
type Property = PropertySummary;

export default function ManagePropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedProperty, setExpandedProperty] = useState<string | number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);
  const [editingProperty, setEditingProperty] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<{ pricePerHour: number; pricePerDay: number; totalSlots: number }>({
    pricePerHour: 0,
    pricePerDay: 0,
    totalSlots: 0,
  });
  const [togglingStatus, setTogglingStatus] = useState<string | number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await propertiesApi.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setErrorMessage('Failed to load properties. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const onFocus = () => {
      fetchProperties();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProperties();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchProperties]);

  const handleDelete = async (id: string | number) => {
    try {
      await propertiesApi.delete(id);
      setProperties(properties.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      setErrorMessage('Failed to delete property.');
      alert('Failed to delete property');
    }
  };

  const toggleExpand = (id: string | number) => {
    setExpandedProperty(expandedProperty === id ? null : id);
  };

  // Toggle activation status
  const handleToggleStatus = async (property: Property) => {
    try {
      setTogglingStatus(property.id);
      const newStatus = property.status === 'ACTIVATED' ? 'NOT_ACTIVATED' : 'ACTIVATED';
      await propertiesApi.toggleStatus(String(property.id), newStatus);
      setProperties(properties.map(p => 
        p.id === property.id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      setErrorMessage(errorMessage);
      alert(errorMessage);
    } finally {
      setTogglingStatus(null);
    }
  };

  // Start editing a property
  const startEditing = (property: Property) => {
    setEditingProperty(property.id);
    setEditForm({
      pricePerHour: property.pricePerHour || 300,
      pricePerDay: property.pricePerDay || 2000,
      totalSlots: property.totalSlots || 0,
    });
  };

  // Save edited property
  const saveEdit = async (property: Property) => {
    if (editForm.pricePerHour <= 0 || editForm.pricePerDay <= 0) {
      alert('Prices must be greater than 0');
      return;
    }

    try {
      setSavingEdit(true);
      await propertiesApi.update(property.id, {
        pricePerHour: editForm.pricePerHour,
        pricePerDay: editForm.pricePerDay,
        totalSlots: editForm.totalSlots,
      });
      setProperties(properties.map(p => 
        p.id === property.id ? { ...p, ...editForm } : p
      ));
      setEditingProperty(null);
    } catch (error) {
      console.error('Error updating property:', error);
      setErrorMessage('Failed to update property. Only admins can update prices and slots.');
      alert('Failed to update property. Only admins can update prices and slots.');
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingProperty(null);
  };

  // Group slots by type
  const groupSlotsByType = (slots: Slot[]) => {
    const normal: Slot[] = [];
    const ev: Slot[] = [];
    const carWash: Slot[] = [];

    slots.forEach(slot => {
      const normalizedType = (slot.type || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
      const slotNumber = (slot.slotNumber || slot.number || '').toUpperCase();

      if (normalizedType === 'EV' || normalizedType === 'EV_SLOT' || slotNumber.startsWith('EV')) {
        ev.push(slot);
      } else if (
        normalizedType === 'CAR_WASH' ||
        normalizedType === 'CAR_WASHING' ||
        normalizedType === 'CARWASH' ||
        slotNumber.startsWith('CW')
      ) {
        carWash.push(slot);
      } else {
        normal.push(slot);
      }
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
        {rows.map((row) => {
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
          className={`flex items-center gap-2 ${adminPrimaryButton}`}
        >
          <Plus className="w-5 h-5" />
          Add Property
        </a>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className={`text-center py-16 ${adminCard}`}>
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
                className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 overflow-hidden"
              >
                {/* Property Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-linear-to-br from-[#84CC16] to-[#BEF264]">
                        <Building2 className="w-6 h-6 text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold dark:text-[#E5E7EB] text-[#111827]">
                            {property.name}
                          </h3>
                          {/* Status Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            property.status === 'ACTIVATED'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {property.status === 'ACTIVATED' ? 'Activated' : 'Not Activated'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm dark:text-[#94A3B8] text-[#6B7280]">
                          <MapPin className="w-4 h-4" />
                          {property.address}
                        </div>
                        {/* Pricing Info */}
                        {editingProperty === property.id ? (
                          <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-amber-400" />
                              <input
                                type="number"
                                min="1"
                                value={editForm.pricePerHour}
                                onChange={(e) => setEditForm({ ...editForm, pricePerHour: parseFloat(e.target.value) || 0 })}
                                className={`w-24 ${adminInputCompact}`}
                              />
                              <span className="text-xs dark:text-[#94A3B8]">/hr</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-amber-400" />
                              <input
                                type="number"
                                min="1"
                                value={editForm.pricePerDay}
                                onChange={(e) => setEditForm({ ...editForm, pricePerDay: parseFloat(e.target.value) || 0 })}
                                className={`w-24 ${adminInputCompact}`}
                              />
                              <span className="text-xs dark:text-[#94A3B8]">/day</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-amber-400" />
                              <span className="dark:text-[#94A3B8] text-[#6B7280]">
                                <span className="text-amber-400 font-medium">LKR {property.pricePerHour || 300}</span>/hr
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-amber-400" />
                              <span className="dark:text-[#94A3B8] text-[#6B7280]">
                                <span className="text-amber-400 font-medium">LKR {property.pricePerDay || 2000}</span>/day
                              </span>
                            </div>
                          </div>
                        )}
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
                      {/* Toggle Status Button */}
                      <button
                        onClick={() => handleToggleStatus(property)}
                        disabled={togglingStatus === property.id}
                        className={`p-2 rounded-lg border transition-colors ${
                          property.status === 'ACTIVATED'
                            ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                            : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        } disabled:opacity-50`}
                        title={property.status === 'ACTIVATED' ? 'Deactivate' : 'Activate'}
                      >
                        {togglingStatus === property.id ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Power className="w-5 h-5" />
                        )}
                      </button>
                      {/* Edit Button */}
                      {editingProperty === property.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(property)}
                            disabled={savingEdit}
                            className="p-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                            title="Save changes"
                          >
                            {savingEdit ? (
                              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Save className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={adminIconButton}
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditing(property)}
                          className={adminIconButton}
                          title="Edit prices & slots"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleExpand(property.id)}
                        className={adminIconButton}
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
                            className={adminSecondaryButton}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(property.id)}
                          className="p-2 rounded-lg border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
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
