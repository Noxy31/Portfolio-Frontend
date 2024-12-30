<!-- AnimatedBackground.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'

const props = defineProps<{
  opacity: number,
  isDarkMode: boolean
}>()

const ctnRef = ref<HTMLDivElement>()

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
  uniform vec3 uColor;
  uniform vec3 uResolution;
  varying vec2 vUv;

  void main() {
    float mr = min(uResolution.x, uResolution.y);
    vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
    float d = -uTime * 1.2;
    float a = 0.0;

    for (float i = 0.0; i < 8.0; ++i) {
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }

    d += uTime * 1.0;
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

const resize = () => {
  if (!ctnRef.value) return
  const scale = 1
  renderer.setSize(ctnRef.value.offsetWidth * scale, ctnRef.value.offsetHeight * scale)
}

onMounted(() => {
  if (!ctnRef.value) return

  const ctn = ctnRef.value
  renderer = new Renderer({ dpr: 2 })
  gl = renderer.gl

  window.addEventListener('resize', resize)
  resize()

  const geometry = new Triangle(gl)
  const program = new Program(gl, {
    vertex: vert,
    fragment: frag,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(props.isDarkMode ? 0.2 : 0.8, 0.2, 0.5) },
      uResolution: {
        value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height],
      },
    },
  })

  const mesh = new Mesh(gl, { geometry, program })

  const update = (t: number) => {
    animateId = requestAnimationFrame(update)
    program.uniforms.uTime.value = t * 0.001
    program.uniforms.uColor.value = new Color(props.isDarkMode ? 0.2 : 0.8, 0.2, 0.5)
    renderer.render({ scene: mesh })
  }

  animateId = requestAnimationFrame(update)
  if (gl.canvas instanceof HTMLCanvasElement) {
    ctn.appendChild(gl.canvas)
    gl.canvas.style.opacity = props.opacity.toString()
  }
})

watch(() => props.opacity, (newOpacity) => {
  if (gl?.canvas instanceof HTMLCanvasElement) {
    gl.canvas.style.opacity = newOpacity.toString()
    gl.canvas.style.transition = 'opacity 0.5s ease-in-out'
  }
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
  <div ref="ctnRef" class="absolute inset-0 -z-10"></div>
</template>
