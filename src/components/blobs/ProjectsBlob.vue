<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps<{
  isDarkMode: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let tesseract: THREE.Group
let animationFrameId: number | null = null
let isComponentMounted = true

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

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const outerFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform vec3 uStartColor;
  uniform vec3 uEndColor;

  void main() {
    float blend = sin(vWorldPosition.y + uTime * 0.5) * 0.5 + 0.5;
    vec3 baseColor = mix(uStartColor, uEndColor, blend);

    vec3 reflection = normalize(reflect(normalize(vWorldPosition), normalize(vNormal)));
    float reflectionIntensity = pow(1.0 - abs(dot(normalize(vNormal), reflection)), 0.8);

    vec2 p = reflection.xy * 2.0;
    float zoom = 1.5;
    float angle = uTime * 0.1;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    float pattern = 0.0;
    for(int i = 0; i < 6; i++) {
      p = abs(p);
      p = p * zoom - (zoom - 1.8);
      p *= rot;
      pattern += 1.8/dot(p, p);
    }

    vec3 mirrorColor = vec3(0.5 + 0.5 * sin(pattern + uTime));
    vec3 finalColor = mix(baseColor, mirrorColor, reflectionIntensity * 0.8);

    gl_FragColor = vec4(finalColor, 0.7);
  }
`

const innerFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform vec3 uStartColor;
  uniform vec3 uEndColor;

  void main() {
    float blend = sin(vWorldPosition.y + uTime * 0.5) * 0.5 + 0.5;
    vec3 baseColor = mix(uStartColor, uEndColor, blend);

    // Plasma effect
    float plasma = sin(vWorldPosition.x * 10.0 + uTime) +
                  sin(vWorldPosition.y * 12.0 + uTime * 1.2) +
                  sin(vWorldPosition.z * 8.0 + uTime * 0.8) +
                  sin(length(vWorldPosition) * 5.0 - uTime * 2.0);

    plasma = plasma * 0.25;  // Normalize to [-1,1]
    plasma = plasma * 0.5 + 0.5;  // Convert to [0,1]

    vec3 plasmaColor = mix(uEndColor, uStartColor, plasma);

    gl_FragColor = vec4(plasmaColor, 0.7);
  }
`

const edgeFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform vec3 uStartColor;
  uniform vec3 uEndColor;

  void main() {
    float blend = sin(vWorldPosition.y + uTime * 0.5) * 0.5 + 0.5;
    vec3 finalColor = mix(uStartColor, uEndColor, blend);
    gl_FragColor = vec4(finalColor, 0.6);
  }
`

const createEdge = (start: THREE.Vector3, end: THREE.Vector3, material: THREE.Material) => {
  const direction = end.clone().sub(start)
  const height = direction.length()
  const cylinder = new THREE.CylinderGeometry(0.03, 0.03, height, 8)

  const edge = new THREE.Mesh(cylinder, material)
  edge.position.copy(start.clone().add(direction.multiplyScalar(0.5)))
  edge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  edge.renderOrder = 1

  return edge
}

const createTesseract = () => {
  const group = new THREE.Group()
  const currentColors = props.isDarkMode ? colors.dark : colors.light

  // Materials
  const outerMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: outerFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uStartColor: { value: new THREE.Color().copy(currentColors.start) },
      uEndColor: { value: new THREE.Color().copy(currentColors.end) }
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false
  })

  const innerMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: innerFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uStartColor: { value: new THREE.Color().copy(currentColors.start) },
      uEndColor: { value: new THREE.Color().copy(currentColors.end) }
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false
  })

  const edgeMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: edgeFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uStartColor: { value: new THREE.Color().copy(currentColors.start) },
      uEndColor: { value: new THREE.Color().copy(currentColors.end) }
    },
    transparent: true,
    depthWrite: false,
    depthTest: false
  })

  // Inner cube vertices
  const innerSize = 0.4
  const innerVertices = [
    new THREE.Vector3(-innerSize, -innerSize, -innerSize),
    new THREE.Vector3(innerSize, -innerSize, -innerSize),
    new THREE.Vector3(innerSize, innerSize, -innerSize),
    new THREE.Vector3(-innerSize, innerSize, -innerSize),
    new THREE.Vector3(-innerSize, -innerSize, innerSize),
    new THREE.Vector3(innerSize, -innerSize, innerSize),
    new THREE.Vector3(innerSize, innerSize, innerSize),
    new THREE.Vector3(-innerSize, innerSize, innerSize),
  ]

  // Outer cube vertices
  const outerSize = 0.8
  const outerVertices = [
    new THREE.Vector3(-outerSize, -outerSize, -outerSize),
    new THREE.Vector3(outerSize, -outerSize, -outerSize),
    new THREE.Vector3(outerSize, outerSize, -outerSize),
    new THREE.Vector3(-outerSize, outerSize, -outerSize),
    new THREE.Vector3(-outerSize, -outerSize, outerSize),
    new THREE.Vector3(outerSize, -outerSize, outerSize),
    new THREE.Vector3(outerSize, outerSize, outerSize),
    new THREE.Vector3(-outerSize, outerSize, outerSize),
  ]

  // Create inner cube
  const innerGeometry = new THREE.BoxGeometry(innerSize * 2, innerSize * 2, innerSize * 2)
  const innerCube = new THREE.Mesh(innerGeometry, innerMaterial)

  // Create outer cube
  const outerGeometry = new THREE.BoxGeometry(outerSize * 2, outerSize * 2, outerSize * 2)
  const outerCube = new THREE.Mesh(outerGeometry, outerMaterial)

  // Create edges
  const innerEdges = []
  innerEdges.push(
    createEdge(innerVertices[0], innerVertices[1], edgeMaterial),
    createEdge(innerVertices[1], innerVertices[2], edgeMaterial),
    createEdge(innerVertices[2], innerVertices[3], edgeMaterial),
    createEdge(innerVertices[3], innerVertices[0], edgeMaterial),
    createEdge(innerVertices[4], innerVertices[5], edgeMaterial),
    createEdge(innerVertices[5], innerVertices[6], edgeMaterial),
    createEdge(innerVertices[6], innerVertices[7], edgeMaterial),
    createEdge(innerVertices[7], innerVertices[4], edgeMaterial),
    createEdge(innerVertices[0], innerVertices[4], edgeMaterial),
    createEdge(innerVertices[1], innerVertices[5], edgeMaterial),
    createEdge(innerVertices[2], innerVertices[6], edgeMaterial),
    createEdge(innerVertices[3], innerVertices[7], edgeMaterial)
  )

  const outerEdges = []
  outerEdges.push(
    createEdge(outerVertices[0], outerVertices[1], edgeMaterial),
    createEdge(outerVertices[1], outerVertices[2], edgeMaterial),
    createEdge(outerVertices[2], outerVertices[3], edgeMaterial),
    createEdge(outerVertices[3], outerVertices[0], edgeMaterial),
    createEdge(outerVertices[4], outerVertices[5], edgeMaterial),
    createEdge(outerVertices[5], outerVertices[6], edgeMaterial),
    createEdge(outerVertices[6], outerVertices[7], edgeMaterial),
    createEdge(outerVertices[7], outerVertices[4], edgeMaterial),
    createEdge(outerVertices[0], outerVertices[4], edgeMaterial),
    createEdge(outerVertices[1], outerVertices[5], edgeMaterial),
    createEdge(outerVertices[2], outerVertices[6], edgeMaterial),
    createEdge(outerVertices[3], outerVertices[7], edgeMaterial)
  )

  const connectingEdges = []
  for (let i = 0; i < 8; i++) {
    connectingEdges.push(createEdge(innerVertices[i], outerVertices[i], edgeMaterial))
  }

  // Add everything to the group
  group.add(innerCube)
  group.add(outerCube)
  innerEdges.forEach(edge => group.add(edge))
  outerEdges.forEach(edge => group.add(edge))
  connectingEdges.forEach(edge => group.add(edge))

  return group
}

const init = () => {
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  tesseract = createTesseract()
  scene.add(tesseract)
}

const animate = () => {
  if (!isComponentMounted) return

  animationFrameId = requestAnimationFrame(animate)

  if (tesseract) {
    tesseract.rotation.x += 0.005
    tesseract.rotation.y += 0.005
    tesseract.rotation.z += 0.0025

    tesseract.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
        child.material.uniforms.uTime.value = performance.now() / 1000
      }
    })
  }

  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

watch(() => props.isDarkMode, (newValue) => {
  if (tesseract) {
    const currentColors = newValue ? colors.dark : colors.light
    tesseract.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
        child.material.uniforms.uStartColor.value.copy(currentColors.start)
        child.material.uniforms.uEndColor.value.copy(currentColors.end)
      }
    })
  }
})

onMounted(() => {
  isComponentMounted = true
  init()
  animate()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  isComponentMounted = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <canvas ref="canvasRef" class="blob-canvas"></canvas>
</template>
