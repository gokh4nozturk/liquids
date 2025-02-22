"use client";

import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";
import Image from "next/image";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise3D = createNoise3D();
    let frame = 0;
    let time = 0;

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const padding = 0;
      canvas.width = rect.width + padding * 2;
      canvas.height = rect.height + padding * 2;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      canvas.style.left = `-${padding}px`;
      canvas.style.top = `-${padding}px`;
    };

    const calculateColor = (x: number, y: number, time: number) => {
      const scale = 0.005;
      const edge = 0.07;
      const speed = 0.2;
      const turbulence = 0.5;

      const noiseValue1 = noise3D(x * scale, y * scale, time * speed);
      const noiseValue2 = noise3D(x * scale * 2, y * scale * 2, time * speed * 1.5);
      
      const finalNoise = (noiseValue1 + noiseValue2 * turbulence) / (1 + turbulence);
      
      return finalNoise > edge ? "#000" : "#fff";
    };

    const animate = () => {
      if (!canvas) return;
      frame = requestAnimationFrame(animate);
      time += 0.01;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < canvas.width; x += 2) {
        for (let y = 0; y < canvas.height; y += 2) {
          const color = calculateColor(x, y, time);
          if (color === "#fff") {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="relative max-w-[500px] w-full">
          <canvas
            ref={canvasRef}
            className="absolute rounded-3xl"
            style={{ imageRendering: 'pixelated' }}
          />
          <div ref={containerRef} className="relative z-10 bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
            <Image
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
              className="mb-8 invert"
            />
            <h1 className="text-2xl font-bold mb-4 text-white">Liquid Metal Effect</h1>
            <p className="text-gray-300">
              Bu efekt simplex-noise kullanılarak oluşturulmuş sıvı metal animasyonudur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
