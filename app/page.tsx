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

    const getNoise = (x: number, y: number, time: number, offset = 0) => {
      const scale = 2.0; // Pattern Scale
      const speed = 0.3; // Speed
      const liquify = 0.07; // Liquify effect
      
      return noise3D(
        (x * scale) / 1000 + time * speed + offset,
        (y * scale) / 1000,
        liquify * time
      );
    };

    const calculateColor = (x: number, y: number, time: number) => {
      const dispersion = 0.015; // Chromatic aberration
      const edge = 0.4; // Edge threshold
      const blur = 0.005; // Pattern blur

      // RGB kanalları için farklı offset'lerle noise hesaplıyoruz
      const r = getNoise(x, y, time, dispersion);
      const g = getNoise(x, y, time);
      const b = getNoise(x, y, time, -dispersion);

      // Blur efekti için çevre piksellerin ortalamasını alıyoruz
      const blurOffset = 2;
      const rBlur = (
        getNoise(x - blurOffset, y, time, dispersion) +
        getNoise(x + blurOffset, y, time, dispersion) +
        getNoise(x, y - blurOffset, time, dispersion) +
        getNoise(x, y + blurOffset, time, dispersion)
      ) / 4;

      // Edge detection ve renk hesaplama
      const edgeR = r > edge ? 255 : r * 200 + 50;
      const edgeG = g > edge ? 255 : g * 200 + 50;
      const edgeB = b > edge ? 255 : b * 200 + 50;

      // Blur ile karıştırma
      const finalR = Math.min(255, edgeR + rBlur * blur * 1000);
      const finalG = Math.min(255, edgeG + rBlur * blur * 1000);
      const finalB = Math.min(255, edgeB + rBlur * blur * 1000);

      return `rgb(${finalR}, ${finalG}, ${finalB})`;
    };

    const animate = () => {
      if (!canvas) return;
      frame = requestAnimationFrame(animate);
      time += 0.01;

      // Metalik gri arka plan
      ctx.fillStyle = "#E8E8E8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < canvas.width; x += 1) {
        for (let y = 0; y < canvas.height; y += 1) {
          const color = calculateColor(x, y, time);
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
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
          <div ref={containerRef} className="relative z-10 bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <Image
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
              className="mb-8"
            />
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Liquid Metal Effect</h1>
            <p className="text-gray-600">
              Bu efekt simplex-noise kullanılarak oluşturulmuş sıvı metal animasyonudur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
