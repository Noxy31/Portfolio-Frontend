<!-- DynamicCard.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  icon?: string;
  title: string;
  description: string;
  side: 'left' | 'right';
  position: 'top' | 'bottom';
  isDarkMode: boolean;
  type: 'copy' | 'link' | 'download';
  action: string;
}

const props = defineProps<Props>()
const copySuccess = ref(false)

const cardClasses = computed(() => {
  const baseClasses = 'cursor-pointer flex gap-4 overflow-hidden rounded-xl border border-neutral-400/20 px-8 py-4 shadow-sm transition-all duration-300 hover:scale-105 h-[120px] md:h-[150px] w-80 md:w-96'

  const bgClasses = props.isDarkMode
    ? 'bg-[#1a2937] shadow-lg'
    : 'bg-white shadow-md'

  const positionClasses = {
    'left-top': 'md:absolute md:left-[20vw] md:top-[25vh] relative',
    'left-bottom': 'md:absolute md:left-[20vw] md:bottom-[25vh] relative',
    'right-top': 'md:absolute md:right-[20vw] md:top-[25vh] relative',
    'right-bottom': 'md:absolute md:right-[20vw] md:bottom-[25vh] relative'
  }

  return `${baseClasses} ${bgClasses} ${positionClasses[`${props.side}-${props.position}`]}`
})

const tileBackgroundColor = computed(() =>
  props.isDarkMode
    ? 'rgba(110, 168, 204, 0.15)'
    : 'rgba(157, 142, 193, 0.1)'
)

const handleClick = async () => {
  switch (props.type) {
    case 'copy':
      try {
        await navigator.clipboard.writeText(props.action)
        copySuccess.value = true
        setTimeout(() => {
          copySuccess.value = false
        }, 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
      break
    case 'link':
      window.open(props.action, '_blank')
      break
    case 'download':
      const link = document.createElement('a')
      link.href = props.action
      link.download = props.action.split('/').pop() || 'cv.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      break
  }
}
</script>

<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- Background animation -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 flex select-none flex-wrap overflow-hidden rounded-xl">
      <template v-for="row in 20" :key="`row-${row}`">
        <div class="flex h-[16px] w-full border-b border-dashed" :class="isDarkMode ? 'border-neutral-600/20' : 'border-neutral-300/20'">
          <template v-for="col in 22" :key="`tile-${row}-${col}`">
            <div class="relative h-[16px] w-[15px] border-r border-dashed"
                 :class="isDarkMode ? 'border-neutral-600/20' : 'border-neutral-300/20'">
              <div
                class="tile-animation"
                :style="{
                  animationDelay: `${Math.random() * 14}s`,
                  background: tileBackgroundColor
                }"
              />
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- Content -->
    <div class="z-0 flex items-center gap-4">
      <div v-if="$slots.icon" class="flex-shrink-0">
        <slot name="icon"></slot>
      </div>
      <div class="flex flex-col">
        <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-neutral-100' : 'text-neutral-900'">
          {{ title }}
        </h3>
        <p class="mt-1" :class="isDarkMode ? 'text-neutral-100' : 'text-neutral-500'">
          {{ description }}
        </p>
        <span v-if="copySuccess"
              class="text-sm text-green-400 mt-1 transition-opacity duration-300"
              :class="{ 'opacity-100': copySuccess, 'opacity-0': !copySuccess }">
          Copié !
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes tiles {
  0%, 40%, 80% {
    opacity: 0;
  }
  20%, 60% {
    opacity: 1;
  }
}

.tile-animation {
  @apply inset-0 h-[16px] w-[15px];
  opacity: 0;
  animation: tiles 14s ease infinite;
}
</style>
