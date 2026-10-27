import { GridCell, GridSize, ImageMode, Matrix, Preset, TransformedCell } from '../types';

export function clamp255(val: number): number {
  return Math.max(0, Math.min(255, Math.round(val)));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clampR = clamp255(r);
  const clampG = clamp255(g);
  const clampB = clamp255(b);
  return (
    '#' +
    [clampR, clampG, clampB]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function makeGrayscaleCell(v: number): GridCell {
  const clamped = clamp255(v);
  return {
    r: clamped,
    g: clamped,
    b: clamped,
    hex: rgbToHex(clamped, clamped, clamped),
  };
}

export function makeColorCell(r: number, g: number, b: number): GridCell {
  const cr = clamp255(r);
  const cg = clamp255(g);
  const cb = clamp255(b);
  return {
    r: cr,
    g: cg,
    b: cb,
    hex: rgbToHex(cr, cg, cb),
  };
}

export function createEmptyGrid(size: GridSize, mode: ImageMode): GridCell[][] {
  const grid: GridCell[][] = [];
  const defaultVal = mode === 'grayscale' ? 255 : 255;
  for (let r = 0; r < size; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < size; c++) {
      row.push(makeGrayscaleCell(defaultVal));
    }
    grid.push(row);
  }
  return grid;
}

export function extractMatrices(grid: GridCell[][]): {
  R: Matrix;
  G: Matrix;
  B: Matrix;
  A: Matrix; // For grayscale (uses average or red channel)
} {
  const R: Matrix = [];
  const G: Matrix = [];
  const B: Matrix = [];
  const A: Matrix = [];

  for (let r = 0; r < grid.length; r++) {
    const rowR: number[] = [];
    const rowG: number[] = [];
    const rowB: number[] = [];
    const rowA: number[] = [];

    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      rowR.push(cell.r);
      rowG.push(cell.g);
      rowB.push(cell.b);
      // For grayscale representation, since r=g=b in grayscale or average in color
      const gray = Math.round((cell.r + cell.g + cell.b) / 3);
      rowA.push(gray);
    }

    R.push(rowR);
    G.push(rowG);
    B.push(rowB);
    A.push(rowA);
  }

  return { R, G, B, A };
}

export function transformGrid(
  grid: GridCell[][],
  k: number,
  mode: ImageMode,
  cValue: number = 1
): {
  transformedGrid: TransformedCell[][];
  transformedR: Matrix;
  transformedG: Matrix;
  transformedB: Matrix;
  transformedA: Matrix;
} {
  const transformedGrid: TransformedCell[][] = [];
  const transformedR: Matrix = [];
  const transformedG: Matrix = [];
  const transformedB: Matrix = [];
  const transformedA: Matrix = [];

  for (let r = 0; r < grid.length; r++) {
    const rowCells: TransformedCell[] = [];
    const rowR: number[] = [];
    const rowG: number[] = [];
    const rowB: number[] = [];
    const rowA: number[] = [];

    for (let c = 0; c < grid[r].length; c++) {
      const orig = grid[r][c];

      if (mode === 'monochrome' || mode === 'grayscale') {
        // In monochrome and grayscale, all 3 channels change equally (single matrix A)
        const origVal = orig.r; // r=g=b
        const raw = Math.round((cValue * origVal + k) * 10) / 10;
        const clamped = clamp255(raw);
        const isClamped = raw < 0 || raw > 255;

        rowCells.push({
          r: clamped,
          g: clamped,
          b: clamped,
          hex: rgbToHex(clamped, clamped, clamped),
          originalR: origVal,
          originalG: origVal,
          originalB: origVal,
          rawR: raw,
          rawG: raw,
          rawB: raw,
          isRClamped: isClamped,
          isGClamped: isClamped,
          isBClamped: isClamped,
        });

        rowR.push(clamped);
        rowG.push(clamped);
        rowB.push(clamped);
        rowA.push(clamped);
      } else {
        // Color mode
        const rawR = Math.round((cValue * orig.r + k) * 10) / 10;
        const rawG = Math.round((cValue * orig.g + k) * 10) / 10;
        const rawB = Math.round((cValue * orig.b + k) * 10) / 10;

        const clampedR = clamp255(rawR);
        const clampedG = clamp255(rawG);
        const clampedB = clamp255(rawB);

        const isRClamped = rawR < 0 || rawR > 255;
        const isGClamped = rawG < 0 || rawG > 255;
        const isBClamped = rawB < 0 || rawB > 255;

        rowCells.push({
          r: clampedR,
          g: clampedG,
          b: clampedB,
          hex: rgbToHex(clampedR, clampedG, clampedB),
          originalR: orig.r,
          originalG: orig.g,
          originalB: orig.b,
          rawR,
          rawG,
          rawB,
          isRClamped,
          isGClamped,
          isBClamped,
        });

        rowR.push(clampedR);
        rowG.push(clampedG);
        rowB.push(clampedB);
        rowA.push(Math.round((clampedR + clampedG + clampedB) / 3));
      }
    }

    transformedGrid.push(rowCells);
    transformedR.push(rowR);
    transformedG.push(rowG);
    transformedB.push(rowB);
    transformedA.push(rowA);
  }

  return {
    transformedGrid,
    transformedR,
    transformedG,
    transformedB,
    transformedA,
  };
}

// Educational Presets directly matching textbook
export const PRESETS: Preset[] = [
  {
    id: 'textbook-p90-a',
    name: '교과서 90쪽 예제 A',
    description: '교과서에 수록된 회색조 3×3 행렬 A [230, 80, 230; 80, 230, 80; 230, 80, 230]',
    size: 3,
    mode: 'grayscale',
    suggestedK: 50,
    data: [
      [makeGrayscaleCell(230), makeGrayscaleCell(80), makeGrayscaleCell(230)],
      [makeGrayscaleCell(80), makeGrayscaleCell(230), makeGrayscaleCell(80)],
      [makeGrayscaleCell(230), makeGrayscaleCell(80), makeGrayscaleCell(230)],
    ],
  },
  {
    id: 'textbook-p91-q1',
    name: '교과서 91쪽 문제 1',
    description: '2×2 회색조 체커 패턴',
    size: 3,
    mode: 'grayscale',
    suggestedK: -50,
    data: [
      [makeGrayscaleCell(200), makeGrayscaleCell(60), makeGrayscaleCell(200)],
      [makeGrayscaleCell(60), makeGrayscaleCell(200), makeGrayscaleCell(60)],
      [makeGrayscaleCell(200), makeGrayscaleCell(60), makeGrayscaleCell(200)],
    ],
  },
  {
    id: 'checker-4x4',
    name: '체커보드 패턴 4×4',
    description: '명암이 교차하는 4×4 흑백 이미지',
    size: 4,
    mode: 'grayscale',
    suggestedK: 60,
    data: [
      [makeGrayscaleCell(240), makeGrayscaleCell(70), makeGrayscaleCell(240), makeGrayscaleCell(70)],
      [makeGrayscaleCell(70), makeGrayscaleCell(240), makeGrayscaleCell(70), makeGrayscaleCell(240)],
      [makeGrayscaleCell(240), makeGrayscaleCell(70), makeGrayscaleCell(240), makeGrayscaleCell(70)],
      [makeGrayscaleCell(70), makeGrayscaleCell(240), makeGrayscaleCell(70), makeGrayscaleCell(240)],
    ],
  },
  {
    id: 'color-flag-3x3',
    name: '3원색 십자 패턴 3×3',
    description: 'RGB 원색이 뚜렷하게 나뉜 컬러 이미지',
    size: 3,
    mode: 'color',
    suggestedK: 40,
    data: [
      [makeColorCell(220, 38, 38), makeColorCell(37, 99, 235), makeColorCell(220, 38, 38)],
      [makeColorCell(37, 99, 235), makeColorCell(234, 179, 8), makeColorCell(37, 99, 235)],
      [makeColorCell(220, 38, 38), makeColorCell(37, 99, 235), makeColorCell(220, 38, 38)],
    ],
  },
  {
    id: 'color-sunset-4x4',
    name: '일몰 그라데이션 4×4',
    description: '보라색에서 주황·노랑으로 변하는 그라데이션 컬러',
    size: 4,
    mode: 'color',
    suggestedK: -40,
    data: [
      [makeColorCell(76, 29, 149), makeColorCell(109, 40, 217), makeColorCell(147, 51, 234), makeColorCell(192, 38, 211)],
      [makeColorCell(190, 24, 93), makeColorCell(225, 29, 72), makeColorCell(244, 63, 94), makeColorCell(251, 113, 133)],
      [makeColorCell(234, 88, 12), makeColorCell(249, 115, 22), makeColorCell(251, 146, 60), makeColorCell(253, 186, 116)],
      [makeColorCell(202, 138, 4), makeColorCell(234, 179, 8), makeColorCell(250, 204, 21), makeColorCell(254, 240, 138)],
    ],
  },
  {
    id: 'color-pixel-heart-5x5',
    name: '픽셀 하트 5×5',
    description: '5×5 붉은색 픽셀 아트 하트',
    size: 5,
    mode: 'color',
    suggestedK: 50,
    data: [
      [makeColorCell(255, 255, 255), makeColorCell(239, 68, 68), makeColorCell(255, 255, 255), makeColorCell(239, 68, 68), makeColorCell(255, 255, 255)],
      [makeColorCell(239, 68, 68), makeColorCell(220, 38, 38), makeColorCell(239, 68, 68), makeColorCell(220, 38, 38), makeColorCell(239, 68, 68)],
      [makeColorCell(239, 68, 68), makeColorCell(220, 38, 38), makeColorCell(185, 28, 28), makeColorCell(220, 38, 38), makeColorCell(239, 68, 68)],
      [makeColorCell(255, 255, 255), makeColorCell(239, 68, 68), makeColorCell(220, 38, 38), makeColorCell(239, 68, 68), makeColorCell(255, 255, 255)],
      [makeColorCell(255, 255, 255), makeColorCell(255, 255, 255), makeColorCell(220, 38, 38), makeColorCell(255, 255, 255), makeColorCell(255, 255, 255)],
    ],
  },
];
