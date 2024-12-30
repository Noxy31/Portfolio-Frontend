<script setup lang="ts">
import GradientCard from '../components/GradientCard.vue'
import { type PropType } from 'vue'

interface Project {
  id: number
  title: string
  description: string
  imageout: string
  imagein: string
  schemaUrl: string
  docUrl: string
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
})

defineEmits<{
  (e: 'openModal', project: Project): void
}>()
</script>

<template>
  <GradientCard :title="project.title" :description="project.description" :withArrow="true"
    @click="$emit('openModal', project)">
    <div class="h-48 md:h-56 lg:h-64 w-full overflow-hidden bg-white dark:bg-black flex items-center justify-center">
 <img
   :src="project.imageout"
   :alt="project.title"
   class="min-w-full min-h-full object-cover"
   style="transform: scale(1.2);"
 >
</div>
  </GradientCard>
</template>
