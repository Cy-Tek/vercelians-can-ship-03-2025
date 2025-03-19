"use client"

import { useEffect, useRef, useState } from "react"

export default function HexTechAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [density, setDensity] = useState(30)
  const [glowIntensity, setGlowIntensity] = useState(0.8)

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Hexagon properties
    const hexSize = dimensions.width / density
    const hexHeight = hexSize * Math.sqrt(3)
    const hexWidth = hexSize * 2
    const hexVerticalSpacing = hexHeight * 0.75
    const hexHorizontalSpacing = hexWidth * 0.75

    const rows = Math.ceil(dimensions.height / hexVerticalSpacing) + 2
    const cols = Math.ceil(dimensions.width / hexHorizontalSpacing) + 2

    // Create hexagons grid
    const hexagons: Hexagon[] = []
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const x = col * hexHorizontalSpacing + (row % 2 === 0 ? 0 : hexWidth / 2)
        const y = row * hexVerticalSpacing

        hexagons.push({
          x,
          y,
          size: hexSize,
          opacity: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * 2 * Math.PI,
          pulseSpeed: (Math.random() * 0.02 + 0.01) * speed,
          dataLines: Math.random() > 0.7,
          dataSpeed: (Math.random() * 0.5 + 0.5) * speed,
          dataOffset: Math.random() * 100,
          highlight: Math.random() > 0.85,
          color: getRandomColor(),
        })
      }
    }

    // Particles
    const particles: Particle[] = []
    const particleCount = Math.floor((dimensions.width * dimensions.height) / 20000)

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let animationFrameId: number
    let lastTime = 0

    const render = (time: number) => {
      if (!isPlaying) return

      const deltaTime = time - lastTime
      lastTime = time

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "#050A14"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw hexagons
      hexagons.forEach((hex) => {
        hex.pulse += hex.pulseSpeed * (deltaTime / 16)
        if (hex.pulse > Math.PI * 2) hex.pulse -= Math.PI * 2

        const currentOpacity = hex.opacity * (0.6 + 0.4 * Math.sin(hex.pulse))

        drawHexagon(
          ctx,
          hex.x,
          hex.y,
          hex.size,
          hex.color,
          currentOpacity * glowIntensity,
          hex.highlight,
          hex.dataLines,
          hex.dataOffset + time * 0.001 * hex.dataSpeed,
        )
      })

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.speedX * (deltaTime / 16)
        particle.y += particle.speedY * (deltaTime / 16)

        // Wrap around screen
        if (particle.x < 0) particle.x = dimensions.width
        if (particle.x > dimensions.width) particle.x = 0
        if (particle.y < 0) particle.y = dimensions.height
        if (particle.y > dimensions.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120, 220, 255, ${particle.opacity})`
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [dimensions, isPlaying, speed, density, glowIntensity])

  function drawHexagon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number,
    highlight: boolean,
    dataLines: boolean,
    dataOffset: number,
  ) {
    const sides = 6
    const angle = (Math.PI * 2) / sides

    ctx.beginPath()
    for (let i = 0; i < sides; i++) {
      const pointX = x + size * Math.cos(angle * i)
      const pointY = y + size * Math.sin(angle * i)
      if (i === 0) {
        ctx.moveTo(pointX, pointY)
      } else {
        ctx.lineTo(pointX, pointY)
      }
    }
    ctx.closePath()

    // Fill with gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5)
    gradient.addColorStop(
      0,
      `${color}${Math.floor(opacity * 40)
        .toString(16)
        .padStart(2, "0")}`,
    )
    gradient.addColorStop(1, `${color}00`)
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw border
    ctx.strokeStyle = `${color}${Math.floor(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw highlight
    if (highlight) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
      ctx.lineWidth = 2
      ctx.stroke()

      // Inner glow
      ctx.beginPath()
      for (let i = 0; i < sides; i++) {
        const pointX = x + size * 0.8 * Math.cos(angle * i)
        const pointY = y + size * 0.8 * Math.sin(angle * i)
        if (i === 0) {
          ctx.moveTo(pointX, pointY)
        } else {
          ctx.lineTo(pointX, pointY)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`
      ctx.stroke()
    }

    // Draw data lines
    if (dataLines) {
      const lineCount = 3
      const lineSpacing = size / (lineCount + 1)

      ctx.strokeStyle = `rgba(120, 220, 255, ${opacity * 0.7})`
      ctx.lineWidth = 1

      for (let i = 1; i <= lineCount; i++) {
        const lineY = y - size / 2 + i * lineSpacing

        ctx.beginPath()
        ctx.moveTo(x - size / 2, lineY)
        ctx.lineTo(x + size / 2, lineY)

        // Create data-like pattern
        for (let j = 0; j < size; j += 4) {
          const dashPos = (j + dataOffset * 20) % size
          if (dashPos < size / 2) {
            ctx.strokeStyle = `rgba(120, 220, 255, ${opacity * 0.7})`
          } else {
            ctx.strokeStyle = `rgba(120, 220, 255, ${opacity * 0.3})`
          }

          ctx.beginPath()
          ctx.moveTo(x - size / 2 + j, lineY)
          ctx.lineTo(x - size / 2 + j + 2, lineY)
          ctx.stroke()
        }
      }
    }
  }

  function getRandomColor() {
    const colors = [
      "#0088FF", // Blue
      "#00CCFF", // Cyan
      "#00FFCC", // Teal
      "#66FFFF", // Light cyan
      "#3377FF", // Royal blue
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050A14]">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-4 p-4 bg-black/30 backdrop-blur-sm rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="speed" className="text-white text-sm">
            Speed:
          </label>
          <input
            id="speed"
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
            className="w-24"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="density" className="text-white text-sm">
            Density:
          </label>
          <input
            id="density"
            type="range"
            min="10"
            max="50"
            step="1"
            value={density}
            onChange={(e) => setDensity(Number.parseInt(e.target.value))}
            className="w-24"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="glow" className="text-white text-sm">
            Glow:
          </label>
          <input
            id="glow"
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={glowIntensity}
            onChange={(e) => setGlowIntensity(Number.parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
}

// Types
interface Hexagon {
  x: number
  y: number
  size: number
  opacity: number
  pulse: number
  pulseSpeed: number
  dataLines: boolean
  dataSpeed: number
  dataOffset: number
  highlight: boolean
  color: string
}

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}
