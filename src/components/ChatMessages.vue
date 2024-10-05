<template>
  <div id="chatMessages" ref="chatContainer" class="chat-container">
    <!-- Loop through the messages and render them based on their role -->
    <div v-for="(message, index) in chatMessages" :key="index" :class="messageClass(message)">
      <!-- User and assistant messages -->
      <p v-if="message.role === 'user' || message.role === 'assistant'" v-html="formatMessage(message.content)"></p>

      <!-- Function call messages -->
      <div v-if="message.role === 'function'" class="function-call-block">
        <strong @click="toggleExpand(index)" class="collapsible-header">
          {{ message.name }} (Click to {{ expandedIndices.includes(index) ? 'Collapse' : 'Expand' }}):
        </strong>
        <pre v-if="expandedIndices.includes(index)" v-html="escapeHtml(message.content)"></pre>
      </div>

      <!-- Error messages -->
      <p v-if="message.role === 'system'" class="error-message">{{ message.content }}</p>
    </div>

    <!-- Display loading dots if the LLM is processing -->
    <div v-if="serviceStore.isLoading" class="loading-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';

// Access the chatMessages from the store
const serviceStore = useServiceStore();
const chatMessages = serviceStore.chatMessages;

// Reference for the chat container (to control scroll)
const chatContainer = ref(null);

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

// Watch for changes in chat messages and scroll to the bottom when a new message is added
watch(chatMessages, async () => {
  // Wait for the DOM to finish updating
  await nextTick();
  // Scroll the chat container to the bottom
  chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
});

// Escape HTML for function calls to prevent injection issues
function escapeHtml(unsafeString = '') {
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
  if (message.role === 'function') return 'function-call-message';
  if (message.role === 'system') return 'system-message'; // Add class for system messages
}
</script>

<style scoped>
/* Chat message styles */
.user-message {
  background-color: #1c4a77; /* Different background color for user */
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0 0 30px;
  color: #ecf0f1;
}

.assistant-message {
  background-color: #153350; /* Different background color for assistant */
  padding: 10px;
  border-radius: 5px;
  margin: 10px 30px 0 0;
  color: #ecf0f1;
}

/* Error (system) message styles */
.error-message {
  background-color: #e74c3c; /* Red background for errors */
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  color: white;
  font-weight: bold;
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
  margin-top: 10px;
  flex-grow: 1;
  overflow-y: auto; /* Allow scrolling when content overflows */
}

/* Loading dots styles */
.loading-dots {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.dot {
  width: 10px;
  height: 10px;
  margin: 0 5px;
  background-color: #cccccc;
  border-radius: 50%;
  animation: bounce 1s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
