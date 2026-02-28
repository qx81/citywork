<template>
  <view class="page">
    <view class="card">
      <text class="title">个人中心</text>
      <navigator url="/pages/profile/index">编辑资料</navigator><navigator url="/pages/collection/index">我的收藏</navigator><navigator url="/pages/message/index">消息通知</navigator>
    </view>
  </view>
</template>

<script setup>
</script>

<style scoped>
.page{padding:24rpx;}
.card{background:#fff;border-radius:16rpx;padding:24rpx;box-shadow:0 8rpx 24rpx rgba(0,0,0,.04)}
.title{font-size:34rpx;font-weight:600;margin-bottom:16rpx;display:block}
</style>
