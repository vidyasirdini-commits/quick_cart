import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { DataTable, Button, Input, Select, Badge } from '../components';
import { useToast } from '../components/Toast';
import { formatDate } from '../utils';
import { adminApi } from '../services';

const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Admin Supervisor',
    email: 'admin@quickcart.com',
    role: 'admin',
    zone: 'Platform-wide',
    is_active: true,
    created_at: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'usr-2',
    name: 'Green Grocers Downtown',
    email: 'partner@quickcart.com',
    role: 'partner',
    zone: 'Zone 1: Central District',
    is_active: true,
    created_at: '2026-01-15T10:30:00.000Z',
  },
  {
    id: 'usr-3',
    name: 'Ravi Delivery Pro',
    email: 'delivery@quickcart.com',
    role: 'delivery',
    zone: 'Zone 1: Central District',
    is_active: true,
    created_at: '2026-02-01T09:15:00.000Z',
  },
  {
    id: 'usr-4',
    name: 'Sarah Customer',
    email: 'customer@quickcart.com',
    role: 'customer',
    zone: 'Zone 1: Central District',
    is_active: true,
    created_at: '2026-02-12T14:20:00.000Z',
  },
  {
    id: 'usr-5',
    name: 'Alex Baker',
    email: 'bakery@quickcart.com',
    role: 'partner',
    zone: 'Zone 2: North Sector',
    is_active: false,
    created_at: '2026-02-20T11:00:00.000Z',
  },
];

export const AdminUsersPage = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getUsers({
          role: roleFilter !== 'all' ? roleFilter : undefined,
          search: searchTerm.trim() || undefined,
        });
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      } catch {
        // Fallback
      }
    };
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [roleFilter, searchTerm]);

  const handleToggleUserStatus = async (userId) => {
    const userToToggle = users.find((u) => u.id === userId);
    if (!userToToggle) return;

    const newStatus = !userToToggle.is_active;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: newStatus } : u))
    );

    try {
      await adminApi.toggleUserActive(userId);
      toast.info(`User ${userToToggle.name} is now ${newStatus ? 'Active' : 'Deactivated'}`);
    } catch (err) {
      toast.error(err.message || 'Status toggle failed');
      // Revert if error
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !newStatus } : u))
      );
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role) => {
    if (role === 'admin') return 'danger';
    if (role === 'partner') return 'accent';
    if (role === 'delivery') return 'info';
    return 'default';
  };

  const columns = [
    {
      header: 'User / Contact',
      field: 'name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Role',
      field: 'role',
      render: (row) => (
        <Badge variant={getRoleBadgeVariant(row.role)} size="sm" className="capitalize">
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Assigned Zone',
      field: 'zone',
    },
    {
      header: 'Status',
      field: 'is_active',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'default'} size="sm" dot>
          {row.is_active ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      header: 'Joined Date',
      field: 'created_at',
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>,
    },
    {
      header: 'Action',
      field: 'action',
      sortable: false,
      render: (row) => (
        <Button
          size="sm"
          variant={row.is_active ? 'secondary' : 'primary'}
          onClick={() => handleToggleUserStatus(row.id)}
          leftIcon={row.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
        >
          {row.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Directory & Access Control
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all registered shoppers, merchant partners, and courier personnel with access switches.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'customer', label: 'Customers' },
              { value: 'partner', label: 'Store Partners' },
              { value: 'delivery', label: 'Delivery Executives' },
              { value: 'admin', label: 'Administrators' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredUsers} pageSize={8} />
    </div>
  );
};

export default AdminUsersPage;
