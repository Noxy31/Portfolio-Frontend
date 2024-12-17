<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Home, UserCircle, FolderOpen, Mail, LucideMoon, LucideSun } from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'
import BlobAbout from '@/components/blobs/AboutBlob.vue'
import GlitchTransition from '@/components/GlitchTransition.vue'

interface NavItem {
  icon: LucideIcon
  label: string
  path: string
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: UserCircle, label: 'About', path: '/about' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: Mail, label: 'Contact', path: '/contact' }
]

const isDarkMode = ref(true)
const glitchTransition = ref<InstanceType<typeof GlitchTransition> | null>(null)
const route = useRoute()

// Watcher pour le darkMode
watch(isDarkMode, (newValue) => {
  const root = document.documentElement;
  if (newValue) {
    root.style.setProperty('--bg-color', '#213447');
    root.style.setProperty('--text-color', '#EEE9E5');
    root.style.setProperty('--transition-duration', '0.5s');
  } else {
    root.style.setProperty('--bg-color', '#EEE9E5');
    root.style.setProperty('--text-color', '#213447');
    root.style.setProperty('--transition-duration', '0.5s');
  }
});

// Watcher pour la route pour déclencher la transition
watch(() => route.path, () => {
  console.log('Route changed, triggering glitch effect');
  glitchTransition.value?.startGlitchEffect();
});
</script>

<template>
  <div class="wrapper">
    <!-- Fond clair -->
    <div :class="[
      'background-layer light-bg transition-all duration-700 ease-in-out absolute inset-0 -z-10',
      isDarkMode ? 'opacity-0' : 'opacity-100'
    ]" />

    <!-- Fond sombre -->
    <div :class="[
      'background-layer dark-bg transition-all duration-700 ease-in-out absolute inset-0 -z-10',
      isDarkMode ? 'opacity-100' : 'opacity-0'
    ]" />

    <div class="min-h-screen relative z-0">
      <!-- Header -->
      <header class="fixed w-full top-0 flex justify-end p-4 backdrop-blur-sm z-50">
        <label class="inline-flex items-center relative">
          <input class="peer hidden" id="toggle" type="checkbox" v-model="isDarkMode" />
          <div class="relative w-[82px] h-[37px] bg-white peer-checked:bg-zinc-500 rounded-full after:absolute after:content-[''] after:w-[30px] after:h-[30px] after:bg-gradient-to-r from-orange-500 to-yellow-400 peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900 after:rounded-full after:top-[3.75px] after:left-[3.75px] active:after:w-[37px] peer-checked:after:left-[74.5px] peer-checked:after:translate-x-[-100%] shadow-sm duration-300 after:duration-300 after:shadow-md">
          </div>
          <LucideSun v-if="!isDarkMode" class="absolute w-5 h-5 right-[9px] text-black transition-opacity duration-300" />
          <LucideMoon v-if="isDarkMode" class="absolute w-5 h-5 left-[9px] text-#EEE9E5 transition-opacity duration-300" />
        </label>
      </header>

      <!-- Sidebar NavItems -->
      <nav :class="[
        'fixed left-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl z-50',
        'transition-all duration-500 ease-in-out',
        isDarkMode ? 'bg-[rgba(33,42,49,0.8)]' : 'bg-[rgba(255,255,255,0.8)]'
      ]">
        <ul class="flex flex-col gap-8">
          <li v-for="item in navItems" :key="item.path">
            <RouterLink :to="item.path" class="flex flex-col items-center gap-2 group transition-all duration-300">
              <component :is="item.icon" class="w-6 h-6 transition-colors duration-300" :style="{
                color: isDarkMode
                  ? $route.path === item.path ? '#6EA8CC' : '#AEB7BC'
                  : $route.path === item.path ? '#213447' : '#6B7280',
              }" />
              <span class="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" :style="{
                color: isDarkMode ? '#6EA8CC' : '#213447'
              }">
                {{ item.label }}
              </span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <BlobAbout :isDarkMode="isDarkMode" class="blob-canvas" />
      <GlitchTransition
        ref="glitchTransition"
        :isDarkMode="isDarkMode"
        :currentComponent="'about'"
      />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  min-height: 100vh;
}

.background-layer {
  width: 100%;
  height: 100%;
}

.light-bg {
  background: linear-gradient(to bottom right, #6EA8CC, #EEE9E5);
}

.dark-bg {
  background: linear-gradient(to bottom right, #213447, #212A31);
}

.transition-all {
  transition-property: all;
}
</style>
