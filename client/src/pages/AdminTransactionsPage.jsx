import React, { useState, useEffect } from 'react';
import { Download, Search, Calendar, Store, Filter } from 'lucide-react';
import { DataTable, Button, Input, Select, Badge } from '../components';
import { useToast } from '../components/Toast';
import { formatCurrency, formatDate } from '../utils';
import { adminApi } from '../services';

const INITIAL_TRANSACTIONS = [
  {
    id: 'ord-849201',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    customer: 'Sarah Jenkins',
    store_name: 'Fresh Basket Supermarket',
    zone: 'Central District',
    total: 395,
    status: 'out_for_delivery',
  },
  {
    id: 'ord-731904',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    customer: 'David Kumar',
    store_name: 'Artisan Daily Bakery',
    zone: 'Central District',
    total: 280,
    status: 'delivered',
  },
  {
    id: 'ord-619283',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    customer: 'Elena Rostova',
    store_name: 'City Care Pharmacy',
    zone: 'North Sector',
    total: 512,
    status: 'placed',
  },
  {
    id: 'ord-518290',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    customer: 'Michael Chang',
    store_name: 'Organic Roots Farm Store',
    zone: 'West Hills',
    total: 740,
    status: 'delivered',
  },
  {
    id: 'ord-402911',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    customer: 'Priya Sharma',
    store_name: 'Fresh Basket Supermarket',
    zone: 'Central District',
    total: 620,
    status: 'cancelled',
  },
  {
    id: 'ord-391024',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    customer: 'James Wilson',
    store_name: 'Artisan Daily Bakery',
    zone: 'Central District',
    total: 190,
    status: 'delivered',
  },
];

export const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchTx = async () => {
      try {
        const data = await adminApi.getTransactions({
          date: dateFilter,
          zone: selectedZone !== 'all' ? selectedZone : undefined,
          store: selectedStore !== 'all' ? selectedStore : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchTerm.trim() || undefined,
        });
        if (isMounted && data && Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      } catch {
        // Fallback
      }
    };
    fetchTx();
    return () => {
      isMounted = false;
    };
  }, [dateFilter, selectedZone, selectedStore, selectedStatus, searchTerm]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.store_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesZone = selectedZone === 'all' || t.zone === selectedZone;
    const matchesStore = selectedStore === 'all' || t.store_name === selectedStore;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    let matchesDate = true;
    const orderDate = new Date(t.created_at).getTime();
    const now = Date.now();

    if (dateFilter === 'today') {
      matchesDate = now - orderDate <= 1000 * 60 * 60 * 24;
    } else if (dateFilter === 'week') {
      matchesDate = now - orderDate <= 1000 * 60 * 60 * 24 * 7;
    } else if (dateFilter === 'month') {
      matchesDate = now - orderDate <= 1000 * 60 * 60 * 24 * 30;
    }

    return matchesSearch && matchesZone && matchesStore && matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Store', 'Zone', 'Total (INR)', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.created_at,
      `"${t.customer}"`,
      `"${t.store_name}"`,
      `"${t.zone}"`,
      t.total,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `quickcart_transactions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Transactions CSV exported successfully');
  };

  const columns = [
    {
      header: 'Order Ref',
      field: 'id',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'Date & Time',
      field: 'created_at',
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>,
    },
    {
      header: 'Customer',
      field: 'customer',
      render: (row) => <span className="font-medium text-slate-900">{row.customer}</span>,
    },
    {
      header: 'Store Partner',
      field: 'store_name',
    },
    {
      header: 'Zone',
      field: 'zone',
    },
    {
      header: 'Amount',
      field: 'total',
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: 'Status',
      field: 'status',
      render: (row) => <Badge status={row.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Transaction Ledger & Audits
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Filterable historical orders, zone receipts, payment sums, and CSV ledger export.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={exportToCSV}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Export CSV ({filteredTransactions.length})
        </Button>
      </div>

      {/* Comprehensive Filters Bar (Date, Zone, Store, Status) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-1">
            <Input
              placeholder="Search ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Date Filter */}
          <div>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Dates' },
                { value: 'today', label: 'Past 24 Hours' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
              ]}
            />
          </div>

          {/* Zone Filter */}
          <div>
            <Select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              options={[
                { value: 'all', label: 'All Zones' },
                { value: 'Central District', label: 'Central District' },
                { value: 'North Sector', label: 'North Sector' },
                { value: 'West Hills', label: 'West Hills' },
              ]}
            />
          </div>

          {/* Store Filter */}
          <div>
            <Select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              options={[
                { value: 'all', label: 'All Stores' },
                { value: 'Fresh Basket Supermarket', label: 'Fresh Basket' },
                { value: 'Artisan Daily Bakery', label: 'Artisan Bakery' },
                { value: 'City Care Pharmacy', label: 'City Care Pharmacy' },
                { value: 'Organic Roots Farm Store', label: 'Organic Roots' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'placed', label: 'Placed' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'packed', label: 'Packed' },
                { value: 'out_for_delivery', label: 'Out for Delivery' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable columns={columns} data={filteredTransactions} pageSize={8} />
    </div>
  );
};

export default AdminTransactionsPage;
