import React from 'react';
import { WalletCard } from '../components/WalletCard';
import { ActionButtons } from '../components/ActionButtons';
import { Services } from '../components/Services';
import { RecentTransactions } from '../components/RecentTransactions';
import { NexaAI } from '../components/NexaAI';
import { SpendingAnalytics } from '../components/SpendingAnalytics';

export const Dashboard = () => {
  return (
    <div className="dashboard-grid">
      {/* Left Column (Desktop) / Top Section (Mobile) */}
      <div className="flex-col" style={{ gap: '16px' }}>
        <WalletCard />
        <ActionButtons />
        <SpendingAnalytics />
      </div>

      {/* Right Column (Desktop) / Bottom Section (Mobile) */}
      <div className="flex-col" style={{ gap: '16px' }}>
        <Services />
        <RecentTransactions />
      </div>

      {/* Floating AI Assistant */}
      <NexaAI />
    </div>
  );
};
