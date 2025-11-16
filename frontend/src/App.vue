<template>
    <div id="app">
      <h1 style="text-align:center;margin-top:40px;">基础运镜控制面板</h1>
      <ShotControl />
    </div>
</template>
<script setup lang="ts">
import ShotControl from './components/ShotControl.vue'
</script>
<style>
#app {
  font-family:Avenir,Helvetica,Arial,sans-serif;
  max-width:800px;
  margin:0 auto;
  padding:20px;
}
</style>