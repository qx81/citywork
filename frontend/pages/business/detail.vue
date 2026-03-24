<template>
  <view class="page">
    <view class="nav-wrap"><view class="safe-top" /><view class="nav-bar"><view class="nav-action" @click="goBack">←</view><text class="nav-title">商家详情</text><view class="nav-actions-right"><view class="nav-action" @click="toggleFavorite">{{ isFavorite ? '★' : '☆' }}</view><view class="nav-action" @click="shareDetail">↗</view></view></view></view>
    <scroll-view v-if="detail" scroll-y class="page-scroll">
      <view class="card">
        <view class="head"><text class="title">{{ detail.name }}</text><text class="score">⭐ {{ detail.score }}</text></view>
        <text class="desc">{{ detail.recommend_reason }}</text>
        <view class="meta"><text>📍 {{ detail.address }}</text><text>👍 {{ detail.likes }} 人觉得不错</text></view>
        <view class="cost">人均 ¥{{ detail.avg_cost }}</view>
      </view>
      <view class="card"><text class="sec-title">到店信息</text><view class="row"><text>营业时段</text><text>{{ detail.open_time || '10:00-22:00' }}</text></view><view class="row"><text>联系电话</text><text>{{ maskedPhone }}</text></view></view>
    </scroll-view>
    <view v-else class="state">正在加载商家详情...</view>
    <view class="bottom-bar" v-if="detail"><view class="side" @click="contactShop">联系商家</view><view class="main" @click="primaryAction">立即到店</view></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../common/api';

const isFavorite = ref(false);
const detail = ref(null);
const mockBusinessDetailMap = {
  1: { id: 1, name: '小鹿咖啡烘焙馆', address: '文创园 A3 栋 1F', score: 4.8, recommend_reason: '手冲稳定，安静适合办公，甜品更新快。', avg_cost: 42, likes: 268, contact_phone: '13500135000', open_time: '09:30-22:30' },
  2: { id: 2, name: '城南精洗车房', address: '南湖大道 88 号', score: 4.7, recommend_reason: '洗护流程标准，提供等候休息区。', avg_cost: 78, likes: 193, contact_phone: '13400134000', open_time: '08:00-21:00' }
};

const maskedPhone = computed(() => {
  const phone = String(detail.value?.contact_phone || '');
  return phone.length >= 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '门店私聊获取';
});

const goBack = () => (getCurrentPages().length > 1 ? uni.navigateBack() : uni.navigateTo({ url: '/pages/business/index' }));
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // 对应接口：POST /api/collection/add 或 DELETE /api/collection/remove
};
const shareDetail = () => uni.showToast({ title: '已触发分享', icon: 'none' });
const contactShop = () => uni.showToast({ title: '联系商家中', icon: 'none' });
const primaryAction = () => uni.showToast({ title: '已打开到店导航', icon: 'none' });

async function fetchBusinessDetail(id) {
  try {
    detail.value = await api.businessDetail(id);
  } catch (e) {
    detail.value = mockBusinessDetailMap[id] || mockBusinessDetailMap[1];
  }
}

onLoad((query) => fetchBusinessDetail(Number(query?.id || 1)));
</script>

<style scoped>
.page { min-height: 100vh; background: #f3f5f8; padding-bottom: 120rpx; }
.nav-wrap { position: sticky; top: 0; z-index: 10; background: #f3f5f8; }
.safe-top { height: var(--status-bar-height); }
.nav-bar { height: 88rpx; display: flex; align-items: center; justify-content: space-between; padding: 0 24rpx; }
.nav-action { width: 64rpx; height: 64rpx; border-radius: 20rpx; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(25,45,86,.08); }
.nav-actions-right { display: flex; gap: 12rpx; }
.nav-title { font-size: 32rpx; font-weight: 700; }
.page-scroll { height: calc(100vh - var(--status-bar-height) - 88rpx - 120rpx); padding: 16rpx 24rpx; box-sizing: border-box; }
.card { background: #fff; border-radius: 32rpx; padding: 24rpx; box-shadow: 0 12rpx 34rpx rgba(32,58,108,.08); margin-bottom: 16rpx; }
.head { display:flex; justify-content: space-between; align-items: center; }
.title { font-size: 36rpx; font-weight: 700; color: #1f2a3d; }
.score { color: #f7a400; font-weight: 600; }
.desc { display:block; margin-top: 10rpx; color: #5d6b82; line-height: 1.7; }
.meta { margin-top: 16rpx; display: flex; flex-direction: column; gap: 8rpx; color: #607086; font-size: 24rpx; }
.cost { margin-top: 18rpx; font-size: 38rpx; font-weight: 800; color: #2f7eff; }
.sec-title { font-size: 30rpx; font-weight: 700; margin-bottom: 12rpx; display:block; }
.row { display:flex; justify-content: space-between; padding: 14rpx 0; border-bottom: 1rpx solid #eef2f7; color: #415067; }
.bottom-bar { position: fixed; left: 20rpx; right: 20rpx; bottom: 20rpx; background: #fff; border-radius: 28rpx; padding: 14rpx; display: flex; gap: 12rpx; box-shadow: 0 14rpx 36rpx rgba(30,51,94,.14); }
.side { width: 200rpx; border-radius: 20rpx; background: #f4f7fc; display: flex; align-items: center; justify-content: center; }
.main { flex: 1; border-radius: 20rpx; background: linear-gradient(135deg, #2f7eff, #5a9bff); color: #fff; font-size: 30rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; }
</style>
