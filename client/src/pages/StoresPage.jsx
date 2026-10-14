import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Search, ArrowRight, Clock } from 'lucide-react';
import { Card, Badge, Input, Select, Button } from '../components';
import { storesApi } from '../services';

// Initial mock stores matching seed data as graceful fallback
const INITIAL_STORES = [
  {
    id: 'store-1',
    name: 'Fresh Basket Supermarket',
    zone_id: 'zone-1',
    zone_name: 'Zone 1: Central District',
    is_open: true,
    category: 'Groceries & Produce',
    rating: 4.8,
    delivery_time: '15-25 min',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    product_count: 24,
  },
  {
    id: 'store-2',
    name: 'Artisan Daily Bakery',
    zone_id: 'zone-1',
    zone_name: 'Zone 1: Central District',
    is_open: true,
    category: 'Bakery & Snacks',
    rating: 4.9,
    delivery_time: '10-20 min',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    product_count: 18,
  },
  {
    id: 'store-3',
    name: 'City Care Essentials & Pharmacy',
    zone_id: 'zone-2',
    zone_name: 'Zone 2: North Sector',
    is_open: true,
    category: 'Health & Essentials',
    rating: 4.7,
    delivery_time: '15-30 min',
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=600&q=80',
    product_count: 32,
  },
];

export const StoresPage = () => {
  const [stores, setStores] = useState(INITIAL_STORES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchStores = async () => {
      try {
        const data = await storesApi.getStores({
          zone: selectedZone !== 'all' ? selectedZone : undefined,
          search: searchTerm.trim() || undefined,
        });
        if (isMounted && data && Array.isArray(data)) {
          const mapped = data.map((s, idx) => ({
            id: s.id,
            name: s.name,
            zone_id: s.zone_id,
            zone_name: s.zone?.name || `Zone: ${s.zone_id}`,
            is_open: s.is_open !== false,
            category: s.category || (idx % 2 === 0 ? 'Groceries & Produce' : 'Bakery & Pantry'),
            delivery_time: '15-25 min',
            image:
              s.image ||
              (idx % 2 === 0
                ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
                : 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'),
            product_count: s.products?.length || s._count?.products || 12,
          }));
          setStores(mapped);
        }
      } catch {
        // Fallback to initial
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStores();
    return () => {
      isMounted = false;
    };
  }, [selectedZone, searchTerm]);

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.category && store.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesZone =
      selectedZone === 'all' ||
      store.zone_id === selectedZone ||
      (store.zone_id && store.zone_id.includes(selectedZone));
    return matchesSearch && matchesZone;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
            Hyperlocal Directory
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Local Stores Near You
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Order fresh goods from verified merchants with guaranteed fast neighborhood delivery.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search stores or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              options={[
                { value: 'all', label: 'All Delivery Zones' },
                { value: '1', label: 'Zone 1: Central District' },
                { value: '2', label: 'Zone 2: North Sector' },
                { value: '3', label: 'Zone 3: West Hills' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <Card key={store.id} hover className="flex flex-col h-full">
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <Badge
                  variant={store.is_open ? 'success' : 'default'}
                  className="shadow-sm font-semibold"
                >
                  {store.is_open ? 'Open Now' : 'Closed'}
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[11px] px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                <Clock className="h-3 w-3 text-accent-400" />
                {store.delivery_time}
              </div>
            </div>

            <Card.Content className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{store.zone_name}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{store.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{store.category}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-800">{store.product_count}</strong> products
                </span>
                <Link to={`/stores/${store.id}`}>
                  <Button
                    size="sm"
                    variant={store.is_open ? 'primary' : 'secondary'}
                    disabled={!store.is_open}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {store.is_open ? 'Shop Catalog' : 'Closed'}
                  </Button>
                </Link>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StoresPage;
