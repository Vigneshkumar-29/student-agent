"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState, memo } from "react"

import { cn } from "@/lib/utils"

// Reduced number of markers and mapSamples for better performance
const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: window.devicePixelRatio || 1, // Use device pixel ratio but cap it
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 8000, // Reduced from 16000
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    // Reduced number of markers
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}

// Optimized version with reduced rendering frequency
function GlobeComponent({
  className,
  config = GLOBE_CONFIG,
  lowPerformance = false, // Added performance mode option
}: {
  className?: string
  config?: COBEOptions
  lowPerformance?: boolean
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)
  const frameRef = useRef<number>() // For animation frame management
  
  // Reduce animation speed in low-performance mode
  const rotationSpeed = lowPerformance ? 0.002 : 0.005
  
  // Throttled pointer handler
  const updatePointerInteraction = useCallback((value: any) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }, [])

  // Throttled movement handler
  const updateMovement = useCallback((clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }, [])

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += rotationSpeed
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r, rotationSpeed],
  )

  const onResize = useCallback(() => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }, [])

  useEffect(() => {
    const resizeHandler = () => {
      // Throttle resize events
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      frameRef.current = requestAnimationFrame(onResize)
    }
    
    window.addEventListener("resize", resizeHandler, { passive: true })
    onResize()

    // Adjust configuration for performance
    const finalConfig = {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
      devicePixelRatio: lowPerformance ? 1 : (config.devicePixelRatio || 2),
      mapSamples: lowPerformance ? 4000 : (config.mapSamples || 8000),
    }

    const globe = createGlobe(canvasRef.current!, finalConfig)

    // Fade in the globe after a short delay
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1"
      }
    }, 100)

    return () => {
      globe.destroy()
      window.removeEventListener("resize", resizeHandler)
      clearTimeout(timer)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [config, onRender, onResize, lowPerformance])

  // Use passive event listeners for all interactions
  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          e.preventDefault()
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => 
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const Globe = memo(GlobeComponent) 