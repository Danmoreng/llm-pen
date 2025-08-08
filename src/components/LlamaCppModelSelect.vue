<!-- components/LlamaCppModelSelect.vue -->
<template>
  <div class="form-container">
    <div class="form-group">
      <label for="llamaCppModelSelect">Select Model:</label>
      <select id="llamaCppModelSelect" v-model="serviceStore.selectedModel">
        <option v-for="model in models" :key="model.id" :value="model.id">
          {{ model.id }}
        </option>
      </select>
      <button @click="refreshModels" :disabled="isRefreshing" class="refresh-button">
        {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';
import { fetchLlamaCppModels } from '@/api/llamaCpp';

const serviceStore = useServiceStore();
const models = ref([]);
const error = ref(null);
const isRefreshing = ref(false);

async function fetchModels() {
  isRefreshing.value = true;
  error.value = null;
  
  try {
    const fetchedModels = await fetchLlamaCppModels();
    models.value = fetchedModels;
    
    // If no model is selected and we have models, select the first one
    if (!serviceStore.selectedModel && fetchedModels.length > 0) {
      serviceStore.selectedModel = fetchedModels[0].id;
    }
  } catch (err) {
    error.value = err.message;
    console.error('Failed to fetch llama.cpp models:', err);
  } finally {
    isRefreshing.value = false;
  }
}

function refreshModels() {
  fetchModels();
}

onMounted(() => {
  fetchModels();
});
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

label {
  flex-basis: 150px;
  flex-shrink: 0;
}

select {
  flex-grow: 1;
}

.refresh-button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #3a3a52;
  color: #f0f0f0;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  min-width: 80px;
}

.refresh-button:hover:not(:disabled) {
  background-color: #474766;
}

.refresh-button:disabled {
  background-color: #2a2a3a;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9em;
  padding: 5px 10px;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  margin-top: 5px;
}
</style>