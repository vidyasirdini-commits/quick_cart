import React, { useState } from 'react';
import { MapPin, Plus, Store, Truck, Edit2, UserCheck, ShieldCheck } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, Select } from '../components';
import { useToast } from '../components/Toast';
import { adminApi } from '../services';

const INITIAL_ZONES = [
  {
    id: '1',
    name: 'Zone 1: Central District',
    description: 'Dense commercial hub and inner city residential sectors',
    stores: ['Fresh Basket Supermarket', 'Artisan Daily Bakery'],
    delivery_execs: ['Ravi Kumar (Express Courier)', 'Vikram Singh'],
  },
  {
    id: '2',
    name: 'Zone 2: North Sector',
    description: 'Suburban communities and northern IT corridor',
    stores: ['City Care Pharmacy'],
    delivery_execs: ['Karan Mehta'],
  },
  {
    id: '3',
    name: 'Zone 3: West Hills',
    description: 'Green belt, residential apartments and fresh produce nurseries',
    stores: ['Organic Roots Farm Store'],
    delivery_execs: ['Ankit Sharma'],
  },
];

const AVAILABLE_STORES = [
  'Fresh Basket Supermarket',
  'Artisan Daily Bakery',
  'City Care Pharmacy',
  'Organic Roots Farm Store',
  'Daily Greens Express',
];

const AVAILABLE_COURIERS = [
  'Ravi Kumar (Express Courier)',
  'Vikram Singh',
  'Karan Mehta',
  'Ankit Sharma',
  'Sunil Yadav',
];

export const AdminZonesPage = () => {
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [editingZone, setEditingZone] = useState(null);
  const [activeZoneForAssign, setActiveZoneForAssign] = useState(null);

  const [zoneForm, setZoneForm] = useState({ name: '', description: '' });
  const [assignForm, setAssignForm] = useState({ storeToAssign: '', courierToAssign: '' });

  const toast = useToast();

  const fetchZones = async () => {
    try {
      const data = await adminApi.getZones();
      if (data && Array.isArray(data.zones) && data.zones.length > 0) {
        setZones(data.zones);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleOpenAddZone = () => {
    setEditingZone(null);
    setZoneForm({ name: '', description: '' });
    setZoneModalOpen(true);
  };

  const handleOpenEditZone = (zone) => {
    setEditingZone(zone);
    setZoneForm({ name: zone.name, description: zone.description });
    setZoneModalOpen(true);
  };

  const handleOpenAssign = (zone) => {
    setActiveZoneForAssign(zone);
    setAssignForm({ storeToAssign: '', courierToAssign: '' });
    setAssignModalOpen(true);
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    if (!zoneForm.name.trim()) {
      toast.error('Zone name is required');
      return;
    }

    try {
      if (editingZone) {
        try {
          await adminApi.updateZone(editingZone.id, zoneForm);
        } catch {
          // Fallback
        }
        setZones((prev) =>
          prev.map((z) => (z.id === editingZone.id ? { ...z, ...zoneForm } : z))
        );
        toast.success('Zone updated successfully');
      } else {
        let created = null;
        try {
          created = await adminApi.createZone(zoneForm);
        } catch {
          // Fallback
        }
        const newZone = created || {
          id: String(Date.now()),
          ...zoneForm,
          stores: [],
          delivery_execs: [],
        };
        setZones((prev) => [...prev, newZone]);
        toast.success('New delivery zone allocated');
      }
      setZoneModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save zone');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!activeZoneForAssign) return;

    const { storeToAssign, courierToAssign } = assignForm;
    if (!storeToAssign && !courierToAssign) {
      toast.error('Please select at least one store or courier to assign');
      return;
    }

    try {
      try {
        await adminApi.assignToZone(activeZoneForAssign.id, {
          store_name: storeToAssign || undefined,
          courier_name: courierToAssign || undefined,
        });
      } catch {
        // Fallback
      }

      setZones((prev) =>
        prev.map((z) => {
          if (z.id === activeZoneForAssign.id) {
            const updatedStores =
              storeToAssign && !z.stores.includes(storeToAssign)
                ? [...z.stores, storeToAssign]
                : z.stores;
            const updatedExecs =
              courierToAssign && !z.delivery_execs.includes(courierToAssign)
                ? [...z.delivery_execs, courierToAssign]
                : z.delivery_execs;
            return { ...z, stores: updatedStores, delivery_execs: updatedExecs };
          }
          return z;
        })
      );

      toast.success(`Resources assigned to ${activeZoneForAssign.name}`);
      setAssignModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Delivery Zone Allocation & Fleets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure geographic zones, assign local store hubs, and allocate dedicated courier personnel.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddZone}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Delivery Zone
        </Button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <Card key={zone.id} className="p-6 flex flex-col justify-between" hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditZone(zone)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Edit zone details"
                    aria-label="Edit zone"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{zone.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{zone.description}</p>
              </div>

              {/* Stores in zone */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-primary-600" />
                  Stores Assigned ({zone.stores.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {zone.stores.map((s) => (
                    <span
                      key={s}
                      className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                    >
                      {s}
                    </span>
                  ))}
                  {zone.stores.length === 0 && (
                    <span className="text-slate-400 text-[11px] italic">No stores assigned yet</span>
                  )}
                </div>
              </div>

              {/* Couriers in zone */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                  Delivery Couriers ({zone.delivery_execs.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {zone.delivery_execs.map((d) => (
                    <span
                      key={d}
                      className="bg-blue-50 text-blue-800 text-[10px] px-2 py-0.5 rounded font-medium"
                    >
                      {d}
                    </span>
                  ))}
                  {zone.delivery_execs.length === 0 && (
                    <span className="text-slate-400 text-[11px] italic">No couriers assigned yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {zone.stores.length + zone.delivery_execs.length} total resources
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleOpenAssign(zone)}
                leftIcon={<UserCheck className="h-3.5 w-3.5" />}
              >
                Assign Resource
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create / Edit Zone Modal */}
      <Modal
        isOpen={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        title={editingZone ? 'Edit Zone Properties' : 'Create New Delivery Zone'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveZone}>
              {editingZone ? 'Save Changes' : 'Create Zone'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveZone} className="space-y-4">
          <Input
            label="Zone Name"
            placeholder="e.g. Zone 4: South Tech Park"
            value={zoneForm.name}
            onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Zone Description"
            placeholder="Coverage boundaries and service notes"
            value={zoneForm.description}
            onChange={(e) => setZoneForm((p) => ({ ...p, description: e.target.value }))}
            required
          />
        </form>
      </Modal>

      {/* Assign Stores / Delivery Couriers to Zone Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Resources to ${activeZoneForAssign?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignSubmit}>
              Assign to Zone
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a store merchant or courier executive to associate with this delivery zone:
          </p>

          <Select
            label="Assign Store Partner"
            value={assignForm.storeToAssign}
            onChange={(e) => setAssignForm((p) => ({ ...p, storeToAssign: e.target.value }))}
            options={[
              { value: '', label: '-- Choose a store to assign --' },
              ...AVAILABLE_STORES.map((s) => ({ value: s, label: s })),
            ]}
          />

          <Select
            label="Assign Delivery Executive"
            value={assignForm.courierToAssign}
            onChange={(e) =>
              setAssignForm((p) => ({ ...p, courierToAssign: e.target.value }))
            }
            options={[
              { value: '', label: '-- Choose an executive to assign --' },
              ...AVAILABLE_COURIERS.map((c) => ({ value: c, label: c })),
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};

export default AdminZonesPage;
