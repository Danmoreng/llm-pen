<template>
  <div class="container">
    <!-- Chat Section -->
    <div class="chat-section">
      <ServiceSelect />

      <!-- Conditional rendering based on selected service -->
      <LocalModelSelect v-if="serviceStore.selectedService === 'local'" />
      <OpenAIKeyInput v-else-if="serviceStore.selectedService === 'openai'" />
      <p v-else>No Service selected.</p>

      <ChatMessages />
      <ChatInput />
    </div>

    <!-- Right Section (Editor and Output) -->
    <div class="right-section">
      <div class="editor-output-container">
        <EditorSection />
        <OutputSection />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useServiceStore } from '@/stores/serviceStore';
import ServiceSelect from '@/components/ServiceSelect.vue';
import LocalModelSelect from '@/components/LocalModelSelect.vue';
import OpenAIKeyInput from '@/components/OpenAIKeyInput.vue';
import ChatMessages from '@/components/ChatMessages.vue';
import ChatInput from '@/components/ChatInput.vue';
import EditorSection from '@/components/EditorSection.vue';
import OutputSection from '@/components/OutputSection.vue';

// Using Pinia store to manage service selection state
const serviceStore = useServiceStore();
</script>

<style scoped>
/* Global container layout */
.container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #2e2e3e;
  overflow: hidden;
}

.chat-section {
  flex: 1;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.right-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-output-container {
  display: flex;
  flex: 1;
  height: 100%;
}
</style>
