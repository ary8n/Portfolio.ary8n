"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useInView } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Mail, Code, Database, Smartphone, Brain } from "lucide-react"
import type * as THREE from "three"

// Custom cursor component
function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.matches('a, button, [role="button"], .hover-target')) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }

    window.addEventListener("mousemove", updateMousePosition)
    document.addEventListener("mouseover", handleMouseOver)
    document.addEventListener("mouseout", handleMouseOut)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseout", handleMouseOut)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 w-4 h-4 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-200 ease-out"
      style={{
        left: mousePosition.x - 8,
        top: mousePosition.y - 8,
        transform: isHovering ? "scale(3)" : "scale(1)",
      }}
    />
  )
}

// Shooting star component with trail
function ShootingStar({
  position,
  direction,
  speed,
}: { position: [number, number, number]; direction: [number, number, number]; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Points>(null)
  const [trailPositions, setTrailPositions] = useState<Float32Array>()

  useEffect(() => {
    // Initialize trail positions
    const positions = new Float32Array(30 * 3) // 30 trail points
    setTrailPositions(positions)
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current && trailRef.current && trailPositions) {
      // Update shooting star position
      meshRef.current.position.x += direction[0] * speed * delta
      meshRef.current.position.y += direction[1] * speed * delta
      meshRef.current.position.z += direction[2] * speed * delta

      // Update trail
      const currentPos = meshRef.current.position

      // Shift trail positions
      for (let i = trailPositions.length - 3; i >= 3; i -= 3) {
        trailPositions[i] = trailPositions[i - 3]
        trailPositions[i + 1] = trailPositions[i - 2]
        trailPositions[i + 2] = trailPositions[i - 1]
      }

      // Add current position to trail
      trailPositions[0] = currentPos.x
      trailPositions[1] = currentPos.y
      trailPositions[2] = currentPos.z

      trailRef.current.geometry.attributes.position.needsUpdate = true

      // Reset position if out of bounds
      if (Math.abs(currentPos.x) > 5 || Math.abs(currentPos.y) > 5) {
        meshRef.current.position.set(position[0], position[1], position[2])
      }
    }
  })

  return (
    <group>
      {/* Main shooting star */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>

      {/* Trail */}
      {trailPositions && (
        <points ref={trailRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={trailPositions} count={10} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#3b82f6" size={0.01} transparent opacity={0.6} sizeAttenuation />
        </points>
      )}
    </group>
  )
}

// Enhanced Particle background component with shooting stars
function ParticleBackground() {
  const starsRef = useRef<any>()

  // Static stars
  const [stars] = useState(() => {
    const positions = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000 * 3; i += 3) {
      const radius = Math.random() * 2 + 0.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      positions[i] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i + 2] = radius * Math.cos(phi)
    }
    return positions
  })

  // Shooting stars data
  const [shootingStarsData] = useState(() => {
    return Array.from({ length: 8 }, () => ({
      position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2] as [
        number,
        number,
        number,
      ],
      direction: [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0] as [number, number, number],
      speed: Math.random() * 1 + 0.5,
    }))
  })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (starsRef.current) {
        const x = (event.clientX / window.innerWidth) * 2 - 1
        const y = -(event.clientY / window.innerHeight) * 2 + 1
        starsRef.current.rotation.x = y * 0.05
        starsRef.current.rotation.y = x * 0.05
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      {/* Static stars */}
      <group rotation={[0, 0, Math.PI / 4]}>
        <Points ref={starsRef} positions={stars} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color="#ffffff"
            size={0.008}
            sizeAttenuation={true}
            depthWrite={false}
            opacity={0.8}
          />
        </Points>
      </group>

      {/* Shooting stars */}
      {shootingStarsData.map((star, index) => (
        <ShootingStar key={index} position={star.position} direction={star.direction} speed={star.speed} />
      ))}
    </>
  )
}

// Subtle background stars for other sections
function SubtleStarBackground() {
  const [stars] = useState(() => {
    const positions = new Float32Array(500 * 3)
    for (let i = 0; i < 500 * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 5
    }
    return positions
  })

  return (
    <Points positions={stars} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#ffffff" size={0.003} sizeAttenuation={true} depthWrite={false} opacity={0.3} />
    </Points>
  )
}

// CSS Shooting Stars (for sections without 3D canvas)
function CSSShootingStars() {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; left: number; animationDuration: number }>>([])

  useEffect(() => {
    const createShootingStar = () => {
      const newStar = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        animationDuration: Math.random() * 3 + 2,
      }

      setShootingStars((prev) => [...prev, newStar])

      // Remove star after animation
      setTimeout(() => {
        setShootingStars((prev) => prev.filter((star) => star.id !== newStar.id))
      }, newStar.animationDuration * 1000)
    }

    const interval = setInterval(createShootingStar, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-80"
          style={{
            left: `${star.left}%`,
            top: "-10px",
            animation: `shootingStar ${star.animationDuration}s linear forwards`,
            boxShadow: "0 0 6px 2px rgba(96, 165, 250, 0.6)",
          }}
        />
      ))}
    </div>
  )
}

// Animated section wrapper
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Project card component
function ProjectCard({
  title,
  description,
  image,
  tech,
  link,
}: {
  title: string
  description: string
  image: string
  tech: string[]
  link: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-gray-900 hover-target"
    >
      <Card className="border-0 bg-transparent">
        <CardContent className="p-0">
          <div className="relative h-64 overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-300 text-sm mb-3">{description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {tech.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Portfolio() {
  const { scrollYProgress } = useScroll()
  const [activeSection, setActiveSection] = useState("hero")

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = "none"

    // Smooth scrolling for the entire page
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.body.style.cursor = "auto"
    }
  }, [])

  const projects = [
    {
      title: "Cancer Detection using Machine Learning",
      description:
        "Advanced ML model for early cancer detection using medical imaging data with high accuracy classification.",
      image: "/placeholder.svg?height=300&width=400",
      tech: ["Python", "Machine Learning", "Medical Imaging", "Classification"],
      link: "https://github.com/ary8n/Cancer-Detection-Machine-Learning-Model",
    },
    {
      title: "Coastal Tourism Suitability Mapping",
      description:
        "Predictive analytics model for mapping coastal tourism suitability using environmental and weather data.",
      image: "/placeholder.svg?height=300&width=400",
      tech: ["Python", "Predictive Analytics", "GIS", "Environmental Data"],
      link: "https://github.com/ary8n/Sea-Weather-Prediction-Model",
    },
    {
      title: "AI-Based Visual Feedback Collector",
      description:
        "Real-time AI system for collecting and analyzing visual feedback with advanced computer vision techniques.",
      image: "/placeholder.svg?height=300&width=400",
      tech: ["Python", "Computer Vision", "AI", "Real-time Processing"],
      link: "https://github.com/ary8n/Real-Time-AIInference-Diagnostics-Tool",
    },
    {
      title: "CommentGuard - Spam Filter Plugin",
      description:
        "Intelligent WordPress plugin that filters spam comments using behavioral analysis and machine learning.",
      image: "/placeholder.svg?height=300&width=400",
      tech: ["JavaScript", "PHP", "WordPress", "Machine Learning"],
      link: "https://github.com/ary8n/comment-guard",
    },
  ]

  const skills = [
    { name: "Programming", icon: Code, items: ["Java", "Python", "C", "Kotlin"] },
    { name: "Databases", icon: Database, items: ["SQL", "Data Analysis"] },
    { name: "Mobile Dev", icon: Smartphone, items: ["Android", "Kotlin"] },
    { name: "AI/ML", icon: Brain, items: ["PyTorch", "scikit-learn", "OpenCV"] },
  ]

  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen font-['Inter',sans-serif] overflow-x-hidden">
      <CustomCursor />

      {/* Sticky Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.h1 className="text-2xl font-bold text-blue-400" whileHover={{ scale: 1.05 }}>
            Aryan Nayak
          </motion.h1>
          <nav className="flex space-x-8">
            {["Projects", "About"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover-target"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ParticleBackground />
          </Canvas>
        </div>

        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent"
          >
            Aryan Nayak
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Software Engineer & AI Developer
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Button
              onClick={() => scrollToSection("projects")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg transition-all duration-300 hover:scale-105 hover-target"
            >
              View My Work
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex justify-center space-x-8 mt-8"
          >
            <a
              href="https://github.com/ary8n"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover-target"
            >
              <Github className="w-8 h-8" />
            </a>
            <a
              href="https://www.linkedin.com/in/aryan-nayak8/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover-target"
            >
              <Linkedin className="w-8 h-8" />
            </a>
            <a
              href="mailto:aryannayak375@gmail.com"
              className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover-target"
            >
              <Mail className="w-8 h-8" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative py-20 px-6">
        {/* Subtle background stars */}
        <div className="absolute inset-0 z-0 opacity-20">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <SubtleStarBackground />
          </Canvas>
        </div>

        {/* CSS Shooting stars */}
        <CSSShootingStars />

        <div className="container mx-auto relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">Featured Projects</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <AnimatedSection key={index}>
                <ProjectCard {...project} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 px-6 bg-gray-900/50">
        {/* Subtle background stars */}
        <div className="absolute inset-0 z-0 opacity-15">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <SubtleStarBackground />
          </Canvas>
        </div>

        <div className="container mx-auto relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">About Me</h2>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  I'm a dedicated software engineer currently pursuing my Bachelor's in Computer Science Engineering at
                  KIIT University. With a passion for AI/ML and full-stack development, I love creating innovative
                  solutions that solve real-world problems.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  My experience spans from developing predictive models for environmental analysis to creating WordPress
                  plugins for spam detection. I'm always eager to learn new technologies and collaborate with skilled
                  teams to build impactful software.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Mail className="w-5 h-5" />
                    <span>aryannayak375@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <span>📍</span>
                    <span>Bhubaneshwar, Odisha</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid grid-cols-2 gap-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800 p-6 rounded-xl hover-target"
                  >
                    {skill.icon && <skill.icon className="w-8 h-8 text-blue-400 mb-4" />}
                    <h3 className="text-xl font-semibold mb-3 text-white">{skill.name}</h3>
                    <ul className="space-y-1">
                      {skill.items.map((item, i) => (
                        <li key={i} className="text-gray-300 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2024 Aryan Nayak. All rights reserved.</p>
            <div className="flex space-x-6">
              <a
                href="https://github.com/ary8n"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover-target"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/aryan-nayak8/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover-target"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="mailto:aryannayak375@gmail.com"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover-target"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
