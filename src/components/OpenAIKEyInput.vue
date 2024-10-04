<template>
  <label for="apiKeyInput">Enter your OpenAI API Key:</label>
  <input type="password" id="apiKeyInput" v-model="serviceStore.apiKey" placeholder="Your API Key here..." />

  <label for="modelSelect">Select OpenAI Model:</label>
  <select id="modelSelect" v-model="serviceStore.selectedModel">
    <option value="gpt-4o">GPT-4o</option>
    <option value="gpt-4o-mini">GPT-4o-Mini</option>
  </select>
</template>

<script setup>
import { useServiceStore } from '@/stores/serviceStore';

const serviceStore = useServiceStore();
</script>

<style scoped>
</style>
