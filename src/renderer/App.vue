<template class="">
  <MDBNavbar expand="sm" light bg="light" container>
    <MDBNavbarBrand href="#">Meloncher</MDBNavbarBrand>
    <MDBNavbarNav class="mb-2 mb-sm-0">
      <MDBNavbarItem to="#" active> Играть </MDBNavbarItem>
      <MDBNavbarItem href="#"> Пойти нахуй </MDBNavbarItem>
    </MDBNavbarNav>
  </MDBNavbar>
  <MDBContainer
    class="d-flex flex-column flex-grow-1 mw-100"
    style="background-color: blueviolet"
  >
    <MDBContainer class="flex-grow-1">
      <div class="card">
        <div class="form-control">
          <MDBInput v-model="version" />
          <MDBInput v-model="username" />
          <MDBBtn color="primary" v-if="progress.value < 0" @click="playButton"
            >Играть</MDBBtn
          >
          <!--        <span v-if="progress.value >= 0"-->
          <!--          >{{ progress.text }}: {{ progress.value * 100 }}%</span-->
          <!--        >-->
          <MDBProgress :height="20" v-if="progress.value >= 0">
            <MDBProgressBar :value="progress.value * 100">{{
              progress.text
            }}</MDBProgressBar>
          </MDBProgress>
        </div>
      </div>
    </MDBContainer>
    <MDBFooter class="" :text="['center', 'lg-start']">
      <MDBContainer class="p-4">
        <MDBDropdown dropup v-model="dropdown2">
          <MDBDropdownToggle @click="dropdown2 = !dropdown2"
          >Версия</MDBDropdownToggle
          >
          <MDBDropdownMenu aria-labelledby="dropdownMenuButton">
            <MDBDropdownItem href="#">1</MDBDropdownItem>
            <MDBDropdownItem href="#">2</MDBDropdownItem>
            <MDBDropdownItem href="#">3</MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
        <MDBDropdown dropup v-model="dropdown1">
          <MDBDropdownToggle @click="dropdown1 = !dropdown1"
            >Хуйня крч</MDBDropdownToggle
          >
          <MDBDropdownMenu aria-labelledby="dropdownMenuButton">
            <MDBDropdownItem href="#">Пойти на хуй</MDBDropdownItem>
            <MDBDropdownItem href="#">Пойти в пизду</MDBDropdownItem>
            <MDBDropdownItem href="#">Сожрать говно</MDBDropdownItem>
            <MDBDropdownItem divider />
            <form class="input-group">
              <MDBInput
                label="Войти по нику"
              />
              <MDBBtn>Войти</MDBBtn>
            </form>
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBContainer>
    </MDBFooter>
  </MDBContainer>
</template>

<script>
import { defineComponent, ref } from "vue";
import { ipcRenderer } from "electron";

import {
  MDBProgress,
  MDBProgressBar,
  MDBInput,
  MDBBtn,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBFooter,
  MDBContainer,
} from "mdb-vue-ui-kit";

export default defineComponent({
  setup() {
    const dropdown1 = ref(false);
    const dropdown2 = ref(false);

    return {
      dropdown1,
      dropdown2,
    };
  },
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
  components: {
    MDBProgress,
    MDBProgressBar,
    MDBInput,
    MDBBtn,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarNav,
    MDBNavbarItem,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBFooter,
    MDBContainer,
  },
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
@import "/mdb/scss/index.free.scss";
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100%;
  background-color: yellowgreen;
  display: flex;
  flex-direction: column;
  //font-family: Avenir, Helvetica, Arial, sans-serif;
  //-webkit-font-smoothing: antialiased;
  //-moz-osx-font-smoothing: grayscale;
  //text-align: center;
  //color: #2c3e50;
  //margin-top: 60px;
}
</style>
