<template>
  <view class="page">
    <view class="nav-wrap"><view class="safe-top" /><view class="nav-bar"><view class="nav-action" @click="goBack">←</view><text class="nav-title">活动详情</text><view class="nav-actions-right"><view class="nav-action" @click="toggleFavorite">{{ isFavorite ? '★' : '☆' }}</view><view class="nav-action" @click="shareDetail">↗</view></view></view></view>
    <scroll-view v-if="detail" scroll-y class="page-scroll">
      <view class="card">
        <text class="title">{{ detail.title }}</text>
        <text class="desc">{{ detail.description }}</text>
        <view class="chips"><text class="chip">{{ detail.play_type }}</text><text class="chip">{{ formatTime(detail.play_time) }}</text><text class="chip">{{ detail.location }}</text></view>
        <view class="budget">预算参考 ¥{{ detail.budget }}</view>
      </view>
      <view class="card">
        <text class="sec-title">参与信息</text>
        <view class="row"><text>当前人数</text><text>{{ detail.current_people }}/{{ detail.max_people }}</text></view>
        <view class="row"><text>联系方式</text><text>{{ maskedPhone }}</text></view>
      </view>
    </scroll-view>
    <view v-else class="state">正在加载活动详情...</view>
    <view class="bottom-bar" v-if="detail"><view class="side" @click="contactOrganizer">联系</view><view class="main" @click="primaryAction">立即报名</view></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../common/api';

const isFavorite = ref(false);
const detail = ref(null);
const mockPlayDetailMap = {
  1: { id: 1, title: '周末羽毛球 2 小时局', description: '新手友好，场地已订，建议自带球拍。', play_type: '羽毛球', play_time: '2026-03-27 19:30:00', location: '市体育中心羽毛球馆', budget: 35, current_people: 3, max_people: 6, contact_phone: '13700137000' },
  2: { id: 2, title: '夜场剧本杀拼车拼本', description: '恐怖本谨慎报名，支持新手引导。', play_type: '剧本杀', play_time: '2026-03-29 20:00:00', location: '中央广场 5F 侦探馆', budget: 88, current_people: 4, max_people: 7, contact_phone: '13600136000' }
};

const maskedPhone = computed(() => {
  const phone = String(detail.value?.contact_phone || '');
  return phone.length >= 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '私聊获取';
});

const formatTime = (time) => {
  const d = new Date(time);
  if (Number.isNaN(d.getTime())) return time || '时间待定';
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const goBack = () => (getCurrentPages().length > 1 ? uni.navigateBack() : uni.navigateTo({ url: '/pages/play/index' }));
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // 对应接口：POST /api/collection/add 或 DELETE /api/collection/remove
};
const shareDetail = () => uni.showToast({ title: '已触发分享', icon: 'none' });
const contactOrganizer = () => uni.showToast({ title: '联系发起人中', icon: 'none' });
const primaryAction = () => uni.showToast({ title: '报名请求已发送', icon: 'none' }); // 对应接口：POST /api/play/join/:id

async function fetchPlayDetail(id) {
  try {
    detail.value = await api.playDetail(id);
  } catch (e) {
    detail.value = mockPlayDetailMap[id] || mockPlayDetailMap[1];
  }
}

onLoad((query) => fetchPlayDetail(Number(query?.id || 1)));
</script>

<style scoped>
.page { min-height: 100vh; background: #f3f5f8; padding-bottom: 120rpx; }
.nav-wrap { position: sticky; top: 0; background: #f3f5f8; z-index: 10; }
.safe-top { height: var(--status-bar-height); }
.nav-bar { height: 88rpx; display: flex; align-items: center; justify-content: space-between; padding: 0 24rpx; }
.nav-action { width: 64rpx; height: 64rpx; border-radius: 20rpx; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(25,45,86,.08); }
.nav-actions-right { display: flex; gap: 12rpx; }
.nav-title { font-size: 32rpx; font-weight: 700; }
.page-scroll { height: calc(100vh - var(--status-bar-height) - 88rpx - 120rpx); padding: 16rpx 24rpx; box-sizing: border-box; }
.card { background: #fff; border-radius: 32rpx; padding: 24rpx; box-shadow: 0 12rpx 34rpx rgba(32,58,108,.08); margin-bottom: 16rpx; }
.title { font-size: 36rpx; font-weight: 700; color: #1f2a3d; }
.desc { display:block; margin-top: 10rpx; color: #5d6b82; line-height: 1.7; }
.chips { margin-top: 16rpx; display:flex; flex-wrap: wrap; gap: 10rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #edf3ff; color: #2f7eff; font-size: 22rpx; }
.budget { margin-top: 18rpx; font-size: 38rpx; font-weight: 800; color: #2f7eff; }
.sec-title { font-size: 30rpx; font-weight: 700; margin-bottom: 12rpx; display:block; }
.row { display:flex; justify-content: space-between; padding: 14rpx 0; border-bottom: 1rpx solid #eef2f7; color: #415067; }
.bottom-bar { position: fixed; left: 20rpx; right: 20rpx; bottom: 20rpx; background: #fff; border-radius: 28rpx; padding: 14rpx; display: flex; gap: 12rpx; box-shadow: 0 14rpx 36rpx rgba(30,51,94,.14); }
.side { width: 180rpx; border-radius: 20rpx; background: #f4f7fc; display: flex; align-items: center; justify-content: center; }
.main { flex: 1; border-radius: 20rpx; background: linear-gradient(135deg, #2f7eff, #5a9bff); color: #fff; font-size: 30rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; }
</style>
