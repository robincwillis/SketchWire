import { StatusBar } from 'expo-status-bar';
import { SketchCanvas } from './src/components/SketchCanvas';

export default function App() {
  return (
    <>
      <StatusBar style="light" hidden />
      <SketchCanvas />
    </>
  );
}
