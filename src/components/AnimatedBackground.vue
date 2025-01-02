<!-- AnimatedBackground.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'

const props = defineProps<{
  opacity: number,
  isDarkMode: boolean
}>()

const ctnRef = ref<HTMLDivElement>()
const isEnabled = ref(true)

const detectPerformance = () => {
  const cpuCores = navigator.hardwareConcurrency || 2
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  return cpuCores <= 4 || isMobile
}

const quality = {
  high: {
    dpr: 2,
    iterations: 8.0,
    animationSpeed: 1.2
  },
  low: {
    dpr: 1,
    iterations: 4.0,
    animationSpeed: 0.8
  }
}

const settings = detectPerformance() ? quality.low : quality.high

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

let renderer: Renderer
let animateId: number
let gl: WebGLRenderingContext & { renderer: Renderer; canvas: HTMLCanvasElement }
let lastFrame = 0
const targetFPS = detectPerformance() ? 30 : 60
const frameInterval = 1000 / targetFPS

const resize = () => {
  if (!ctnRef.value || !renderer) return
  const scale = detectPerformance() ? 0.75 : 1
  renderer.setSize(ctnRef.value.offsetWidth * scale, ctnRef.value.offsetHeight * scale)
}

onMounted(() => {
  if (!ctnRef.value) return

  // Désactiver l'animation si les performances sont trop faibles
  if (detectPerformance() && window.innerWidth < 768) {
    isEnabled.value = false
    return
  }

  const ctn = ctnRef.value
  renderer = new Renderer({ dpr: settings.dpr })
  gl = renderer.gl

  window.addEventListener('resize', resize)
  resize()

  const geometry = new Triangle(gl)
  const program = new Program(gl, {
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

  const update = (t: number) => {
    if (!isEnabled.value) return

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

  if (gl.canvas instanceof HTMLCanvasElement) {
    ctn.appendChild(gl.canvas)
    gl.canvas.style.opacity = props.opacity.toString()
    gl.canvas.style.transition = 'opacity 0.5s ease-in-out'
  }
})

watch(() => props.opacity, (newOpacity) => {
  if (gl?.canvas instanceof HTMLCanvasElement) {
    gl.canvas.style.opacity = newOpacity.toString()
  }
})

document.addEventListener('visibilitychange', () => {
  isEnabled.value = document.visibilityState === 'visible'
})

onUnmounted(() => {
  cancelAnimationFrame(animateId)
  window.removeEventListener('resize', resize)
  if (ctnRef.value && gl?.canvas instanceof HTMLCanvasElement) {
    ctnRef.value.removeChild(gl.canvas)
  }
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
})
</script>

<template>
  <div ref="ctnRef" class="absolute inset-0 -z-10">
    <div v-if="!isEnabled" class="absolute inset-0 bg-gradient-to-br"
         :class="isDarkMode ? 'from-[#213447] to-[#212A31]' : 'from-[#6EA8CC] to-[#EEE9E5]'">
    </div>
  </div>
</template>
