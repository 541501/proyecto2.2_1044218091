'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D4ED8] mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const userRole = session?.user?.role || 'profesor';

  // Build navigation based on role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
      { href: '/bloques', label: 'Bloques', icon: Building2 },
    ];

    if (userRole === 'profesor') {
      return [
        ...baseItems,
        { href: '/reservas/mis', label: 'Mis Reservas', icon: Calendar },
        { href: '/perfil', label: 'Perfil', icon: User },
      ];
    }

    if (userRole === 'coordinador') {
      return [
        ...baseItems,
        { href: '/reservas', label: 'Todas las Reservas', icon: Calendar },
        { href: '/reportes', label: 'Reportes', icon: FileText },
        { href: '/perfil', label: 'Perfil', icon: User },
      ];
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { href: '/reservas', label: 'Todas las Reservas', icon: Calendar },
        { href: '/reportes', label: 'Reportes', icon: FileText },
        { href: '/admin', label: 'Administración', icon: Settings },
        { href: '/perfil', label: 'Perfil', icon: User },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await signOut({ redirect: true, redirectUrl: '/login' });
    toast.success('Sesión cerrada');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-[#E2E8F0] shadow-sm">
        {/* Logo */}
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-bold">
              CS
            </div>
            <span className="font-bold text-slate-900">ClassSport</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = false; // Would check pathname here
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#1D4ED8] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-[#E2E8F0] px-4 py-4 space-y-3">
          <div className="px-2">
            <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
            <p className="text-xs text-slate-500">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden md:ml-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1D4ED8] rounded flex items-center justify-center text-white font-bold text-sm">
              CS
            </div>
            <span className="font-bold text-slate-900">ClassSport</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-2"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
