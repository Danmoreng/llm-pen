// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

// Create Vue app
const app = createApp(App);

// Use Pinia for state management
app.use(createPinia());

app.mount('#app');
