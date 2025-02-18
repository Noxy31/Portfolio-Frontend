<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'

const props = defineProps<{
  isDarkMode: boolean
}>()

const ctnRef = ref<HTMLDivElement>()
const isEnabled = ref(true)
const isWebGLSupported = ref(true)
const isInViewport = ref(false)

const detectPerformance = () => {
  const maxPixels = 2_500_000
  const cpuCores = navigator.hardwareConcurrency || 2
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const pixelRatio = window.devicePixelRatio || 1
  const totalPixels = screenWidth * screenHeight * pixelRatio

  if (isMobile || totalPixels > maxPixels || cpuCores <= 2) {
    return 'low'
  } else if (cpuCores <= 4 || totalPixels > maxPixels / 2) {
    return 'medium'
  }
  return 'high'
}

const quality = {
  high: {
    dpr: Math.min(window.devicePixelRatio, 1.25),
    iterations: 5.0,
    animationSpeed: 0.8,
    scale: 0.9,
    targetFPS: 50
  },
  medium: {
    dpr: Math.min(window.devicePixelRatio, 1),
    iterations: 4.0,
    animationSpeed: 0.6,
    scale: 0.75,
    targetFPS: 40
  },
  low: {
    dpr: 0.75,
    iterations: 3.0,
    animationSpeed: 0.4,
    scale: 0.5,
    targetFPS: 30
  }
}

const vert = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }`

const frag = `
  precision highp float;
  uniform float uTime;
  uniform float uIterations;
  uniform float uAnimationSpeed;
  uniform vec3 uColor;
  uniform vec3 uResolution;
  varying vec2 vUv;

  void main() {
    float mr = min(uResolution.x, uResolution.y);
    vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

    float d = -(uTime * uAnimationSpeed);
    float a = 0.0;

    #ifdef GL_FRAGMENT_PRECISION_HIGH
      for (float i = 0.0; i < 12.0; ++i) {
        if (i >= uIterations) break;
        a += cos(i - d - a * uv.x * 0.8);
        d += sin(uv.y * i + a) * 0.8;
      }
    #else
      for (float i = 0.0; i < 6.0; ++i) {
        if (i >= uIterations) break;
        a += cos(i - d - a * uv.x * 0.6);
        d += sin(uv.y * i + a) * 0.6;
      }
    #endif

    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.3 + 0.2, cos(a + d) * 0.25 + 0.2);
    col = cos(col * 0.25 + 0.25);

    if (uColor.r < 0.5) {
      col *= 0.7;
    }
    gl_FragColor = vec4(col, 1.0);
  }`

const performanceLevel = detectPerformance()
const settings = quality[performanceLevel]
let renderer: Renderer | null = null
let program: Program | null = null
let mesh: Mesh | null = null
let lastFrame = 0
let frameCount = 0
const frameInterval = 1000 / settings.targetFPS

const setupIntersectionObserver = () => {
  if (!ctnRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      isInViewport.value = entries[0].isIntersecting
      if (isInViewport.value) {
        startAnimation()
      } else {
        stopAnimation()
      }
    },
    { threshold: 0.1 }
  )

  observer.observe(ctnRef.value)
  return observer
}

const resize = () => {
  if (!ctnRef.value || !renderer || !program) return

  const width = ctnRef.value.offsetWidth
  const height = window.innerHeight
  const scale = settings.scale

  if (width === 0 || height === 0) return

  const internalWidth = Math.floor(width * scale)
  const internalHeight = Math.floor(height * scale)

  renderer.setSize(width, height)
  renderer.gl.viewport(0, 0, internalWidth, internalHeight)
  program.uniforms.uResolution.value = [internalWidth, internalHeight, internalWidth / internalHeight]

  if (mesh) {
    renderer.render({ scene: mesh })
  }
}

const startAnimation = () => {
  if (!isEnabled.value || !isInViewport.value) return

  lastFrame = performance.now()
  frameCount = 0

  const update = (time: number) => {
    if (!isEnabled.value || !isInViewport.value || !renderer || !program || !mesh) {
      return
    }

    const elapsed = time - lastFrame

    if (elapsed >= frameInterval) {
      frameCount++
      lastFrame = time - (elapsed % frameInterval)

      if (frameCount % Math.max(1, Math.floor(60 / settings.targetFPS)) === 0) {
        program.uniforms.uTime.value = time * 0.001
        program.uniforms.uColor.value = new Color(props.isDarkMode ? 0.2 : 0.8, 0.2, 0.5)
        renderer.render({ scene: mesh })
      }
    }

    requestAnimationFrame(update)
  }

  requestAnimationFrame(update)
}

const stopAnimation = () => {
  isEnabled.value = false
}

const initWebGL = () => {
  if (!ctnRef.value) return

  try {
    renderer = new Renderer({ dpr: settings.dpr })
    const gl = renderer.gl

    const geometry = new Triangle(gl)
    program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uIterations: { value: settings.iterations },
        uAnimationSpeed: { value: settings.animationSpeed },
        uColor: { value: new Color(props.isDarkMode ? 0.2 : 0.8, 0.2, 0.5) },
        uResolution: { value: [0, 0, 1] },
      },
    })

    mesh = new Mesh(gl, { geometry, program })

    if (gl.canvas instanceof HTMLCanvasElement) {
      ctnRef.value.appendChild(gl.canvas)
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      gl.canvas.style.position = 'absolute'
      gl.canvas.style.left = '0'
      gl.canvas.style.top = '0'
      gl.canvas.style.objectFit = 'cover'
    }

    resize()
  } catch (error) {
    console.error('Error initializing WebGL:', error)
    isWebGLSupported.value = false
  }
}

onMounted(() => {
  isWebGLSupported.value = !!document.createElement('canvas').getContext('webgl')
  if (!isWebGLSupported.value) return

  initWebGL()
  const observer = setupIntersectionObserver()

  onUnmounted(() => {
    observer?.disconnect()
    stopAnimation()

    if (renderer) {
      renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
      renderer = null
    }

    program?.remove()
    program = null
    mesh = null
  })
})

let resizeRAF: number | null = null
window.addEventListener('resize', () => {
  if (resizeRAF) cancelAnimationFrame(resizeRAF)
  resizeRAF = requestAnimationFrame(resize)
})
</script>

<template>
  <div ref="ctnRef" class="fixed inset-0 w-screen h-screen -z-10">
    <div v-if="!isWebGLSupported || !isEnabled"
         class="fixed inset-0 w-screen h-screen bg-gradient-to-br"
         :class="isDarkMode ? 'from-[#213447] to-[#212A31]' : 'from-[#6EA8CC] to-[#EEE9E5]'">
    </div>
  </div>
</template>
