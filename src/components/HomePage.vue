<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Home, FolderOpen, Mail, LucideMoon, LucideSun, UserCircle, Rss } from 'lucide-vue-next';
import type { LucideIcon } from 'lucide-vue-next';
import ScrollIndicator from '@/components/ScrollIndicator.vue';
import HomeBlob from '@/components/blobs/HomeBlob.vue';
import AnimatedTitle from '@/components/Titles/AnimatedTitle.vue';
import ProjectCards from '../components/ProjectCards.vue';
import ContactTitle from '../components/Titles/ContactTitle.vue';
import DynamicCard from '../components/DynamicCard.vue';
import FreelanceProjects from '@/components/FreelanceProjects.vue';
import AnimatedBackground from '../components/AnimatedBackground.vue';
import TechWatchView from '@/components/TechWatch.vue';
import E5View from './E5View.vue';
import AboutCard from '@/components/AboutCard.vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const mouseX = ref(0)
const mouseY = ref(0)
const isGlowVisible = ref(false)
const isModalOpen = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches
}

const updateMousePosition = (event: MouseEvent) => {
  if (isMobile.value) {
    isGlowVisible.value = false
    return
  }

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
  { icon: UserCircle, label: 'About', id: 'about' },
  { icon: FolderOpen, label: 'Projects', id: 'projects' },
  { icon: Rss, label: 'Veille', id: 'tech-watch' },
  { icon: Mail, label: 'Contact', id: 'contact' },
]

const isDarkMode = ref(false)
const isTransitioning = ref(false)
const currentSection = ref('home')
const sections = ref<HTMLElement[]>([])
const sectionVisibility = ref<{ [key: string]: number }>({})

const TOGGLE_ANIMATION_DURATION = 300

const hasScrolled = ref(false)

const handleScroll = () => {
  const scrollPosition = window.scrollY;
  if (scrollPosition > 50) {
    hasScrolled.value = true;
  } else {
    hasScrolled.value = false;
  }
}

const handleDarkModeToggle = () => {
  if (isTransitioning.value) return

  isTransitioning.value = true

  // Utiliser les classes CSS plutôt que de modifier directement le style
  document.documentElement.classList.toggle('dark-mode')

  // Débloquer les transitions après un délai
  setTimeout(() => {
    isTransitioning.value = false
  }, TOGGLE_ANIMATION_DURATION)
}

const updateCurrentSection = () => {
  // Obtenir la position de défilement actuelle
  const scrollPosition = window.scrollY + window.innerHeight / 2;

  // Trouver la section actuellement visible
  sections.value.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSection.value = section.id;
      sectionVisibility.value[section.id] = 1;
    } else {
      sectionVisibility.value[section.id] = 0;
    }
  });
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
  checkMobile()
  sections.value = Array.from(document.querySelectorAll('section'))
  updateCurrentSection()
  sectionVisibility.value['home'] = 1

  window.addEventListener('mousemove', updateMousePosition)
  window.addEventListener('resize', checkMobile)
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('scroll', updateCurrentSection)
})

watch(isDarkMode, handleDarkModeToggle, { flush: 'post' })

watch(isModalOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  } else {
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', updateMousePosition)
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('scroll', updateCurrentSection)
})
</script>

<template>
  <div class="relative min-h-[calc(var(--vh)*100)] overflow-hidden">
    <!-- Background gradients -->
    <div class="fixed inset-0 -z-10 bg-gradient-to-br"
     :class="isDarkMode ? 'from-[#213447] to-[#212A31]' : 'from-[#6EA8CC] to-[#EEE9E5]'">
</div>


    <!-- Toggle dark mode -->
    <div :class="[
      'fixed w-full top-0 flex justify-end p-4 z-50 transition-all duration-300 ease-in-out',
      isModalOpen
        ? 'opacity-0 pointer-events-none'
        : [
          isMobile
            ? hasScrolled
              ? 'opacity-0 -translate-y-full'
              : 'opacity-100 translate-y-0'
            : currentSection === 'home'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-full md:opacity-100 md:translate-y-0'
        ]
    ]">
      <label class="inline-flex items-center relative" :class="{ 'pointer-events-none': isTransitioning }">
        <input class="peer hidden" id="toggle" type="checkbox" v-model="isDarkMode" :disabled="isTransitioning" />
        <div class="relative w-[82px] h-[37px] bg-white peer-checked:bg-zinc-500 rounded-full
               after:absolute after:content-[''] after:w-[30px] after:h-[30px]
               after:bg-gradient-to-r from-orange-500 to-yellow-400
               peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900
               after:rounded-full after:top-[3.75px] after:left-[3.75px]
               after:transform-gpu peer-checked:after:translate-x-[44.5px]
               shadow-sm transition-all duration-300 ease-in-out
               after:transition-all after:duration-300 after:ease-in-out">
        </div>
        <Transition name="icon-fade" mode="out-in">
          <LucideSun v-if="!isDarkMode" class="absolute w-5 h-5 right-[9px] text-black" />
          <LucideMoon v-else class="absolute w-5 h-5 left-[9px] text-[#EEE9E5]" />
        </Transition>
      </label>
    </div>

    <nav :class="[
      'fixed left-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl z-50 transition-all duration-500 ease-in-out hidden md:block',
      isDarkMode ? 'bg-[rgba(33,42,49,0.8)]' : 'bg-[rgba(255,255,255,0.8)]',
      isModalOpen ? 'opacity-0' : 'opacity-100'
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
    <AnimatedBackground :isDarkMode="isDarkMode" />

    <main class="relative overflow-y-auto">
      <!-- Section Home -->
      <section id="home" class="h-[calc(var(--vh)*100)] flex items-center justify-center relative">
        <div class="absolute inset-0 flex items-center justify-center z-10">
          <HomeBlob :isDarkMode="isDarkMode" :isVisible="sectionVisibility['home'] || 0" />
        </div>
        <AnimatedTitle :isDarkMode="isDarkMode" />
        <ScrollIndicator :isDarkMode="isDarkMode" />
      </section>

      <!-- Section About -->
      <section id="about" class="min-h-[calc(var(--vh)*100)] relative z-0 pb-32">
        <div class="relative z-20 w-full flex flex-col">
          <h2 class="text-6xl
           laptop-sm:text-[4rem]
           laptop-md:text-[5rem]
           xl:text-[10rem]
           font-secondary transform-gpu drop-shadow-lg text-center w-full mt-8"
            :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }">
            À propos
          </h2>
          <div class="container mx-auto max-w-[1920px]
                mt-24
                md:mt-32
                laptop-sm:mt-16
                laptop-md:mt-20
                lg:mt-32
                px-4 lg:px-16 xl:px-24">
            <div class="grid grid-cols-1
                  md:grid-cols-2
                  gap-8
                  md:gap-24
                  laptop-sm:gap-16
                  laptop-md:gap-20
                  lg:gap-32
                  items-center">
              <div class="flex justify-center md:justify-end">
                <div class="w-72 h-72
                     md:w-[400px] md:h-[400px]
                     laptop-sm:w-[350px] laptop-sm:h-[350px]
                     laptop-md:w-[400px] laptop-md:h-[400px]
                     lg:w-[550px] lg:h-[550px]
                     xl:w-[600px] xl:h-[600px]
                     rounded-full overflow-hidden border-4 transition-all duration-500" :class="[
                      isDarkMode ? 'border-[#6EA8CC]' : 'border-[#3C5B80]',
                      sectionVisibility['about'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    ]">
                  <img src="/3.jpg" alt="Avatar" class="w-full h-full object-cover" />
                </div>
              </div>
              <div class="flex justify-center md:justify-start">
                <AboutCard :isDarkMode="isDarkMode" :isVisible="Boolean(sectionVisibility['about'])"
                  class="w-full max-w-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Projects -->
      <section id="projects" class="relative min-h-[calc(var(--vh)*100)] pb-16 lg:pb-32 z-20">
        <div class="absolute inset-0 hidden md:flex items-center justify-center z-10">
        </div>
        <div class="relative z-20 w-full flex flex-col">
          <h2 class="text-6xl
           laptop-sm:text-[4rem]
           laptop-md:text-[5rem]
           xl:text-[10rem]
           font-secondary transform-gpu drop-shadow-lg text-center w-full mt-8"
            :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }">
            Projets
          </h2>
          <div class="flex-1 flex items-center mt-12">
            <ProjectCards :isDarkMode="isDarkMode" :isVisible="Boolean(sectionVisibility['projects'])"
              @updateModalState="isModalOpen = $event" />
          </div>
          <h2 class="text-6xl
          laptop-sm:text-[4rem]
          laptop-md:text-[5rem]
          xl:text-[10rem]
          font-secondary transform-gpu drop-shadow-lg text-center w-full mt-32"
            :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }">
            Freelance
          </h2>
          <div class="flex-1 flex items-center">
            <FreelanceProjects :isDarkMode="isDarkMode" :isVisible="Boolean(sectionVisibility['projects'])"
              @updateModalState="isModalOpen = $event" />
          </div>


          <!-- Section E6 (à l'intérieur de projects) -->
          <h2 class="text-6xl
           laptop-sm:text-[4rem]
           laptop-md:text-[5rem]
           xl:text-[10rem]
           font-secondary transform-gpu drop-shadow-lg text-center w-full mt-32"
            :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }">
            Epreuve E6
          </h2>
          <div class="flex-1 flex items-center mt-12">
            <E5View :isDarkMode="isDarkMode" :isVisible="Boolean(sectionVisibility['projects'])"
              @updateModalState="isModalOpen = $event" />
          </div>
        </div>
      </section>

      <!-- Section Veille Technologique -->
      <section id="tech-watch" class="relative min-h-[calc(var(--vh)*100)] pb-16 lg:pb-32 z-20">
        <div class="relative z-20 w-full flex flex-col">
          <h2 class="text-6xl
       laptop-sm:text-[4rem]
       laptop-md:text-[5rem]
       xl:text-[10rem]
       font-secondary transform-gpu drop-shadow-lg text-center w-full mt-8"
            :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }">
            Veille Technologique
          </h2>
          <h3 class="text-3xl
       laptop-sm:text-[2rem]
       laptop-md:text-[2.5rem]
       xl:text-[3rem]
       font-secondary transform-gpu drop-shadow-lg text-center w-full mt-4"
            :class="{ 'text-[#D5DDE3]': isDarkMode, 'text-[#213447]': !isDarkMode }">
            Mes sources
          </h3>
          <div class="flex-1 flex items-center mt-12">
            <TechWatchView :isDarkMode="isDarkMode" :isVisible="Boolean(sectionVisibility['tech-watch'])" />
          </div>
        </div>
      </section>

      <!-- Section Contact -->
      <section id="contact" class="h-[calc(var(--vh)*100)] relative z-20 px-4 md:px-0">
        <div class="relative z-20 w-full h-full flex flex-col items-center gap-8 md:gap-0">
          <div class="mt-[20vh] w-full flex justify-center">
            <ContactTitle :isDarkMode="isDarkMode" />
          </div>

          <DynamicCard title="GitHub" description="github.com/Noxy31" side="left" position="top"
            :isDarkMode="isDarkMode" type="link" action="https://github.com/Noxy31">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                :class="isDarkMode ? 'text-neutral-100' : 'text-neutral-900'">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </template>
          </DynamicCard>

          <DynamicCard title="Téléphone" description="+33 7 68 66 76 14" side="right" position="top"
            :isDarkMode="isDarkMode" type="copy" action="+33768667614">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                :class="isDarkMode ? 'text-neutral-100' : 'text-neutral-900'">
                <path
                  d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z" />
              </svg>
            </template>
          </DynamicCard>

          <DynamicCard title="Email" description="ckc744@proton.me" side="left" position="bottom"
            :isDarkMode="isDarkMode" type="copy" action="ckc744@proton.me">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                :class="isDarkMode ? 'text-neutral-100' : 'text-neutral-900'">
                <path
                  d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z" />
              </svg>
            </template>
          </DynamicCard>

          <DynamicCard title="CV" description="Télécharger mon CV" side="right" position="bottom"
            :isDarkMode="isDarkMode" type="download" action="/CV.pdf">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                :class="isDarkMode ? 'text-neutral-100' : 'text-neutral-900'">
                <path
                  d="M11.363 2c4.155 0 2.637 6 2.637 6s6-1.65 6 2.457v11.543h-16v-20h7.363zm.826-2h-10.189v24h20v-14.386c0-2.391-6.648-9.614-9.811-9.614zm4.811 13h-2.628v3.686h.907v-1.472h1.49v-.732h-1.49v-.698h1.721v-.784zm-4.9 0h-1.599v3.686h1.599c.537 0 .961-.181 1.262-.535.555-.658.587-2.034-.062-2.692-.298-.3-.712-.459-1.2-.459zm-.692.783h.496c.473 0 .802.173.915.644.064.267.077.679-.021.948-.128.351-.381.528-.754.528h-.637v-2.12zm-2.74-.783h-1.668v3.686h.907v-1.277h.761c.619 0 1.064-.277 1.224-.763.095-.291.095-.597 0-.885-.16-.484-.606-.761-1.224-.761zm-.761.732h.546c.235 0 .467.028.576.228.067.123.067.366 0 .489-.109.199-.341.227-.576.227h-.546v-.944z" />
              </svg>
            </template>
          </DynamicCard>
        </div>
      </section>
    </main>
  </div>
</template>


<style scoped>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
