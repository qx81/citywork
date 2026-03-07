<template>
  <view class="page">
    <view class="card">
      <text class="title">编辑个人资料</text>

      <view class="avatar-row" @click="chooseAvatar">
        <text class="label">头像</text>
        <view class="avatar-action">
          <image class="avatar" :src="form.avatar || '/static/avatar.png'" mode="aspectFill" />
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">姓名</text>
        <input v-model="form.username" class="input" type="text" maxlength="20" placeholder="请输入姓名" />
      </view>

      <view class="form-item">
        <text class="label">城市</text>
        <input v-model="form.city" class="input" type="text" maxlength="20" placeholder="请输入城市" />
      </view>

      <view class="form-item">
        <text class="label">地址</text>
        <input v-model="form.address" class="input" type="text" maxlength="80" placeholder="请输入地址" />
      </view>

      <view class="form-item bio-item">
        <text class="label">个性签名</text>
        <textarea v-model="form.bio" class="textarea" maxlength="100" placeholder="介绍一下自己吧" />
      </view>

      <button class="save-btn" :disabled="submitting" @click="submitProfile">{{ submitting ? '保存中...' : '保存资料' }}</button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import * as apiModule from '../../common/api';

const apiService = apiModule?.api || apiModule?.default || apiModule;

const form = reactive({
  username: '',
  city: '',
  avatar: '',
  address: '',
  bio: ''
});
const submitting = ref(false);

const fillForm = (data = {}) => {
  form.username = data.username || '';
  form.city = data.city || '';
  form.avatar = data.avatar || '';
  form.address = data.address || '';
  form.bio = data.bio || '';
};

const loadProfile = async () => {
  try {
    const profile = await apiService.profile();
    fillForm(profile);
  } catch (e) {
    // 请求失败时保持当前表单
  }
};

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async ({ tempFilePaths }) => {
      const filePath = tempFilePaths?.[0];
      if (!filePath) return;
      try {
        const avatarUrl = await apiService.uploadAvatar(filePath);
        if (avatarUrl) {
          form.avatar = avatarUrl;
          uni.showToast({ title: '头像上传成功', icon: 'none' });
        }
      } catch (e) {
        uni.showToast({ title: '头像上传失败', icon: 'none' });
      }
    }
  });
};

const submitProfile = async () => {
  if (!form.username.trim()) {
    uni.showToast({ title: '姓名不能为空', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    await apiService.updateProfile({
      username: form.username.trim(),
      city: form.city.trim(),
      avatar: form.avatar,
      address: form.address.trim(),
      bio: form.bio.trim()
    });

    const cached = uni.getStorageSync('userInfo') || {};
    uni.setStorageSync('userInfo', {
      ...cached,
      username: form.username.trim(),
      city: form.city.trim(),
      avatar: form.avatar,
      address: form.address.trim(),
      bio: form.bio.trim()
    });

    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 450);
  } finally {
    submitting.value = false;
  }
};

onShow(() => {
  loadProfile();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24rpx;
  background: #f5f7fa;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
}

.title {
  display: block;
  margin-bottom: 28rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.avatar-row,
.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.bio-item {
  align-items: flex-start;
}

.label {
  width: 130rpx;
  font-size: 30rpx;
  color: #333;
}

.avatar-action {
  display: flex;
  align-items: center;
}

.avatar {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  background: #f4f4f4;
}

.arrow {
  color: #999;
  font-size: 42rpx;
}

.input,
.textarea {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333;
}

.textarea {
  min-height: 120rpx;
  text-align: left;
  background: #fafafa;
  border-radius: 12rpx;
  padding: 16rpx;
  box-sizing: border-box;
}

.save-btn {
  margin-top: 36rpx;
  background: #4a6fa5;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
}

.save-btn[disabled] {
  opacity: 0.7;
}
</style>
