import { create } from 'zustand';
import * as THREE from 'three';
import { AppMode, Line3D, SketchState } from '../types';

let lineIdCounter = 0;

interface SketchActions {
  setMode: (mode: AppMode) => void;
  startLine: (point: THREE.Vector3) => void;
  addPoint: (point: THREE.Vector3) => void;
  finishLine: () => void;
  undo: () => void;
  clear: () => void;
  setSelectPoint: (point: THREE.Vector3 | null) => void;
  setPlanePoints: (points: THREE.Vector3[]) => void;
}

const ORIGIN = new THREE.Vector3(0, 0, 0);

export const useSketchStore = create<SketchState & SketchActions>((set) => ({
  mode: 'draw',
  lines: [],
  currentLine: null,
  allPoints: [],
  selectPoint: ORIGIN,
  planePoints: [],

  setMode: (mode) => set({ mode }),

  startLine: (point) =>
    set((state) => ({
      currentLine: [point],
      allPoints: [...state.allPoints, point],
    })),

  addPoint: (point) =>
    set((state) => {
      if (!state.currentLine) return state;
      return {
        currentLine: [...state.currentLine, point],
        allPoints: [...state.allPoints, point],
      };
    }),

  finishLine: () =>
    set((state) => {
      if (!state.currentLine || state.currentLine.length < 2) {
        return { currentLine: null };
      }
      const newLine: Line3D = {
        id: `line-${lineIdCounter++}`,
        points: state.currentLine,
      };
      return {
        lines: [...state.lines, newLine],
        currentLine: null,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.lines.length === 0) return state;
      const removedLine = state.lines[state.lines.length - 1];
      const removedSet = new Set(removedLine.points);
      return {
        lines: state.lines.slice(0, -1),
        allPoints: state.allPoints.filter((p) => !removedSet.has(p)),
      };
    }),

  clear: () =>
    set({
      lines: [],
      currentLine: null,
      allPoints: [],
      planePoints: [],
      selectPoint: ORIGIN,
    }),

  setSelectPoint: (point) => set({ selectPoint: point }),

  setPlanePoints: (points) => set({ planePoints: points }),
}));
