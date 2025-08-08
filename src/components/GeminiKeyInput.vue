<!-- components/GeminiKeyInput.vue -->
<template>
  <div class="form-group">
    <label for="gemini-api-key">Gemini API Key:</label>
    <input
        id="gemini-api-key"
        type="password"
        v-model="serviceStore.apiKey"
        placeholder="Enter your Google Gemini API key"
    />
  </div>
</template>

<script>
import { useServiceStore } from '@/stores/serviceStore';

export default {
  name: 'GeminiKeyInput',
  setup() {
    const serviceStore = useServiceStore();
    return { serviceStore };
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>