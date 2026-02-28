<template>
  <view class="page">
    <view class="search" @click="goSearch">🔍 搜索技能/二手/约玩/商家</view>
    <view class="grid">
      <navigator url="/pages/skill/index">技能服务</navigator>
      <navigator url="/pages/secondHand/index">二手闲置</navigator>
      <navigator url="/pages/play/index">线下约玩</navigator>
      <navigator url="/pages/business/index">商家推荐</navigator>
    </view>
    <view class="card" v-for="item in nearbyList" :key="item.id">
      <text>{{ item.title }}（{{ item.type }}）</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../common/api';

const nearbyList = ref([]);
const goSearch = () => uni.navigateTo({ url: '/pages/search/index' });

onMounted(async () => {
  nearbyList.value = await api.nearby('杭州');
});
</script>

<style scoped>
.page{padding:24rpx}
.search{background:#fff;border-radius:999rpx;padding:18rpx 24rpx;color:#999;margin-bottom:20rpx}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16rpx;margin-bottom:20rpx}
.grid navigator{background:#2b6cff;color:#fff;border-radius:14rpx;padding:24rpx;text-align:center}
.card{background:#fff;padding:20rpx;border-radius:14rpx;margin-bottom:12rpx}
</style>
