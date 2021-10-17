<template>
  <div class="popup" v-if="show">
    <div class="popup__content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "PopupWindow",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.popup {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #00000080;
  position: fixed;
  display: flex;
  &__content {
    margin: auto;
    background: white;
    border-radius: 12px;
    min-height: 64px;
    min-width: 64px;
  }
}
</style>
