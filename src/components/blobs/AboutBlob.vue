<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

const props = defineProps<{
  isDarkMode: boolean
  isVisible: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mousePosition = new THREE.Vector3()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let model: THREE.Mesh
let lastTime = 0
let isComponentMounted = true
let animationFrameId: number | null = null
const clock = new THREE.Clock()

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const performanceSettings = {
  targetFPS: isMobile ? 30 : 60
}

const frameInterval = 1000 / performanceSettings.targetFPS

const colors = {
  dark: {
    start: new THREE.Color(0.435, 0.659, 0.800),
    end: new THREE.Color(0.416, 0.298, 0.576)
  },
  light: {
    start: new THREE.Color(0.235, 0.359, 0.500),
    end: new THREE.Color(0.216, 0.158, 0.376)
  }
}

const createShaderMaterial = () => {
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
    uniform float uOpacity;

    void main() {
      float blend = sin(vPosition.y + uTime * 0.5) * 0.5 + 0.5;
      vec3 finalColor = mix(uStartColor, uEndColor, blend);

      float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vec3(0.0, 0.0, 1.0)))), 2.0);
      finalColor = mix(finalColor, vec3(1.0), fresnel * 0.5);

      gl_FragColor = vec4(finalColor, uOpacity);
    }
  `

  const currentColors = props.isDarkMode ? colors.dark : colors.light

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uStartColor: { value: new THREE.Color().copy(currentColors.start) },
      uEndColor: { value: new THREE.Color().copy(currentColors.end) },
      uOpacity: { value: 0 }
    },
    transparent: true
  })
}

const loadModel = () => {
  const loader = new GLTFLoader()
  const material = createShaderMaterial()

  loader.load(
    '/models/scene.gltf',
    (gltf: GLTF) => {
      gltf.scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          model = new THREE.Mesh(child.geometry, material)
          model.scale.set(0.7, 0.7, 0.7)
          model.rotation.x = -0.3
          scene.add(model)
        }
      })
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error)
    }
  )
}

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))

  loadModel()
}

const animate = () => {
  if (!isComponentMounted) return

  animationFrameId = requestAnimationFrame(animate)
  const currentTime = performance.now()
  const deltaTime = currentTime - lastTime

  if (deltaTime > frameInterval && model && model.geometry instanceof THREE.BufferGeometry) {
    lastTime = currentTime - (deltaTime % frameInterval)
    const time = clock.getElapsedTime()

    if (model.material instanceof THREE.ShaderMaterial) {
      model.material.uniforms.uTime.value = time
      model.material.uniforms.uOpacity.value = props.isVisible
    }

    model.rotation.y += 0.015
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
  if (model?.material instanceof THREE.ShaderMaterial) {
    const targetColors = newValue ? colors.dark : colors.light

    gsap.to(model.material.uniforms.uStartColor.value, {
      r: targetColors.start.r,
      g: targetColors.start.g,
      b: targetColors.start.b,
      duration: 0.3,
      ease: "power2.out"
    })

    gsap.to(model.material.uniforms.uEndColor.value, {
      r: targetColors.end.r,
      g: targetColors.end.g,
      b: targetColors.end.b,
      duration: 0.3,
      ease: "power2.out"
    })
  }
})

onMounted(() => {
  isComponentMounted = true
  init()
  animate()
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  isComponentMounted = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)

  if (model) {
    if (model.geometry) model.geometry.dispose()
    if (model.material instanceof THREE.Material) model.material.dispose()
    scene?.remove(model)
  }
  renderer?.dispose()
})
</script>

<template>
  <canvas ref="canvasRef" class="blob-canvas"></canvas>
</template>
