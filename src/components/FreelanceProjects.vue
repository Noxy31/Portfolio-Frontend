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
    title: 'OasysConsulting.fr - Cabinet de consulting IT',
    description: 'Site vitrine avec interactions base de données et serveur de mail, construction modulaire via composants dynamiques, traduction dynamique en plusieurs langues.',
    image: '/oasys-website.png',
    technologies: ['Vue.js', 'Node.js', 'Express', 'MySQL', 'i18n'],
    link: 'https://oasysconsulting.fr'
  },
  {
    id: 'oasys-backoffice',
    title: 'BackOffice OasysConsulting - Gestion de projets',
    description: 'Système complet de gestion de projets pour l\'administration interne, avec découpage par module et rôles, gestion des utilisateurs et suivi des tâches. Accés client, récupération des factures et suivis des projets par client.',
    image: '/oasys-backoffice.jpg',
    technologies: ['Vue.js', 'Vuex', 'Node.js', 'Express', 'MySQL'],
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
    <!-- Introduction au freelance avec effet glassmorphism -->
    <div class="max-w-4xl mx-auto text-center mb-16 relative px-6 py-10"
      :class="[cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
      style="transition: all 0.6s ease-out">
      <!-- Fond avec glassmorphism et fondu sur les bords -->
      <div class="absolute inset-0 glassmorphism-bg" :class="isDarkMode ? 'glassmorphism-dark' : 'glassmorphism-light'">
      </div>

      <!-- Contenu - en dessus du fond -->
      <div class="relative z-10">
        <h3 class="text-3xl font-bold mb-4" :class="textClass">Projets Développeur FullStack Freelance</h3>
        <p class="text-lg" :class="textClass">
          En parallèle de ma formation, je développe mes compétences en tant que développeur freelance.
          <br>Je propose des solutions web personnalisées pour répondre aux besoins spécifiques de mes clients.
          <br>Je m'occupe également du paramètrage et du déploiement des applications sur les serveurs.
        </p>
      </div>
    </div>

    <!-- Grille de projets -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
      <div v-for="(project, index) in projects" :key="project.id" :class="[
        cardClass,
        'rounded-xl overflow-hidden border-2 shadow-lg transform transition-all duration-300',
        cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      ]" :style="{
            transitionDelay: `${index * 0.15}s`,
            transitionProperty: 'all',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDuration: '0.6s'
          }">
        <!-- Image du projet -->
        <div class="h-64 overflow-hidden">
          <img :src="project.image" :alt="project.title"
            class="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110">
        </div>

        <!-- Contenu du projet -->
        <div class="p-6">
          <h4 class="text-xl font-bold mb-2" :class="textClass">{{ project.title }}</h4>
          <p class="mb-4" :class="textClass">{{ project.description }}</p>

          <!-- Technologies utilisées -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tech in project.technologies" :key="tech" :class="[
              props.isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-800',
              'px-3 py-1 rounded-full text-sm font-medium'
            ]">
              {{ tech }}
            </span>
          </div>

          <!-- Lien vers le site (si disponible) -->
          <div v-if="project.link" class="mt-4">
            <a :href="project.link" target="_blank" rel="noopener noreferrer" :class="[
              props.isDarkMode ? 'text-[#6EA8CC] hover:text-[#8ABFDF]' : 'text-[#9D8EC1] hover:text-[#B6A8D8]',
              'inline-flex items-center font-medium'
            ]" @click.stop>
              Visiter le site
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <div v-else class="mt-4">
            <span :class="[
              props.isDarkMode ? 'text-slate-400' : 'text-slate-500',
              'inline-flex items-center font-medium'
            ]">
              Accès privé (backoffice)
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glassmorphism-bg {
  border-radius: 16px;
  /* Effet de flou */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  /* Fondu sur les bords - utilisant un mask-image */
  -webkit-mask-image: radial-gradient(circle at center, black 80%, transparent 100%);
  mask-image: radial-gradient(circle at center, black 80%, transparent 100%);
}

.glassmorphism-light {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glassmorphism-dark {
  background: rgba(26, 32, 44, 0.25);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
