<template>
  <div
    ref="elementRef"
    class="group relative z-10 transform-gpu overflow-hidden rounded-[20px] p-2 transition-all duration-300 hover:scale-[1.01] active:scale-90 h-full"
    :class="[
      isDarkMode
        ? 'bg-white/10 hover:bg-white/15'
        : 'bg-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.4)]'
    ]"
  >
    <ArrowUpRight
      v-if="withArrow"
      :class="[
        'absolute right-2 top-2 z-20 size-5 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100',
        isDarkMode ? 'text-neutral-300' : 'text-[#3C5B80]'
      ]"
    />
    <!-- Gradient Background -->
    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full transition-transform duration-500 ease-out group-hover:scale-[3] pointer-events-none"
      :class="[state.elementX === null || state.elementY === null ? 'opacity-0' : 'opacity-100']"
      :style="{
        maskImage: `radial-gradient(${circleSize / 2}px circle at center, white, transparent)`,
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        left: `${state.elementX}px`,
        top: `${state.elementY}px`,
        background: isDarkMode
          ? 'linear-gradient(135deg, #00FFFF 0%, #FF00FF 50%, #FF0000 100%)'
          : 'linear-gradient(135deg, #00C6FF 0%, #0072FF 50%, #FF0099 100%)',
        opacity: '0.5',
        filter: 'brightness(1.5) contrast(1.5)',
        willChange: 'transform'
      }"
    />
    <!-- Background Layer -->
    <div
      class="absolute inset-px rounded-[19px] transition-colors duration-300"
      :class="[
        isDarkMode
          ? 'bg-neutral-900/90'
          : 'bg-[rgba(255,255,255,0.85)]'
      ]"
    />
    <!-- Content Container -->
    <div
      v-if="$slots.default"
      class="relative overflow-hidden rounded-[15px] transition-colors duration-300"
      :class="[
        'h-48 md:h-56 lg:h-64',
        isDarkMode ? 'bg-black/30' : 'bg-transparent',
        props.class
      ]"
    >
      <slot></slot>
    </div>
    <!-- Text Content -->
    <div class="relative px-4 pb-2 pt-4">
      <h3
        class="text-lg font-semibold transition-colors duration-300"
        :class="[
          isDarkMode ? 'text-neutral-300' : 'text-[#3C5B80]'
        ]"
      >
        {{ title }}
      </h3>
      <p
        class="mt-2 transition-colors duration-300"
        :class="[
          isDarkMode ? 'text-neutral-400' : 'text-neutral-700'
        ]"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMouse } from '../components/useMouse'
import { ArrowUpRight } from 'lucide-vue-next'
import type { VNode } from 'vue'

interface Props {
  title: string
  description: string
  withArrow?: boolean
  circleSize?: number
  class?: string
  isDarkMode: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withArrow: false,
  circleSize: 400
})

defineSlots<{
  default?: () => VNode | VNode[]
}>()

const { state, elementRef } = useMouse()
</script>

<style scoped>
.group {
  isolation: isolate;
  transform: translateZ(0);
}

.group,
.group * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.group > * {
  isolation: isolate;
}
</style>
