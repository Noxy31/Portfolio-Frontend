<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { useRoute } from 'vue-router'

const props = defineProps<{
  isDarkMode: boolean
  currentComponent: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const route = useRoute()

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let transitionMesh: THREE.Mesh
let isTransitioning = false
let animationFrameId: number | null = null

const glitchShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDisp: { value: null as THREE.Texture | null },
    byp: { value: 0 },
    amount: { value: 0.08 },
    angle: { value: 0.02 },
    seed: { value: 0.02 },
    seed_x: { value: 0.02 },
    seed_y: { value: 0.02 },
    distortion_x: { value: 0.5 },
    distortion_y: { value: 0.6 },
    col_s: { value: 0.05 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform int byp;
    uniform sampler2D tDiffuse;
    uniform sampler2D tDisp;
    uniform float amount;
    uniform float angle;
    uniform float seed;
    uniform float seed_x;
    uniform float seed_y;
    uniform float distortion_x;
    uniform float distortion_y;
    uniform float col_s;
    varying vec2 vUv;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      if(byp<1) {
        vec2 p = vUv;
        float xs = floor(gl_FragCoord.x / 0.5);
        float ys = floor(gl_FragCoord.y / 0.5);
        vec4 normal = texture2D(tDisp, p*seed*seed);

        if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {
          if(seed_x>0.){
            p.y = 1. - (p.y + distortion_y);
          }
          else {
            p.y = distortion_y;
          }
        }

        if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {
          if(seed_y>0.){
            p.x=distortion_x;
          }
          else {
            p.x = 1. - (p.x + distortion_x);
          }
        }

        p.x+=normal.x*seed_x*(seed/5.);
        p.y+=normal.y*seed_y*(seed/5.);

        vec4 color = texture2D(tDiffuse,p);
        gl_FragColor = color;
      }
      else {
        gl_FragColor = texture2D(tDiffuse, vUv);
      }
    }
  `
}

const initGlitch = () => {
  console.log('Initializing glitch effect')
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    preserveDrawingBuffer: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)

  const material = new THREE.ShaderMaterial({
    uniforms: glitchShader.uniforms,
    vertexShader: glitchShader.vertexShader,
    fragmentShader: glitchShader.fragmentShader
  })

  const geometry = new THREE.PlaneGeometry(2, 2)
  transitionMesh = new THREE.Mesh(geometry, material)
  scene.add(transitionMesh)

  new THREE.TextureLoader().load('/noise.png',
    (texture) => {
      console.log('Noise texture loaded')
      glitchShader.uniforms.tDisp.value = texture
    },
    undefined,
    (error) => console.error('Error loading noise texture:', error)
  )
}

const startGlitchEffect = () => {
  console.log('Starting glitch effect')
  if (isTransitioning) return
  isTransitioning = true

  const currentCanvas = document.querySelector('.blob-canvas') as HTMLCanvasElement
  if (!currentCanvas) {
    console.log('No canvas found')
    return
  }

  console.log('Canvas found, creating texture')
  const texture = new THREE.Texture(currentCanvas)
  texture.needsUpdate = true
  glitchShader.uniforms.tDiffuse.value = texture

  const duration = 1000
  const startTime = performance.now()

  const animate = () => {
    const currentTime = performance.now()
    const progress = (currentTime - startTime) / duration

    if (progress < 1) {
      glitchShader.uniforms.amount.value = Math.sin(progress * Math.PI) * (props.isDarkMode ? 0.5 : 0.3)
      glitchShader.uniforms.angle.value = Math.random() * 2
      glitchShader.uniforms.seed.value = Math.random()
      glitchShader.uniforms.distortion_x.value = Math.random()
      glitchShader.uniforms.distortion_y.value = Math.random()

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    } else {
      isTransitioning = false
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }

  animate()
}

const handleResize = () => {
  if (!renderer) return
  renderer.setSize(window.innerWidth, window.innerHeight)
}

watch(() => route.path, () => {
  console.log('Route changed, starting effect from watch')
  startGlitchEffect()
}, { immediate: true })

onMounted(() => {
  console.log('GlitchTransition mounted')
  initGlitch()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', handleResize)
  renderer?.dispose()
})

defineExpose({
  startGlitchEffect
})
</script>

<template>
  <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-[100]"></canvas>
</template>
