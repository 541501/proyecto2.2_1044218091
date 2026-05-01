-- Migration: 0002_init_spaces.sql
-- Descripción: Crea tablas para bloques académicos, salones y franjas horarias
-- Fase: 3 — Bloques, Salones y Disponibilidad

-- Bloques académicos (A, B, C)
CREATE TABLE IF NOT EXISTS blocks (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  code       VARCHAR(5)   UNIQUE NOT NULL,  -- A, B, C
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocks_code ON blocks(code);
CREATE INDEX IF NOT EXISTS idx_blocks_active ON blocks(is_active);

-- Franjas horarias fijas de la institución (6 franjas académicas)
-- Las franjas son estándar de la institución, no se pueden crear nuevas
CREATE TABLE IF NOT EXISTS slots (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(20)  NOT NULL,         -- "07:00–09:00"
  start_time  TIME         NOT NULL,
  end_time    TIME         NOT NULL,
  order_index INTEGER      NOT NULL,         -- para ordenar en el calendario
  is_active   BOOLEAN      DEFAULT true,
  UNIQUE (start_time, end_time),
  UNIQUE (order_index)
);

CREATE INDEX IF NOT EXISTS idx_slots_order ON slots(order_index);
CREATE INDEX IF NOT EXISTS idx_slots_active ON slots(is_active);

-- Salones/espacios físicos dentro de cada bloque
-- Tipos: 'salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro'
-- RN-09: El código del salón debe ser único dentro del bloque (UNIQUE compuesto)
CREATE TABLE IF NOT EXISTS rooms (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id    UUID         NOT NULL REFERENCES blocks(id) ON DELETE RESTRICT,
  code        VARCHAR(20)  NOT NULL,        -- "A-101"
  type        VARCHAR(20)  NOT NULL DEFAULT 'salon'
              CHECK (type IN ('salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro')),
  capacity    INTEGER      NOT NULL CHECK (capacity > 0),
  equipment   TEXT,                         -- descripción libre: "Videobeam, tablero, AC"
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (block_id, code)                   -- RN-09: código único dentro del bloque
);

CREATE INDEX IF NOT EXISTS idx_rooms_block ON rooms(block_id);
CREATE INDEX IF NOT EXISTS idx_rooms_block_active ON rooms(block_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
