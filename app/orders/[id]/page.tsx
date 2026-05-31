'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';

/* Representación de una orden de pago */
type Order = {
  id: number;
  email: string;
  monto: number;
  created_at: string;
  updated_at: string;
  customer: { id: number; nombre: string; ap: string; am: string | null };
  status: { id: number; nombre: string };
  payment_method: { id: number; nombre: string };
};

/* Colores asignados según el status */
const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

/* Estilos para la línea de tiempo según el status */
const TIMELINE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  paid: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏳' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
  refunded: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '↩' },
};

/* Componente Sidebar y diseño */
type SidebarProps = {
  onDashboard: () => void;
  onLogout: () => void;
};

function Sidebar({ onDashboard, onLogout }: SidebarProps) {
  return (
    <aside className="flex flex-col w-56 bg-gray-900 shrink-0 p-3 h-full">
      <h2 className="text-white text-base font-semibold px-3 py-3 mb-2">Backoffice</h2>
      <nav className="flex-1 space-y-1">
        <div
          onClick={onDashboard}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm cursor-pointer transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
          </svg>
          Panel Principal
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Detalle Órden y Pago
        </div>
      </nav>
      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition w-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar Sesión
      </button>
    </aside>
  );
}

/* Componente principal de la página de detalle de orden */
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const token = Cookies.get('token');
  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Redirigir al login si no hay token */
  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })
      .then(r => r.json())
      .then(data => { setOrder(data.data); setLoading(false); })
      .catch(() => { setError('Error al cargar la orden.'); setLoading(false); });
  }, [token, id]);

  function handleLogout() {
    Cookies.remove('token');
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar desktop */}
      <div className="hidden md:flex">
        <Sidebar onDashboard={() => router.push('/dashboard')} onLogout={handleLogout} />
      </div>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <Sidebar onDashboard={() => router.push('/dashboard')} onLogout={handleLogout} />
          <div className="flex-1 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto min-w-0">

        {/* Topbar mobile */}
        <div className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold">Backoffice</span>
        </div>

        <div className="p-4 md:p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-5">Detalle Órden/Pago</h1>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-400 text-sm">Cargando orden...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Contenido */}
          {order && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Card principal */}
              <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Orden #{order.id}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status.nombre] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status.nombre}
                  </span>
                </div>

                {/* Monto */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Monto Total</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${Number(order.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    <span className="text-base font-normal text-gray-400 ml-2">MXN</span>
                  </p>
                </div>

                {/* Grid de info */}
                <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Cliente</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer.nombre} {order.customer.ap} {order.customer.am ?? ''}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm text-gray-900">{order.email}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Método de Pago</p>
                    <p className="text-sm text-gray-900">{order.payment_method.nombre}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Última Actualización</p>
                    <p className="text-sm text-gray-900">{new Date(order.updated_at).toLocaleString('es-MX')}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Timeline</h3>
                <div>

                  {/* Orden creada */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                      <div className="w-px h-8 bg-gray-200 my-1"></div>
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-gray-900">Orden creada</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString('es-MX')}</p>
                    </div>
                  </div>

                  {/* Procesando pago */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                      <div className="w-px h-8 bg-gray-200 my-1"></div>
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-gray-900">Procesando pago</p>
                      <p className="text-xs text-gray-400 mt-0.5">Enviado a pasarela</p>
                    </div>
                  </div>

                  {/* Status final */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${TIMELINE_STYLES[order.status.nombre]?.bg || 'bg-gray-100'} ${TIMELINE_STYLES[order.status.nombre]?.text || 'text-gray-600'}`}>
                        {TIMELINE_STYLES[order.status.nombre]?.icon || '?'}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{order.status.nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.updated_at).toLocaleString('es-MX')}</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}