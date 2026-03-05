<template>
  <view class="page">
    <view class="card">
      <text class="title">统一发布入口</text>
      <button @click="showTypeSelector">选择发布类型</button>
    </view>
  </view>
</template>

<script setup>
const showTypeSelector = () => {
  uni.showActionSheet({
    itemList: ['技能', '二手', '约玩', '商家']
  })
}
</script>

<style scoped>
.page{padding:24rpx;}
.card{background:#fff;border-radius:16rpx;padding:24rpx;box-shadow:0 8rpx 24rpx rgba(0,0,0,.04)}
.title{font-size:34rpx;font-weight:600;margin-bottom:16rpx;display:block}
</style>
