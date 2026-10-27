export type ImageMode = 'monochrome' | 'grayscale' | 'color';

export type GridSize = 3 | 4 | 5;

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface GridCell {
  r: number;
  g: number;
  b: number;
  hex: string;
}

export type Matrix = number[][];

export interface CellCoord {
  row: number;
  col: number;
}

export interface TransformedCell extends GridCell {
  originalR: number;
  originalG: number;
  originalB: number;
  rawR: number;
  rawG: number;
  rawB: number;
  isRClamped: boolean;
  isGClamped: boolean;
  isBClamped: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  size: GridSize;
  mode: ImageMode;
  data: GridCell[][];
  suggestedK?: number;
}
