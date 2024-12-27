<script setup lang="ts">
defineProps<{
  isDarkMode: boolean
}>()
</script>

<template>
  <div class="w-full absolute top-32 sm:top-28 md:top-24 lg:top-16 xl:top-8 flex flex-col items-center">
    <h1
      class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[14rem] font-secondary transform-gpu drop-shadow-lg mb-4 md:mb-6 lg:mb-8"
      :class="{ 'text-[#AEB7BC]': isDarkMode, 'text-[#213447]': !isDarkMode }"
    >
      Cedric Le Meur
    </h1>
    <a
      class="text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[4rem] font-secondary transform-gpu"
      :class="{ 'text-[#AEB7BC]': isDarkMode, 'text-[#213447]': !isDarkMode }"
    >
      Developpeur
    </a>
  </div>
</template>

<style scoped>
h1 {
  text-shadow: 2px 2px 15px rgba(0, 0, 0, 0.2);
}
</style>
