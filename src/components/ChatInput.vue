<template>
  <textarea
    id="chatInput"
    ref="chatInputRef"
    placeholder="Enter your request..."
    v-model="chatInput"
    :disabled="!serviceStore.chatEnabled || serviceStore.isLoading"
    @keydown="handleKeydown"
  ></textarea>
  <button
    @click="sendMessage"
    :disabled="!serviceStore.chatEnabled || serviceStore.isLoading"
  >
    Send
  </button>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';

const serviceStore = useServiceStore();
const chatInput = ref('');
const chatInputRef = ref(null); // Reference to the chat input element

// Function to handle the sending of the message
const sendMessage = () => {
  if (chatInput.value.trim() === '') return; // Prevent sending empty messages
  serviceStore.sendChatMessage(chatInput.value);
  chatInput.value = ''; // Clear input after sending
};

// Function to handle keydown event
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    // Prevent default behavior of enter key (creating a new line)
    event.preventDefault();
    // Send message if enter is pressed without shift
    sendMessage();
  }
};

// Watch for changes in isLoading and set focus when loading is done
watch(
  () => serviceStore.isLoading,
  async (newValue) => {
    if (!newValue) {
      // Wait for the DOM to finish updating, then set focus
      await nextTick();
      chatInputRef.value?.focus();
    }
  }
);
</script>

<style scoped>
/* Add any styles for the chat input */
#chatInput {
  width: 100%;
  height: 100px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: none;
  padding: 10px;
  border-radius: 5px;
  background-color: #34495e;
  color: #ecf0f1;
  font-size: 16px;
  resize: none;
}

#chatInput:disabled {
  opacity: 0.6;
}

/* Send button styling */
button {
  padding: 10px;
  background-color: #1abc9c;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: initial;
}

button:hover:enabled {
  background-color: #16a085;
}
</style>
