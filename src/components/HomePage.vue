<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Home, FolderOpen, Mail, LucideMoon, LucideSun } from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'
import ScrollIndicator from '@/components/ScrollIndicator.vue';
import HomeBlob from '@/components/blobs/HomeBlob.vue'
import ProjectsBlob from '@/components/blobs/ProjectsBlob.vue'
import ContactBlob from './blobs/ContactBlob.vue'
import AnimatedTitle from '@/components/Titles/AnimatedTitle.vue'
import ProjectCards from '../components/ProjectCards.vue'; // Importer ProjectCards
import ContactTitle from '../components/Titles/ContactTitle.vue';
import AnimatedBackground from '../components/AnimatedBackground.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const mouseX = ref(0)
const mouseY = ref(0)
const isGlowVisible = ref(false)
const isModalOpen = ref(false);  // Ajout de isModalOpen

const updateMousePosition = (event: MouseEvent) => {
  if (event.target && isElementOrAncestor(event.target as HTMLElement, 'main')) {
    isGlowVisible.value = true
    requestAnimationFrame(() => {
      mouseX.value = event.clientX
      mouseY.value = event.clientY
    })
  } else {
    isGlowVisible.value = false
  }
}

const isElementOrAncestor = (element: HTMLElement, targetClass: string): boolean => {
  if (!element) return false
  if (element.tagName.toLowerCase() === targetClass) return true
  return element.parentElement ? isElementOrAncestor(element.parentElement, targetClass) : false
}

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
      sectionVisibility.value[entry.target.id] = entry.intersectionRatio
      if (entry.intersectionRatio > 0.5) {
        currentSection.value = entry.target.id
      }
    })
  }, {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100)
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
  sectionVisibility.value['home'] = 1
  window.addEventListener('mousemove', updateMousePosition)
})

watch(isModalOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';  // Désactive le scroll
    document.body.classList.add('modal-open');
  } else {
    document.body.style.overflow = '';  // Réactive le scroll
    document.body.classList.remove('modal-open');
  }
});

onBeforeUnmount(() => {
  if (observer) {
    sections.value.forEach(section => {
      observer.unobserve(section)
    })
    observer.disconnect()
  }
  window.removeEventListener('mousemove', updateMousePosition)
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">

    <div class="pointer-events-none fixed inset-0 z-30" :style="{ opacity: isGlowVisible ? 1 : 0 }">
      <div class="absolute" :style="{
        left: `${mouseX}px`,
        top: `${mouseY}px`,
      }">
        <div class="absolute w-3 h-3 rounded-full animate-orbit transition-colors duration-700 shadow-lg" :class="[
          isDarkMode
            ? 'bg-gradient-to-br from-[#6EA8CC] to-[#6A4C93] shadow-[#6EA8CC]/50'
            : 'bg-gradient-to-br from-[#3C5B80] to-[#372860] shadow-[#3C5B80]/50'
        ]" :style="{
          filter: 'drop-shadow(0 0 4px currentColor)'
        }" />
      </div>
    </div>

    <div :class="[
      'fixed inset-0 -z-10 transition-all duration-700 ease-in-out bg-gradient-to-br from-[#6EA8CC] to-[#EEE9E5]',
      isDarkMode ? 'opacity-0' : 'opacity-100'
    ]" />
    <div :class="[
      'fixed inset-0 -z-10 transition-all duration-700 ease-in-out bg-gradient-to-br from-[#213447] to-[#212A31]',
      isDarkMode ? 'opacity-100' : 'opacity-0'
    ]" />

    <div :class="[
      'fixed w-full top-0 flex justify-end p-4 z-50 transition-all duration-300 ease-in-out',
      currentSection !== 'home'
        ? 'opacity-0 translate-y-[-100%] md:opacity-100 md:translate-y-0'
        : 'opacity-100 translate-y-0'
    ]">
      <label class="inline-flex items-center relative">
        <input class="peer hidden" id="toggle" type="checkbox" v-model="isDarkMode" />
        <div
          class="relative w-[82px] h-[37px] bg-white peer-checked:bg-zinc-500 rounded-full after:absolute after:content-[''] after:w-[30px] after:h-[30px] after:bg-gradient-to-r from-orange-500 to-yellow-400 peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900 after:rounded-full after:top-[3.75px] after:left-[3.75px] active:after:w-[37px] peer-checked:after:left-[74.5px] peer-checked:after:translate-x-[-100%] shadow-sm duration-300 after:duration-300 after:shadow-md">
        </div>
        <LucideSun v-if="!isDarkMode" class="absolute w-5 h-5 right-[9px] text-black transition-opacity duration-300" />
        <LucideMoon v-if="isDarkMode"
          class="absolute w-5 h-5 left-[9px] text-[#EEE9E5] transition-opacity duration-300" />
      </label>
    </div>

    <nav :class="[
      'fixed left-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl z-50 transition-all duration-500 ease-in-out hidden md:block',
      isDarkMode ? 'bg-[rgba(33,42,49,0.8)]' : 'bg-[rgba(255,255,255,0.8)]'
    ]">
      <ul class="flex flex-col gap-8 m-0 p-0 list-none w-full">
        <li v-for="item in navItems" :key="item.id" class="w-full flex justify-center">
          <button @click="scrollToSection(item.id)"
            class="w-[48px] flex flex-col items-center gap-2 group transition-all duration-300 m-0 p-0">
            <component :is="item.icon" class="w-6 h-6 transition-colors duration-300" :style="{
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
    <AnimatedBackground
      :opacity="1 - sectionVisibility['projects']"
      :isDarkMode="isDarkMode"
    />

    <main class="relative overflow-y-auto">
      <!-- Section Home -->
      <section id="home" class="h-screen flex items-center justify-center min-h-screen relative">
        <div class="absolute inset-0 flex items-center justify-center z-10">
          <HomeBlob :isDarkMode="isDarkMode" :isVisible="sectionVisibility['home'] || 0" />
        </div>
        <AnimatedTitle :isDarkMode="isDarkMode" />
        <ScrollIndicator :isDarkMode="isDarkMode" />
      </section>

      <!-- Section Projects -->
      <section id="projects" class="relative min-h-screen pb-16 lg:pb-32 z-0">
  <div class="absolute inset-0 flex items-center justify-center z-10">
    <ProjectsBlob :isDarkMode="isDarkMode" :isVisible="Boolean(sectionVisibility['projects'])" />
  </div>
  <div class="relative z-20 w-full flex flex-col">
    <h2
      class="text-8xl sm:text-8xl md:text-[6rem] lg:text-[8rem] xl:text-[10rem] font-secondary transform-gpu drop-shadow-lg text-center w-full mt-8"
      :class="{ 'text-[#AEB7BC]': isDarkMode, 'text-[#213447]': !isDarkMode }">
      Projets
    </h2>
    <div class="flex-1 flex items-center mt-12"> <!-- Ajout de mt-12 pour un espacement -->
      <ProjectCards :isDarkMode="isDarkMode" :isVisible="Boolean(sectionVisibility['projects'])" />
    </div>
  </div>
</section>

      <!-- Section Contact -->
      <section id="contact" class="h-screen relative min-h-screen z-0">
        <div class="absolute inset-0 flex items-center justify-center z-10">
          <ContactBlob :isDarkMode="isDarkMode" :isVisible="sectionVisibility['contact'] || 0" />
        </div>
        <div class="relative z-20 w-full h-full">
          <ContactTitle :isDarkMode="isDarkMode" />
        </div>
      </section>
    </main>
  </div>
</template>


<style scoped>
/* Appliquer un minimum de hauteur de 100vh pour chaque section */
section {
  min-height: 100vh;
}

main {
  overflow-y: auto;
}


.scroll-indicator-container {
  position: absolute;
  bottom: 0;
}

body.modal-open {
  overflow: hidden;
}

body.modal-open .navbar,
body.modal-open .toggle-color-mode {
  display: none;
}
</style>
