<script setup lang="ts">
defineProps({
  isDarkMode: {
    type: Boolean,
    required: true
  }
});
</script>

<template>
  <div class="w-full flex justify-center px-4 absolute top-8">
    <h2 class="text-8xl sm:text-8xl md:text-[6rem] lg:text-[8rem] xl:text-[10rem] font-secondary transform-gpu drop-shadow-lg"
      :class="{ 'text-[#AEB7BC]': isDarkMode, 'text-[#213447]': !isDarkMode }">
      Contact
    </h2>
  </div>
</template>
