<template>
  <div class="page">
    <div class="content">
      <h1>Пашол нахуй</h1>
    </div>
    <div class="footer">
      <button class="play-button" @click="playButton">Играть</button>
    </div>
    <ProgressBar
      v-if="progress.value >= 0"
      :progress="progress.value"
      :text="progress.text"
    ></ProgressBar>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import ProgressBar from "@/renderer/components/ProgressBar";

export default {
  name: "Main",
  components: {
    ProgressBar,
  },
  data() {
    return {
      version: "1.17.1",
      username: "SukaBlyad",
      progress: {
        value: -1,
        text: "",
      },
    };
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
};
</script>

<style lang="scss" scoped>
$accent-color: #aa0000;
.page {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  background: #b3b3b3;
}
.content {
  flex: 1 1 auto;
}
.footer {
  flex: 0 0 60px;
  display: flex;
  justify-content: center;
  background: #262626;
}
.play-button {
  //position: fixed;
  background-color: $accent-color;
  //background-image: url("../img/play_button.png");
  height: 50px;
  width: 244px;
  outline: 2px solid black;
  left: 50%;
  //transform: translateX(-50%) translateY(-12px);
  display: block;
  color: white;
  //font-family: MinecraftTen, sans-serif;
  font-size: 24px;
  text-shadow: 0 4px 4px #00000040;
  box-shadow: 0 8px 4px #00000040;
  &:hover {
    filter: brightness(110%);
  }
  &:active {
    filter: brightness(90%);
  }
}
</style>
