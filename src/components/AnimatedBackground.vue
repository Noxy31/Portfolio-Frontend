# AnimatedBackground.vue
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

// Amélioration de la détection des performances
const detectPerformance = () => {
  const cpuCores = navigator.hardwareConcurrency || 2
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const screenWidth = window.innerWidth

  if (isMobile && screenWidth < 768) {
    return 'low'
  } else if (cpuCores <= 4 || isMobile) {
    return 'medium'
  }
  return 'high'
}

const quality = {
  high: {
    dpr: 1.5,
    iterations: 8.0,
    animationSpeed: 1.2,
    scale: 1
  },
  medium: {
    dpr: 1,
    iterations: 6.0,
    animationSpeed: 1.0,
    scale: 1
  },
  low: {
    dpr: 0.75,
    iterations: 4.0,
    animationSpeed: 0.5,
    scale: 1
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

    // Ajustement du zoom pour mobile
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      uv *= 1.5;
    #else
      uv *= 1.2;
    #endif

    float d = -uTime * uAnimationSpeed;
    float a = 0.0;
    for (float i = 0.0; i < 16.0; ++i) {
      if (i >= uIterations) break;
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }
    d += uTime * uAnimationSpeed;
    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.4 + 0.2, cos(a + d) * 0.3 + 0.2);
    col = cos(col * cos(vec3(d, a, 2.5)) * 0.3 + 0.3);
    if (uColor.r < 0.5) {
      col *= 0.6;
    }
    gl_FragColor = vec4(col, 1.0);
  }`

let renderer: Renderer | null = null
let animateId: number | null = null
let gl: WebGLRenderingContext & { renderer: Renderer; canvas: HTMLCanvasElement } | null = null
let program: Program | null = null
let lastFrame = 0
const targetFPS = performanceLevel === 'low' ? 30 : 60
const frameInterval = 1000 / targetFPS

const checkWebGLSupport = () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl')
  return !!gl
}

const getViewportHeight = () => {
  return performanceLevel === 'low'
    ? window.outerHeight  // Pour mobile
    : window.innerHeight  // Pour desktop
}


const resize = () => {
  if (!ctnRef.value || !renderer || !gl) return

  try {
    // Utiliser notre nouvelle fonction pour la hauteur
    const width = ctnRef.value.offsetWidth
    const height = getViewportHeight()

    if (width === 0 || height === 0) return

    renderer.setSize(width, height)

    const internalWidth = Math.floor(width * settings.scale)
    const internalHeight = Math.floor(height * settings.scale)

    if (internalWidth > 0 && internalHeight > 0) {
      gl.viewport(0, 0, internalWidth, internalHeight)
    }

    // Mise à jour des uniformes du programme
    if (program) {
      program.uniforms.uResolution.value = [
        internalWidth,
        internalHeight,
        internalWidth / internalHeight
      ]
    }

    // Force un rendu immédiat pour éviter le flash noir
    if (renderer && program && gl) {
      const geometry = new Triangle(gl)
      const mesh = new Mesh(gl, { geometry, program })
      renderer.render({ scene: mesh })
    }
  } catch (error) {
    console.error('Error during resize:', error)
    // En cas d'erreur, on réinitialise le contexte WebGL
    cleanupWebGL()
    initWebGL()
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
        uResolution: {
          value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height],
        },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

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

    // Forcer un premier rendu
    renderer.render({ scene: mesh })
  } catch (error) {
    console.error('Error initializing WebGL:', error)
    isWebGLSupported.value = false
    cleanupWebGL()
  }
}

let resizeTimeout: number | null = null
const handleResize = () => {
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(() => {
    resize()
  }, 150)
}

const cleanupWebGL = () => {
  if (animateId !== null) {
    cancelAnimationFrame(animateId)
    animateId = null
  }

  if (gl?.canvas instanceof HTMLCanvasElement && ctnRef.value?.contains(gl.canvas)) {
    ctnRef.value.removeChild(gl.canvas)
  }

  if (gl) {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    gl = null
  }

  if (program) {
    program.remove()
    program = null
  }

  if (renderer) {
    renderer = null
  }
}

onMounted(() => {
  if (!ctnRef.value) return

  isWebGLSupported.value = checkWebGLSupport()
  if (!isWebGLSupported.value) return

  initWebGL()

  // Ajout de la fonction d'animation
  if (renderer && program && gl) {
    const geometry = new Triangle(gl)
    const mesh = new Mesh(gl, { geometry, program })

    const update = (t: number) => {
      if (!isEnabled.value || !renderer || !program || !mesh) return

      const now = performance.now()
      const elapsed = now - lastFrame

      if (elapsed > frameInterval) {
        lastFrame = now - (elapsed % frameInterval)
        program.uniforms.uTime.value = t * 0.001
        program.uniforms.uColor.value = new Color(props.isDarkMode ? 0.2 : 0.8, 0.2, 0.5)
        renderer.render({ scene: mesh })
      }

      animateId = requestAnimationFrame(update)
    }

    animateId = requestAnimationFrame(update)
  }

  // Correction ici : ajout de l'event listener complet
  window.addEventListener('resize', handleResize)
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

const handleVisibilityChange = () => {
  isEnabled.value = document.visibilityState === 'visible'

  // Redémarrer l'animation si nécessaire
  if (isEnabled.value && animateId === null) {
    animateId = requestAnimationFrame((t) => {
      lastFrame = performance.now()
      if (program) program.uniforms.uTime.value = t * 0.001
    })
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange)

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
  <div ref="ctnRef" class="absolute inset-0 -z-10">
    <div v-if="!isWebGLSupported || !isEnabled" class="absolute inset-0 bg-gradient-to-br"
      :class="isDarkMode ? 'from-[#213447] to-[#212A31]' : 'from-[#6EA8CC] to-[#EEE9E5]'">
    </div>
  </div>
</template>
