import React, { useState } from 'react';
import { Plus, Search, Edit2, Check, AlertTriangle, Boxes } from 'lucide-react';
import { DataTable, Button, Input, Select, Modal, Badge } from '../components';
import { useToast } from '../components/Toast';
import { formatCurrency } from '../utils';

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Organic Whole Milk (1L)',
    category: 'Dairy',
    price: 65,
    stock_qty: 12,
    is_active: true,
  },
  {
    id: 'prod-2',
    name: 'Farm Fresh Brown Eggs (Pack of 6)',
    category: 'Dairy & Eggs',
    price: 85,
    stock_qty: 4,
    is_active: true,
  },
  {
    id: 'prod-3',
    name: 'Artisan Sourdough Loaf',
    category: 'Bakery',
    price: 140,
    stock_qty: 3,
    is_active: true,
  },
  {
    id: 'prod-4',
    name: 'Crisp Red Gala Apples (1kg)',
    category: 'Fruits',
    price: 190,
    stock_qty: 20,
    is_active: true,
  },
  {
    id: 'prod-5',
    name: 'Cold Pressed Olive Oil (500ml)',
    category: 'Pantry',
    price: 499,
    stock_qty: 0,
    is_active: false,
  },
];

export const PartnerInventoryPage = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Groceries',
    price: '',
    stock_qty: '',
    is_active: true,
  });

  const toast = useToast();

  const categories = ['All', 'Dairy', 'Dairy & Eggs', 'Bakery', 'Fruits', 'Pantry', 'Groceries'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Groceries',
      price: '',
      stock_qty: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock_qty: prod.stock_qty,
      is_active: prod.is_active,
    });
    setModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock_qty, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Price must be greater than or equal to 0');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Stock quantity must be a non-negative integer');
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...formData, price: priceNum, stock_qty: stockNum }
            : p
        )
      );
      toast.success('Product updated successfully');
    } else {
      const newProd = {
        id: `prod-${Date.now()}`,
        ...formData,
        price: priceNum,
        stock_qty: stockNum,
      };
      setProducts((prev) => [newProd, ...prev]);
      toast.success('New product added to inventory');
    }
    setModalOpen(false);
  };

  const handleInlineStockChange = (id, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_qty: qty } : p))
    );
  };

  const handleToggleActive = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
    toast.info('Item status toggled');
  };

  const columns = [
    {
      header: 'Product Name',
      field: 'name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{row.name}</span>
          {row.stock_qty < 5 && row.stock_qty > 0 && (
            <Badge variant="accent" size="sm" dot>
              Low Stock
            </Badge>
          )}
          {row.stock_qty === 0 && (
            <Badge variant="danger" size="sm">
              Out
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      field: 'category',
    },
    {
      header: 'Price (₹)',
      field: 'price',
      render: (row) => formatCurrency(row.price),
    },
    {
      header: 'Stock Qty',
      field: 'stock_qty',
      render: (row) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={row.stock_qty}
            onChange={(e) => handleInlineStockChange(row.id, e.target.value)}
            className={`w-20 px-2.5 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono ${
              row.stock_qty < 5 ? 'border-amber-400 bg-amber-50/50' : 'border-slate-300'
            }`}
          />
        </div>
      ),
    },
    {
      header: 'Listing Status',
      field: 'is_active',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row.id)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            row.is_active
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          {row.is_active ? 'Active' : 'Hidden'}
        </button>
      ),
    },
    {
      header: 'Actions',
      field: 'actions',
      sortable: false,
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleOpenEditModal(row)}
          leftIcon={<Edit2 className="h-3.5 w-3.5" />}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Stock Sync
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify available stock levels, adjust prices, and toggle public store catalog items.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Product
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <DataTable columns={columns} data={filteredProducts} pageSize={8} />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Organic Almond Milk (1L)"
            required
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            options={[
              { value: 'Dairy', label: 'Dairy' },
              { value: 'Dairy & Eggs', label: 'Dairy & Eggs' },
              { value: 'Bakery', label: 'Bakery' },
              { value: 'Fruits', label: 'Fruits' },
              { value: 'Pantry', label: 'Pantry' },
              { value: 'Groceries', label: 'Groceries' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
              placeholder="0.00"
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={formData.stock_qty}
              onChange={(e) => setFormData((p) => ({ ...p, stock_qty: e.target.value }))}
              placeholder="0"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
              className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
            />
            Visible on store catalog
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default PartnerInventoryPage;
