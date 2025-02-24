<template>
  <div
    class="w-full p-6
           md:p-8
           laptop-sm:p-6
           laptop-md:p-7
           lg:p-8
           rounded-3xl transition-all duration-500"
    :class="[
      isDarkMode
        ? 'bg-[rgba(33,42,49,0.8)] shadow-[rgba(0,0,0,0.2)]'
        : 'bg-[rgba(255,255,255,0.8)] shadow-[rgba(0,0,0,0.1)]',
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
    ]"
  >
    <h3 class="text-2xl font-bold mb-6
               laptop-sm:text-xl laptop-sm:mb-4
               laptop-md:text-2xl laptop-md:mb-5"
        :class="isDarkMode ? 'text-[#6EA8CC]' : 'text-[#3C5B80]'">
      Développeur Full Stack
    </h3>
    <div class="space-y-6 text-lg
                laptop-sm:space-y-4 laptop-sm:text-base
                laptop-md:space-y-5 laptop-md:text-lg"
         :class="isDarkMode ? 'text-neutral-200' : 'text-neutral-700'">
      <p>
        Passionné par le développement web et mobile, ainsi que par la Data Science et l'IA, je crée des applications modernes et performantes
        en utilisant les dernières technologies.
      </p>
      <div class="space-y-2">
        <h4 class="font-semibold laptop-sm:text-base laptop-md:text-lg"
            :class="isDarkMode ? 'text-[#6EA8CC]' : 'text-[#3C5B80]'">
          Compétences :
        </h4>
        <div class="grid grid-cols-2 gap-4 laptop-sm:gap-3">
          <div>
            <p class="font-medium mb-1">Frontend :</p>
            <p>Vue.js, ReactNative, TypeScript, Kotlin</p>
          </div>
          <div>
            <p class="font-medium mb-1">Backend :</p>
            <p>Node.js, Python, SQL (MySQL et PostGreSQL)</p>
          </div>
          <div>
            <p class="font-medium mb-1">SysDev:</p>
            <p>Déploiement et intégration de services sur serveurs Linux</p>
          </div>
        </div>
      </div>
      <div>
        <h4 class="font-semibold mb-2 laptop-sm:text-base laptop-md:text-lg"
            :class="isDarkMode ? 'text-[#6EA8CC]' : 'text-[#3C5B80]'">
          Expérience :
        </h4>
        <p class="mb-2">
           Etudiant en développement web, spécialisé dans la création d'applications Vue.js
          et le développement d'APIs REST.
        </p>
      </div>
      <div>
        <h4 class="font-semibold mb-2 laptop-sm:text-base laptop-md:text-lg"
            :class="isDarkMode ? 'text-[#6EA8CC]' : 'text-[#3C5B80]'">
          Formation :
        </h4>
        <p>
          Formation en développement Full Stack, avec une spécialisation en développement web moderne
          et architecture logicielle.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isDarkMode: boolean
  isVisible: boolean
}>()
</script>
