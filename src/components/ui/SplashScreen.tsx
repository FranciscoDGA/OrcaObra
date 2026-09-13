import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setOpacity(1), 50);
    const finishTimer = setTimeout(() => {
      setOpacity(0);
      setTimeout(onFinish, 400);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center transition-opacity duration-400"
      style={{ opacity }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          <span className="text-white/90">Orça</span>Obra
        </h1>
        <p className="text-teal-100 text-sm">Orçamentos inteligentes para sua obra</p>
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
