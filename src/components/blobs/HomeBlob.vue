<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'

const props = defineProps<{
  isDarkMode: boolean
}>()

// Performance settings
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const performanceSettings = {
  subdivision: isMobile ? 20 : 32,
  targetFPS: isMobile ? 30 : 60
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mousePosition = new THREE.Vector3()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let blob: THREE.Mesh
let lastTime = 0

const frameInterval = 1000 / performanceSettings.targetFPS
const clock = new THREE.Clock()

// Shader colors for dark and light modes
const colors = {
  dark: {
    start: new THREE.Color(0.435, 0.659, 0.800), // #6EA8CC
    end: new THREE.Color(0.416, 0.298, 0.576)    // #6a4c93
  },
  light: {
    start: new THREE.Color(0.235, 0.359, 0.500), // #3C5B80
    end: new THREE.Color(0.216, 0.158, 0.376)    // #372860
  }
}

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
    uniform vec3 uStartColor;
    uniform vec3 uEndColor;

    void main() {
      float blend = sin(vPosition.y + uTime * 0.5) * 0.5 + 0.5;
      vec3 finalColor = mix(uStartColor, uEndColor, blend);

      float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vec3(0.0, 0.0, 1.0)))), 2.0);
      finalColor = mix(finalColor, vec3(1.0), fresnel * 0.5);

      gl_FragColor = vec4(finalColor, 1);
    }
  `

  const currentColors = props.isDarkMode ? colors.dark : colors.light

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uStartColor: { value: new THREE.Color().copy(currentColors.start) },
      uEndColor: { value: new THREE.Color().copy(currentColors.end) }
    },
    transparent: true
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

      for (let i = 0; i < positions.count; i++) {
        const initialX = initialPositions.getX(i)
        const initialY = initialPositions.getY(i)
        const initialZ = initialPositions.getZ(i)

        const noise1 = Math.sin(initialX * 5 + time * 2) *
          Math.cos(initialY * 4 + time * 1.5) *
          Math.sin(initialZ * 3 + time) * 0.15

        const noise2 = Math.cos(initialX * 3 - time * 1.5) *
          Math.sin(initialY * 4 + time) *
          Math.cos(initialZ * 4 - time * 2) * 0.15

        const vertex = new THREE.Vector3(initialX, initialY, initialZ)
        const distanceToMouse = vertex.distanceTo(mousePosition)

        const mouseFactor = Math.max(0, 0 - distanceToMouse) * 0.1

        const mouseDisplacement = vertex.clone()
          .sub(mousePosition)
          .normalize()
          .multiplyScalar(mouseFactor)

        const maxDisplacement = 1
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

    blob.rotation.y += 0.010
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

watch(() => props.isDarkMode, (newValue) => {
  if (blob?.material instanceof THREE.ShaderMaterial) {
    const targetColors = newValue ? colors.dark : colors.light;

    gsap.to(blob.material.uniforms.uStartColor.value, {
      r: targetColors.start.r,
      g: targetColors.start.g,
      b: targetColors.start.b,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(blob.material.uniforms.uEndColor.value, {
      r: targetColors.end.r,
      g: targetColors.end.g,
      b: targetColors.end.b,
      duration: 0.3,
      ease: "power2.out"
    });
  }
});

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
  <canvas ref="canvasRef"></canvas>
</template>
