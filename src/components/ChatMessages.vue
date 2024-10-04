<template>
  <div id="chatMessages" class="chat-container">
    <!-- Loop through the messages and render them based on their role -->
    <div v-for="(message, index) in chatMessages" :key="index" :class="messageClass(message)">
      <!-- User and assistant messages -->
      <p v-if="message.role === 'user' || message.role === 'assistant'" v-html="formatMessage(message.content)"></p>

      <!-- Function call messages -->
      <div v-if="message.role === 'function-call'" class="function-call-block">
        <strong @click="toggleExpand(index)" class="collapsible-header">
          {{ getFunctionName(message.content) }} (Click to {{ expandedIndices.includes(index) ? 'Collapse' : 'Expand' }}):
        </strong>
        <pre v-if="expandedIndices.includes(index)" v-html="escapeHtml(getFunctionArgs(message.content))"></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';

// Access the chatMessages from the store
const serviceStore = useServiceStore();
const chatMessages = serviceStore.chatMessages;

// Tracks which function call messages are expanded
const expandedIndices = ref([]);

// Function to toggle expanded/collapsed state
const toggleExpand = (index) => {
  if (expandedIndices.value.includes(index)) {
    expandedIndices.value = expandedIndices.value.filter((i) => i !== index); // Collapse
  } else {
    expandedIndices.value.push(index); // Expand
  }
};

// Function to extract the function name from the message content
const getFunctionName = (content) => {
  try {
    const parsedContent = JSON.parse(content);
    return parsedContent.name || 'Function Call';
  } catch {
    return 'Function Call';
  }
};

// Function to extract and format the function arguments as JSON
const getFunctionArgs = (content) => {
  try {
    const parsedContent = JSON.parse(content);
    return JSON.stringify(parsedContent.arguments, null, 2); // Pretty-print JSON arguments
  } catch {
    return content;
  }
};

// Escape HTML for function calls to prevent injection issues
function escapeHtml(unsafeString) {
  return unsafeString
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Format regular messages
const formatMessage = (content) => {
  return content; // For now, just return the content as it is
};

function messageClass(message) {
  if (message.role === 'user') return 'user-message';
  if (message.role === 'assistant') return 'assistant-message';
  if (message.role === 'function-call') return 'function-call-message';
}
</script>

<style scoped>
/* Chat message styles */
.user-message {
  background-color: #34495e;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  color: #ecf0f1;
}

.assistant-message {
  background-color: #2c3e50;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  color: #ecf0f1;
}

/* Function call block style */
.function-call-block {
  background-color: #1b2631;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  font-family: 'Courier New', Courier, monospace;
  color: #f1c40f;
}

.collapsible-header {
  cursor: pointer;
  text-decoration: underline;
  display: block;
  margin-bottom: 5px;
}

/* Preformatted function call content */
.function-call-block pre {
  background-color: #2c3e50;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

/* Make the chat container scrollable and take as much space as possible */
.chat-container {
  flex-grow: 1;
  overflow-y: auto; /* Allow scrolling when content overflows */
}

/* To make sure chat container grows with the page, ensure it's inside a flex container */
#app, .container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: row;
}

.chat-section {
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-section, .output-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>
