<template>
  <div class="progressBar">
    <div class="progressBar__progress" :style="{ width: progress * 100 + '%' }">
<!--      {{ text }}-->
    </div>
    <div class="progressBar__text">{{ text }}</div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: {
    progress: Number,
    text: String,
  },
  data() {
    return {
    };
  },
};
</script>

<style lang="scss" scoped>
.progressBar {
  position: relative;
  display: flex;
  height: 24px;
  width: auto;
  background: black;
  color: white;
  //&:before {
  //  content: var(text);
  //  display: flex;
  //  align-items: center;
  //  position: absolute;
  //  left: 0;
  //  top: 0;
  //  bottom: 0;
  //  width: var(progress);
  //  background-color: red;
  //}
  &__progress {
    position: absolute;
    background: red;
    height: 24px;
    width: 0;
  }
  &__text {
    //background-color: #0dcaf0;
    position: absolute;
    display: block;
    color: white;
    align-items: center;
    justify-content: center;
    //left: 0;
    //bottom: 0;

  }
}
</style>
