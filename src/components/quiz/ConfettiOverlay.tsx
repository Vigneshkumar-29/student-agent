import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiOverlayProps {
  show: boolean;
}

const ConfettiOverlay = ({ show = false }: ConfettiOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (show && canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });

      myConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [show]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ConfettiOverlay;
