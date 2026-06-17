import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Alvo de compilação para garantir compatibilidade com navegadores mobile
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Garante que o CSS não quebre em safaris antigos
    cssTarget: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
  }
});
