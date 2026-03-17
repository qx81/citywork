<template>
  <view class="page">
    <view class="nav-wrap">
      <view class="safe-top" />
      <view class="nav-bar">
        <view class="nav-btn" @click="goBack">←</view>
        <text class="nav-title">技能服务</text>
        <view class="nav-btn" @click="goSearch">⌕</view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-box" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索空调清洗、摄影、维修、家教...</text>
      </view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">正在加载技能服务...</text>
    </view>

    <view v-else-if="serviceList.length" class="list-wrap">
      <view v-for="service in serviceList" :key="service.id" class="service-card">
        <view class="card-top">
          <text class="category-pill">{{ service.category || '技能服务' }}</text>
          <text class="time-text">{{ formatTime(service.created_at) }}</text>
        </view>
        <text class="service-title">{{ service.title || '未命名服务' }}</text>
        <text class="service-desc">{{ service.description || '暂无服务说明' }}</text>

        <view class="meta-row">
          <text class="meta-item">📍 {{ service.service_area || '同城服务' }}</text>
          <text class="meta-item">🕒 {{ service.service_time || '时间可协商' }}</text>
        </view>

        <view class="card-footer">
          <view class="user-box">
            <image v-if="service.avatar" class="avatar" :src="service.avatar" mode="aspectFill" />
            <view v-else class="avatar avatar-fallback">{{ getNameInitial(service.username) }}</view>
            <text class="username">{{ service.username || '匿名技师' }}</text>
          </view>
          <text class="price">¥{{ service.price || 0 }}<text class="unit">/{{ service.price_unit || '次' }}</text></text>
        </view>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <view class="empty-icon">🧰</view>
      <text class="empty-title">暂无相关技能服务</text>
      <text class="empty-sub">可尝试重新筛选或返回首页查看更多内容</text>
      <view class="empty-actions">
        <view class="btn ghost" @click="goHome">返回首页</view>
        <view class="btn primary" @click="reload">重新筛选</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../../common/api';

const loading = ref(true);
const serviceList = ref([]);

const goBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  uni.switchTab({ url: '/pages/index/index' });
};

const goHome = () => uni.switchTab({ url: '/pages/index/index' });
const goSearch = () => uni.navigateTo({ url: '/pages/search/index' });

const getNameInitial = (name) => {
  const safeName = String(name || '匿').trim();
  return safeName.charAt(0).toUpperCase();
};

const formatTime = (time) => {
  if (!time) return '刚刚发布';
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return '刚刚发布';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const loadSkillServices = async () => {
  loading.value = true;
  try {
    const list = await api.skillList('recommend');
    serviceList.value = Array.isArray(list) ? list : [];
  } catch (e) {
    serviceList.value = [];
  } finally {
    loading.value = false;
  }
};

const reload = () => loadSkillServices();

onMounted(() => {
  loadSkillServices();
});
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
.search-icon { font-size: 26rpx; margin-right: 10rpx; }
.search-placeholder { color: #8e98a8; font-size: 25rpx; }

.loading-wrap { padding: 120rpx 0; text-align: center; }
.loading-text { color: #7e8797; font-size: 26rpx; }

.list-wrap { padding: 8rpx 24rpx 30rpx; }
.service-card { background: #fff; border-radius: 28rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 10rpx 30rpx rgba(26, 58, 120, .08); }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.category-pill { background: #ebf2ff; color: #2f7eff; border-radius: 999rpx; padding: 8rpx 18rpx; font-size: 22rpx; }
.time-text { color: #9aa4b4; font-size: 22rpx; }
.service-title { display: block; color: #1f2a3d; font-size: 32rpx; font-weight: 700; margin-bottom: 10rpx; }
.service-desc { display: block; color: #5f6d82; line-height: 1.6; font-size: 24rpx; }
.meta-row { margin-top: 14rpx; display: flex; flex-wrap: wrap; gap: 12rpx; }
.meta-item { background: #f6f8fc; color: #6f7c8f; padding: 8rpx 14rpx; border-radius: 14rpx; font-size: 22rpx; }
.card-footer { margin-top: 18rpx; display: flex; align-items: center; justify-content: space-between; }
.user-box { display: flex; align-items: center; }
.avatar { width: 52rpx; height: 52rpx; border-radius: 50%; background: #d8e4ff; }
.avatar-fallback { display: flex; align-items: center; justify-content: center; color: #2f7eff; font-size: 24rpx; font-weight: 700; }
.username { color: #526079; font-size: 24rpx; margin-left: 10rpx; }
.price { color: #2f7eff; font-weight: 700; font-size: 34rpx; }
.unit { font-size: 22rpx; }

.empty-wrap { margin: 80rpx 24rpx; padding: 60rpx 32rpx; background: #fff; border-radius: 28rpx; box-shadow: 0 12rpx 32rpx rgba(26, 58, 120, .08); text-align: center; }
.empty-icon { width: 120rpx; height: 120rpx; border-radius: 32rpx; margin: 0 auto 20rpx; background: linear-gradient(145deg, #edf3ff, #f7faff); color: #2f7eff; display: flex; align-items: center; justify-content: center; font-size: 58rpx; }
.empty-title { display: block; color: #1f2a3d; font-size: 30rpx; font-weight: 700; }
.empty-sub { display: block; color: #8a94a6; font-size: 24rpx; margin-top: 12rpx; }
.empty-actions { margin-top: 28rpx; display: flex; justify-content: center; gap: 16rpx; }
.btn { min-width: 180rpx; padding: 16rpx 22rpx; border-radius: 999rpx; font-size: 24rpx; }
.btn.ghost { background: #eef3ff; color: #2f7eff; }
.btn.primary { background: #2f7eff; color: #fff; }
</style>
