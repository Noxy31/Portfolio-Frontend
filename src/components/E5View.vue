<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import ProjectCard from './ProjectCard.vue'

interface Project {
  id: number
  title: string
  description: string
  imageout: string
  imagein: string
  schemaUrl: string
  docUrl: string
}

const emit = defineEmits(['updateModalState'])

defineProps({
  isDarkMode: {
    type: Boolean as PropType<boolean>,
    required: true,
  },
  isVisible: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})

const selectedProject = ref<Project | null>(null)
const projects = ref<Project[]>([
  {
    id: 3,
    title: 'Nurse Care',
    description: "Application mobile de gestion de cabinet d'infimiers et d'infirmières",
    imageout: '/NC-Logo.png',
    imagein: '/NC-Exhibit.png',
    schemaUrl: '/NurseCare - DT - CLM.pdf',
    docUrl: '/NurseCare - DF - CLM.pdf',
  },
  {
    id: 2,
    title: "Deliver'Easy",
    description: 'Application web de logistique et gestion de livraisons.',
    imageout: '/logo/Logo-DE.png',
    imagein: '/logo/DE-Exhibit.png',
    schemaUrl: '/path/to/schema3.pdf',
    docUrl: '/path/to/doc3.pdf',
  }
])

watch(selectedProject, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    emit('updateModalState', true)
  } else {
    document.body.style.overflow = ''
    emit('updateModalState', false)
  }
})

const openPdf = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

const openModal = (project: Project) => {
  selectedProject.value = project
}
</script>

<template>
  <div class="w-full z-1001 flex flex-col items-center justify-center">
    <!-- Grille principale -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-[80%]">
      <!-- Premier projet -->
      <ProjectCard :project="projects[0]" :isDarkMode="isDarkMode" class="w-full transform transition-all duration-500"
        @openModal="openModal(projects[0])" />

      <!-- Carte simple personnalisée -->
      <div class="w-full h-full rounded-xl p-6 transition-all duration-300 flex items-center justify-center"
        :class="isDarkMode ? 'bg-[#212A31] shadow-lg' : 'bg-white shadow-md'">
        <div class="text-center space-y-6" :class="isDarkMode ? 'text-neutral-300' : 'text-[#3C5B80]'">
          <p class="text-lg mb-4">Dans le cadre de l'épreuve E6 du BTS SIO SLAM,<br />
            j'ai réalisé ces deux projets qui illustrent mes compétences en développement d'applications :</p>

          <!-- NurseCare avec flèche vers la gauche -->
          <div class="flex items-center justify-start space-x-2">
            <svg class="w-6 h-6 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
            <p class="text-lg text-left">NurseCare,l'application Web de cabinet d'infirmiers responsive sur mobile</p>
          </div>

          <!-- Ticky avec flèche vers la droite -->
          <div class="flex items-center justify-end space-x-2">
            <p class="text-lg text-right">Deliver'Easy, l'application de gestion de tournées et de livraison de colis</p>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>
      </div>


      <!-- Deuxième projet -->
      <ProjectCard :project="projects[1]" :isDarkMode="isDarkMode" class="w-full transform transition-all duration-500"
        @openModal="openModal(projects[1])" />
    </div>

    <!-- Boutons -->
    <div class="mt-16 flex justify-center gap-4">
      <!-- Bouton Excel existant -->
      <button @click="openPdf('/E4- Tableau de synthèse - Le Meur Cédric - BTS SIO 2025.pdf')"
        class="flex items-center gap-3 px-8 py-4 rounded-lg font-medium transition-colors text-lg"
        :class="isDarkMode ? 'bg-[#217346] text-white hover:bg-[#1a5c38]' : 'bg-[#217346] text-white hover:bg-[#1a5c38]'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.17 3.25H13.17V4.83H21.17V3.25Z" />
          <path d="M21.17 6.42H13.17V8H21.17V6.42Z" />
          <path d="M21.17 9.58H13.17V11.17H21.17V9.58Z" />
          <path d="M21.17 12.75H13.17V14.33H21.17V12.75Z" />
          <path
            d="M11.25 3.25H2.83V20.75H21.17V16H11.25V3.25ZM9.31 17.62L7.5 13.81L5.77 17.62H4.52L6.87 12.75L4.66 8.12H5.93L7.55 11.68L9.2 8.12H10.43L8.22 12.77L10.57 17.62H9.31Z"
            fill="currentColor" />
        </svg>
        Voir le tableau de synthèse E4
      </button>

      <!-- Nouveau bouton Présentation Portfolio -->
      <button @click="openPdf('/Présentation professionnelle.pdf')"
        class="flex items-center gap-3 px-8 py-4 rounded-lg font-medium transition-colors text-lg"
        :class="isDarkMode ? 'bg-[#6EA8CC] text-white hover:bg-[#5D97BB]' : 'bg-[#9D8EC1] text-white hover:bg-[#8C7DB0]'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M21 2H3C1.9 2 1 2.9 1 4V20C1 21.1 1.9 22 3 22H21C22.1 22 23 21.1 23 20V4C23 2.9 22.1 2 21 2ZM21 20H3V4H21V20ZM8 9H16V11H8V9ZM8 12H16V14H8V12ZM8 6H16V8H8V6ZM8 15H16V17H8V15Z" />
        </svg>
        Présentation Portfolio
      </button>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="selectedProject" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="selectedProject = null"></div>
        <div
          class="relative w-[90vw] max-w-7xl h-auto max-h-[90vh] p-4 md:p-8 rounded-xl transform transition-all font-primary"
          :class="isDarkMode ? 'bg-[rgba(33,42,49,0.95)]' : 'bg-[rgba(255,255,255,0.95)]'">
          <div class="h-full flex flex-col">
            <div class="flex-1 flex flex-col items-center justify-start">
              <img :src="selectedProject.imagein" :alt="selectedProject.title"
                class="w-full max-h-[45vh] object-contain rounded-lg mb-4" />

              <h2 class="text-2xl md:text-3xl font-bold mb-2 md:mb-4"
                :class="isDarkMode ? 'text-[#EEE9E5]' : 'text-[#213447]'">
                {{ selectedProject.title }}
              </h2>

              <p class="text-base md:text-lg mb-4 md:mb-8" :class="isDarkMode ? 'text-[#AEB7BC]' : 'text-[#6B7280]'">
                {{ selectedProject.description }}
              </p>
            </div>

            <div class="flex flex-row justify-center gap-4 px-2 md:gap-16 md:px-32">
              <button @click="openPdf(selectedProject.schemaUrl)"
                class="flex-1 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
                :class="isDarkMode ? 'bg-[#6EA8CC] text-white' : 'bg-[#3C5B80] text-white'">
                Voir Documentation Technique
              </button>
              <button @click="openPdf(selectedProject.docUrl)"
                class="flex-1 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
                :class="isDarkMode ? 'bg-[#9747FF] text-white' : 'bg-[#4A2C6A] text-white'">
                Voir Documentation Fonctionnelle
              </button>
            </div>
          </div>

          <button @click="selectedProject = null"
            class="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-gray-700">
            <span class="sr-only">Fermer</span>×
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@body {
  white-space: pre-line
}
</style>
