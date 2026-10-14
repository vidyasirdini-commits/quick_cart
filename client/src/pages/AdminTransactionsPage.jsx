import React, { useState } from 'react';
import { Download, Search, Filter, CreditCard } from 'lucide-react';
import { DataTable, Button, Input, Select, Badge } from '../components';
import { useToast } from '../components/Toast';
import { formatCurrency, formatDate } from '../utils';

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
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    customer: 'Michael Chang',
    store_name: 'Organic Roots Farm Store',
    zone: 'West Hills',
    total: 740,
    status: 'delivered',
  },
  {
    id: 'ord-402911',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    customer: 'Priya Sharma',
    store_name: 'Fresh Basket Supermarket',
    zone: 'Central District',
    total: 620,
    status: 'cancelled',
  },
  {
    id: 'ord-391024',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
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
  const [selectedStatus, setSelectedStatus] = useState('all');
  const toast = useToast();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.store_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || t.zone === selectedZone;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesZone && matchesStatus;
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
    link.setAttribute('download', `quickcart_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Complete financial records, payment logs, and zone fulfillment transactions.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={exportToCSV}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="w-full lg:w-72">
          <Input
            placeholder="Search order ID, store, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-48">
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

          <div className="w-full sm:w-48">
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
