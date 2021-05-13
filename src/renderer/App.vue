<template>
  <MDBNavbar expand="lg" light bg="light" container>
    <MDBNavbarBrand href="#">Brand</MDBNavbarBrand>
    <MDBNavbarToggler
      @click="collapse1 = !collapse1"
      target="#navbarSupportedContent"
    ></MDBNavbarToggler>
    <MDBCollapse v-model="collapse1" id="navbarSupportedContent">
      <MDBNavbarNav class="mb-2 mb-lg-0">
        <MDBNavbarItem to="#" active> Home </MDBNavbarItem>
        <MDBNavbarItem href="#"> Link </MDBNavbarItem>
        <MDBNavbarItem>
          <!-- Navbar dropdown -->
          <MDBDropdown class="nav-item" v-model="dropdown1">
            <MDBDropdownToggle
              tag="a"
              class="nav-link"
              @click="dropdown1 = !dropdown1"
              >Dropdown</MDBDropdownToggle
            >
            <MDBDropdownMenu aria-labelledby="dropdownMenuButton">
              <MDBDropdownItem href="#">Action</MDBDropdownItem>
              <MDBDropdownItem href="#">Another Action</MDBDropdownItem>
              <MDBDropdownItem href="#">Something else here</MDBDropdownItem>
            </MDBDropdownMenu>
          </MDBDropdown>
        </MDBNavbarItem>
        <MDBNavbarItem to="#" disabled> Disabled </MDBNavbarItem>
      </MDBNavbarNav>
      <!-- Search form -->
      <form class="d-flex input-group w-auto">
        <input
          type="search"
          class="form-control"
          placeholder="Type query"
          aria-label="Search"
        />
        <MDBBtn outline="primary"> Search </MDBBtn>
      </form>
    </MDBCollapse>
  </MDBNavbar>
  <!--  <div class="container pt-5">-->
  <!--    <div class="card">-->
  <!--      <div class="form-control">-->
  <!--        <input type="text" v-model="version" />-->
  <!--        <input type="text" v-model="username" />-->
  <!--        <button class="btn" v-if="progress.value < 0" @click="playButton">Играть</button>-->
  <!--        <span v-if="progress.value >= 0"-->
  <!--          >{{ progress.text }}: {{ progress.value * 100 }}%</span-->
  <!--        >-->
  <!--      </div>-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ipcRenderer } from "electron";

import {
  MDBBtn,
  MDBNavbar,
  MDBNavbarToggler,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBCollapse,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-vue-ui-kit";

export default defineComponent({
  data() {
    return {
      version: "1.16.5",
      username: "player",
      progress: {
        value: -1,
        text: "",
      },
    };
  },
  name: "App",
  components: {},
  methods: {
    playButton() {
      ipcRenderer.send("play", {
        version: this.version,
        username: this.username,
      });
    },
  },
  mounted() {
    ipcRenderer.on("progress", (event, args) => {
      this.progress = args;
      console.log(args);
    });
  },
});
</script>

<style lang="scss">
//@import "./assets/theme.css";
@import "~@/../mdb/scss/index.free.scss";
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  //font-family: Avenir, Helvetica, Arial, sans-serif;
  //-webkit-font-smoothing: antialiased;
  //-moz-osx-font-smoothing: grayscale;
  //text-align: center;
  //color: #2c3e50;
  //margin-top: 60px;
}
</style>
