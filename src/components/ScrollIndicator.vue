<template>
  <div class="absolute bottom-4 inset-x-0 md:inset-x-auto md:right-44 md:bottom-8 flex flex-col items-center gap-2 md:gap-4 animate-bounce">
    <p
      :style="{ color: isDarkMode ? '#EEE9E5' : '#213447' }"
      class="text-sm md:text-lg lg:text-xl font-medium"
    >
      Scrollez vers le bas
    </p>
    <LucideChevronDown
      :style="{ color: isDarkMode ? '#EEE9E5' : '#213447' }"
      class="w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12"
    />
  </div>
</template>

<script lang="ts" setup>
import { LucideChevronDown } from 'lucide-vue-next';
defineProps({
  isDarkMode: {
    type: Boolean,
    required: true
  }
});
</script>
