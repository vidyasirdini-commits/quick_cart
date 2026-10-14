import React, { useState } from 'react';
import { MapPin, Plus, Store, Truck, Edit2 } from 'lucide-react';
import { Card, Button, Input, Modal, Badge } from '../components';
import { useToast } from '../components/Toast';

const INITIAL_ZONES = [
  {
    id: '1',
    name: 'Zone 1: Central District',
    description: 'Dense commercial hub and inner city residential sectors',
    stores_count: 5,
    delivery_execs_count: 8,
  },
  {
    id: '2',
    name: 'Zone 2: North Sector',
    description: 'Suburban communities and northern IT corridor',
    stores_count: 3,
    delivery_execs_count: 4,
  },
  {
    id: '3',
    name: 'Zone 3: West Hills',
    description: 'Green belt, residential apartments and fresh produce nurseries',
    stores_count: 4,
    delivery_execs_count: 5,
  },
];

export const AdminZonesPage = () => {
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const toast = useToast();

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (zone) => {
    setEditingZone(zone);
    setFormData({ name: zone.name, description: zone.description });
    setModalOpen(true);
  };

  const handleSaveZone = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Zone name is required');
      return;
    }

    if (editingZone) {
      setZones((prev) =>
        prev.map((z) => (z.id === editingZone.id ? { ...z, ...formData } : z))
      );
      toast.success('Zone updated successfully');
    } else {
      const newZone = {
        id: String(Date.now()),
        ...formData,
        stores_count: 0,
        delivery_execs_count: 0,
      };
      setZones((prev) => [...prev, newZone]);
      toast.success('New delivery zone allocated');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Delivery Zone Allocation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Partition delivery coverage, allocate regional store hubs, and assign courier fleets.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Delivery Zone
        </Button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <Card key={zone.id} className="p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(zone)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  aria-label="Edit zone"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{zone.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{zone.description}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg">
                <Store className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="block font-bold text-slate-900">{zone.stores_count}</span>
                  <span className="text-[10px] text-slate-500">Stores</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg">
                <Truck className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="block font-bold text-slate-900">
                    {zone.delivery_execs_count}
                  </span>
                  <span className="text-[10px] text-slate-500">Execs</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingZone ? 'Edit Zone' : 'Create Delivery Zone'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
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
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Zone Description"
            placeholder="Coverage boundaries and service notes"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default AdminZonesPage;
