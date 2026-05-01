/**
 * app/admin/rooms/[id]/edit/page.tsx — Editar salón
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

interface FormData {
  code?: string;
  type?: string;
  capacity?: number;
  equipment?: string;
}

export default function EditRoomPage({ params }: PageProps) {
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [form, setForm] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
          setForm(data);
        }
      } catch (err) {
        console.error('Error fetching room:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin/rooms');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al actualizar el salón');
      }
    } catch (err) {
      setError('Error al actualizar el salón');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Editar Salón {room?.code}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Código
            </label>
            <input
              type="text"
              value={form.code || ''}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tipo
            </label>
            <select
              value={form.type || ''}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="salon">Salón</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="auditorio">Auditorio</option>
              <option value="sala_computo">Sala de cómputo</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Capacidad
            </label>
            <input
              type="number"
              value={form.capacity || ''}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Equipamiento
            </label>
            <textarea
              value={form.equipment || ''}
              onChange={(e) =>
                setForm({ ...form, equipment: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
