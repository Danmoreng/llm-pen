<template>
  <div class="editor-section">
    <div class="editor">
      <h2>HTML</h2>
      <div class="monaco-container" ref="htmlEditor"></div>
    </div>

    <div class="editor">
      <h2>CSS</h2>
      <div class="monaco-container" ref="cssEditor"></div>
    </div>

    <div class="editor">
      <h2>JavaScript</h2>
      <div class="monaco-container" ref="jsEditor"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as monaco from 'monaco-editor';
import { useEditorStore } from '@/stores/editorStore';

const editorStore = useEditorStore();

// Refs for Monaco editor containers
const htmlEditor = ref(null);
const cssEditor = ref(null);
const jsEditor = ref(null);

onMounted(() => {
  // Create Monaco Editor instances and sync with editorStore
  monaco.editor.create(htmlEditor.value, {
    value: editorStore.htmlContent,
    language: 'html',
    theme: 'vs-dark',
    automaticLayout: true,
  }).onDidChangeModelContent(() => {
    // Update store when content changes
    editorStore.htmlContent = htmlEditor.value.getModel().getValue();
  });

  monaco.editor.create(cssEditor.value, {
    value: editorStore.cssContent,
    language: 'css',
    theme: 'vs-dark',
    automaticLayout: true,
  }).onDidChangeModelContent(() => {
    // Update store when content changes
    editorStore.cssContent = cssEditor.value.getModel().getValue();
  });

  monaco.editor.create(jsEditor.value, {
    value: editorStore.jsContent,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
  }).onDidChangeModelContent(() => {
    // Update store when content changes
    editorStore.jsContent = jsEditor.value.getModel().getValue();
  });
});
</script>

<style scoped>
.editor-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.editor {
  position: relative;
  flex: 1;
  margin: 0 5px 5px 5px;
  display: flex;
  flex-direction: column;
}

.editor h2 {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 12px;
  color: #f8f8f2;
  margin: 0;
  background-color: rgb(30, 30, 47);
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
}

/* Monaco editor container styling */
.monaco-container {
  flex-grow: 1;
  width: 100%;
  height: 100%; /* Make sure the editor takes the full space */
  background-color: #1e1e2f;
  border-radius: 4px;
  resize: none;
}
</style>
