<script setup lang="ts">
import { type PropType } from 'vue';

interface Project {
  id: number;
  title: string;
  description: string;
  imageout: string;
  imagein: string;
  schemaUrl: string;
  docUrl: string;
}

defineProps({
  project: {
    type: Object as PropType<Project>,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    required: true
  }
});

defineEmits<{
  (e: 'openModal', project: Project): void
}>();
</script>

<template>
  <div
    @click="$emit('openModal', project)"
    class="w-full rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300"
    :class="isDarkMode ? 'bg-[rgba(33,42,49,0.8)]' : 'bg-[rgba(255,255,255,0.8)]'"
  >
    <div class="h-[8vw]  overflow-hidden">
      <img :src="project.imageout" :alt="project.title" class="w-full h-full object-cover">
    </div>
    <div class="p-2 sm:p-4 flex justify-center">
      <h3 :class="isDarkMode ? 'text-[#EEE9E5]' : 'text-[#213447]'"
          class="text-base sm:text-lg md:text-xl font-semibold text-center">
        {{ project.title }}
      </h3>
    </div>
  </div>
</template>
