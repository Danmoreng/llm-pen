<template>
  <div class="editor-section">
    <div class="editor">
      <h2>HTML Editor</h2>
      <textarea v-model="editorStore.htmlContent" rows="10"></textarea>
    </div>

    <div class="editor">
      <h2>CSS Editor</h2>
      <textarea v-model="editorStore.cssContent" rows="10"></textarea>
    </div>

    <div class="editor">
      <h2>JavaScript Editor</h2>
      <textarea v-model="editorStore.jsContent" rows="10"></textarea>
    </div>
  </div>
</template>

<script setup>
import { useEditorStore } from '@/stores/editorStore';

const editorStore = useEditorStore();
</script>

<style scoped>
.editor-section {
  flex: 1;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  color: #f8f8f2;
}

.editor {
  flex: 1;
  margin-bottom: 20px;
}

.editor h2 {
  color: #f8f8f2;
  margin-bottom: 10px;
}

textarea {
  width: 100%;
  padding: 10px;
  background-color: #1e1e2f;
  border: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #f8f8f2;
  border-radius: 4px;
  height: 200px;
}
</style>
