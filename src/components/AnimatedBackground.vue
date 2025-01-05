<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'

const props = defineProps<{
  opacity: number,
  isDarkMode: boolean
}>()

const ctnRef = ref<HTMLDivElement>()
const isEnabled = ref(true)
const isWebGLSupported = ref(true)

const detectPerformance = () => {
  const cpuCores = navigator.hardwareConcurrency || 2
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const pixelRatio = window.devicePixelRatio || 1
  const totalPixels = screenWidth * screenHeight * pixelRatio

  if (isMobile || totalPixels < 1_000_000) {
    return 'low'
  } else if (cpuCores <= 4 || totalPixels < 2_000_000) {
    return 'medium'
  }
  return 'high'
}

const quality = {
  high: {
    dpr: Math.min(window.devicePixelRatio, 1.5),
    iterations: 6.0,
    animationSpeed: 1.0,
    scale: 1
  },
  medium: {
    dpr: Math.min(window.devicePixelRatio, 1),
    iterations: 4.0,
    animationSpeed: 0.8,
    scale: 0.8
  },
  low: {
    dpr: 0.75,
    iterations: 3.0,
    animationSpeed: 0.5,
    scale: 0.6
  }
}

const performanceLevel = detectPerformance()
const settings = quality[performanceLevel]

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

    #ifdef GL_FRAGMENT_PRECISION_HIGH
      uv *= 1.2;
    #else
      uv *= 1.0;
    #endif

    float d = -uTime * uAnimationSpeed;
    float a = 0.0;

    #ifdef GL_FRAGMENT_PRECISION_HIGH
      for (float i = 0.0; i < 16.0; ++i) {
        if (i >= uIterations) break;
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a);
      }
    #else
      for (float i = 0.0; i < 8.0; ++i) {
        if (i >= uIterations) break;
        a += cos(i - d - a * uv.x * 0.8);
        d += sin(uv.y * i + a) * 0.8;
      }
    #endif

    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.4 + 0.2, cos(a + d) * 0.3 + 0.2);

    #ifdef GL_FRAGMENT_PRECISION_HIGH
      col = cos(col * cos(vec3(d, a, 2.5)) * 0.3 + 0.3);
    #else
      col = cos(col * 0.3 + 0.3);
    #endif

    if (uColor.r < 0.5) {
      col *= 0.6;
    }
    gl_FragColor = vec4(col, 1.0);
  }`

let renderer: Renderer | null = null
let animateId: number | null = null
let gl: WebGLRenderingContext & { renderer: Renderer; canvas: HTMLCanvasElement } | null = null
let program: Program | null = null
let mesh: Mesh | null = null
let lastFrame = 0
const targetFPS = performanceLevel === 'low' ? 30 : performanceLevel === 'medium' ? 45 : 60
const frameInterval = 1000 / targetFPS

const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    return !!gl
  } catch {
    return false
  }
}

const resize = () => {
  if (!ctnRef.value || !renderer || !gl) return

  try {
    const width = ctnRef.value.offsetWidth
    const height = window.innerHeight
    const scale = settings.scale

    if (width === 0 || height === 0) return

    renderer.setSize(width, height)

    const internalWidth = Math.floor(width * scale)
    const internalHeight = Math.floor(height * scale)

    if (internalWidth > 0 && internalHeight > 0) {
      gl.viewport(0, 0, internalWidth, internalHeight)
    }

    if (program) {
      program.uniforms.uResolution.value = [internalWidth, internalHeight, internalWidth / internalHeight]
    }

    if (mesh) {
      renderer.render({ scene: mesh })
    }
  } catch (error) {
    console.error('Error during resize:', error)
    restartWebGL()
  }
}

const initWebGL = () => {
  if (!ctnRef.value) return

  try {
    renderer = new Renderer({ dpr: settings.dpr })
    gl = renderer.gl

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
      gl.canvas.style.opacity = props.opacity.toString()
      gl.canvas.style.transition = 'opacity 0.5s ease-in-out'
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      gl.canvas.style.position = 'absolute'
      gl.canvas.style.left = '0'
      gl.canvas.style.top = '0'
      gl.canvas.style.objectFit = 'cover'
    }

    resize()
    startAnimation()
  } catch (error) {
    console.error('Error initializing WebGL:', error)
    isWebGLSupported.value = false
    cleanupWebGL()
  }
}

const startAnimation = () => {
  if (animateId !== null) return

  lastFrame = performance.now()

      const update = (time: number) => {
    if (!isEnabled.value || !renderer || !program || !mesh) {
      animateId = null
      return
    }

    const elapsed = time - lastFrame

    if (elapsed >= frameInterval) {
      lastFrame = time - (elapsed % frameInterval)
      program.uniforms.uTime.value = time * 0.001
      program.uniforms.uColor.value = new Color(props.isDarkMode ? 0.2 : 0.8, 0.2, 0.5)
      renderer.render({ scene: mesh })
    }

    animateId = requestAnimationFrame(update)
  }

  animateId = requestAnimationFrame(update)
}

const cleanupWebGL = () => {
  if (animateId !== null) {
    cancelAnimationFrame(animateId)
    animateId = null
  }

  if (gl?.canvas instanceof HTMLCanvasElement && ctnRef.value?.contains(gl.canvas)) {
    ctnRef.value.removeChild(gl.canvas)
  }

  if (program) {
    program.remove()
    program = null
  }

  if (gl) {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    gl = null
  }

  mesh = null
  renderer = null
}

const restartWebGL = () => {
  cleanupWebGL()
  initWebGL()
}

let resizeTimeout: number | null = null
const handleResize = () => {
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(resize, 150)
}

const handleVisibilityChange = () => {
  const wasEnabled = isEnabled.value
  isEnabled.value = document.visibilityState === 'visible'

  if (isEnabled.value && !wasEnabled) {
    startAnimation()
  } else if (!isEnabled.value && animateId !== null) {
    cancelAnimationFrame(animateId)
    animateId = null
  }
}

onMounted(() => {
  isWebGLSupported.value = checkWebGLSupport()
  if (!isWebGLSupported.value) return

  initWebGL()
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

watch(() => props.opacity, (newOpacity) => {
  if (gl?.canvas instanceof HTMLCanvasElement) {
    gl.canvas.style.opacity = newOpacity.toString()
  }
})

watch(() => props.isDarkMode, (newIsDarkMode) => {
  if (program) {
    program.uniforms.uColor.value = new Color(newIsDarkMode ? 0.2 : 0.8, 0.2, 0.5)
  }
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('resize', handleResize)

  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  cleanupWebGL()
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
