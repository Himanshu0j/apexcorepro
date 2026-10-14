'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Settings,
  Eye,
  X,
  FileText,
  FileImage,
} from 'lucide-react';
import { Order, AdminStats, LicenseKeyItem, SystemSettings } from '@/types';
import { isValidTronAddress, TronVerificationResult } from '@/lib/tron';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'orders' | 'keys' | 'settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'keys' | 'settings'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Selected Order for Inspection / Action Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verificationResult, setVerificationResult] = useState<TronVerificationResult | null>(null);

  // Keys Pool State
  const [keysPool, setKeysPool] = useState<LicenseKeyItem[]>([]);
  const [newKeysInput, setNewKeysInput] = useState('');
  const [isAddingKeys, setIsAddingKeys] = useState(false);
  const [keysMessage, setKeysMessage] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setStats(data.stats || null);
      }

      const keysRes = await fetch('/api/admin/keys');
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setKeysPool(keysData.keys || []);
      }

      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings || null);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/login');
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated);
          if (data.authenticated) {
            loadDashboardData();
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, [loadDashboardData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
        setIsLoggingIn(false);
        return;
      }

      setIsAuthenticated(true);
      loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login error occurred.';
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      setIsAuthenticated(false);
      setOrders([]);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleApproveOrder = async () => {
    if (!selectedOrder) return;
    setIsPerformingAction(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          customKey: customKeyInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionMessage({ type: 'error', text: data.error || 'Failed to approve order.' });
        setIsPerformingAction(false);
        return;
      }

      setActionMessage({ type: 'success', text: data.message });
      setSelectedOrder(data.order);
      loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    if (!actionReason.trim()) {
      setActionMessage({ type: 'error', text: 'Please provide a clear rejection reason for the audit log.' });
      return;
    }

    setIsPerformingAction(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          reason: actionReason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionMessage({ type: 'error', text: data.error || 'Failed to reject order.' });
        setIsPerformingAction(false);
        return;
      }

      setActionMessage({ type: 'success', text: data.message });
      setSelectedOrder(data.order);
      loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleVerifyOnBlockchain = async () => {
    if (!selectedOrder || !selectedOrder.txHash) return;
    setIsPerformingAction(true);
    setActionMessage(null);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_BLOCKCHAIN' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionMessage({ type: 'error', text: data.error || 'Verification check failed.' });
        setIsPerformingAction(false);
        return;
      }

      setVerificationResult(data.verification);
      setSelectedOrder(data.order);
      if (data.verification?.verified) {
        setActionMessage({
          type: 'success',
          text: '✓ Confirmed on TRON blockchain. Activation key allocated.',
        });
      } else {
        setActionMessage({
          type: 'error',
          text: data.verification?.failureReason || 'Blockchain verification did not confirm required transfer.',
        });
      }
      loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Blockchain check error.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleAddKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeysInput.trim()) return;

    setIsAddingKeys(true);
    setKeysMessage(null);

    const keysArray = newKeysInput
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: keysArray }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setKeysMessage(data.error || 'Failed to add keys.');
      } else {
        setKeysMessage(data.message);
        setNewKeysInput('');
        loadDashboardData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding keys.';
      setKeysMessage(msg);
    } finally {
      setIsAddingKeys(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (!isValidTronAddress(settings.merchantWalletAddress)) {
      setSettingsMessage({
        type: 'error',
        text: 'Invalid TRON wallet address. It must be a valid 34-character Base58 address starting with "T".',
      });
      return;
    }

    setIsSavingSettings(true);
    setSettingsMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSettingsMessage({ type: 'error', text: data.error || 'Failed to save settings.' });
      } else {
        setSettingsMessage({ type: 'success', text: data.message });
        setSettings(data.settings);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving settings.';
      setSettingsMessage({ type: 'error', text: msg });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Login view if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h1 className="text-base font-semibold text-slate-900">Admin Authentication</h1>
            <p className="text-xs text-slate-500">
              Enter password to access the order management portal.
            </p>
          </div>

          {loginError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Default: <code className="text-slate-700 font-mono">AdminSecure2026!</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-md bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Return to checkout</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors" title="Back to Checkout">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Checkout</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">Control Center</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 border border-slate-200">
                ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={isLoadingOrders}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex gap-6 text-xs font-medium border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Orders & Reviews</span>
            {stats && stats.verificationPending > 0 && (
              <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] font-bold border border-amber-200">
                {stats.verificationPending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'keys'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>License Keys</span>
            {stats && (
              <span className="text-[10px] font-mono text-slate-400">
                ({stats.availableKeysCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* TAB 1: ORDERS & REVIEWS */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* Stats Metrics Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="rounded-md border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Total orders</span>
                  <p className="mt-0.5 font-mono text-xl font-bold text-slate-900">{stats.totalOrders}</p>
                </div>

                <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3.5 shadow-xs">
                  <span className="text-[11px] text-amber-900 font-medium">Pending review</span>
                  <p className="mt-0.5 font-mono text-xl font-bold text-amber-950">
                    {stats.verificationPending}
                  </p>
                </div>

                <div className="rounded-md border border-blue-200 bg-blue-50/60 p-3.5 shadow-xs">
                  <span className="text-[11px] text-blue-900 font-medium">Confirmed</span>
                  <p className="mt-0.5 font-mono text-xl font-bold text-blue-950">
                    {stats.paymentConfirmed}
                  </p>
                </div>

                <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-xs">
                  <span className="text-[11px] text-emerald-900 font-medium">Keys issued</span>
                  <p className="mt-0.5 font-mono text-xl font-bold text-emerald-950">
                    {stats.keysIssued}
                  </p>
                </div>

                <div className="rounded-md border border-rose-200 bg-rose-50/60 p-3.5 shadow-xs">
                  <span className="text-[11px] text-rose-900 font-medium">Rejected</span>
                  <p className="mt-0.5 font-mono text-xl font-bold text-rose-950">
                    {stats.paymentRejected}
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Volume</span>
                  <p className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                    ${stats.totalVolumeUsdt} <span className="text-xs font-normal text-slate-500">USDT</span>
                  </p>
                </div>
              </div>
            )}

            {/* Controls: Search and Status Filters */}
            <div className="rounded-md border border-slate-200 bg-white p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-72">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadDashboardData()}
                  placeholder="Search orders, emails, hashes..."
                  className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 text-xs w-full sm:w-auto">
                {['ALL', 'VERIFICATION_PENDING', 'KEY_ISSUED', 'PAYMENT_REJECTED', 'AWAITING_PAYMENT'].map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setTimeout(loadDashboardData, 10);
                      }}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Order ID</th>
                      <th className="px-3.5 py-2.5">Customer</th>
                      <th className="px-3.5 py-2.5">Amount</th>
                      <th className="px-3.5 py-2.5">Transaction hash</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5">Date</th>
                      <th className="px-3.5 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3.5 py-6 text-center text-slate-400">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {o.id}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <div className="font-medium text-slate-800">{o.customerEmail || '—'}</div>
                            {o.customerName && <div className="text-[11px] text-slate-400">{o.customerName}</div>}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-900 whitespace-nowrap">
                            ${o.amountSent || o.amountUsdt} USDT
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[11px]">
                            {o.txHash ? (
                              <div className="flex items-center gap-1 text-slate-700">
                                <span className="max-w-[130px] truncate">{o.txHash}</span>
                                <a
                                  href={`https://tronscan.org/#/transaction/${o.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-slate-800"
                                  title="View on TronScan"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-400">Pending</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            {o.status === 'KEY_ISSUED' && (
                              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                                Key issued
                              </span>
                            )}
                            {o.status === 'VERIFICATION_PENDING' && (
                              <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                                Pending audit
                              </span>
                            )}
                            {o.status === 'PAYMENT_CONFIRMED' && (
                              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
                                Confirmed
                              </span>
                            )}
                            {o.status === 'PAYMENT_REJECTED' && (
                              <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 border border-rose-200">
                                Rejected
                              </span>
                            )}
                            {o.status === 'AWAITING_PAYMENT' && (
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                                Awaiting payment
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(o);
                                setActionReason('');
                                setCustomKeyInput('');
                                setActionMessage(null);
                                setVerificationResult(null);
                              }}
                              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LICENSE KEY INVENTORY */}
        {activeTab === 'keys' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Add Keys Form */}
            <div className="md:col-span-1 rounded-md border border-slate-200 bg-white p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Replenish Keys
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste pre-generated keys from your licensing server (one per line).
                </p>
              </div>

              {keysMessage && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  {keysMessage}
                </div>
              )}

              <form onSubmit={handleAddKeys} className="space-y-3 text-xs">
                <textarea
                  rows={6}
                  required
                  value={newKeysInput}
                  onChange={(e) => setNewKeysInput(e.target.value)}
                  placeholder="APEX-XXXX-XXXX-XXXX-XXXX&#10;APEX-YYYY-YYYY-YYYY-YYYY"
                  className="w-full rounded-md border border-slate-300 bg-white p-2.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingKeys}
                  className="w-full rounded-md bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isAddingKeys ? 'Adding...' : 'Add keys to inventory'}
                </button>
              </form>
            </div>

            {/* Keys Table */}
            <div className="md:col-span-2 rounded-md border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Key Pool ({keysPool.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Available: <strong className="text-slate-900">{keysPool.filter((k) => k.status === 'AVAILABLE').length}</strong>
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto rounded border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Key</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2">Issued to</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {keysPool.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-slate-900 select-all">
                          {k.key}
                        </td>
                        <td className="px-3 py-2 font-sans">
                          {k.status === 'AVAILABLE' ? (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                              Available
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-500">
                              Issued
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{k.orderId || '—'}</td>
                        <td className="px-3 py-2 font-sans text-slate-500 truncate max-w-[140px]">{k.issuedToEmail || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl mx-auto rounded-md border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Store &amp; Receiving Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure merchant TRON wallet address, pricing, and support details.
              </p>
            </div>

            {settingsMessage && (
              <div
                className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                  settingsMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {settingsMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{settingsMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700">
                    Merchant TRON (TRC20) wallet address <span className="text-rose-500">*</span>
                  </label>
                  {isValidTronAddress(settings.merchantWalletAddress) ? (
                    <span className="text-[11px] font-mono text-emerald-700">✓ Valid Base58 address</span>
                  ) : (
                    <span className="text-[11px] font-mono text-rose-700">✗ Invalid address</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={settings.merchantWalletAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, merchantWalletAddress: e.target.value.trim() })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tool name</label>
                  <input
                    type="text"
                    required
                    value={settings.toolName}
                    onChange={(e) => setSettings({ ...settings, toolName: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Product description</label>
                  <input
                    type="text"
                    required
                    value={settings.productName}
                    onChange={(e) => setSettings({ ...settings, productName: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Price (USDT)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={settings.priceUsdt}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        priceUsdt: parseFloat(e.target.value) || 200,
                        priceUsd: parseFloat(e.target.value) || 200,
                      })
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Support contact email</label>
                  <input
                    type="email"
                    required
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isSavingSettings ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Order Inspection</span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedOrder.id}</h2>
              <p className="text-xs text-slate-500">
                Created: {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {actionMessage && (
              <div
                className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* Details Grid */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Customer email:</span>
                <span className="font-sans font-semibold text-slate-900">{selectedOrder.customerEmail || '—'}</span>
              </div>

              {selectedOrder.customerName && (
                <div className="flex justify-between text-slate-600">
                  <span>Name:</span>
                  <span className="font-sans text-slate-800">{selectedOrder.customerName}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="font-bold text-slate-900">${selectedOrder.amountSent || selectedOrder.amountUsdt} USDT</span>
              </div>

              {selectedOrder.txHash && (
                <div className="pt-1 border-t border-slate-200 flex flex-col gap-0.5 text-slate-600">
                  <span>Transaction hash:</span>
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-slate-200 text-slate-900 break-all select-all">
                    <span>{selectedOrder.txHash}</span>
                    <a
                      href={`https://tronscan.org/#/transaction/${selectedOrder.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-900 shrink-0 ml-auto"
                      title="Inspect on TronScan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {selectedOrder.activationKey && (
                <div className="pt-1 border-t border-slate-200 flex justify-between items-center text-slate-600">
                  <span className="font-semibold text-emerald-800">Issued Key:</span>
                  <span className="font-bold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedOrder.activationKey}
                  </span>
                </div>
              )}

              {selectedOrder.rejectionReason && (
                <div className="pt-1 border-t border-slate-200 text-rose-800">
                  <span className="font-semibold">Rejection reason: </span>
                  <span>{selectedOrder.rejectionReason}</span>
                </div>
              )}
            </div>

            {/* Screenshot if available */}
            {selectedOrder.screenshotUrl && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileImage className="h-4 w-4 text-slate-500" />
                  <span>Customer uploaded receipt:</span>
                </span>
                <div className="rounded border border-slate-200 bg-white max-h-48 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedOrder.screenshotUrl}
                    alt="Receipt"
                    className="max-h-48 object-contain w-auto"
                  />
                </div>
              </div>
            )}

            {/* Live Blockchain Verification Result */}
            {verificationResult && (
              <div className="rounded-md border border-slate-300 bg-slate-50 p-3 space-y-1.5 text-xs">
                <span className="font-semibold text-slate-900">Blockchain check outcome:</span>
                <div className="font-mono text-[11px] text-slate-700 space-y-1">
                  <div className={verificationResult.verified ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    Outcome: {verificationResult.verified ? '✓ VERIFIED ON TRON' : '✗ NOT CONFIRMED / PENDING'}
                  </div>
                  {verificationResult.actualAmountUsdt && (
                    <div>Confirmed amount: {verificationResult.actualAmountUsdt} USDT</div>
                  )}
                  {verificationResult.blockNumber && (
                    <div>Block: #{verificationResult.blockNumber}</div>
                  )}
                  <div className="pt-1 text-slate-500 max-h-20 overflow-y-auto">
                    {verificationResult.logs.map((l, idx) => (
                      <div key={idx}>• {l}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {selectedOrder.txHash && (
                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 bg-slate-50 text-xs">
                  <div>
                    <span className="font-medium text-slate-900">Blockchain check</span>
                    <p className="text-[11px] text-slate-500">Query TRON node records for this TxID.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOnBlockchain}
                    disabled={isPerformingAction}
                    className="inline-flex items-center gap-1 rounded bg-white border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isPerformingAction ? 'animate-spin' : ''}`} />
                    <span>Run check</span>
                  </button>
                </div>
              )}

              {/* Approve */}
              <div className="space-y-1.5 text-xs">
                <span className="font-medium text-slate-800">Approve & Issue key</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="Custom key (or leave blank to auto-allocate from inventory)"
                    className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApproveOrder}
                    disabled={isPerformingAction}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>

              {/* Reject */}
              <div className="space-y-1.5 text-xs">
                <span className="font-medium text-slate-800">Reject payment</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Mandatory reason for audit log (e.g. Sent via BEP20 instead of TRC20)"
                    className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRejectOrder}
                    disabled={isPerformingAction}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
