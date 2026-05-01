'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { SeedModeBanner } from '@/components/seed-mode-banner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Building2,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface DashboardData {
  role: string;
  mode: 'seed' | 'live';
  data: any;
}

interface User {
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard data
      const dashRes = await fetch('/api/dashboard');
      if (!dashRes.ok) {
        throw new Error('Failed to load dashboard data');
      }
      const dashData = await dashRes.json();
      setDashboardData(dashData);

      // Fetch user data
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Error cargando datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  onClick={loadDashboardData}
                  className="mt-4"
                  variant="outline"
                  size="sm"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const today = new Date();
  const dayName = format(today, 'EEEE', { locale: es });
  const dateStr = format(today, 'd MMMM yyyy', { locale: es });

  return (
    <AppLayout>
      {/* Seed Mode Banner */}
      {dashboardData?.mode === 'seed' && (
        <SeedModeBanner visible={true} />
      )}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Buen {dayName === 'Monday' || dayName === 'Tuesday' || dayName === 'Wednesday' ? 'día' : dayName === 'Thursday' ? 'jueves' : 'viernes'},{' '}
              <span className="text-[#1D4ED8]">{user?.name || 'Usuario'}</span>
            </h1>
            <p className="text-slate-600 capitalize">
              {dayName}, {dateStr}
            </p>
          </div>
          {dashboardData?.role === 'profesor' && (
            <Link href="/bloques">
              <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] gap-2">
                <Plus className="h-4 w-4" />
                Nueva Reserva
              </Button>
            </Link>
          )}
        </div>

        {/* Profesor Dashboard */}
        {dashboardData?.role === 'profesor' && (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Reservas Hoy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#16A34A]">
                      {dashboardData?.data?.todayCount || 0}
                    </span>
                    <span className="text-xs text-slate-500">reservas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Esta Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#3B82F6]">
                      {dashboardData?.data?.weekCount || 0}
                    </span>
                    <span className="text-xs text-slate-500">reservas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Estado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-[#16A34A] text-white">
                    {dashboardData?.mode === 'live' ? 'Operativo' : 'Configuración'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Reservas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mis Reservas
                </CardTitle>
                <CardDescription>
                  Tus reservas de hoy y los próximos 7 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.data?.todayReservations?.length === 0 &&
                dashboardData?.data?.upcomingReservations?.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Sin reservas"
                    description="No tienes reservas programadas para hoy ni la próxima semana"
                    action={
                      <Link href="/bloques">
                        <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF]">
                          Hacer una Reserva
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.data?.todayReservations?.map((res: any) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {res.room?.code} — {res.subject}
                            </p>
                            <p className="text-sm text-slate-600">
                              {res.slot?.name} • {res.group_name}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-[#16A34A] text-white">Hoy</Badge>
                      </div>
                    ))}
                    {dashboardData?.data?.upcomingReservations?.map((res: any) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {res.room?.code} — {res.subject}
                            </p>
                            <p className="text-sm text-slate-600">
                              {format(new Date(res.reservation_date), 'dd MMM', { locale: es })} •{' '}
                              {res.slot?.name}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Próxima</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Coordinador / Admin Dashboard */}
        {(dashboardData?.role === 'coordinador' || dashboardData?.role === 'admin') && (
          <>
            {/* Blocks Occupancy */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Ocupación de Bloques - Hoy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboardData?.data?.blocks?.map((block: any) => {
                  const occupancy = block.totalSlots > 0 
                    ? Math.round((block.activeReservations / block.totalSlots) * 100)
                    : 0;
                  
                  return (
                    <Card key={block.id} className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-slate-900">
                          Bloque {block.code}
                        </CardTitle>
                        <CardDescription>{block.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-600">
                                Ocupación
                              </span>
                              <span className="text-lg font-bold text-slate-900">
                                {occupancy}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  occupancy < 50
                                    ? 'bg-[#16A34A]'
                                    : occupancy < 75
                                    ? 'bg-[#D97706]'
                                    : 'bg-[#DC2626]'
                                }`}
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Franjas ocupadas: {block.activeReservations}</span>
                            <span>Total: {block.totalSlots}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#1D4ED8]" />
                    Todas las Reservas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Ver y gestionar todas las reservas del sistema
                  </p>
                  <Link href="/reservas">
                    <Button variant="outline" size="sm">
                      Ver Reservas
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#1D4ED8]" />
                    Reportes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Generar reportes de ocupación y disponibilidad
                  </p>
                  <Link href="/reportes">
                    <Button variant="outline" size="sm">
                      Generar Reporte
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
