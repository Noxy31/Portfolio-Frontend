<script setup lang="ts">
defineProps<{
  isDarkMode: boolean
}>()
</script>

<template>
  <div class="w-full absolute top-24 sm:top-20 md:top-16 lg:top-12 xl:top-8 flex flex-col items-center">
    <h1
      class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[10rem] font-secondary transform-gpu drop-shadow-lg mb-4 md:mb-6 lg:mb-8"
      :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }"
    >
      Cedric Le Meur
    </h1>
    <a
      class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[4rem] font-secondary transform-gpu"
      :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }"
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
