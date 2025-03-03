<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});

const projects = ref([
  {
    id: 'oasys-website',
    title: 'OasysConsulting.fr',
    description: 'Site vitrine avec interactions base de données et serveur de données',
    image: '/oasys-website.png',
    technologies: ['Vue.js', 'Node.js', 'Express', 'MySQL', 'i18n'],
    link: 'https://oasysconsulting.fr'
  },
  {
    id: 'oasys-backoffice',
    title: 'BackOffice OasysConsulting',
    description: 'Système complet de gestion de projets pour l\'administration interne',
    image: '/oasys-backoffice.jpg', // Assurez-vous d'ajouter cette image dans votre dossier public
    technologies: ['Vue.js', 'Vuex', 'Node.js', 'Express', 'MongoDB'],
    link: null
  }
]);

const cardsVisible = ref(false);

// Animation au scroll
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      cardsVisible.value = true;
    }, 300);
  } else {
    cardsVisible.value = false;
  }
});

// Suppression de la classe containerClass qui n'est pas utilisée

const cardClass = computed(() => {
  return props.isDarkMode
    ? 'bg-slate-800 border-slate-700 shadow-slate-900/50 hover:border-[#6EA8CC]'
    : 'bg-white border-slate-200 shadow-slate-300 hover:border-[#9D8EC1]';
});

const textClass = computed(() => {
  return props.isDarkMode ? 'text-slate-200' : 'text-slate-800';
});

// Pas de fonction openModal car les cartes ne sont pas cliquables
</script>

<template>
  <div class="container mx-auto mt-16 mb-8 px-4 lg:px-16 xl:px-24">
    <!-- Introduction au freelance -->
    <div class="max-w-4xl mx-auto text-center mb-16"
         :class="[textClass, cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
         style="transition: all 0.6s ease-out">
      <h3 class="text-3xl font-bold mb-4">Projets Développeur Freelance</h3>
      <p class="text-lg">
        En parallèle de ma formation, je développe mes compétences en tant que développeur freelance.
        Je propose des solutions web personnalisées pour répondre aux besoins spécifiques de mes clients.
      </p>
    </div>

    <!-- Grille de projets -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
      <div v-for="(project, index) in projects" :key="project.id"
           :class="[
             cardClass,
             'rounded-xl overflow-hidden border-2 shadow-lg transform transition-all duration-300',
             cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
           ]"
           :style="{
             transitionDelay: `${index * 0.15}s`,
             transitionProperty: 'all',
             transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
             transitionDuration: '0.6s'
           }">
        <!-- Image du projet -->
        <div class="h-64 overflow-hidden">
          <img :src="project.image" :alt="project.title" class="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110">
        </div>

        <!-- Contenu du projet -->
        <div class="p-6">
          <h4 class="text-xl font-bold mb-2" :class="textClass">{{ project.title }}</h4>
          <p class="mb-4" :class="textClass">{{ project.description }}</p>

          <!-- Technologies utilisées -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tech in project.technologies" :key="tech"
                  :class="[
                    props.isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-800',
                    'px-3 py-1 rounded-full text-sm font-medium'
                  ]">
              {{ tech }}
            </span>
          </div>

          <!-- Lien vers le site (si disponible) -->
          <div v-if="project.link" class="mt-4">
            <a :href="project.link" target="_blank" rel="noopener noreferrer"
               :class="[
                 props.isDarkMode ? 'text-[#6EA8CC] hover:text-[#8ABFDF]' : 'text-[#9D8EC1] hover:text-[#B6A8D8]',
                 'inline-flex items-center font-medium'
               ]"
               @click.stop>
              Visiter le site
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <div v-else class="mt-4">
            <span :class="[
                  props.isDarkMode ? 'text-slate-400' : 'text-slate-500',
                  'inline-flex items-center font-medium'
                ]">
              Accès privé (backoffice)
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
