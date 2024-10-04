<template>
  <div class="editor-section">
    <h2>Code Editor</h2>
    <!-- Simple textarea for editing code -->
    <textarea v-model="editorStore.codeContent" id="codeEditor" rows="10"></textarea>
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

.editor-section h2 {
  color: #f8f8f2;
  margin-bottom: 10px;
  margin-left: 10px;
}

#codeEditor {
  flex-grow: 1;
  width: 100%;
  padding: 10px;
  background-color: #1e1e2f;
  border: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #f8f8f2;
  border-radius: 4px;
}
</style>
