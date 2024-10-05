<template>
  <div id="chatMessages" ref="chatContainer" class="chat-container">
    <!-- Loop through the messages and render them based on their role -->
    <div v-for="(message, index) in chatMessages" :key="index" :class="messageClass(message)">
      <!-- User and assistant messages -->
      <p v-if="message.role === 'user' || message.role === 'assistant'" v-html="marked(message.content)"></p>

      <!-- Function call messages -->
      <div v-if="message.role === 'function'" class="function-call-block">
        <div class="function-call-header" @click="toggleExpand(index)">
          <strong>{{ message.name }}</strong>
          <span class="expand-toggle">
            {{ expandedIndices.includes(index) ? '▲ Hide Details' : '▼ Show Details' }}
          </span>
        </div>
        <template class="function-call-content" v-if="expandedIndices.includes(index)">
          <span v-html="escapeHtml(message.content)"></span>
        </template>
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
import { marked } from 'marked';

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
  return marked("```json\n" + JSON.stringify(JSON.parse(unsafeString), null, 2));
}

function messageClass(message) {
  if (message.role === 'user') return 'user-message';
  if (message.role === 'assistant') return 'assistant-message';
  if (message.role === 'function') return 'function-call-message';
  if (message.role === 'system') return 'system-message'; // Add class for system messages
}
</script>

<style scoped>
/* Function call block styles */
.function-call-block {
  border-radius: 5px;
  margin: 10px 0;
}

.function-call-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  background-color: #561a59;
  font-weight: bold;
}

/* Style for the expand/collapse toggle */
.expand-toggle {
  font-size: 0.9em;
}

/* Adjust other styles for better spacing and readability */
.user-message {
  background-color: #1c4a77;
  padding: 12px;
  border-radius: 5px;
  margin: 10px 0 0 30px;
  color: #ecf0f1;
}

.assistant-message {
  background-color: #153350;
  padding: 12px;
  border-radius: 5px;
  margin: 10px 30px 0 0;
  color: #ecf0f1;
}

/* Error message styles */
.error-message {
  background-color: #e74c3c;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  color: white;
  font-weight: bold;
}

/* Chat container adjustments */
.chat-container {
  margin-top: 10px;
  padding-bottom: 10px;
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
