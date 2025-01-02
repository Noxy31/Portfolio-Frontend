<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

interface Props {
  text?: string
  class?: string
  isDarkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Button',
  class: '',
  isDarkMode: false
})

// Convertir les couleurs THREE.js en couleurs CSS
const darkColors = {
  start: 'rgb(111, 168, 204)', // 0.435, 0.659, 0.800 * 255
  end: 'rgb(106, 76, 147)'    // 0.416, 0.298, 0.576 * 255
}

const lightColors = {
  start: 'rgb(60, 91, 127)',  // 0.235, 0.359, 0.500 * 255
  end: 'rgb(55, 40, 96)'      // 0.216, 0.158, 0.376 * 255
}
</script>

<template>
  <div
    :class="[
      'group relative w-48 cursor-pointer overflow-hidden rounded-full border bg-white p-4 text-center text-lg font-semibold text-black',
      props.class
    ]"
  >
    <span class="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
      {{ props.text }}
    </span>
    <div class="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
      <span>{{ props.text }}</span>
      <ArrowRight :size="24" />
    </div>
    <div
      class="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]"
      :style="{
        'background-color': '#213447',
        'background-image': `linear-gradient(to right, ${props.isDarkMode ? darkColors.start : lightColors.start}, ${props.isDarkMode ? darkColors.end : lightColors.end})`,
        'background-size': '200% 100%',
        'background-position': 'right center',
      }"
      :class="'group-hover:bg-gradient-to-r'"
    ></div>
  </div>
</template>
