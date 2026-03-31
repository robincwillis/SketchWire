import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Line3D } from '../types';
import { buildCompletedLineMesh } from '../engine/LineRenderer';

interface Props {
  lines: Line3D[];
}

function CompletedLine({ line }: { line: Line3D }) {
  const meshRef = useRef<THREE.Line | null>(null);

  if (!meshRef.current) {
    meshRef.current = buildCompletedLineMesh(line.points);
  }

  if (!meshRef.current) return null;

  return <primitive key={line.id} object={meshRef.current} />;
}

export function CompletedLines({ lines }: Props) {
  return (
    <>
      {lines.map((line) => (
        <CompletedLine key={line.id} line={line} />
      ))}
    </>
  );
}
