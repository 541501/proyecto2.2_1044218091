/**
 * app/admin/rooms/new/page.tsx — Crear nuevo salón
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface FormData {
  block_id: string;
  code: string;
  type: string;
  capacity: number;
  equipment: string;
}

export default function NewRoomPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [form, setForm] = useState<FormData>({
    block_id: '',
    code: '',
    type: 'salon',
    capacity: 30,
    equipment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blocksLoaded, setBlocksLoaded] = useState(false);

  // Cargar bloques
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await fetch('/api/blocks');
        const data = await res.json();
        setBlocks(data);
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, block_id: data[0].id }));
        }
        setBlocksLoaded(true);
      } catch (err) {
        console.error('Error fetching blocks:', err);
      }
    };
    fetchBlocks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 409) {
        setError('Ya existe un salón con ese código en el bloque seleccionado.');
      } else if (res.ok) {
        router.push('/admin/rooms');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al crear el salón');
      }
    } catch (err) {
      setError('Error al crear el salón');
    } finally {
      setLoading(false);
    }
  };

  if (!blocksLoaded) {
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
          Crear Nuevo Salón
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Bloque *
            </label>
            <select
              value={form.block_id}
              onChange={(e) =>
                setForm({ ...form, block_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un bloque</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Código (ej: A-101) *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A-101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tipo *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              Capacidad *
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Equipamiento
            </label>
            <textarea
              value={form.equipment}
              onChange={(e) =>
                setForm({ ...form, equipment: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Ej: Videobeam, tablero, aire acondicionado"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creando...' : 'Crear Salón'}
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
