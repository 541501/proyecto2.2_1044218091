'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { CheckCircle2, AlertCircle, Database, Server, Play, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface DiagnosticData {
  mode: string;
  migrations: {
    pending: string[];
    applied: string[];
  };
  supabase: {
    connected: boolean;
    error?: string;
  };
  blob: {
    connected: boolean;
    error?: string;
  };
  counts: {
    users?: number;
    blocks?: number;
    slots?: number;
    rooms?: number;
    reservations?: number;
  };
}

export default function DbSetupPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadDiagnostic();
  }, []);

  const loadDiagnostic = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/system/diagnose');
      if (!res.ok) throw new Error('Failed to load diagnostic');
      const data = await res.json();
      setDiagnostic(data);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrap = async () => {
    try {
      setIsBootstrapping(true);
      const res = await fetch('/api/system/bootstrap', { method: 'POST' });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Bootstrap failed');
      }

      const result = await res.json();
      toast.success(`Bootstrap completado: ${result.applied?.length || 0} migraciones aplicadas`);
      setShowConfirmModal(false);
      
      // Reload diagnostic
      await loadDiagnostic();
    } catch (error) {
      console.error(error);
      toast.error(`Error en bootstrap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw size={48} className="animate-spin text-[#1D4ED8] mx-auto mb-4" />
            <p className="text-slate-600">Cargando diagnóstico...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isLiveMode = diagnostic?.mode === 'live';

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuración de Base de Datos</h1>
          <p className="text-slate-600">Diagnóstico del sistema y ejecución de bootstrap</p>
        </div>

        {/* System Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={24} />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mode Status */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Modo</label>
                <div className="flex items-center gap-2">
                  {isLiveMode ? (
                    <>
                      <CheckCircle2 size={20} className="text-[#16A34A]" />
                      <span className="text-slate-900 font-medium">LIVE</span>
                      <Badge variant="success">Operativo</Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} className="text-[#D97706]" />
                      <span className="text-slate-900 font-medium">SEED</span>
                      <Badge variant="warning">Requiere Setup</Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Supabase Status */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Supabase</label>
                <div className="flex items-center gap-2">
                  {diagnostic?.supabase?.connected ? (
                    <>
                      <CheckCircle2 size={20} className="text-[#16A34A]" />
                      <span className="text-slate-900 font-medium">Conectado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} className="text-[#DC2626]" />
                      <span className="text-slate-900 font-medium">Desconectado</span>
                    </>
                  )}
                </div>
                {diagnostic?.supabase?.error && (
                  <p className="text-xs text-red-600 mt-1">{diagnostic.supabase.error}</p>
                )}
              </div>

              {/* Blob Status */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Vercel Blob</label>
                <div className="flex items-center gap-2">
                  {diagnostic?.blob?.connected ? (
                    <>
                      <CheckCircle2 size={20} className="text-[#16A34A]" />
                      <span className="text-slate-900 font-medium">Conectado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} className="text-[#DC2626]" />
                      <span className="text-slate-900 font-medium">Desconectado</span>
                    </>
                  )}
                </div>
                {diagnostic?.blob?.error && (
                  <p className="text-xs text-red-600 mt-1">{diagnostic.blob.error}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migrations Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server size={24} />
              Migraciones
            </CardTitle>
            <CardDescription>
              Estado de las migraciones de base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Applied Migrations */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Aplicadas ({diagnostic?.migrations?.applied?.length || 0})</h3>
                {diagnostic?.migrations?.applied && diagnostic.migrations.applied.length > 0 ? (
                  <ul className="space-y-1">
                    {diagnostic.migrations.applied.map((m) => (
                      <li key={m} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-[#16A34A]" />
                        {m}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Ninguna aplicada</p>
                )}
              </div>

              {/* Pending Migrations */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Pendientes ({diagnostic?.migrations?.pending?.length || 0})</h3>
                {diagnostic?.migrations?.pending && diagnostic.migrations.pending.length > 0 ? (
                  <ul className="space-y-1">
                    {diagnostic.migrations.pending.map((m) => (
                      <li key={m} className="flex items-center gap-2 text-sm text-slate-600">
                        <AlertCircle size={16} className="text-[#D97706]" />
                        {m}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Ninguna pendiente</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Counts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registros en Base de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {diagnostic?.counts && Object.entries(diagnostic.counts).map(([key, count]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 capitalize mb-1">{key}</p>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bootstrap Info */}
        {!isLiveMode && (
          <Card className="mb-6 border-[#F59E0B]">
            <CardHeader>
              <CardTitle className="text-[#92400E]">Bootstrap Requerido</CardTitle>
              <CardDescription>
                El sistema aplicará las siguientes migraciones y datos iniciales:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-[#FEF3C7] rounded-lg p-4 space-y-2">
                <p className="text-sm text-[#92400E]">
                  <strong>Migraciones:</strong> {diagnostic?.migrations?.pending?.length || 0} migraciones
                </p>
                <p className="text-sm text-[#92400E]">
                  <strong>Usuarios:</strong> 1 usuario admin
                </p>
                <p className="text-sm text-[#92400E]">
                  <strong>Bloques:</strong> 3 bloques (A, B, C)
                </p>
                <p className="text-sm text-[#92400E]">
                  <strong>Franjas Horarias:</strong> 6 franjas
                </p>
                <p className="text-sm text-[#92400E]">
                  <strong>Salones Demo:</strong> 4 salones de demostración
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setShowConfirmModal(true)}
                disabled={isBootstrapping}
              >
                <Play size={18} />
                {isBootstrapping ? 'Ejecutando...' : 'Ejecutar Bootstrap'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Bootstrap Complete */}
        {isLiveMode && (
          <Alert className="border-[#16A34A] bg-[#F0FDF4]">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            <AlertTitle className="text-[#166534]">Bootstrap Completado</AlertTitle>
            <AlertDescription className="text-[#166534]">
              El sistema está completamente configurado y en modo operativo. El banner de modo semilla desaparecerá automáticamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Refresh Button */}
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={loadDiagnostic}
            disabled={isLoading}
          >
            <RefreshCw size={18} />
            Recargar Diagnóstico
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Bootstrap"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isBootstrapping}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBootstrap}
              disabled={isBootstrapping}
            >
              {isBootstrapping ? 'Ejecutando...' : 'Confirmar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Esto aplicará todas las migraciones pendientes y cargará los datos iniciales:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>{diagnostic?.migrations?.pending?.length || 0} migraciones</li>
            <li>1 usuario administrador</li>
            <li>3 bloques académicos (A, B, C)</li>
            <li>6 franjas horarias</li>
            <li>4 salones de demostración</li>
          </ul>
          <p className="text-sm text-slate-600">
            El sistema pasará a modo LIVE después de completar el bootstrap.
          </p>
        </div>
      </Modal>
    </AppLayout>
  );
}
