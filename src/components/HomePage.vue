<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Home, UserCircle, FolderOpen, Mail, LucideMoon, LucideSun } from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'
import HomeBlob from '@/components/blobs/HomeBlob.vue'
import AboutBlob from '@/components/blobs/AboutBlob.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

interface NavItem {
  icon: LucideIcon
  label: string
  id: string
}

const activeColors = {
  dark: '#6EA8CC',
  light: '#9D8EC1'
}


const navItems: NavItem[] = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: UserCircle, label: 'About', id: 'about' },
  { icon: FolderOpen, label: 'Projects', id: 'projects' },
  { icon: Mail, label: 'Contact', id: 'contact' }
]

const isDarkMode = ref(true)
const currentSection = ref('home')
const sections = ref<HTMLElement[]>([])
let observer: IntersectionObserver
const sectionVisibility = ref<{ [key: string]: number }>({})

watch(isDarkMode, (newValue) => {
  const root = document.documentElement
  if (newValue) {
    root.style.setProperty('--bg-color', '#213447')
    root.style.setProperty('--text-color', '#EEE9E5')
    root.style.setProperty('--transition-duration', '0.5s')
  } else {
    root.style.setProperty('--bg-color', '#EEE9E5')
    root.style.setProperty('--text-color', '#213447')
    root.style.setProperty('--transition-duration', '0.5s')
  }
})

const setupScrollObserver = () => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Mettre à jour le ratio de visibilité pour chaque section
      sectionVisibility.value[entry.target.id] = entry.intersectionRatio

      // Mettre à jour la section courante si elle est la plus visible
      if (entry.intersectionRatio > 0.5) {
        currentSection.value = entry.target.id
      }
    })
  }, {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100) // Crée des seuils de 0 à 1 par pas de 0.01
  })

  sections.value.forEach(section => {
    observer.observe(section)
    sectionVisibility.value[section.id] = 0
  })
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

onMounted(() => {
  sections.value = Array.from(document.querySelectorAll('section'))
  setupScrollObserver()
  // Initialiser la première section comme visible
  sectionVisibility.value['home'] = 1
})

onBeforeUnmount(() => {
  if (observer) {
    sections.value.forEach(section => {
      observer.unobserve(section)
    })
    observer.disconnect()
  }
})
</script>

<template>
  <div class="wrapper overflow-hidden">
    <!-- Fonds identiques -->
    <div :class="[
      'background-layer light-bg transition-all duration-700 ease-in-out fixed inset-0 -z-10',
      isDarkMode ? 'opacity-0' : 'opacity-100'
    ]" />
    <div :class="[
      'background-layer dark-bg transition-all duration-700 ease-in-out fixed inset-0 -z-10',
      isDarkMode ? 'opacity-100' : 'opacity-0'
    ]" />

    <!-- Le header modifié -->
    <div class="fixed w-full top-0 flex justify-end p-4 z-50">
      <label class="inline-flex items-center relative">
        <input class="peer hidden" id="toggle" type="checkbox" v-model="isDarkMode" />
        <div class="relative w-[82px] h-[37px] bg-white peer-checked:bg-zinc-500 rounded-full after:absolute after:content-[''] after:w-[30px] after:h-[30px] after:bg-gradient-to-r from-orange-500 to-yellow-400 peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900 after:rounded-full after:top-[3.75px] after:left-[3.75px] active:after:w-[37px] peer-checked:after:left-[74.5px] peer-checked:after:translate-x-[-100%] shadow-sm duration-300 after:duration-300 after:shadow-md">
        </div>
        <LucideSun v-if="!isDarkMode" class="absolute w-5 h-5 right-[9px] text-black transition-opacity duration-300" />
        <LucideMoon v-if="isDarkMode" class="absolute w-5 h-5 left-[9px] text-#EEE9E5 transition-opacity duration-300" />
      </label>
    </div>

    <nav :class="[
      'fixed left-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl z-50',
      'transition-all duration-500 ease-in-out',
      isDarkMode ? 'bg-[rgba(33,42,49,0.8)]' : 'bg-[rgba(255,255,255,0.8)]'
    ]">
      <ul class="flex flex-col gap-8">
        <li v-for="item in navItems" :key="item.id" class="w-full flex justify-center">
          <button
            @click="scrollToSection(item.id)"
            class="w-[48px] flex flex-col items-center gap-2 group transition-all duration-300">
            <component :is="item.icon"
              class="w-6 h-6 transition-colors duration-300"
              :style="{
                color: isDarkMode
                  ? currentSection === item.id ? activeColors.dark : '#AEB7BC'
                  : currentSection === item.id ? activeColors.light : '#6B7280',
              }" />
            <span class="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              :style="{ color: isDarkMode ? activeColors.dark : activeColors.light }">
              {{ item.label }}
            </span>
          </button>
        </li>
      </ul>
    </nav>

    <main class="relative overflow-x-hidden">
      <section id="home" class="min-h-screen relative flex items-center justify-center">
        <div class="absolute inset-0 flex items-center justify-center">
          <HomeBlob
            :isDarkMode="isDarkMode"
            :isVisible="sectionVisibility['home'] || 0"
          />
        </div>
      </section>

      <section id="about" class="min-h-screen relative flex items-center justify-center">
        <div class="absolute inset-0 flex items-center justify-center">
          <AboutBlob
            :isDarkMode="isDarkMode"
            :isVisible="sectionVisibility['about'] || 0"
          />
        </div>
      </section>

      <section id="projects" class="min-h-screen relative flex items-center justify-center">
        <div class="relative z-10 text-center">
          <h2 class="text-5xl font-bold mb-4" :style="{ color: isDarkMode ? '#EEE9E5' : '#213447' }">
            Projects
          </h2>
        </div>
      </section>

      <section id="contact" class="min-h-screen relative flex items-center justify-center">
        <div class="relative z-10 text-center">
          <h2 class="text-5xl font-bold mb-4" :style="{ color: isDarkMode ? '#EEE9E5' : '#213447' }">
            Contact
          </h2>
        </div>
      </section>
    </main>
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

nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
}

nav button {
  margin: 0;
  padding: 0;
}

section {
  position: relative;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

main {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}
</style>
