<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Home, UserCircle, FolderOpen, Mail } from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'
import * as THREE from 'three'
import { gsap } from 'gsap'

// Performance settings
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const performanceSettings = {
  subdivision: isMobile ? 20 : 32,
  particleCount: isMobile ? 1000 : 2000,
  targetFPS: isMobile ? 30 : 60
}

interface NavItem {
  icon: LucideIcon
  label: string
  path: string
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: UserCircle, label: 'About', path: '/about' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: Mail, label: 'Contact', path: '/contact' }
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mousePosition = new THREE.Vector3()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let blob: THREE.Mesh
let lastTime = 0

const frameInterval = 1000 / performanceSettings.targetFPS
const clock = new THREE.Clock()

const createBlob = () => {
  const geometry = new THREE.IcosahedronGeometry(1, performanceSettings.subdivision)
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normal;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;

    void main() {
      vec3 blue = vec3(0.435, 0.659, 0.800);   // #6EA8CC
      vec3 violet = vec3(0.416, 0.298, 0.576);  // #6a4c93

      float blend = sin(vPosition.y + uTime * 0.5) * 0.5 + 0.5;
      vec3 finalColor = mix(blue, violet, blend);

      float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vec3(0.0, 0.0, 1.0)))), 2.0);
      finalColor = mix(finalColor, vec3(1.0), fresnel * 0.5);

      gl_FragColor = vec4(finalColor, 0.9);
    }
  `

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 }
    },
    transparent: false
  })

  blob = new THREE.Mesh(geometry, material)
  scene.add(blob)
}

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance"
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))

  createBlob()

  const ambientLight = new THREE.AmbientLight(0x6EA8CC, 0.5)
  scene.add(ambientLight)

  const purpleLight = new THREE.PointLight(0x9966FF, 2)
  purpleLight.position.set(-2, 1, 4)
  scene.add(purpleLight)

  const blueLight = new THREE.PointLight(0x6EA8CC, 2)
  blueLight.position.set(2, -1, 4)
  scene.add(blueLight)

  const backLight = new THREE.PointLight(0xFFFFFF, 1)
  backLight.position.set(0, 0, -4)
  scene.add(backLight)
}

const animate = () => {
  requestAnimationFrame(animate)

  const currentTime = performance.now()
  const deltaTime = currentTime - lastTime

  if (deltaTime > frameInterval) {
    lastTime = currentTime - (deltaTime % frameInterval)
    const time = clock.getElapsedTime()

    if (blob && blob.geometry instanceof THREE.BufferGeometry) {
      const positions = blob.geometry.attributes.position
      const initialPositions = (new THREE.IcosahedronGeometry(1, performanceSettings.subdivision)).attributes.position

      for(let i = 0; i < positions.count; i++) {
        const initialX = initialPositions.getX(i)
        const initialY = initialPositions.getY(i)
        const initialZ = initialPositions.getZ(i)

        // Animation de base avec amplitude contrôlée
        const noise1 = Math.sin(initialX * 5 + time * 2) *
                      Math.cos(initialY * 4 + time * 1.5) *
                      Math.sin(initialZ * 3 + time) * 0.15

        const noise2 = Math.cos(initialX * 3 - time * 1.5) *
                      Math.sin(initialY * 4 + time) *
                      Math.cos(initialZ * 4 - time * 2) * 0.15

        const vertex = new THREE.Vector3(initialX, initialY, initialZ)
        const distanceToMouse = vertex.distanceTo(mousePosition)

        // On limite l'influence de la souris pour éviter les replis
        const mouseFactor = Math.max(0, 1 - distanceToMouse) * 0.2

        const mouseDisplacement = vertex.clone()
          .sub(mousePosition)
          .normalize()
          .multiplyScalar(mouseFactor)

        // On ajoute une limite à la déformation totale
        const maxDisplacement = 0.3
        const totalDisplacementX = initialX * (noise1 + noise2) + mouseDisplacement.x
        const totalDisplacementY = initialY * (noise1 + noise2) + mouseDisplacement.y
        const totalDisplacementZ = initialZ * (noise1 + noise2) + mouseDisplacement.z

        positions.setXYZ(
          i,
          initialX + Math.min(Math.max(-maxDisplacement, totalDisplacementX), maxDisplacement),
          initialY + Math.min(Math.max(-maxDisplacement, totalDisplacementY), maxDisplacement),
          initialZ + Math.min(Math.max(-maxDisplacement, totalDisplacementZ), maxDisplacement)
        )
      }

      positions.needsUpdate = true
    }

    if (blob.material instanceof THREE.ShaderMaterial) {
      blob.material.uniforms.uTime.value = time
    }

    blob.rotation.y += 0.005
    renderer.render(scene, camera)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1
  const y = -(event.clientY / window.innerHeight) * 2 + 1

  const vector = new THREE.Vector3(x, y, 0)
  vector.unproject(camera)
  const dir = vector.sub(camera.position).normalize()
  const distance = -camera.position.z / dir.z
  const pos = camera.position.clone().add(dir.multiplyScalar(distance))

  gsap.to(mousePosition, {
    duration: 0.3,
    x: pos.x,
    y: pos.y,
    z: pos.z,
    ease: "power2.out"
  })
}

const handleResize = () => {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))
}

onMounted(() => {
  init()
  animate()
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="min-h-screen relative overflow-hidden"
       style="background: linear-gradient(135deg, #212A31 0%, #6EA8CC 100%)">
    <nav
      class="fixed left-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl backdrop-blur-sm z-50"
      style="background-color: rgba(33, 42, 49, 0.8)">
      <ul class="flex flex-col gap-8">
        <li v-for="item in navItems" :key="item.path">
          <RouterLink
            :to="item.path"
            class="flex flex-col items-center gap-2 group transition-all duration-300"
          >
            <component
              :is="item.icon"
              class="w-6 h-6 transition-colors duration-300"
              :style="{
                color: $route.path === item.path ? '#6EA8CC' : '#AEB7BC',
              }"
            />
            <span
              class="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              :style="{
                color: $route.path === item.path ? '#6EA8CC' : '#AEB7BC'
              }"
            >
              {{ item.label }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <canvas
      ref="canvasRef"
      class="fixed inset-0 w-full h-full"
    ></canvas>
  </div>
</template>

<style scoped>
.router-link-active {
  transform: scale(1.1);
}
</style>
