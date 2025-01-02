<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'

const setupViewportHeight = () => {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
  }
}

onMounted(() => {
  const cleanup = setupViewportHeight();
  onBeforeUnmount(cleanup);
})
</script>

<template>
  <header>
    <nav>
      <!-- <RouterLink to="/">Home</RouterLink> -->
    </nav>
  </header>
  <RouterView />
</template>

<style>
:root {
  --vh: 1vh;
}

.h-screen {
  height: calc(var(--vh) * 100) !important;
}

.min-h-screen {
  min-height: calc(var(--vh) * 100) !important;
}
</style>
