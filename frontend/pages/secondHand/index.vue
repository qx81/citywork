<template>
  <view class="page">
    <view class="nav-wrap">
      <view class="safe-top" />
      <view class="nav-bar">
        <view class="nav-btn" @click="goBack">←</view>
        <text class="nav-title">二手闲置</text>
        <view class="nav-btn" @click="goSearch">⌕</view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-box" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索手机数码、家具家电、图书乐器...</text>
      </view>
    </view>

    <view v-if="loading" class="loading-wrap"><text class="loading-text">正在加载闲置好物...</text></view>

    <view v-else-if="list.length" class="list-wrap">
      <view v-for="item in list" :key="item.id" class="card">
        <view class="head-row">
          <text class="tag">{{ item.condition_level || '成色未知' }}</text>
          <text class="time">{{ formatTime(item.created_at) }}</text>
        </view>
        <text class="title">{{ item.title || '未命名闲置' }}</text>
        <text class="desc">{{ item.description || '卖家暂未补充描述' }}</text>
        <view class="meta-row">
          <text class="meta">📍 {{ item.pickup_address || '自提地点待定' }}</text>
          <text class="meta">📞 {{ item.contact_phone || '联系信息私聊' }}</text>
        </view>
        <view class="foot-row">
          <view class="user"><text class="name">{{ item.username || '匿名卖家' }}</text></view>
          <view class="price-wrap">
            <text class="origin" v-if="item.original_price">¥{{ item.original_price }}</text>
            <text class="price">¥{{ item.price || 0 }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <view class="empty-icon">📦</view>
      <text class="empty-title">暂无相关二手闲置</text>
      <text class="empty-sub">试试更换关键词，或返回首页看看其他频道</text>
      <view class="empty-actions">
        <view class="btn ghost" @click="goHome">返回首页</view>
        <view class="btn primary" @click="loadData">重新筛选</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../../common/api';

const loading = ref(true);
const list = ref([]);

const goBack = () => (getCurrentPages().length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/index/index' }));
const goHome = () => uni.switchTab({ url: '/pages/index/index' });
const goSearch = () => uni.navigateTo({ url: '/pages/search/index' });

const formatTime = (time) => {
  if (!time) return '刚刚发布';
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return '刚刚发布';
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const loadData = async () => {
  loading.value = true;
  try {
    const data = await api.secondHandList();
    list.value = Array.isArray(data) ? data : [];
  } catch (e) {
    list.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.page { min-height: 100vh; background: #f3f5f8; }
.nav-wrap { position: sticky; top: 0; z-index: 10; background: #fff; box-shadow: 0 2rpx 12rpx rgba(31, 42, 61, .06); }
.safe-top { height: var(--status-bar-height); }
.nav-bar { height: 88rpx; display: flex; align-items: center; justify-content: space-between; padding: 0 24rpx; }
.nav-btn { width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; border-radius: 20rpx; background: #f2f6ff; color: #2f7eff; font-size: 34rpx; }
.nav-title { font-size: 34rpx; color: #1f2a3d; font-weight: 700; }
.search-section { padding: 20rpx 24rpx 10rpx; }
.search-box { height: 76rpx; border-radius: 999rpx; background: #fff; box-shadow: 0 6rpx 20rpx rgba(38, 67, 120, .08); display: flex; align-items: center; padding: 0 24rpx; }
.search-icon { margin-right: 10rpx; }
.search-placeholder { color: #8e98a8; font-size: 25rpx; }
.loading-wrap { padding: 120rpx 0; text-align: center; color: #7e8797; }
.list-wrap { padding: 8rpx 24rpx 30rpx; }
.card { background: #fff; border-radius: 28rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 10rpx 30rpx rgba(26,58,120,.08); }
.head-row,.foot-row { display:flex; justify-content:space-between; align-items:center; }
.tag { background:#ebf2ff; color:#2f7eff; padding:8rpx 18rpx; border-radius:999rpx; font-size:22rpx; }
.time { color:#9aa4b4; font-size:22rpx; }
.title { display:block; margin:12rpx 0 8rpx; font-size:32rpx; color:#1f2a3d; font-weight:700; }
.desc { color:#5f6d82; font-size:24rpx; line-height:1.6; }
.meta-row { margin-top:14rpx; display:flex; flex-wrap:wrap; gap:12rpx; }
.meta { background:#f6f8fc; color:#6f7c8f; padding:8rpx 14rpx; border-radius:14rpx; font-size:22rpx; }
.name { color:#526079; font-size:24rpx; }
.price-wrap { display:flex; align-items:baseline; gap:10rpx; }
.origin { color:#a1acbd; font-size:22rpx; text-decoration:line-through; }
.price { color:#2f7eff; font-size:34rpx; font-weight:700; }
.empty-wrap { margin: 80rpx 24rpx; padding: 60rpx 32rpx; background: #fff; border-radius: 28rpx; box-shadow: 0 12rpx 32rpx rgba(26,58,120,.08); text-align:center; }
.empty-icon { width:120rpx; height:120rpx; margin:0 auto 20rpx; border-radius:32rpx; background:linear-gradient(145deg,#edf3ff,#f7faff); display:flex; align-items:center; justify-content:center; font-size:58rpx; }
.empty-title { font-size:30rpx; color:#1f2a3d; font-weight:700; display:block; }
.empty-sub { margin-top:12rpx; color:#8a94a6; font-size:24rpx; display:block; }
.empty-actions { margin-top:28rpx; display:flex; justify-content:center; gap:16rpx; }
.btn { min-width:180rpx; padding:16rpx 22rpx; border-radius:999rpx; font-size:24rpx; }
.btn.ghost { background:#eef3ff; color:#2f7eff; }
.btn.primary { background:#2f7eff; color:#fff; }
</style>
