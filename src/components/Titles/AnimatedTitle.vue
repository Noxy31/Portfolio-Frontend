<script setup lang="ts">
defineProps<{
  isDarkMode: boolean
}>()
</script>

<template>
  <div class="w-full absolute
              top-32
              laptop-sm:top-12
              laptop-md:top-16
              xl:top-8
              flex flex-col items-center">
    <h1
      class="font-secondary transform-gpu drop-shadow-lg mb-4 md:mb-6 lg:mb-8
             text-6xl
             laptop-sm:text-[4rem]
             laptop-md:text-[5rem]
             xl:text-[10rem]"
      :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }"
    >
      Cedric Le Meur
    </h1>
    <a
      class="font-secondary transform-gpu
             text-2xl
             laptop-sm:text-2xl
             laptop-md:text-3xl
             xl:text-[4rem]"
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
