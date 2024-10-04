<template>
  <textarea id="chatInput" placeholder="Enter your request..." v-model="chatInput" :disabled="!serviceStore.chatEnabled"></textarea>
  <button @click="sendMessage" :disabled="!serviceStore.chatEnabled">Send</button>
</template>

<script setup>
import { ref } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';

const serviceStore = useServiceStore();
const chatInput = ref('');

const sendMessage = () => {
  serviceStore.sendChatMessage(chatInput.value);
  chatInput.value = '';  // Clear input after sending
};
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

#sendChat {
  padding: 10px;
  background-color: #1abc9c;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

#sendChat:hover {
  background-color: #16a085;
}
</style>
