<!-- src/App.vue -->
<template>
  <div id="app">
    <HomeView></HomeView>
  </div>
</template>

<script>
import HomeView from "./views/HomeView.vue";

export default {
  name: 'App',
  components: {HomeView},
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  height: 100vh; /* Keep the entire layout at 100vh */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1e1e2f;
  overflow: hidden; /* Prevent body from scrolling */
}

.form-container {
  display: flex;
  flex-direction: column; /* Stack form groups vertically */
  gap: 10px; /* Add space between each form group */
}

.form-group {
  display: flex;
  align-items: center; /* Align label and select vertically in the center */
  gap: 10px; /* Add space between label and select */
  width: 100%; /* Ensure form-group takes full width */
}

label {
  flex-basis: 150px; /* Set a fixed width for labels to align them */
  flex-shrink: 0; /* Prevent labels from shrinking */
}

input, select {
  flex-grow: 1; /* Make the select elements take up the remaining space */
}

ul, ol {
  padding-left: 2rem;
}

pre {
  background: #2e2e2e;
  padding: 1rem;
  border-radius: 4px;
  margin: 10px 0 20px 0;
}

code {
  font-family: 'Courier New', Courier, monospace;
  white-space: break-spaces;
}

</style>
