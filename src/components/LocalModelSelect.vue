<template>
  <label for="localModelSelect">Select Local Model:</label>
  <select id="localModelSelect" v-model="serviceStore.selectedModel">
    <option value="qwen2.5:14b">Qwen2.5:14b</option>
    <option value="llama3.1">Llama3.1</option>
    <option value="qwen2.5">Qwen2.5</option>
  </select>
</template>

<script setup>
import { useServiceStore } from '@/stores/serviceStore';
const serviceStore = useServiceStore();
</script>

<style scoped>
</style>
