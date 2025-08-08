<!-- components/GeminiModelSelect.vue -->
<template>
  <div class="form-container">
    <div class="form-group">
      <label for="geminiModelSelect">Select Model:</label>
      <select id="geminiModelSelect" v-model="serviceStore.selectedModel">
        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
      </select>
    </div>
    <div v-if="!isValidModel && serviceStore.selectedModel" class="error-message">
      Warning: "{{ serviceStore.selectedModel }}" may not be a valid Gemini model.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';

const serviceStore = useServiceStore();

// Validate that the selected model is in our supported list
const supportedModels = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

const isValidModel = computed(() => {
  return !serviceStore.selectedModel || supportedModels.includes(serviceStore.selectedModel);
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

.error-message {
  color: #ff6b6b;
  font-size: 0.9em;
  padding: 5px 10px;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  margin-top: 5px;
}
</style>