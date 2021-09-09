<template>
  <div class="navbar">
    <div @click="$router.push('/')" class="navbar__link">Играть</div>
    <div @click="$router.push('/settings')" class="navbar__link">Настройки</div>
<!--    <div @click="$router.push('/')">Vue 3</div>-->
<!--    <div class="navbar__btns">-->
<!--      <button @click="$router.push('/posts')">Посты</button>-->
<!--      <button style="margin-left: 20px" @click="$router.push('/about')">-->
<!--        О сайте-->
<!--      </button>-->
<!--      <button style="margin-left: 20px" @click="$router.push('/store')">-->
<!--        store-->
<!--      </button>-->
<!--      <button style="margin-left: 20px" @click="$router.push('/composition')">-->
<!--        Composition-->
<!--      </button>-->
<!--    </div>-->
  </div>
</template>

<script>
export default {
  name: "Navbar",
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 40px;
  background: #262626;
  color: white;
  box-shadow: 2px 2px 4px #00000080;
  display: flex;
  align-items: center;
  padding: 0 15px;
  &__link {
    margin-right: 15px;
  }
}
</style>
