<template>
  <div class="form-group">
    <label for="serviceSelect">Select Service:</label>
    <select id="serviceSelect" v-model="serviceStore.selectedService">
      <option value="local">Local (Ollama)</option>
      <option value="openai">OpenAI</option>
      <option value="gemini">Google Gemini</option>
    </select>
  </div>
</template>

<script setup>
import { useServiceStore } from '@/stores/serviceStore';
const serviceStore = useServiceStore();
</script>

<style scoped>
</style>
