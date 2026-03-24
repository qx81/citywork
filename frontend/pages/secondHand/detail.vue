<template>
  <view class="page">
    <view class="nav-wrap">
      <view class="safe-top" />
      <view class="nav-bar">
        <view class="nav-action" @click="goBack">←</view>
        <text class="nav-title">闲置详情</text>
        <view class="nav-actions-right">
          <view class="nav-action light" @click="toggleFavorite">{{ isFavorite ? '★' : '☆' }}</view>
          <view class="nav-action light" @click="shareDetail">↗</view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll" v-if="detail">
      <view class="hero-card">
        <view class="hero-top">
          <text class="category-chip">{{ detail.condition_level || '成色未知' }}</text>
          <text class="status-chip">{{ detail.status_text || '在售中' }}</text>
        </view>
        <text class="hero-title">{{ detail.title }}</text>
        <text class="hero-desc">{{ detail.description }}</text>

        <view class="price-panel">
          <view class="price-row">
            <text class="price">¥{{ detail.price }}</text>
            <text class="origin" v-if="detail.original_price">¥{{ detail.original_price }}</text>
          </view>
          <text class="price-note">可小刀 · 支持当面验货</text>
        </view>

        <view class="trust-row">
          <view class="trust-item" v-for="item in trustBadges" :key="item.label">
            <text class="trust-icon">{{ item.icon }}</text>
            <view>
              <text class="trust-value">{{ item.value }}</text>
              <text class="trust-label">{{ item.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head"><text class="section-title">交易信息</text></view>
        <view class="info-grid">
          <view class="info-item"><text class="info-label">自提地址</text><text class="info-value">{{ detail.pickup_address }}</text></view>
          <view class="info-item"><text class="info-label">发布时间</text><text class="info-value">{{ formatDate(detail.created_at) }}</text></view>
          <view class="info-item wide"><text class="info-label">联系号码</text><text class="info-value">{{ maskedPhone }}</text></view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head"><text class="section-title">卖家信息</text></view>
        <view class="seller-row">
          <view class="avatar">{{ nameInitial }}</view>
          <view>
            <text class="seller-name">{{ detail.username || '匿名卖家' }}</text>
            <text class="seller-sub">本地闲置发布者 · 回复快</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-else class="state-card">正在加载闲置详情...</view>

    <view v-if="detail" class="bottom-bar">
      <view class="bottom-side-action" @click="toggleFavorite"><text class="bottom-side-icon">{{ isFavorite ? '★' : '☆' }}</text><text class="bottom-side-text">收藏</text></view>
      <view class="bottom-side-action" @click="contactSeller"><text class="bottom-side-icon">📞</text><text class="bottom-side-text">联系</text></view>
      <view class="bottom-primary" @click="primaryAction">立即约看</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../common/api';

const detail = ref(null);
const isFavorite = ref(false);

const mockSecondHandDetailMap = {
  1: { id: 1, title: '95新 iPhone 13 128G', description: '仅日常佩戴壳膜使用，无维修记录，电池健康 89%，支持当面验机。', condition_level: '95新', price: 2699, original_price: 5199, pickup_address: '万达广场 2 号门', contact_phone: '13800138000', username: '林同学', created_at: '2026-03-20 18:30:00', status_text: '在售中' },
  2: { id: 2, title: '北欧风双人沙发', description: '租房搬家转让，坐垫无塌陷，布套可拆洗。', condition_level: '9成新', price: 680, original_price: 1699, pickup_address: '锦绣花园南区', contact_phone: '13900139000', username: '周女士', created_at: '2026-03-18 20:10:00', status_text: '可议价' }
};

const trustBadges = computed(() => [
  { icon: '🕒', value: '当天可沟通', label: '响应速度' },
  { icon: '📍', value: detail.value?.pickup_address || '同城自提', label: '交易地点' },
  { icon: '🔍', value: detail.value?.condition_level || '成色良好', label: '成色说明' }
]);
const nameInitial = computed(() => String(detail.value?.username || '匿').charAt(0));
const maskedPhone = computed(() => {
  const phone = String(detail.value?.contact_phone || '');
  return phone.length >= 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '私聊获取';
});

function formatDate(value) {
  if (!value) return '最近发布';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '最近发布';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function goBack() {
  if (getCurrentPages().length > 1) return uni.navigateBack();
  uni.navigateTo({ url: '/pages/secondHand/index' });
}
function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
  // 对应接口：POST /api/collection/add 或 DELETE /api/collection/remove
}
function shareDetail() {
  // 对应接口：可扩展 POST /api/secondHand/share-log
  uni.showToast({ title: '已触发分享', icon: 'none' });
}
function contactSeller() {
  // 对应接口：可扩展 POST /api/secondHand/contact
  uni.showToast({ title: '联系卖家中', icon: 'none' });
}
function primaryAction() {
  // 对应接口：可扩展 POST /api/secondHand/reserve/:id
  uni.showToast({ title: '已发起约看', icon: 'none' });
}

async function fetchSecondHandDetail(id) {
  try {
    detail.value = await api.secondHandDetail(id);
  } catch (e) {
    detail.value = mockSecondHandDetailMap[id] || mockSecondHandDetailMap[1];
  }
}

onLoad((query) => {
  fetchSecondHandDetail(Number(query?.id || 1));
});
</script>

<style scoped>
.page { min-height: 100vh; background: #f3f5f8; padding-bottom: 140rpx; }
.nav-wrap { position: sticky; top: 0; z-index: 10; background: #f3f5f8; }
.safe-top { height: var(--status-bar-height); }
.nav-bar { height: 88rpx; display: flex; align-items: center; justify-content: space-between; padding: 0 24rpx; }
.nav-action { width: 64rpx; height: 64rpx; border-radius: 20rpx; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(25, 45, 86, .08); }
.nav-actions-right { display: flex; gap: 12rpx; }
.nav-action.light { background: #fff; }
.nav-title { font-size: 32rpx; font-weight: 700; color: #1f2a3d; }
.page-scroll { height: calc(100vh - var(--status-bar-height) - 88rpx - 120rpx); padding: 16rpx 24rpx 30rpx; box-sizing: border-box; }
.hero-card,.section-card { background: #fff; border-radius: 32rpx; padding: 28rpx; box-shadow: 0 12rpx 34rpx rgba(32, 58, 108, .08); margin-bottom: 18rpx; }
.hero-top { display: flex; justify-content: space-between; }
.category-chip,.status-chip { padding: 8rpx 18rpx; border-radius: 999rpx; font-size: 22rpx; }
.category-chip { background: #edf4ff; color: #2f7eff; }
.status-chip { background: #eefaf3; color: #27a35b; }
.hero-title { display: block; margin: 14rpx 0 10rpx; color: #1f2a3d; font-size: 36rpx; font-weight: 700; }
.hero-desc { color: #58667d; font-size: 25rpx; line-height: 1.7; }
.price-panel { margin-top: 18rpx; padding: 20rpx; border-radius: 24rpx; background: #f7faff; }
.price-row { display: flex; align-items: baseline; gap: 12rpx; }
.price { color: #2f7eff; font-size: 48rpx; font-weight: 800; }
.origin { color: #a0abbb; text-decoration: line-through; }
.price-note { color: #708199; font-size: 22rpx; }
.trust-row { margin-top: 16rpx; display: flex; gap: 12rpx; }
.trust-item { flex: 1; background: #f7f9fc; border-radius: 18rpx; padding: 14rpx; display: flex; gap: 8rpx; }
.trust-label { display: block; color: #97a3b5; font-size: 20rpx; }
.trust-value { display: block; color: #354157; font-size: 22rpx; font-weight: 600; }
.info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14rpx; }
.info-item { background: #f7f9fc; border-radius: 18rpx; padding: 14rpx; }
.info-item.wide { grid-column: 1 / span 2; }
.info-label { display: block; color: #8e9aac; font-size: 22rpx; }
.info-value { display: block; margin-top: 8rpx; color: #2e3b52; font-size: 24rpx; }
.section-title { font-size: 30rpx; color: #1f2a3d; font-weight: 700; margin-bottom: 12rpx; display: block; }
.seller-row { display: flex; align-items: center; gap: 14rpx; }
.avatar { width: 84rpx; height: 84rpx; border-radius: 50%; background: #e6efff; color: #2f7eff; display: flex; align-items: center; justify-content: center; font-size: 34rpx; font-weight: 700; }
.seller-name { display: block; color: #233044; font-size: 28rpx; font-weight: 700; }
.seller-sub { display: block; margin-top: 8rpx; color: #8390a3; font-size: 22rpx; }
.bottom-bar { position: fixed; left: 20rpx; right: 20rpx; bottom: 20rpx; background: #fff; border-radius: 28rpx; padding: 14rpx; display: flex; gap: 10rpx; box-shadow: 0 14rpx 36rpx rgba(30, 51, 94, .14); }
.bottom-side-action { width: 120rpx; border-radius: 20rpx; background: #f4f7fc; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.bottom-side-text { font-size: 20rpx; color: #5f6c81; }
.bottom-primary { flex: 1; border-radius: 20rpx; background: linear-gradient(135deg, #2f7eff, #5a9bff); color: #fff; font-size: 30rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; }
</style>
