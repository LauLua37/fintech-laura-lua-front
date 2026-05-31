'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

/* Representación de una orden */
type Order = {
  id: number;
  email: string;
  monto: number;
  created_at: string;
  customer: { id: number; nombre: string; ap: string; am: string | null };
  status: { id: number; nombre: string };
  payment_method: { id: number; nombre: string };
};

/* Representación de estadísticas */
type Stats = {
  total_orders: number;
  total_revenue: number;
  failed_count: number;
  pending_count: number;
};

/* Metadatos de paginación devueltos por la API */
type Pagination = {
  current_page: number;
  last_page: number;
  total: number;
};

/* Colores asignados según el status */
const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

/** Pill coloreado que muestra el estado de una orden */
function StatusBadge({ nombre }: { nombre: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[nombre] || 'bg-gray-100 text-gray-700'}`}>
      {nombre}
    </span>
  );
}

/* Página principal del dashboard */
/* Tabla con las órdenes, filtros y paginación */
export default function DashboardPage() {
  const router = useRouter();
  const token = Cookies.get('token');

  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filtros y ordanamiento
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [page, setPage] = useState(1);

  /* Redirigir al login si no hay token */
  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  // Muestra las estadísticas generales (ingresos, órdenes totales, etc)
  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/stats`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    })
      .then(r => r.json())
      .then(setStats)
      .catch(() => setError('Error al cargar estadísticas.'));
  }, [token]);

  // Cargar órdenes
  useEffect(() => {
    if (!token) return;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (paymentMethod) params.append('payment_method', paymentMethod);
    params.append('sort_by', sortBy);
    params.append('direction', direction);
    params.append('page', String(page));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?${params}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        setOrders(data.data);
        setPagination(data.meta);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar las órdenes.');
        setLoading(false);
      });
  }, [token, search, status, paymentMethod, sortBy, direction, page]);

  /* Maneja el cambio de ordenamiento */
  function handleSortChange(value: string) {
    const map: Record<string, { sortBy: string; direction: string }> = {
      'id_asc': { sortBy: 'id', direction: 'asc' },
      'fecha_desc': { sortBy: 'created_at', direction: 'desc' },
      'fecha_asc': { sortBy: 'created_at', direction: 'asc' },
      'monto_desc': { sortBy: 'monto', direction: 'desc' },
      'monto_asc': { sortBy: 'monto', direction: 'asc' },
    };
    if (map[value]) {
      setSortBy(map[value].sortBy);
      setDirection(map[value].direction);
      setPage(1);
    }
  }

  /* Elimina el token de la cookie y redirige al login */
  function handleLogout() {
    Cookies.remove('token');
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 shrink-0 p-3">
        <h2 className="text-white text-base font-semibold px-3 py-3 mb-2">Backoffice</h2>

        <nav className="flex-1 space-y-1">
          {/* Panel Principal — activo */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" /></svg>
            Panel Principal
          </div>

          {/* Detalle Órden y Pago */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm cursor-pointer transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Detalle Órden y Pago
          </div>
        </nav>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Cerrar Sesión
        </button>
      </aside>

      {/* ── Sidebar mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <aside className="flex flex-col w-56 bg-gray-900 p-3">
            <h2 className="text-white text-base font-semibold px-3 py-3 mb-2">Backoffice</h2>
            <nav className="flex-1 space-y-1">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium">
                Panel Principal
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 text-sm">
                Detalle Órden y Pago
              </div>
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 text-sm w-full">
              Cerrar Sesión
            </button>
          </aside>
          <div className="flex-1 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ── Contenido principal ── */}
      <main className="flex-1 overflow-y-auto min-w-0">

        {/* Topbar mobile */}
        <div className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-semibold">Backoffice</span>
        </div>

        <div className="p-4 md:p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-5">Detalles Órden/Pago</h1>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Cards stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { val: stats ? `$${stats.total_revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '...', lbl: 'Ingresos Totales' },
              { val: stats ? stats.total_orders : '...', lbl: 'Total Órdenes' },
              { val: stats ? stats.pending_count : '--', lbl: 'Órdenes Pendientes' },
              { val: stats ? stats.failed_count : '...', lbl: 'Pagos Fallidos' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xl font-semibold text-gray-900">{val}</p>
                <p className="text-xs text-gray-500 mt-1">{lbl}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="relative mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Búsqueda por ID, nombre o email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Status</option>
                <option value="paid">paid</option>
                <option value="pending">pending</option>
                <option value="failed">failed</option>
                <option value="refunded">refunded</option>
              </select>

              <select
                value={paymentMethod}
                onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Método Pago</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="PayPal">PayPal</option>
                <option value="SPEI">SPEI</option>
              </select>

              <select
                defaultValue="id_asc"
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="id_asc">ID: menor a mayor</option>
                <option value="fecha_desc">Fecha: más reciente</option>
                <option value="fecha_asc">Fecha: más antigua</option>
                <option value="monto_desc">Monto: mayor a menor</option>
                <option value="monto_asc">Monto: menor a mayor</option>
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-400 text-sm">Cargando órdenes...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">No se encontraron órdenes.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['ID', 'CLIENTE', 'EMAIL', 'MONTO', 'STATUS', 'MÉTODO', 'FECHA'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">#{order.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {order.customer.nombre} {order.customer.ap}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{order.email}</td>
                        <td className="px-4 py-3 font-mono font-medium whitespace-nowrap">
                          ${Number(order.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge nombre={order.status.nombre} />
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{order.payment_method.nombre}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                <span>Página {pagination.current_page} de {pagination.last_page} — {pagination.total} órdenes</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">
                    Anterior
                  </button>
                  <button onClick={() => setPage(page + 1)} disabled={page === pagination.last_page} className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}