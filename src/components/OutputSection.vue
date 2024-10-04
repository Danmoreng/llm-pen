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

// Update the iframe whenever the code content changes
const updateIframe = (code) => {
  const iframe = document.getElementById('codeOutput');
  if (iframe) {
    iframe.srcdoc = code;
  }
};

// Watch for changes in the editor content and update iframe
watch(() => editorStore.codeContent, (newCode) => {
  updateIframe(newCode);
});

// Initially load the iframe content on mount
onMounted(() => {
  updateIframe(editorStore.codeContent);
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
