<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import ProjectCard from '@/components/ProjectCard.vue';

interface Project {
  id: number;
  title: string;
  description: string;
  imageout: string;
  imagein: string;
  schemaUrl: string;
  docUrl: string;
}

defineProps({
  isDarkMode: {
    type: Boolean as PropType<boolean>,
    required: true
  },
  isVisible: {
    type: Boolean as PropType<boolean>,
    default: false
  }
});

const selectedProject = ref<Project | null>(null);
const projects = ref<Project[]>([
  {
    id: 1,
    title: "Organiz'Heure",
    description: "WebApp - Organiz'Heure est une application web de gestion de tâches sous forme de To-Do list. L'application permet de créer des tâches, de les organiser par catégories, de les marquer comme terminées et de les archiver. L'application possède une vue Administrateur et une vue Employé, elle est responsive et fonctionne sur tous les appareils.",
    imageout: '../src/assets/Logo/Logo-OrganizHeure.png',
    imagein: '../src/assets/Logo/OHExhibit.png',
    schemaUrl: '/path/to/schema1.pdf',
    docUrl: '/path/to/doc1.pdf'
  },
  {
    id: 2,
    title: "Deliver'Easy",
    description: "WebApp - Deliver'Easy est une application web de gestion de livraisons. L'application permet de créer des commandes, de les affecter à des livreurs, de suivre les livraisons en temps réel et de générer des rapports. L'application possède une vue Administrateur et une vue Livreur sur mobile, elle est responsive et fonctionne sur tous les appareils.",
    imageout: '../src/assets/Logo/Logo-DE.png',
    imagein: '/path/to/image2.jpg',
    schemaUrl: '/path/to/schema2.pdf',
    docUrl: '/path/to/doc2.pdf'
  },
  {
    id: 3,
    title: 'Nurse Care',
    description: 'Description...',
    imageout: '/path/to/image3.jpg',
    imagein: '/path/to/image3.jpg',
    schemaUrl: '/path/to/schema3.pdf',
    docUrl: '/path/to/doc3.pdf'
  },
  {
    id: 4,
    title: 'Project 4',
    description: 'Description...',
    imageout: '/path/to/image4.jpg',
    imagein: '/path/to/image4.jpg',
    schemaUrl: '/path/to/schema4.pdf',
    docUrl: '/path/to/doc4.pdf'
  },
  {
    id: 5,
    title: 'Project 5',
    description: 'Description...',
    imageout: '/path/to/image5.jpg',
    imagein: '/path/to/image5.jpg',
    schemaUrl: '/path/to/schema5.pdf',
    docUrl: '/path/to/doc5.pdf'
  },
  {
    id: 6,
    title: 'Project 6',
    description: 'Description...',
    imageout: '/path/to/image6.jpg',
    imagein: '/path/to/image6.jpg',
    schemaUrl: '/path/to/schema6.pdf',
    docUrl: '/path/to/doc6.pdf'
  }
]);

const leftProjects = computed(() => projects.value.slice(0, 3));
const rightProjects = computed(() => projects.value.slice(3, 6));

const openPdf = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};
</script>

<template>
  <div class="relative w-full max-w-[1920px] mx-auto flex items-center mt-16">
    <div class="w-full md:w-[40%] flex flex-col gap-8 md:gap-16 px-4 md:pl-[6%] lg:pl-[8%]">
      <ProjectCard v-for="(project, index) in leftProjects" :key="project.id" :project="project"
        :isDarkMode="isDarkMode" :class="[
          'transform transition-all duration-500',
          { 'translate-x-[-100px] opacity-0': !isVisible },
          { 'translate-x-0 opacity-100': isVisible },
          { 'transition-delay-100': index === 0 },
          { 'transition-delay-200': index === 1 },
          { 'transition-delay-300': index === 2 }
        ]" @openModal="selectedProject = $event" />
    </div>

    <div class="w-[40%] flex items-center justify-center">
      <slot></slot>
    </div>

    <div class="w-full md:w-[40%] flex flex-col gap-8 md:gap-16 px-4 md:pr-[6%] lg:pr-[8%]">
      <ProjectCard v-for="(project, index) in rightProjects" :key="project.id" :project="project"
        :isDarkMode="isDarkMode" :class="[
          'transform transition-all duration-500',
          { 'translate-x-[100px] opacity-0': !isVisible },
          { 'translate-x-0 opacity-100': isVisible },
          { 'transition-delay-100': index === 0 },
          { 'transition-delay-200': index === 1 },
          { 'transition-delay-300': index === 2 }
        ]" @openModal="selectedProject = $event" />
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="selectedProject" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="selectedProject = null"></div>
        <div class="relative w-[90vw] max-w-7xl max-h-7xl p-8 rounded-xl transform transition-all font-primary"
          :class="isDarkMode ? 'bg-[rgba(33,42,49,0.95)]' : 'bg-[rgba(255,255,255,0.95)]'">
          <div class="max-h-[60vh] mb-6 flex items-center justify-center">
            <img :src="selectedProject.imagein" :alt="selectedProject.title"
              class="w-full h-auto max-h-full object-contain rounded-lg">
          </div>
          <h2 class="text-3xl font-bold mb-4" :class="isDarkMode ? 'text-[#EEE9E5]' : 'text-[#213447]'">
            {{ selectedProject.title }}
          </h2>
          <p class="mb-8 text-lg" :class="isDarkMode ? 'text-[#AEB7BC]' : 'text-[#6B7280]'">
            {{ selectedProject.description }}
          </p>
          <div class="flex flex-row justify-center gap-4 px-4 md:gap-16 md:px-32">
            <button @click="openPdf(selectedProject.schemaUrl)"
              class="flex-1 px-4 md:px-6 py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
              :class="isDarkMode ? 'bg-[#6EA8CC] text-white' : 'bg-[#3C5B80] text-white'">
              Voir Schéma d'Architecture Technique
            </button>
            <button @click="openPdf(selectedProject.docUrl)"
              class="flex-1 px-4 md:px-6 py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
              :class="isDarkMode ? 'bg-[#6A4C93] text-white' : 'bg-[#372860] text-white'">
              Voir Documentation Fonctionnelle
            </button>
          </div>
          <button @click="selectedProject = null" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
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
