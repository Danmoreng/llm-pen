<template>
  <div class="form-container">
    <div class="form-group">
      <label for="localModelSelect">Select Model:</label>
      <select id="localModelSelect" v-model="serviceStore.selectedModel">
        <option v-for="model in models" :key="model.name" :value="model.name">{{ model.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useServiceStore} from '@/stores/serviceStore';

const serviceStore = useServiceStore();
const models = ref([]);

async function fetchModels() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error(`Error fetching models: ${response.statusText}`);
    }
    const data = await response.json();
    models.value = data.models;
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

onMounted(() => {
  fetchModels();
});
</script>

<style scoped>
</style>
