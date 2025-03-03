<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// Déclaration des types pour Vanta et Three.js
interface VantaFogOptions {
  el: HTMLElement;
  mouseControls: boolean;
  touchControls: boolean;
  gyroControls: boolean;
  minHeight: number;
  minWidth: number;
  highlightColor: number;
  midtoneColor: number;
  lowlightColor: number;
  blurFactor: number;
  zoom: number;
}

interface VantaEffect {
  setOptions(options: Partial<VantaFogOptions>): void;
  destroy(): void;
}

declare global {
  interface Window {
    THREE: object;
    VANTA: {
      FOG: (config: VantaFogOptions) => VantaEffect;
    };
  }
}

const props = defineProps<{
  isDarkMode: boolean;
}>();

const emit = defineEmits(['loaded']);

const backgroundEl = ref<HTMLElement | null>(null);
let vantaEffect: VantaEffect | null = null;
const isLoaded = ref(false);

// Fonction pour initialiser ou mettre à jour l'effet Vanta
const setupVantaEffect = () => {
  if (!backgroundEl.value) return;

  // Si un effet existe déjà, le nettoyer
  if (vantaEffect) {
    vantaEffect.destroy();
  }

  vantaEffect = window.VANTA.FOG({
    el: backgroundEl.value,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    highlightColor: props.isDarkMode ? 0x6553c0 : 0x6ea8cc,
    midtoneColor: props.isDarkMode ? 0x964b81 : 0x9d8ec1,
    lowlightColor: props.isDarkMode ? 0xf2329c : 0xb896a5,
    blurFactor: 0.90,
    zoom: 0.30
  });

  // Signaler que l'effet est chargé
  if (!isLoaded.value) {
    isLoaded.value = true;
    emit('loaded');

    // Masquer le préchargeur directement depuis ce composant
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
      preloader.classList.add('loaded');
    }
  }
};

const loadScripts = async () => {
  // Vérifier si les scripts sont déjà chargés
  if (window.THREE && window.VANTA) {
    setupVantaEffect();
    return;
  }

  try {
    // Fonction pour charger un script
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Échec du chargement du script: ${src}`));
        document.head.appendChild(script);
      });
    };

    // Charger les scripts en parallèle pour plus de rapidité
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.fog.min.js')
    ]);

    setupVantaEffect();
  } catch (error) {
    console.error('Erreur lors du chargement des scripts Vanta:', error);

    // En cas d'erreur, signaler quand même que le composant est "chargé"
    // pour que l'app continue de fonctionner avec le fond statique
    if (!isLoaded.value) {
      isLoaded.value = true;
      emit('loaded');

      const preloader = document.getElementById('app-preloader');
      if (preloader) {
        preloader.classList.add('loaded');
      }
    }
  }
};

watch(() => props.isDarkMode, (newValue) => {
  // Mettre à jour la classe sur le body pour le fond de secours
  if (newValue) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Mettre à jour l'effet Vanta avec un délai pour éviter les problèmes de performance
  setTimeout(() => {
    if (vantaEffect) {
      vantaEffect.setOptions({
        highlightColor: newValue ? 0x6553c0 : 0x6ea8cc,
        midtoneColor: newValue ? 0x964b81 : 0x9d8ec1,
        lowlightColor: newValue ? 0xf2329c : 0xb896a5,
      });
    }
  }, 300);
}, { flush: 'post' });

onMounted(() => {
  // Mettre à jour la classe sur le body pour le fond de secours
  if (props.isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Démarrer le chargement des scripts
  loadScripts();
});

onBeforeUnmount(() => {
  if (vantaEffect) {
    vantaEffect.destroy();
  }
});
</script>

<template>
  <div ref="backgroundEl" class="fixed inset-0 -z-10 w-full h-full"></div>
</template>
