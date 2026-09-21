// src/views/DevicesView.tsx
import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useRegisters } from '@/hooks/useRegisters';
import { formatDateTime, formatRelativeTime } from '@/lib/dates';
import { Smartphone, ShieldAlert, Cpu } from 'lucide-react';

export const DevicesContent: React.FC = () => {
  const { registers, loading } = useRegisters();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Read-Only Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-start gap-3.5 text-indigo-300 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">
            Hardware Register Leases (Read-Only Mode)
          </p>
          <p className="mt-0.5 text-indigo-300/80">
            POS register leases and invoice reservation epochs are exclusively managed by physical counter hardware to ensure zero invoice sequence collision.
          </p>
        </div>
      </div>

      {/* Registers Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Register Code</th>
                <th className="py-3.5 px-4">Assigned Device Name</th>
                <th className="py-3.5 px-4">Device Identifier (UUID)</th>
                <th className="py-3.5 px-4">Lease Status</th>
                <th className="py-3.5 px-4">Epoch Counter</th>
                <th className="py-3.5 px-4">Lease Expiry</th>
                <th className="py-3.5 px-4">Last Sync Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading register devices...
                  </td>
                </tr>
              ) : registers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No registers registered yet. Claim a register from your Quick Bill POS mobile app.
                  </td>
                </tr>
              ) : (
                registers.map((reg) => (
                  <tr
                    key={reg.id || reg.registerCode}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <span className="tracking-wider text-indigo-300">{reg.registerCode}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{reg.deviceName || 'POS Terminal Device'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {reg.ownerDeviceId}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={reg.leaseStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono font-semibold">
                      #{reg.registrationEpoch}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDateTime(reg.leaseExpiresAt)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {reg.lastSyncAt ? formatRelativeTime(reg.lastSyncAt) : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const DevicesView: React.FC = () => {
  return (
    <AppShell
      title="POS Devices & Registers"
      subtitle="Live monitoring of active POS register terminals and lease epochs"
      currentPath="/devices"
    >
      <DevicesContent />
    </AppShell>
  );
};
export default DevicesView;
