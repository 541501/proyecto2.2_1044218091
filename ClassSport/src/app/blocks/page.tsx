/**
 * app/blocks/page.tsx — Grilla de bloques con disponibilidad
 *
 * Flujo:
 * 1. Selector de fecha
 * 2. Grilla de 3 BlockCard (A, B, C)
 * 3. Al clickear, navega a /blocks/[blockId]
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlockCard from '@/components/blocks/BlockCard';
import { Card } from '@/components/ui/card';

export default function BlocksPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [availability, setAvailability] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Inicializar con fecha de hoy
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  }, []);

  // Cargar bloques
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await fetch('/api/blocks');
        if (res.ok) {
          const data = await res.json();
          setBlocks(data);
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };

    fetchBlocks();
  }, []);

  // Cargar disponibilidad cuando cambia la fecha
  useEffect(() => {
    if (!selectedDate || blocks.length === 0) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const availabilityData: Record<string, any> = {};

        for (const block of blocks) {
          const res = await fetch(
            `/api/blocks/${block.id}/availability?date=${selectedDate}`
          );
          if (res.ok) {
            const data = await res.json();
            availabilityData[block.id] = data;
          }
        }

        setAvailability(availabilityData);
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, blocks]);

  const handleBlockClick = (blockId: string) => {
    router.push(`/blocks/${blockId}?date=${selectedDate}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Consultar Disponibilidad
        </h1>
        <p className="text-slate-600">
          Selecciona una fecha y bloque para ver los salones disponibles
        </p>
      </div>

      {/* Selector de fecha */}
      <Card className="p-6">
        <label className="block mb-2">
          <span className="text-sm font-semibold text-slate-700">
            Selecciona una fecha
          </span>
        </label>
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-slate-600">
            {selectedDate && formatDate(selectedDate)}
          </div>
        </div>
      </Card>

      {/* Grilla de bloques */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blocks.map((block) => {
            const blockAvail = availability[block.id];
            const availableRooms = blockAvail?.rooms.filter(
              (r: any) => r.available_slots > 0
            ).length || 0;
            const totalRooms = blockAvail?.rooms.length || 0;

            return (
              <BlockCard
                key={block.id}
                code={block.code}
                name={block.name}
                availableRooms={availableRooms}
                totalRooms={totalRooms}
                onClick={() => handleBlockClick(block.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
