import { onMounted, onUnmounted, ref, reactive } from 'vue'

interface MouseState {
  x: number | null
  y: number | null
  elementX: number | null
  elementY: number | null
  elementPositionX: number | null
  elementPositionY: number | null
}

export function useMouse() {
  const elementRef = ref<HTMLDivElement | null>(null)
  const state = reactive<MouseState>({
    x: null,
    y: null,
    elementX: null,
    elementY: null,
    elementPositionX: null,
    elementPositionY: null,
  })

  const handleMouseMove = (event: MouseEvent) => {
    state.x = event.pageX
    state.y = event.pageY

    if (elementRef.value) {
      const { left, top } = elementRef.value.getBoundingClientRect()
      state.elementPositionX = left + window.scrollX
      state.elementPositionY = top + window.scrollY
      state.elementX = event.pageX - state.elementPositionX
      state.elementY = event.pageY - state.elementPositionY
    }
  }

  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
  })

  return {
    state,
    elementRef
  }
}
