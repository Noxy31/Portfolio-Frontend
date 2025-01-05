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
    <h2 class="text-6xl
               laptop-sm:text-[4rem]
               laptop-md:text-[5rem]
               xl:text-[10rem]
               font-secondary transform-gpu drop-shadow-lg"
      :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }">
      Contact
    </h2>
  </div>
</template>
