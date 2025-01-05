<template>
  <div ref="elementRef"
    class="group relative transform-gpu overflow-hidden rounded-[20px] p-2 transition-transform hover:scale-[1.01] active:scale-90 h-full"
    :class="[
      isDarkMode
        ? 'bg-white/10'
        : 'bg-[rgba(255,255,255,0.3)]'
    ]">
    <ArrowUpRight v-if="withArrow"
      :class="[
        'absolute right-2 top-2 z-10 size-5 translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100',
        isDarkMode ? 'text-neutral-300' : 'text-[#3C5B80]'
      ]" />
    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full transition-transform duration-500 group-hover:scale-[3]"
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
        filter: 'brightness(1.5) contrast(1.5)'
      }" />
    <div class="absolute inset-px rounded-[19px]" :class="[
      isDarkMode
        ? 'bg-neutral-900/70'
        : 'bg-[rgba(255,255,255,0.7)]'
    ]" />
    <div v-if="$slots.default"
      :class="[
        'grid relative h-48 md:h-56 lg:h-64 place-content-center overflow-hidden rounded-[15px] border-white',
        isDarkMode ? 'bg-black/50 dark:border-neutral-950' : 'bg-[rgba(255,255,255,0.8)]',
        props.class
      ]">
      <slot></slot>
    </div>
    <div class="relative px-4 pb-2 pt-4">
      <h3 class="text-lg font-semibold" :class="[
        isDarkMode ? 'text-neutral-300' : 'text-[#3C5B80]'
      ]">
        {{ title }}
      </h3>
      <p class="mt-2" :class="[
        isDarkMode ? 'text-neutral-400' : 'text-neutral-700'
      ]">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMouse } from '../components/useMouse'
import { ArrowUpRight } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  description: string
  withArrow?: boolean
  circleSize?: number
  class?: string
  isDarkMode: boolean
}>()

const { state, elementRef } = useMouse()
const withArrow = props.withArrow ?? false
const circleSize = props.circleSize ?? 400
</script>
