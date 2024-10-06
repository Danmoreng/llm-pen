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
      <div class="controls">
        <button @click="toggleEditor">{{ isEditorVisible ? 'Hide' : 'Show' }} Editor</button>
        <button @click="serviceStore.resetChat">Reset Chat</button>

        <!-- GitHub Repository Link with SVG Icon -->
        <a class="github-link" href="https://github.com/danmoreng/llm-pen" target="_blank" aria-label="GitHub" title="GitHub Repository">
          <img src="@/assets/github-mark.svg" alt="GitHub Icon" />
        </a>
      </div>
      <div class="editor-output-container">
        <EditorSection v-if="isEditorVisible" />
        <OutputSection :expand="!isEditorVisible" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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

// State for toggling the editor
const isEditorVisible = ref(true);
const toggleEditor = () => {
  isEditorVisible.value = !isEditorVisible.value;
};
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

.output-section {
  flex: 1;
}

.output-section.expand {
  flex: 2; /* Expands when editor is hidden */
}

.controls {
  display: flex;
  flex-direction: row;
  align-items: center; /* Vertically align items */
  justify-content: space-between; /* Spread out the controls */
}

button {
  min-width: 150px;
  background-color: #3a3a52; /* Subtle color */
  color: #f0f0f0;
  border: none;
  padding: 5px 10px;
  margin: 5px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 12px;
}

button:hover {
  background-color: #474766; /* Darker on hover */
}

/* GitHub link styles */
.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto; /* Push to the far right */
  text-decoration: none;
  margin-right: 10px;
}

.github-link img {
  width: 20px;
  height: 20px;
  display: block;
  filter: invert(100%);
}

.github-link img:hover {
  filter: invert(70%);
}
</style>
