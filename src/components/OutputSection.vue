<template>
  <div class="output-section">
    <h2>Live Preview</h2>
    <iframe id="codeOutput" sandbox="allow-scripts"></iframe>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useEditorStore } from '@/stores/editorStore';

const editorStore = useEditorStore();

// Function to update the iframe with the merged code from the store
const updateIframe = () => {
  const iframe = document.getElementById('codeOutput');
  if (iframe) {
    iframe.srcdoc = editorStore.getMergedCode(); // Using the store's function directly
  }
};

// Watch for changes in HTML, CSS, and JS and update the iframe
watch(
  () => [editorStore.htmlContent, editorStore.cssContent, editorStore.jsContent],
  () => {
    updateIframe();
  }
);

// Initially load the iframe content on mount
onMounted(() => {
  updateIframe();
});
</script>

<style scoped>
.output-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.output-section h2 {
  color: #f8f8f2;
  margin-bottom: 10px;
}

#codeOutput {
  flex-grow: 1;
  width: 100%;
  border: 1px solid #4e4e5e;
  border-radius: 5px;
  background-color: #1e1e2f;
  overflow-y: auto;
}
</style>
