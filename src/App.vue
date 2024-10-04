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
</style>
