import React, { useRef, useEffect, useCallback } from "react";

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  extraScale?: number;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);

  // DPR-aware resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let ro: ResizeObserver | null = null;
    let raf = 0;

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      // CSS 크기
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // 드로잉 버퍼 크기
      const bw = Math.max(1, Math.round(width * dpr));
      const bh = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // 픽셀 스케일 적용
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }
    };

    // 처음 한 번 + 리사이즈 옵저버
    resizeCanvas();
    ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(resizeCanvas);
    });
    ro.observe(container);

    window.addEventListener("orientationchange", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("orientationchange", resizeCanvas);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          // ease-out (quad)
          return t * (2 - t);
      }
    },
    [easing]
  );

  // 애니메이션 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let anim = 0;

    const draw = (ts: number) => {
      // 전체 클리어
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 살아있는 스파크만 유지하며 그리기
      sparksRef.current = sparksRef.current.filter((s) => {
        const elapsed = ts - s.startTime;
        if (elapsed >= duration) return false;

        const p = elapsed / duration;
        const eased = easeFunc(p);
        const dist = eased * sparkRadius * extraScale;
        const lineLen = sparkSize * (1 - eased);

        const x1 = s.x + dist * Math.cos(s.angle);
        const y1 = s.y + dist * Math.sin(s.angle);
        const x2 = s.x + (dist + lineLen) * Math.cos(s.angle);
        const y2 = s.y + (dist + lineLen) * Math.sin(s.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      anim = requestAnimationFrame(draw);
    };

    anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]);

  // onClick 대신 onPointerDown: 라우트 전환 전에 그려지게
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const count = Math.max(1, sparkCount);
    const newSparks: Spark[] = Array.from({ length: count }, (_, i) => {
      // 약간의 랜덤 퍼짐
      const jitter = (Math.random() - 0.5) * (Math.PI / count);
      return {
        x,
        y,
        angle: (2 * Math.PI * i) / count + jitter,
        startTime: now
      };
    });

    sparksRef.current.push(...newSparks);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-full"
      onPointerDown={handlePointerDown}
    >
      {/* 꼭 z-index 올려서 위에 그리자 */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[9999]" />
      {children}
    </div>
  );
};

export default ClickSpark;
