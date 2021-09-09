<template>
  <div class="app">
    <navbar></navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from "@/renderer/components/Navbar";

export default {
  components: {
    Navbar
  },
  name: "App",
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");
* {
  font-family: "Roboto", sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  height: 100%;
  //border-radius: 10px;
}
.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  //border-radius: 16px;
  //overflow: hidden;
  background-color: #262626;
  box-shadow: black;
}
html,
body {
  background-color: #262626;
  //background-color: transparent;
}
</style>
