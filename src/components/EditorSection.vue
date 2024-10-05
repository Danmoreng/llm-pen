<template>
  <div class="editor-section">
    <div class="editor">
      <h2>HTML</h2>
      <textarea v-model="editorStore.htmlContent"></textarea>
    </div>

    <div class="editor">
      <h2>CSS</h2>
      <textarea v-model="editorStore.cssContent"></textarea>
    </div>

    <div class="editor">
      <h2>JavaScript</h2>
      <textarea v-model="editorStore.jsContent"></textarea>
    </div>
  </div>
</template>

<script setup>
import { useEditorStore } from '@/stores/editorStore';

const editorStore = useEditorStore();
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

textarea {
  flex-grow: 1;
  width: 100%;
  padding: 10px;
  background-color: #1e1e2f;
  border: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #f8f8f2;
  border-radius: 4px;
  resize: none;
  min-height: 0;
}
</style>
