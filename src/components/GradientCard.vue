<script setup lang="ts">
import { useMouse } from '../components/useMouse'
import { ArrowUpRight } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  description: string
  withArrow?: boolean
  circleSize?: number
  class?: string
}>()

const { state, elementRef } = useMouse()

const withArrow = props.withArrow ?? false
const circleSize = props.circleSize ?? 400
</script>

<template>
  <div ref="elementRef"
    class="group relative transform-gpu overflow-hidden rounded-[20px] bg-white/10 p-2 transition-transform hover:scale-[1.01] active:scale-90 h-full">
    <ArrowUpRight v-if="withArrow"
      class="absolute right-2 top-2 z-10 size-5 translate-y-4 text-neutral-700 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 dark:text-neutral-300" />

    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full transition-transform duration-500 group-hover:scale-[3]"
      :class="[state.elementX === null || state.elementY === null ? 'opacity-0' : 'opacity-100']" :style="{
        maskImage: `radial-gradient(${circleSize / 2}px circle at center, white, transparent)`,
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        left: `${state.elementX}px`,
        top: `${state.elementY}px`,
        background: 'linear-gradient(135deg, #3BC4F2, #7A69F9,#F26378,#F5833F)',
      }" />

    <div class="absolute inset-px rounded-[19px] bg-neutral-100/80 dark:bg-neutral-900/80" />

    <div v-if="$slots.default"
      :class="['grid relative h-48 md:h-56 lg:h-64 place-content-center overflow-hidden rounded-[15px] border-white bg-white/70 dark:border-neutral-950 dark:bg-black/50', props.class]">
      <slot></slot>
    </div>

    <div class="relative px-4 pb-2 pt-4">
      <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-300">
        {{ title }}
      </h3>
      <p class="mt-2 text-neutral-600 dark:text-neutral-400">
        {{ description }}
      </p>
    </div>
  </div>
</template>
