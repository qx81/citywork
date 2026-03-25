<template>
  <view class="order-page">
    <view class="header">
      <text class="header-title">订单</text>
    </view>

    <scroll-view class="tab-scroll" scroll-x show-scrollbar="false">
      <view class="tab-wrap">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-item', { active: activeTab === tab.value }]"
          @click="switchTab(tab.value)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="list-container">
      <view v-if="orders.length === 0 && !loading" class="empty">暂无订单</view>

      <view
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        @click="goDetail(order.id)"
      >
        <view class="card-head">
          <text class="type-tag">{{ contentTypeText(order.content_type) }}</text>
          <text :class="['status-text', statusClass(order.status)]">{{ statusText(order.status) }}</text>
        </view>

        <view class="card-body">
          <image class="cover" :src="order.cover || fallbackCover(order.content_type)" mode="aspectFill" />
          <view class="body-right">
            <text class="main-title line-2">{{ order.title || '未命名订单' }}</text>
            <text class="desc line-1">{{ order.summary || summaryFallback(order) }}</text>
            <text class="meta line-1">{{ order.meta || metaFallback(order) }}</text>
          </view>
        </view>

        <view class="card-foot">
          <text class="amount">{{ amountText(order) }}</text>
          <view class="actions">
            <button
              v-for="action in actionsFor(order)"
              :key="action.key"
              :class="['action-btn', action.type]"
              @click.stop="handleAction(action.key, order)"
            >
              {{ action.label }}
            </button>
          </view>
        </view>
      </view>

      <view v-if="orders.length > 0" class="load-text">{{ hasMore ? '上拉加载更多' : '没有更多订单了' }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import request from '../../utils/request';

const tabs = [
  { label: '全部', value: -1 },
  { label: '待支付', value: 0 },
  { label: '已支付', value: 1 },
  { label: '待完成', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
];

const activeTab = ref(-1);
const orders = ref([]);
const page = ref(1);
const pageSize = 10;
const hasMore = ref(true);
const loading = ref(false);

const ensureLogin = () => {
  const token = uni.getStorageSync('token');
  if (token) return true;
  uni.showToast({ title: '请先登录', icon: 'none' });
  setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 300);
  return false;
};

const statusText = (status) => ['待支付', '已支付', '待完成', '已完成', '已取消'][status] || '未知';
const statusClass = (status) => ({
  0: 'status-pending',
  1: 'status-paid',
  2: 'status-pending',
  3: 'status-done',
  4: 'status-cancel'
}[status] || 'status-cancel');
const contentTypeText = (type) => ({ skill: '技能服务', second_hand: '二手闲置', play: '约玩活动' }[type] || '其他订单');

const parseFirstImage = (images) => {
  if (!images) return '';
  if (Array.isArray(images)) return images[0] || '';
  const list = String(images).split(',').map((s) => s.trim()).filter(Boolean);
  return list[0] || '';
};

const fallbackCover = (type) => ({
  skill: 'https://dummyimage.com/160x160/edf5ff/1677ff.png&text=%E6%8A%80%E8%83%BD',
  second_hand: 'https://dummyimage.com/160x160/f0f7ff/1677ff.png&text=%E4%BA%8C%E6%89%8B',
  play: 'https://dummyimage.com/160x160/e8f3ff/1677ff.png&text=%E7%BA%A6%E7%8E%A9'
}[type] || 'https://dummyimage.com/160x160/f5f5f5/999999.png&text=%E8%AE%A2%E5%8D%95');

const amountText = (order) => {
  if (order.content_type === 'play') return `AA制 ¥${Number(order.amount || 0).toFixed(2)} / 人`;
  return `¥${Number(order.amount || 0).toFixed(2)}`;
};

const summaryFallback = (order) => {
  if (order.content_type === 'skill') return '服务信息待补充';
  if (order.content_type === 'second_hand') return '商品信息待补充';
  return '活动信息待补充';
};

const metaFallback = (order) => {
  const time = order.service_time ? new Date(order.service_time).toLocaleString() : '时间待定';
  return `${time}${order.location ? ` | ${order.location}` : ''}`;
};

const mapOrder = (order) => ({
  ...order,
  cover: order.cover || parseFirstImage(order.images),
  title: order.title || order.order_no,
  summary: order.summary || '',
  meta: order.meta || ''
});

const fetchOrders = async (reset = false) => {
  if (loading.value) return;
  if (!hasMore.value && !reset) return;
  loading.value = true;

  if (reset) {
    page.value = 1;
    hasMore.value = true;
  }

  try {
    const params = {
      page: page.value,
      pageSize
    };
    if (activeTab.value !== -1) params.status = activeTab.value;

    const result = await request.get('/order/list', params);
    const list = Array.isArray(result?.list) ? result.list : (Array.isArray(result) ? result : []);
    const mapped = list.map(mapOrder);

    orders.value = reset ? mapped : [...orders.value, ...mapped];
    hasMore.value = result?.hasMore !== undefined ? Boolean(result.hasMore) : mapped.length === pageSize;
    page.value += 1;
  } finally {
    loading.value = false;
  }
};

const switchTab = (value) => {
  if (activeTab.value === value) return;
  activeTab.value = value;
  if (ensureLogin()) fetchOrders(true);
};

const goDetail = (id) => uni.navigateTo({ url: `/pages/order/orderDetail?id=${id}` });

const actionsFor = (order) => {
  if (order.status === 0) {
    return [
      { key: 'cancel', label: '取消订单', type: 'ghost' },
      { key: 'pay', label: '立即支付', type: 'primary' }
    ];
  }
  if (order.status === 2) {
    return [
      { key: 'contact', label: '联系对方', type: 'ghost' },
      { key: 'complete', label: '确认完成', type: 'primary' }
    ];
  }
  if (order.status === 3) {
    return [
      { key: 'detail', label: '查看详情', type: 'ghost' },
      { key: 'delete', label: '删除订单', type: 'text' }
    ];
  }
  if (order.status === 4) {
    return [{ key: 'detail', label: '查看详情', type: 'ghost' }];
  }
  return [];
};

const handleAction = async (action, order) => {
  if (action === 'detail') return goDetail(order.id);
  if (action === 'contact') {
    uni.showToast({ title: '请前往订单详情联系对方', icon: 'none' });
    return;
  }

  if (action === 'pay') await request.post(`/order/pay/${order.id}`);
  if (action === 'cancel') await request.post(`/order/cancel/${order.id}`);
  if (action === 'complete') await request.post(`/order/complete/${order.id}`);
  if (action === 'delete') await request.post(`/order/delete/${order.id}`);

  await fetchOrders(true);
};

onPullDownRefresh(async () => {
  if (!ensureLogin()) {
    uni.stopPullDownRefresh();
    return;
  }
  await fetchOrders(true);
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  if (ensureLogin()) fetchOrders(false);
});

onMounted(() => {
  if (ensureLogin()) fetchOrders(true);
});
</script>

<style scoped>
.order-page { min-height: 100vh; background: #f5f5f5; }
.header { display: flex; justify-content: center; align-items: center; padding: 24rpx 32rpx 16rpx; background: #fff; }
.header-title { font-size: 32rpx; font-weight: 700; color: #333333; }
.tab-scroll { white-space: nowrap; background: #fff; }
.tab-wrap { display: inline-flex; padding: 0 16rpx; }
.tab-item { position: relative; padding: 18rpx 16rpx; margin-right: 20rpx; font-size: 24rpx; color: #999999; }
.tab-item.active { color: #1677ff; }
.tab-item.active::after { content: ''; position: absolute; left: 16rpx; right: 16rpx; bottom: 0; height: 4rpx; background: #1677ff; border-radius: 2rpx; }
.list-container { padding: 12rpx 16rpx 24rpx; }
.empty { padding: 160rpx 0; text-align: center; color: #999999; font-size: 28rpx; }
.order-card { background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 12rpx; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18rpx; }
.type-tag { font-size: 22rpx; color: #1677ff; background: #e8f3ff; padding: 6rpx 14rpx; border-radius: 999rpx; }
.status-text { font-size: 22rpx; }
.status-pending { color: #ff7d00; }
.status-paid { color: #1677ff; }
.status-done { color: #52c41a; }
.status-cancel { color: #999999; }
.card-body { display: flex; gap: 16rpx; }
.cover { width: 160rpx; height: 160rpx; border-radius: 8rpx; background: #f0f0f0; flex-shrink: 0; }
.body-right { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.main-title { font-size: 28rpx; color: #333333; line-height: 1.4; }
.desc { font-size: 24rpx; color: #666666; margin-top: 8rpx; }
.meta { font-size: 22rpx; color: #999999; margin-top: 8rpx; }
.card-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 20rpx; }
.amount { font-size: 30rpx; font-weight: 700; color: #1677ff; }
.actions { display: flex; align-items: center; gap: 12rpx; }
.action-btn { font-size: 24rpx; padding: 12rpx 20rpx; border-radius: 8rpx; line-height: 1; margin: 0; }
.action-btn::after { border: 0; }
.action-btn.ghost { color: #666666; border: 1rpx solid #d9d9d9; background: #fff; }
.action-btn.primary { color: #fff; border: 1rpx solid #1677ff; background: #1677ff; }
.action-btn.text { color: #999999; border: 1rpx solid #d9d9d9; background: #fff; }
.load-text { text-align: center; color: #999999; font-size: 22rpx; padding: 20rpx 0 4rpx; }
.line-1 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.line-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
