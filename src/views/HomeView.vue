<template>
  <div class="home">
    <nav>
      <router-link to="/index">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/">Module</router-link>
    </nav>

    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  }
}
</script>
