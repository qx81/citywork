<template>
  <view class="order-detail-container">
    <view class="header">
      <text @click="handleBack" class="back">返回</text>
      <text class="title">订单详情</text>
      <view class="placeholder"></view>
    </view>
    
    <view v-if="order" class="order-content">
      <view class="order-status">
        <text :class="['status-text', getStatusClass(order.status)]">{{ getStatusText(order.status) }}</text>
      </view>
      
      <view class="order-info">
        <view class="info-item">
          <text class="label">订单号</text>
          <text class="value">{{ order.id }}</text>
        </view>
        <view class="info-item">
          <text class="label">服务类型</text>
          <text class="value">{{ order.service_type === 1 ? '技能服务' : '二手闲置' }}</text>
        </view>
        <view class="info-item">
          <text class="label">价格</text>
          <text class="value price">¥{{ order.price }}</text>
        </view>
        <view class="info-item">
          <text class="label">下单时间</text>
          <text class="value">{{ formatDate(order.created_at) }}</text>
        </view>
        <view class="info-item" v-if="order.address">
          <text class="label">服务地址</text>
          <text class="value">{{ order.address }}</text>
        </view>
        <view class="info-item" v-if="order.remark">
          <text class="label">备注</text>
          <text class="value">{{ order.remark }}</text>
        </view>
      </view>
      
      <view class="order-actions">
        <button v-if="order.status === 0" @click="handlePay(order.id)" class="action-btn pay-btn">去支付</button>
        <button v-if="order.status === 1" @click="handleProcess(order.id)" class="action-btn process-btn">开始处理</button>
        <button v-if="order.status === 2" @click="handleComplete(order.id)" class="action-btn complete-btn">确认完成</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const order = ref(null);
const orderId = ref('');

const handleBack = () => {
  uni.navigateBack();
};

const getOrderDetail = async () => {
  try {
    const result = await request.get(`/order/detail/${orderId.value}`);
    order.value = result;
  } catch (error) {
    console.error('获取订单详情失败:', error);
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 0: return '待支付';
    case 1: return '已支付';
    case 2: return '待完成';
    case 3: return '已完成';
    default: return '未知状态';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-pending';
    case 1: return 'status-paid';
    case 2: return 'status-processing';
    case 3: return 'status-completed';
    default: return '';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const handlePay = async (orderId) => {
  try {
    await request.post(`/order/pay/${orderId}`);
    uni.showToast({ title: '支付成功', icon: 'success' });
    getOrderDetail();
  } catch (error) {
    console.error('支付失败:', error);
  }
};

const handleProcess = async (orderId) => {
  try {
    await request.post(`/order/process/${orderId}`);
    uni.showToast({ title: '订单已开始处理', icon: 'success' });
    getOrderDetail();
  } catch (error) {
    console.error('更新订单状态失败:', error);
  }
};

const handleComplete = async (orderId) => {
  try {
    await request.post(`/order/complete/${orderId}`);
    uni.showToast({ title: '订单已完成', icon: 'success' });
    getOrderDetail();
  } catch (error) {
    console.error('更新订单状态失败:', error);
  }
};

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  orderId.value = currentPage.options.id;
  getOrderDetail();
});
</script>

<style scoped>
.order-detail-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.back {
  font-size: 28rpx;
  color: #007aff;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.placeholder {
  width: 28rpx;
}

.order-content {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-status {
  text-align: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 30rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: bold;
}

.status-pending {
  color: #ff9500;
}

.status-paid {
  color: #007aff;
}

.status-processing {
  color: #34c759;
}

.status-completed {
  color: #999;
}

.order-info {
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
}

.price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff3b30;
}

.order-actions {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #eee;
}

.action-btn {
  padding: 15rpx 40rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
  border: 1rpx solid #ddd;
  background-color: #fff;
}

.pay-btn {
  color: #fff;
  background-color: #ff3b30;
  border-color: #ff3b30;
}

.process-btn {
  color: #007aff;
  border-color: #007aff;
}

.complete-btn {
  color: #34c759;
  border-color: #34c759;
}
</style>