'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CheckoutSummary from '@/components/CheckoutSummary';
import CheckoutInstructions from '@/components/CheckoutInstructions';
import CheckoutForm from '@/components/CheckoutForm';
import OrderTrackerModal from '@/components/OrderTrackerModal';
import PolicyModals, { PolicyType } from '@/components/PolicyModals';
import Footer from '@/components/Footer';
import CheckoutFaq from '@/components/CheckoutFaq';
import { OrderStatus, Order } from '@/types';

interface PublicSettings {
  toolName: string;
  productName: string;
  productDescription: string;
  priceUsd: number;
  priceUsdt: number;
  merchantWalletAddress: string;
  network: string;
  usdtContractAddress: string;
  supportEmail: string;
  companyName: string;
  deliveryTimeframe: string;
  manualReviewEstimatedMinutes: number;
}

const DEFAULT_SETTINGS: PublicSettings = {
  toolName: 'ApexCore Pro',
  productName: 'Tool Activation Key',
  productDescription: 'Software tool activation license.',
  priceUsd: 200,
  priceUsdt: 200,
  merchantWalletAddress: 'TYDZS92Wvd18qM8263WRDQsjVp9dGZp4tT',
  network: 'TRON (TRC20)',
  usdtContractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  supportEmail: 'support@apexcore-software.io',
  companyName: 'ApexCore Technologies Inc.',
  deliveryTimeframe: 'Within 15–45 minutes following TRON blockchain confirmation',
  manualReviewEstimatedMinutes: 30,
};

export default function CheckoutPage() {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);
  const [orderId, setOrderId] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('AWAITING_PAYMENT');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  // Initialize or fetch public settings and create a unique server order
  useEffect(() => {
    async function initCheckout() {
      try {
        // 1. Fetch settings
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings((prev) => ({ ...prev, ...settingsData }));
        }

        // 2. Check for existing order in localStorage or create a fresh one
        const savedOrderId = localStorage.getItem('apex_active_order_id');
        if (savedOrderId) {
          const checkRes = await fetch(`/api/orders/${savedOrderId}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.success && checkData.order) {
              setOrderId(checkData.order.id);
              setOrderStatus(checkData.order.status);
              return;
            }
          }
        }

        // Create new server order reference
        const createRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (createRes.ok) {
          const createData = await createRes.json();
          if (createData.success && createData.order) {
            setOrderId(createData.order.id);
            setOrderStatus(createData.order.status);
            localStorage.setItem('apex_active_order_id', createData.order.id);
          }
        }
      } catch (err) {
        console.error('Checkout initialization error:', err);
        setOrderId((prev) =>
          prev || `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
        );
      }
    }

    initCheckout();
  }, []);

  const handleRefreshOrder = async () => {
    if (!orderId) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrderStatus(data.order.status);
        }
      }
    } catch (err) {
      console.error('Refresh error', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmissionSuccess = (submittedOrder: Order) => {
    if (submittedOrder && submittedOrder.status) {
      setOrderStatus(submittedOrder.status);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Compact Header */}
      <Navbar
        toolName={settings.toolName}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenSupport={() => setActivePolicy('support')}
      />

      {/* Main Checkout Container */}
      <main className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        {/* Page Title & Subtitle */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Activate your tool
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete your payment to request your activation key.
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Instructions and Verification Form */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            {/* Payment Steps & Network Warning */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <CheckoutInstructions priceUsdt={settings.priceUsdt} />
            </div>

            {/* Transaction Verification Submission Form */}
            <CheckoutForm
              orderId={orderId}
              expectedAmount={settings.priceUsdt}
              onSubmissionSuccess={handleSubmissionSuccess}
              onOpenTracker={() => setIsTrackerOpen(true)}
            />
          </div>

          {/* Right Column: Order Summary & Receiving Address */}
          <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-20">
            <CheckoutSummary
              orderId={orderId}
              priceUsdt={settings.priceUsdt}
              productName={settings.productName}
              orderDescription={settings.productDescription}
              walletAddress={settings.merchantWalletAddress}
              status={orderStatus}
              onRefreshOrder={handleRefreshOrder}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>

        {/* Customer Guidance & FAQ */}
        <CheckoutFaq />
      </main>

      {/* Footer without public admin link */}
      <Footer
        toolName={settings.toolName}
        supportEmail={settings.supportEmail}
        companyName={settings.companyName}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        initialOrderId={orderId}
      />

      {/* Policy Modals */}
      <PolicyModals
        activePolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
        supportEmail={settings.supportEmail}
        companyName={settings.companyName}
      />
    </div>
  );
}
