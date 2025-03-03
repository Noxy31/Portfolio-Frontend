<!-- TechWatchView.vue -->
<script setup lang="ts">
interface TechWatchItem {
  title: string;
  description: string;
  image: string;
  link?: string;
}

defineProps<{
  isDarkMode: boolean;
  isVisible: boolean;
}>();

const techWatchItems: TechWatchItem[] = [
  {
    title: "TLDR Newsletters",
    description: "TLDR est un site proposant un large choix de newsletters sur les sujets de la tech (Startups, WebDev, AI, DevOps, etc..). Site reconnu dans le monde de la tech et possédant plusieurs millions d'abonnés. ",
    image: "/tldr.png",
    link: "https://tldr.tech/"
  },
  {
    title: "Framework Vue.js et son écosystème",
    description: "Utilisant beaucoup ce framework dans le cadre de mes cours et de projets personnel, il m'est important de faire de la veille sur les évolutions de Vue.js, ses performances, ses nouveaux outils et les meilleures pratiques de développement. Cela me permets également de faire des études comparative avec d'autres frameworks.",
    image: "/Vuejs.png",
    link: "https://vuejs.org"
  },
  {
    title: "Hugging Face",
    description: "En tant que passionné d'IA, je suis beaucoup les nouveautés sur HuggingFace, qui est une plateforme collaborative majeure dans le domaine de l'IA et du ML. Elle permet de suivre les derniers modèles d'IA, de découvrir de nouveaux projets open source, et d'accéder à une vaste communauté d'experts. La section 'Papers' et le blog sont particulièrement utiles pour suivre les avancées en IA.",
    image: "/HF.png",
    link: "https://huggingface.co/"
  },
  {
    title: "Reddit - AI Revolution",
    description: "Les subreddits r/artificial, r/MachineLearning et r/AINews regroupent les dernières avancées en IA. Ces communautés partagent les percées technologiques, débattent des implications éthiques et présentent des applications concrètes de l'IA. Excellent moyen de suivre l'évolution rapide du domaine.",
    image: "/Reddit.png",
    link: "https://www.reddit.com/r/artificial+MachineLearning+AINews"
  },
  {
    title: "Discord StudySesh",
    description: "En tant que modérateur de StudySesh, un serveur Discord dynamique comptant plus de 3000 membres passionnés de technologie du monde entier, j'y centralise ma veille technologique. Ce hub regroupe étudiants et professionnels, facilitant le partage de connaissances et la discussion autour des dernières innovations. J'y maintiens des canaux dédiés où j'archive et partage les articles les plus pertinents de ma veille technologique.",
    image: "/Discord.png",
    link: "https://discordapp.com/servers/studysesh-992400402127523930"
  },
];
</script>

<!-- TechWatchView.vue -->
<!-- TechWatchView.vue -->
<template>
  <!-- Container principal corrigé - suppression de md:ml-24 et ajout de classes de centrage -->
  <div class="w-full mx-auto px-4 lg:px-16 xl:px-24 max-w-screen-xl">
    <div class="flex flex-col gap-32">
      <div v-for="(item, index) in techWatchItems" :key="index"
           class="flex flex-col md:flex-row items-center gap-8 md:gap-16"
           :class="{ 'md:flex-row-reverse': index % 2 !== 0 }">

        <!-- Image -->
        <div class="w-full md:w-1/2">
          <div class="relative overflow-hidden rounded-xl shadow-xl transform transition-all duration-500"
               :class="[
                 isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
                 isDarkMode ? 'shadow-[#6EA8CC]/20' : 'shadow-[#3C5B80]/20'
               ]"
               :style="{ transitionDelay: `${index * 200}ms` }">
            <img :src="item.image" :alt="item.title"
                 class="w-full h-[300px] md:h-[400px] object-cover" />
          </div>
        </div>

        <!-- Content avec effet glassmorphism -->
        <div class="w-full md:w-1/2 transform transition-all duration-500 relative"
             :class="[
               isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
               { 'md:text-right': index % 2 !== 0 }
             ]"
             :style="{ transitionDelay: `${(index * 200) + 100}ms` }">

          <!-- Fond avec glassmorphism et fondu sur les bords -->
          <div class="absolute inset-0 glassmorphism-bg"
               :class="isDarkMode ? 'glassmorphism-dark' : 'glassmorphism-light'"></div>

          <!-- Contenu - en dessus du fond -->
          <div class="relative z-10 p-6 rounded-xl">
            <h3 class="text-3xl font-bold mb-4"
                :class="isDarkMode ? 'text-[#F8F9FA]' : 'text-gray-900'">
              {{ item.title }}
            </h3>
            <p class="text-xl mb-6 leading-relaxed"
               :class="isDarkMode ? 'text-[#F8F9FA]' : 'text-gray-700'">
              {{ item.description }}
            </p>
            <a v-if="item.link"
               :href="item.link"
               target="_blank"
               class="inline-flex items-center gap-2 text-lg font-medium transition-colors duration-300"
               :class="{
                 'text-[#F8F9FA] hover:text-[#6EA8CC]': isDarkMode,
                 'text-[#3C5B80] hover:text-[#5A7BA3]': !isDarkMode
               }">
              En savoir plus
              <svg xmlns="http://www.w3.org/2000/svg"
                   class="h-5 w-5"
                   fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor">
                <path stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
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
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* Fondu sur les bords - utilisant un mask-image */
  -webkit-mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
  mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
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

/* Ajout de styles responsive pour garantir le centrage sur tous les écrans */
@media (min-width: 2000px) {
  .max-w-screen-xl {
    max-width: 1536px; /* Limitation de la largeur pour très grands écrans */
  }
}
</style>
