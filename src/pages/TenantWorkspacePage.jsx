import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export function TenantWorkspacePage() {
  const { user, tenant, userRole, container, logout, restartContainer } = useAuth();
  const { navigateTo } = useShop();

  const [isRestarting, setIsRestarting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleRestart = async () => {
    setIsRestarting(true);
    setFeedback('');
    const res = await restartContainer();
    setIsRestarting(false);
    if (res.success) {
      setFeedback('Container restarted successfully.');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(`Error: ${res.error}`);
    }
  };

  return (
    <main className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-10 flex-grow space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#e2ded9] gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#bc9c85] font-semibold block mb-1">
            Isolated Workspace Environment
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#151616] tracking-wider uppercase font-light">
            {tenant ? tenant.name : "Tenant Workspace"}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateTo('shop')}
            className="px-5 py-2.5 bg-white border border-[#151616] text-[#151616] uppercase text-xs tracking-widest font-semibold hover:bg-[#151616] hover:text-white transition-colors"
          >
            Browse Products
          </button>
          <button
            onClick={logout}
            className="px-5 py-2.5 bg-[#93000a] text-white uppercase text-xs tracking-widest font-semibold hover:bg-black transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 p-3 text-xs text-emerald-800 rounded">
          {feedback}
        </div>
      )}

      {/* Grid of Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: User Identity */}
        <div className="bg-white border border-[#e2ded9] p-6 space-y-3 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-[10px] uppercase tracking-widest text-[#bc9c85] font-semibold">User Identity</span>
            <span className="text-[10px] uppercase bg-gray-100 px-2 py-0.5 font-mono">{userRole || 'owner'}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#151616]">{user ? user.name : '-'}</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{user ? user.email : '-'}</p>
          </div>
          <div className="pt-2 text-[11px] text-gray-400 font-mono">
            User ID: {user ? user.id : '-'}
          </div>
        </div>

        {/* Card 2: Tenant Workspace */}
        <div className="bg-white border border-[#e2ded9] p-6 space-y-3 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-[10px] uppercase tracking-widest text-[#bc9c85] font-semibold">PostgreSQL Tenant</span>
            <span className="text-[10px] uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 font-semibold">Active</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#151616]">{tenant ? tenant.name : '-'}</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">slug: {tenant ? tenant.slug : '-'}</p>
          </div>
          <div className="pt-2 text-[11px] text-gray-400 font-mono">
            Tenant ID: {tenant ? tenant.id : '-'}
          </div>
        </div>

        {/* Card 3: Isolated Container Metadata */}
        <div className="bg-white border border-[#e2ded9] p-6 space-y-3 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-[10px] uppercase tracking-widest text-[#bc9c85] font-semibold">Isolated Container</span>
            <span className={`text-[10px] uppercase px-2 py-0.5 font-semibold ${
              container && container.status === 'running' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {container ? container.status : 'Provisioned'}
            </span>
          </div>
          <div>
            <p className="text-xs font-mono text-[#151616] truncate">{container ? container.container_name : 'shov_tenant_default'}</p>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">Docker ID: {container ? container.container_id : '-'}</p>
          </div>
          <div className="pt-2 flex justify-between items-center">
            <span className="text-[11px] text-gray-400 font-mono">RAM: 256MB | CPU: 0.5</span>
            {userRole === 'owner' && (
              <button
                onClick={handleRestart}
                disabled={isRestarting}
                className="text-[10px] uppercase tracking-wider font-semibold text-[#bc9c85] hover:text-[#151616] underline"
              >
                {isRestarting ? 'Restarting...' : 'Restart Container'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Feature Overview */}
      <div className="bg-white border border-[#e2ded9] p-8 space-y-4 shadow-sm">
        <h3 className="font-serif text-xl text-[#151616] uppercase tracking-wider font-light">
          Tenant Isolation & Security Overview
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 leading-relaxed font-light">
          <li className="flex items-start space-x-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><strong>Server-Side Tenant Resolution:</strong> All requests enforce JWT validation and database tenant membership verification.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><strong>Strict Parameter Security:</strong> Frontend request parameters (`tenant_id`, `container_id`) are never trusted.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><strong>Isolated Container Metadata:</strong> Dedicated container identity tracked in PostgreSQL `tenant_containers`.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span><strong>JWT Refresh Token Rotation:</strong> SHA-256 session token hashing with automatic state restoration.</span>
          </li>
        </ul>
      </div>
    </main>
  );
}
