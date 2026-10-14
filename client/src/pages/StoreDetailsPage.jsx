import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Search,
  Plus,
  Minus,
  Check,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { Button, Input, Badge, Card } from '../components';
import { formatCurrency } from '../utils';
import { storesApi } from '../services';

// Sample product catalog for the store fallback
const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Organic Whole Milk (1L)',
    category: 'Dairy',
    price: 65,
    stock_qty: 12,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Farm-fresh pasteurized whole milk, rich in nutrients.',
  },
  {
    id: 'prod-2',
    name: 'Farm Fresh Brown Eggs (Pack of 6)',
    category: 'Dairy & Eggs',
    price: 85,
    stock_qty: 4,
    image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80',
    description: 'Cage-free nutritious brown eggs.',
  },
  {
    id: 'prod-3',
    name: 'Artisan Sourdough Loaf',
    category: 'Bakery',
    price: 140,
    stock_qty: 3,
    image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=400&q=80',
    description: 'Slow-fermented artisan crust sourdough with soft crumb.',
  },
  {
    id: 'prod-4',
    name: 'Crisp Red Gala Apples (1kg)',
    category: 'Fruits',
    price: 190,
    stock_qty: 20,
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
    description: 'Sweet and crunchy freshly picked Gala apples.',
  },
  {
    id: 'prod-5',
    name: 'Cold Pressed Olive Oil (500ml)',
    category: 'Pantry',
    price: 499,
    stock_qty: 0,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    description: 'Extra virgin cold pressed olive oil for healthy cooking.',
  },
  {
    id: 'prod-6',
    name: 'Organic Hass Avocados (Pack of 2)',
    category: 'Fruits',
    price: 240,
    stock_qty: 2,
    image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
    description: 'Creamy, perfectly ripe avocados.',
  },
];

export const StoreDetailsPage = () => {
  const { id } = useParams();
  const { addToCart, items, store: cartStore } = useCart();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [currentStore, setCurrentStore] = useState({
    id: id || 'store-1',
    name: 'Fresh Basket Supermarket',
    zone_name: 'Zone 1: Central District',
    is_open: true,
  });

  React.useEffect(() => {
    let isMounted = true;
    const fetchStoreAndProducts = async () => {
      try {
        if (id) {
          const storeData = await storesApi.getStoreById(id);
          if (isMounted && storeData) {
            setCurrentStore({
              id: storeData.id,
              name: storeData.name,
              zone_name: storeData.zone?.name || 'Central District',
              is_open: storeData.is_open !== false,
            });
          }

          const productsData = await storesApi.getStoreProducts(id, {
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            search: searchTerm.trim() || undefined,
            inStock: inStockOnly ? 'true' : undefined,
          });
          if (isMounted && productsData && Array.isArray(productsData) && productsData.length > 0) {
            setProducts(productsData);
          }
        }
      } catch {
        // Fallback gracefully
      }
    };
    fetchStoreAndProducts();
    return () => {
      isMounted = false;
    };
  }, [id, selectedCategory, searchTerm, inStockOnly]);

  const categories = ['All', 'Dairy', 'Dairy & Eggs', 'Bakery', 'Fruits', 'Pantry', 'Supplements', 'Essentials'];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesStock = !inStockOnly || prod.stock_qty > 0;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getCartQuantity = (productId) => {
    const found = items.find((item) => item.id === productId);
    return found ? found.qty : 0;
  };

  const handleAddProduct = (prod) => {
    const added = addToCart(prod, currentStore, 1);
    if (added) {
      toast.success(`Added ${prod.name} to cart`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back to Stores Link */}
      <Link
        to="/stores"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        All Stores
      </Link>

      {/* Store Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="success" dot>
              Open for Ordering
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="flex items-center text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1" />
              {currentStore.zone_name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentStore.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Order fulfilled directly from local shelves with instant stock deduction.
          </p>
        </div>

        {cartStore?.id === currentStore.id && items.length > 0 && (
          <Link to="/cart">
            <Button
              variant="primary"
              size="md"
              leftIcon={<ShoppingCart className="h-4 w-4" />}
            >
              View Cart ({items.reduce((acc, i) => acc + i.qty, 0)})
            </Button>
          </Link>
        )}
      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search and In-Stock Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 select-none cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 border-slate-300"
            />
            In Stock Only
          </label>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const cartQty = getCartQuantity(product.id);
          const isOutOfStock = product.stock_qty <= 0;
          const isLowStock = product.stock_qty > 0 && product.stock_qty <= 5;
          const reachedLimit = cartQty >= product.stock_qty;

          return (
            <Card key={product.id} className="flex flex-col h-full overflow-hidden">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {isOutOfStock ? (
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="danger">Out of Stock</Badge>
                  </div>
                ) : isLowStock ? (
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="accent" dot>
                      Only {product.stock_qty} left
                    </Badge>
                  </div>
                ) : null}
              </div>

              <Card.Content className="flex-1 flex flex-col justify-between p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <div>
                    {isOutOfStock ? (
                      <Button size="sm" variant="secondary" disabled>
                        Unavailable
                      </Button>
                    ) : cartQty > 0 ? (
                      <div className="flex items-center gap-1.5 bg-primary-50 rounded-lg p-1 border border-primary-200">
                        <button
                          type="button"
                          onClick={() => addToCart(product, currentStore, -1)}
                          className="p-1 rounded text-primary-700 hover:bg-primary-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold text-primary-800 px-1.5">
                          {cartQty}
                        </span>
                        <button
                          type="button"
                          disabled={reachedLimit}
                          onClick={() => addToCart(product, currentStore, 1)}
                          className="p-1 rounded text-primary-700 hover:bg-primary-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAddProduct(product)}
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StoreDetailsPage;
