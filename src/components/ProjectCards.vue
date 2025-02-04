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
    id: 1,
    title: "Organiz'Heure",
    description:
      "WebApp - Organiz'Heure est une application web de gestion de tâches sous forme de To-Do list.",
    imageout: '/logo/Logo-OrganizHeure.png',
    imagein: '/logo/OHExhibit.png',
    schemaUrl: '/OH.pdf',
    docUrl: '/path/to/doc1.pdf',
  },
  {
    id: 2,
    title: "Deliver'Easy",
    description: "WebApp - Deliver'Easy est une application de gestion de livraisons.",
    imageout: '/logo/Logo-DE.png',
    imagein: '/logo/DE-Exhibit.png',
    schemaUrl: '/path/to/schema2.pdf',
    docUrl: '/path/to/doc2.pdf',
  },
  {
    id: 3,
    title: 'Nurse Care',
    description: "Application mobile de gestion de cabinet d'infimiers et d'infirmières",
    imageout: '/NC-Logo.png',
    imagein: '/path/to/image3.jpg',
    schemaUrl: '/path/to/schema3.pdf',
    docUrl: '/path/to/doc3.pdf',
  },
  {
    id: 4,
    title: 'Ticky',
    description: 'MobileApp - Ticky est une application mobile de ticketing.',
    imageout: '/TickyLogo.png',
    imagein: '/path/to/image3.jpg',
    schemaUrl: '/path/to/schema3.pdf',
    docUrl: '/path/to/doc3.pdf',
  },
  {
    id: 5,
    title: 'GLPI',
    description:
      'Mise en place d’une solution GLPI sur Linux pour la gestion de parc informatique et le suivi des incidents, incluant la configuration et les tests de création/résolution de tickets avec différents profils d’utilisateurs.',
    imageout: '/GLPI-Logo2.png',
    imagein: '/GLPI-OVERVIEW.png',
    schemaUrl: '/GLPI.pdf',
    docUrl: '/path/to/doc3.pdf',
  },
  {
    id: 6,
    title: 'Passerelle Linux et DMZ',
    description:
      "Mise en place d'une passerelle Linux et d'une DMZ sous Debian 12, intégrant un routeur avec pare-feu, DNS et NAT, ainsi qu'un serveur web sécurisé pour héberger des intranets accessibles en HTTPS, tout en respectant des règles strictes d'accès réseau.",
    imageout: '/PLDMZ.png',
    imagein: '/PLDMZ-OVERVIEW.png',
    schemaUrl: '/Passerelle Linux et DMZ.pdf',
    docUrl: '/Passerelle Linux et DMZ.pdf',
  },
])

const openPdf = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

// Watcher pour gérer le défilement et la navbar/toggle
watch(selectedProject, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    emit('updateModalState', true)
  } else {
    document.body.style.overflow = ''
    emit('updateModalState', false)
  }
})

// Fonction pour ouvrir la modal avec le projet
const openModal = (project: Project) => {
  selectedProject.value = project
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center">
    <!-- Colonne du haut -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-[80%]">
      <ProjectCard
        v-for="(project, index) in projects.slice(0, 3)"
        :key="project.id"
        :project="project"
        :isDarkMode="isDarkMode"
        class="w-full transform transition-all duration-500"
        :class="[
          { 'opacity-0': !isVisible },
          { 'opacity-100': isVisible },
          `transition-delay-${(index + 1) * 100}`,
        ]"
        @openModal="openModal(project)"
      />
    </div>

    <!-- Slot central -->
    <div class="w-[40%] flex items-center justify-center my-4">
      <slot></slot>
    </div>

    <!-- Colonne du bas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-[80%]">
      <ProjectCard
        v-for="(project, index) in projects.slice(3, 6)"
        :key="project.id"
        :project="project"
        :isDarkMode="isDarkMode"
        class="w-full transform transition-all duration-500"
        :class="[
          { 'opacity-0': !isVisible },
          { 'opacity-100': isVisible },
          `transition-delay-${(index + 1) * 100}`,
        ]"
        @openModal="openModal(project)"
      />
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="selectedProject" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="selectedProject = null"
        ></div>
        <div
          class="relative w-[90vw] max-w-7xl h-auto max-h-[90vh] p-4 md:p-8 rounded-xl transform transition-all font-primary"
          :class="isDarkMode ? 'bg-[rgba(33,42,49,0.95)]' : 'bg-[rgba(255,255,255,0.95)]'"
        >
          <div class="h-full flex flex-col">
            <div class="flex-1 flex flex-col items-center justify-start">
              <img
                :src="selectedProject.imagein"
                :alt="selectedProject.title"
                class="w-full max-h-[45vh] object-contain rounded-lg mb-4"
              />

              <h2
                class="text-2xl md:text-3xl font-bold mb-2 md:mb-4"
                :class="isDarkMode ? 'text-[#EEE9E5]' : 'text-[#213447]'"
              >
                {{ selectedProject.title }}
              </h2>

              <p
                class="text-base md:text-lg mb-4 md:mb-8"
                :class="isDarkMode ? 'text-[#AEB7BC]' : 'text-[#6B7280]'"
              >
                {{ selectedProject.description }}
              </p>
            </div>

            <div class="flex flex-row justify-center gap-4 px-2 md:gap-16 md:px-32">
              <button
                @click="openPdf(selectedProject.schemaUrl)"
                class="flex-1 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
                :class="isDarkMode ? 'bg-[#6EA8CC] text-white' : 'bg-[#3C5B80] text-white'"
              >
                Voir Documentation Technique
              </button>
              <button
                @click="openPdf(selectedProject.schemaUrl)"
                class="flex-1 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
                :class="isDarkMode ? 'bg-[#9747FF] text-white' : 'bg-[#4A2C6A] text-white'"
              >
                Voir Documentation Fonctionnelle
              </button>
            </div>
          </div>

          <button
            @click="selectedProject = null"
            class="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-gray-700"
          >
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
</style>
