<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'

const props = defineProps<{
  isDarkMode: boolean
}>()

interface ColorSet {
  start: THREE.Color;
  end: THREE.Color;
}

interface Colors {
  dark: ColorSet;
  light: ColorSet;
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let envelope: THREE.Group
let isComponentMounted = true

const colors: Colors = {
  dark: {
    start: new THREE.Color(0.435, 0.659, 0.800),  // Pink
    end: new THREE.Color(0.416, 0.298, 0.576)     // Purple
  },
  light: {
    start: new THREE.Color(0.335, 0.459, 0.600),  // Light pink (plus clair)
    end: new THREE.Color(0.316, 0.258, 0.476)     // Light purple (plus clair)
  }
}

const createCustomMaterial = () => {
  const currentColors = props.isDarkMode ? colors.dark : colors.light
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uStartColor;
      uniform vec3 uEndColor;
      uniform float uTime;

      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        float noise1 = sin(vPosition.x * 2.0 + vPosition.y * 2.0 + uTime * 0.8) * 0.5 + 0.5;
        float noise2 = cos(vPosition.x * 3.0 - vPosition.y * 2.0 + uTime * 0.6) * 0.5 + 0.5;
        float noise3 = sin(vPosition.x * 1.0 + vPosition.y * 4.0 - uTime * 0.4) * 0.5 + 0.5;

        float finalNoise = (noise1 + noise2 + noise3) / 3.0;

        vec3 color1 = mix(uStartColor, uEndColor, finalNoise + vUv.y);
        vec3 color2 = mix(uEndColor, uStartColor, sin(uTime * 0.5) * 0.5 + 0.5);
        vec3 finalColor = mix(color1, color2, finalNoise);

        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
        finalColor = mix(finalColor, vec3(1.0), fresnel * 0.4);

        gl_FragColor = vec4(finalColor, 0.8);
      }
    `,
    uniforms: {
      uStartColor: { value: currentColors.start.clone() }, // Utilisation de clone() pour éviter les références
      uEndColor: { value: currentColors.end.clone() },
      uTime: { value: 0 }
    },
    transparent: true,
    side: THREE.DoubleSide
  })
}

const createEnvelope = () => {
  envelope = new THREE.Group()

  // Enveloppe simple avec coins arrondis
  const envelopeShape = new THREE.Shape()
  const width = 2.5
  const height = 1.8
  const radius = 0.2

  envelopeShape.moveTo(-width/2 + radius, -height/2)
  envelopeShape.lineTo(width/2 - radius, -height/2)
  envelopeShape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius)
  envelopeShape.lineTo(width/2, height/2 - radius)
  envelopeShape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2)
  envelopeShape.lineTo(-width/2 + radius, height/2)
  envelopeShape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius)
  envelopeShape.lineTo(-width/2, -height/2 + radius)
  envelopeShape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2)

  const envelopeGeometry = new THREE.ExtrudeGeometry(envelopeShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 4
  })

  const baseMesh = new THREE.Mesh(envelopeGeometry, createCustomMaterial())
  envelope.add(baseMesh)
  envelope.add(baseMesh)

  // Volet triangulaire style enveloppe classique
  const flapWidth = width * 0.95
  const flapHeight = height * 0.5  // Hauteur réduite
  const flapShape = new THREE.Shape()

  // Base du rabat
  flapShape.moveTo(-flapWidth/2, 0)
  flapShape.lineTo(flapWidth/2, 0)

  // Pointe triangulaire
  flapShape.lineTo(0, -flapHeight)
  flapShape.lineTo(-flapWidth/2, 0)

  const flapGeom = new THREE.ExtrudeGeometry(flapShape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3
  })

  const voletMesh = new THREE.Mesh(flapGeom, createCustomMaterial())
  voletMesh.position.set(0, height/2 - 0.1, 0.1)  // Aligné exactement avec le haut de l'enveloppe
  envelope.add(voletMesh)

  // Bulle de dialogue
  const bubbleShape = new THREE.Shape()
  const bubbleWidth = 0.6
  const bubbleHeight = 0.4
  const bubbleRadius = 0.1

  bubbleShape.moveTo(-bubbleWidth/2 + bubbleRadius, 0)
  bubbleShape.lineTo(-0.2, 0)
  bubbleShape.lineTo(-0.3, -0.15)
  bubbleShape.lineTo(-0.1, 0)
  bubbleShape.lineTo(bubbleWidth/2 - bubbleRadius, 0)
  bubbleShape.quadraticCurveTo(bubbleWidth/2, 0, bubbleWidth/2, bubbleRadius)
  bubbleShape.lineTo(bubbleWidth/2, bubbleHeight - bubbleRadius)
  bubbleShape.quadraticCurveTo(bubbleWidth/2, bubbleHeight, bubbleWidth/2 - bubbleRadius, bubbleHeight)
  bubbleShape.lineTo(-bubbleWidth/2 + bubbleRadius, bubbleHeight)
  bubbleShape.quadraticCurveTo(-bubbleWidth/2, bubbleHeight, -bubbleWidth/2, bubbleHeight - bubbleRadius)
  bubbleShape.lineTo(-bubbleWidth/2, bubbleRadius)
  bubbleShape.quadraticCurveTo(-bubbleWidth/2, 0, -bubbleWidth/2 + bubbleRadius, 0)

  const bubbleGeom = new THREE.ExtrudeGeometry(bubbleShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3
  })

  const bubbleMesh = new THREE.Mesh(bubbleGeom, createCustomMaterial())
  bubbleMesh.position.set(1.0, 1.2, 0.2)
  envelope.add(bubbleMesh)

  scene.add(envelope)
}

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    alpha: true,
    antialias: true
  })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  createEnvelope()
}

const animate = () => {
  if (!isComponentMounted) return

  const time = performance.now() * 0.001

  // Rotation rapide sur l'axe Z pour effet de vibration
  envelope.rotation.z = Math.sin(time * 8) * 0.03 // Vibration rapide
                     + Math.sin(time * 4) * 0.02  // Vibration secondaire

  // Léger mouvement vertical maintenu
  envelope.position.y = Math.sin(time) * 0.03

  // Mise à jour des shaders
  envelope.traverse(child => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
      child.material.uniforms.uTime.value = time
    }
  })

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

onMounted(() => {
  init()
  animate()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  isComponentMounted = false
  window.removeEventListener('resize', handleResize)
})

watch(() => props.isDarkMode, (newValue) => {
  if (!envelope) return

  const targetColors = newValue ? colors.dark : colors.light

  envelope.traverse(child => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
      // Mise à jour immédiate des uniforms
      child.material.uniforms.uStartColor.value.copy(targetColors.start)
      child.material.uniforms.uEndColor.value.copy(targetColors.end)

      // Animation GSAP pour une transition fluide
      gsap.to(child.material.uniforms.uStartColor.value, {
        r: targetColors.start.r,
        g: targetColors.start.g,
        b: targetColors.start.b,
        duration: 0.5,
        ease: 'power2.inOut'
      })
      gsap.to(child.material.uniforms.uEndColor.value, {
        r: targetColors.end.r,
        g: targetColors.end.g,
        b: targetColors.end.b,
        duration: 0.5,
        ease: 'power2.inOut'
      })
    }
  })
}, { immediate: true })
</script>

<template>
  <canvas ref="canvasRef" />
</template>
