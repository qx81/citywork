<template>
  <view class="page">
    <view class="nav-wrap">
      <view class="safe-top" />
      <view class="nav-bar">
        <view class="nav-action" @click="goBack">←</view>
        <text class="nav-title">服务详情</text>
        <view class="nav-actions-right">
          <view class="nav-action light" @click="toggleFavorite">{{ isFavorite ? '★' : '☆' }}</view>
          <view class="nav-action light" @click="shareService">↗</view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll">
      <view v-if="loading" class="state-card loading-card">
        <text class="state-title">正在加载服务详情...</text>
        <text class="state-sub">请稍候，正在同步本地服务信息</text>
      </view>

      <template v-else-if="detail">
        <view class="hero-card">
          <view class="hero-top">
            <view>
              <text class="category-chip">{{ detail.category || '技能服务' }}</text>
              <text class="hero-title">{{ detail.title }}</text>
            </view>
            <view class="recommend-badge" v-if="Number(detail.is_recommend) === 1">平台优选</view>
          </view>

          <text class="hero-desc">{{ detail.description || '服务者暂未补充详细说明' }}</text>

          <view class="price-panel">
            <view>
              <text class="price-label">参考价格</text>
              <view class="price-row">
                <text class="price">¥{{ formatPrice(detail.price) }}</text>
                <text class="price-unit">/{{ unitText }}</text>
              </view>
              <text class="price-note">{{ detail.service_time || '可协商预约时段' }} · {{ detail.service_area || '同城上门服务' }}</text>
            </view>
            <view class="price-tag">{{ pricingLabel }}</view>
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

        <view class="section-card provider-card">
          <view class="section-head">
            <text class="section-title">服务者信息</text>
            <text class="section-extra">{{ providerMetaText }}</text>
          </view>

          <view class="provider-main">
            <image v-if="detail.avatar" class="provider-avatar" :src="detail.avatar" mode="aspectFill" />
            <view v-else class="provider-avatar provider-avatar-fallback">{{ nameInitial }}</view>
            <view class="provider-info">
              <view class="provider-name-row">
                <text class="provider-name">{{ detail.username || '匿名服务者' }}</text>
                <text class="provider-verified">实名认证</text>
              </view>
              <text class="provider-bio">{{ detail.bio || `${detail.username || '这位服务者'}长期提供本地上门服务，沟通响应及时。` }}</text>
              <view class="provider-tags">
                <text class="provider-tag">{{ detail.city || '本地服务者' }}</text>
                <text class="provider-tag">{{ detail.service_area || '同城上门' }}</text>
                <text class="provider-tag">{{ scene.serviceTag }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-head">
            <text class="section-title">服务内容</text>
            <text class="section-extra">真实上门场景</text>
          </view>
          <view class="bullet-list">
            <view v-for="(item, index) in scene.serviceItems" :key="item" class="bullet-item">
              <view class="bullet-index">{{ index + 1 }}</view>
              <text class="bullet-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-head">
            <text class="section-title">服务范围与收费说明</text>
            <text class="section-extra">下单前建议确认</text>
          </view>
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">服务范围</text>
              <text class="info-value">{{ detail.service_area || '同城主城区可约' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">预约时段</text>
              <text class="info-value">{{ detail.service_time || '时间可协商' }}</text>
            </view>
            <view class="info-item wide">
              <text class="info-label">收费方式</text>
              <text class="info-value">{{ pricingText }}</text>
            </view>
          </view>
          <view class="tips-panel">
            <view v-for="tip in scene.priceTips" :key="tip" class="tip-row">
              <text class="tip-dot" />
              <text class="tip-text">{{ tip }}</text>
            </view>
          </view>
        </view>

        <view class="section-card assurance-card">
          <view class="section-head">
            <text class="section-title">平台保障</text>
            <text class="section-extra">让联系更放心</text>
          </view>
          <view class="assurance-list">
            <view v-for="item in assurances" :key="item.title" class="assurance-item">
              <text class="assurance-icon">{{ item.icon }}</text>
              <view>
                <text class="assurance-title">{{ item.title }}</text>
                <text class="assurance-desc">{{ item.desc }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="section-card contact-card">
          <view class="section-head">
            <text class="section-title">联系与下单</text>
            <text class="section-extra">支持先沟通后预约</text>
          </view>
          <view class="contact-box">
            <view>
              <text class="contact-label">联系电话</text>
              <text class="contact-value">{{ maskedPhone }}</text>
            </view>
            <view class="contact-status">平均 10 分钟内回复</view>
          </view>
          <view class="contact-actions-inline">
            <view class="inline-btn ghost" @click="copyPhone">复制号码</view>
            <view class="inline-btn soft" @click="consultNow">在线咨询</view>
          </view>
        </view>
      </template>

      <view v-else class="state-card empty-card">
        <text class="state-title">服务详情不存在</text>
        <text class="state-sub">该服务可能已下架或暂时不可查看</text>
        <view class="state-btn" @click="goSkillList">返回技能服务列表</view>
      </view>
    </scroll-view>

    <view v-if="detail" class="bottom-bar">
      <view class="bottom-side-action" @click="toggleFavorite">
        <text class="bottom-side-icon">{{ isFavorite ? '★' : '☆' }}</text>
        <text class="bottom-side-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
      </view>
      <view class="bottom-side-action" @click="consultNow">
        <text class="bottom-side-icon">💬</text>
        <text class="bottom-side-text">咨询</text>
      </view>
      <view class="bottom-primary" @click="placeOrder">立即预约</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../common/api';

const loading = ref(true);
const detail = ref(null);
const isFavorite = ref(false);

const sceneConfig = {
  '空调清洗': {
    serviceTag: '深度清洗',
    serviceItems: ['上门检测空调运行情况与污垢程度', '拆洗滤网、蒸发器和出风口，减少异味与积尘', '完成后进行通风试机并提醒后续保养周期'],
    priceTips: ['当前展示价格通常为单台参考价，柜机或深度拆洗可单独沟通。', '若现场存在高空作业、严重积垢等情况，需与服务者二次确认。']
  },
  '人像摄影': {
    serviceTag: '约拍服务',
    serviceItems: ['拍摄前沟通风格、服装和场景路线', '提供现场引导动作与基础妆造建议', '拍摄完成后交付精选底片与修图成片'],
    priceTips: ['展示价格多为基础时长套餐，超时或加急修图一般会额外计费。', '场地票务、化妆、服装租赁等第三方费用通常需单独承担。']
  },
  '电脑系统重装': {
    serviceTag: '系统优化',
    serviceItems: ['上门检测电脑故障、卡顿或系统异常原因', '重装系统并安装常用软件与驱动', '提供基础数据备份建议与后续使用优化'],
    priceTips: ['价格一般包含基础安装与优化，不含正版软件授权费用。', '如需硬件更换、远程持续维护等延伸服务，可另行协商。']
  },
  default: {
    serviceTag: '同城上门',
    serviceItems: ['服务前确认需求、时间与上门地址', '按约定提供对应服务内容并现场沟通细节', '服务完成后确认结果，必要时提供后续建议'],
    priceTips: ['页面价格为参考价，具体以服务内容、距离和现场情况为准。', '下单前建议先与服务者确认预约时段、服务范围及额外费用。']
  }
};

const assurances = [
  { icon: '🛡️', title: '信息可追溯', desc: '服务者账号与发布内容在平台留痕，沟通更安心。' },
  { icon: '📍', title: '同城上门', desc: '突出本地生活场景，便于提前确认区域与到达时间。' },
  { icon: '🤝', title: '先沟通再预约', desc: '支持先了解服务细节、报价方式与预约安排。' }
];

const scene = computed(() => {
  const title = detail.value?.title || '';
  const matchedKey = Object.keys(sceneConfig).find((key) => key !== 'default' && title.includes(key));
  return sceneConfig[matchedKey] || sceneConfig.default;
});

const unitText = computed(() => (detail.value?.price_unit === 'hour' ? '小时' : '次'));
const pricingLabel = computed(() => (detail.value?.price_unit === 'hour' ? '按时计费' : '按次计费'));
const pricingText = computed(() => `当前服务以${pricingLabel.value}为主，参考价为 ¥${formatPrice(detail.value?.price)} / ${unitText.value}。`);
const nameInitial = computed(() => String(detail.value?.username || '匿').trim().charAt(0).toUpperCase());
const providerMetaText = computed(() => `${formatDate(detail.value?.created_at)} 发布`);
const maskedPhone = computed(() => {
  const phone = String(detail.value?.phone || '').trim();
  if (!phone) return '暂未公开，建议先在线咨询';
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
});
const trustBadges = computed(() => [
  { icon: '⭐', value: Number(detail.value?.is_recommend) === 1 ? '平台推荐' : '口碑服务', label: '服务标签' },
  { icon: '📍', value: detail.value?.service_area || '同城覆盖', label: '服务区域' },
  { icon: '🕒', value: detail.value?.service_time || '时间可约', label: '预约时间' }
]);

function formatPrice(value) {
  const num = Number(value || 0);
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

function formatDate(value) {
  if (!value) return '最近发布';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '最近发布';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  goSkillList();
}

function goSkillList() {
  uni.navigateTo({ url: '/pages/skill/index' });
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
  uni.showToast({ title: isFavorite.value ? '已加入收藏' : '已取消收藏', icon: 'none' });
}

function shareService() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' });
}

function consultNow() {
  uni.showToast({ title: '已为你打开咨询入口', icon: 'none' });
}

function placeOrder() {
  uni.showToast({ title: '预约功能开发中', icon: 'none' });
}

function copyPhone() {
  const phone = String(detail.value?.phone || '').trim();
  if (!phone) {
    uni.showToast({ title: '暂未获取联系电话', icon: 'none' });
    return;
  }
  uni.setClipboardData({ data: phone, showToast: false, success: () => uni.showToast({ title: '号码已复制', icon: 'none' }) });
}

async function loadDetail(id) {
  loading.value = true;
  try {
    const data = await api.skillDetail(id);
    detail.value = data || null;
  } catch (error) {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

onLoad((options) => {
  const id = options?.id;
  if (!id) {
    loading.value = false;
    detail.value = null;
    return;
  }
  loadDetail(id);
});
</script>

<style scoped>
.page { min-height: 100vh; background: #f3f6fb; padding-bottom: 168rpx; }
.nav-wrap { position: sticky; top: 0; z-index: 30; background: rgba(243, 246, 251, .96); backdrop-filter: blur(12rpx); }
.safe-top { height: var(--status-bar-height); }
.nav-bar { height: 88rpx; display: flex; align-items: center; justify-content: space-between; padding: 0 24rpx; }
.nav-title { color: #1f2a3d; font-size: 32rpx; font-weight: 700; }
.nav-actions-right { display: flex; align-items: center; gap: 12rpx; }
.nav-action { width: 64rpx; height: 64rpx; border-radius: 22rpx; background: #2f7eff; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 30rpx; box-shadow: 0 10rpx 24rpx rgba(47, 126, 255, .18); }
.nav-action.light { background: #fff; color: #2f7eff; }
.page-scroll { height: calc(100vh - var(--status-bar-height) - 88rpx); }
.hero-card { margin: 12rpx 24rpx 18rpx; padding: 30rpx 26rpx; border-radius: 32rpx; background: linear-gradient(160deg, #2f7eff 0%, #68a8ff 100%); color: #fff; box-shadow: 0 20rpx 40rpx rgba(47, 126, 255, .22); }
.hero-top { display: flex; justify-content: space-between; gap: 16rpx; }
.category-chip { display: inline-flex; align-items: center; padding: 8rpx 16rpx; border-radius: 999rpx; background: rgba(255,255,255,.18); font-size: 22rpx; margin-bottom: 16rpx; }
.hero-title { display: block; font-size: 40rpx; line-height: 1.3; font-weight: 700; }
.recommend-badge { height: fit-content; padding: 10rpx 18rpx; border-radius: 999rpx; background: rgba(255,255,255,.2); font-size: 22rpx; white-space: nowrap; }
.hero-desc { display: block; margin-top: 20rpx; line-height: 1.7; font-size: 25rpx; color: rgba(255,255,255,.92); }
.price-panel { margin-top: 28rpx; padding: 24rpx; border-radius: 28rpx; background: rgba(10, 32, 76, .18); display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.price-label { display: block; font-size: 22rpx; opacity: .86; }
.price-row { display: flex; align-items: baseline; margin-top: 8rpx; }
.price { font-size: 52rpx; font-weight: 700; }
.price-unit { margin-left: 8rpx; font-size: 24rpx; opacity: .9; }
.price-note { display: block; margin-top: 10rpx; font-size: 22rpx; color: rgba(255,255,255,.82); }
.price-tag { padding: 12rpx 20rpx; border-radius: 20rpx; background: rgba(255,255,255,.18); font-size: 24rpx; }
.trust-row { margin-top: 22rpx; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14rpx; }
.trust-item { background: rgba(255,255,255,.14); border-radius: 24rpx; padding: 18rpx 16rpx; display: flex; align-items: center; gap: 12rpx; }
.trust-icon { font-size: 28rpx; }
.trust-value { display: block; font-size: 22rpx; font-weight: 700; }
.trust-label { display: block; margin-top: 4rpx; font-size: 20rpx; opacity: .82; }
.section-card { margin: 0 24rpx 18rpx; padding: 26rpx 24rpx; border-radius: 28rpx; background: #fff; box-shadow: 0 12rpx 32rpx rgba(24, 42, 79, .07); }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; margin-bottom: 18rpx; }
.section-title { color: #1f2a3d; font-size: 30rpx; font-weight: 700; }
.section-extra { color: #8c97a8; font-size: 22rpx; }
.provider-main { display: flex; gap: 18rpx; }
.provider-avatar { width: 96rpx; height: 96rpx; border-radius: 28rpx; background: #dfe9ff; flex-shrink: 0; }
.provider-avatar-fallback { display: flex; align-items: center; justify-content: center; color: #2f7eff; font-size: 34rpx; font-weight: 700; }
.provider-info { flex: 1; min-width: 0; }
.provider-name-row { display: flex; align-items: center; flex-wrap: wrap; gap: 12rpx; }
.provider-name { color: #1f2a3d; font-size: 30rpx; font-weight: 700; }
.provider-verified { padding: 6rpx 14rpx; border-radius: 999rpx; background: #edf4ff; color: #2f7eff; font-size: 20rpx; }
.provider-bio { display: block; margin-top: 10rpx; line-height: 1.7; color: #617087; font-size: 24rpx; }
.provider-tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.provider-tag { padding: 8rpx 16rpx; border-radius: 999rpx; background: #f6f8fc; color: #6f7c8f; font-size: 21rpx; }
.bullet-list { display: flex; flex-direction: column; gap: 16rpx; }
.bullet-item { display: flex; align-items: flex-start; gap: 14rpx; }
.bullet-index { width: 42rpx; height: 42rpx; border-radius: 14rpx; background: #edf4ff; color: #2f7eff; display: flex; align-items: center; justify-content: center; font-size: 22rpx; font-weight: 700; flex-shrink: 0; }
.bullet-text { flex: 1; color: #4f5e76; font-size: 25rpx; line-height: 1.7; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14rpx; }
.info-item { padding: 20rpx; border-radius: 22rpx; background: #f7f9fd; }
.info-item.wide { grid-column: 1 / -1; }
.info-label { display: block; color: #8b95a6; font-size: 22rpx; }
.info-value { display: block; margin-top: 10rpx; color: #1f2a3d; font-size: 26rpx; line-height: 1.6; font-weight: 600; }
.tips-panel { margin-top: 18rpx; padding: 18rpx 20rpx; border-radius: 22rpx; background: #fff8ef; }
.tip-row { display: flex; align-items: flex-start; gap: 12rpx; }
.tip-row + .tip-row { margin-top: 12rpx; }
.tip-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #ff9b54; margin-top: 12rpx; flex-shrink: 0; }
.tip-text { flex: 1; color: #8b5b2d; font-size: 23rpx; line-height: 1.7; }
.assurance-list { display: flex; flex-direction: column; gap: 16rpx; }
.assurance-item { display: flex; align-items: flex-start; gap: 16rpx; padding: 18rpx; border-radius: 22rpx; background: #f7f9fd; }
.assurance-icon { font-size: 30rpx; }
.assurance-title { display: block; color: #1f2a3d; font-size: 26rpx; font-weight: 700; }
.assurance-desc { display: block; margin-top: 8rpx; color: #67758c; font-size: 23rpx; line-height: 1.6; }
.contact-box { padding: 22rpx; border-radius: 24rpx; background: linear-gradient(180deg, #f7faff 0%, #f2f6ff 100%); display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.contact-label { display: block; color: #8a94a4; font-size: 22rpx; }
.contact-value { display: block; margin-top: 8rpx; color: #1f2a3d; font-size: 32rpx; font-weight: 700; }
.contact-status { padding: 10rpx 16rpx; border-radius: 999rpx; background: #fff; color: #2f7eff; font-size: 21rpx; white-space: nowrap; }
.contact-actions-inline { display: flex; gap: 14rpx; margin-top: 18rpx; }
.inline-btn { flex: 1; text-align: center; padding: 18rpx 0; border-radius: 20rpx; font-size: 24rpx; font-weight: 600; }
.inline-btn.ghost { background: #edf4ff; color: #2f7eff; }
.inline-btn.soft { background: #1f2a3d; color: #fff; }
.state-card { margin: 40rpx 24rpx; padding: 60rpx 32rpx; border-radius: 30rpx; background: #fff; text-align: center; box-shadow: 0 14rpx 34rpx rgba(24, 42, 79, .06); }
.state-title { display: block; color: #1f2a3d; font-size: 32rpx; font-weight: 700; }
.state-sub { display: block; margin-top: 12rpx; color: #8a94a6; font-size: 24rpx; line-height: 1.7; }
.state-btn { margin: 28rpx auto 0; width: 260rpx; padding: 18rpx 0; border-radius: 999rpx; background: #2f7eff; color: #fff; font-size: 24rpx; }
.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,.96); backdrop-filter: blur(16rpx); box-shadow: 0 -8rpx 24rpx rgba(20, 33, 61, .08); display: flex; align-items: center; gap: 14rpx; }
.bottom-side-action { width: 112rpx; height: 88rpx; border-radius: 24rpx; background: #f4f7fc; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #4f5e76; }
.bottom-side-icon { font-size: 28rpx; }
.bottom-side-text { font-size: 20rpx; margin-top: 4rpx; }
.bottom-primary { flex: 1; height: 88rpx; border-radius: 24rpx; background: linear-gradient(135deg, #2f7eff, #4fa0ff); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28rpx; font-weight: 700; box-shadow: 0 14rpx 28rpx rgba(47, 126, 255, .24); }
</style>
