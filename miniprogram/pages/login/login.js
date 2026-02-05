const db = wx.cloud.database();

Page({
  data: {
    userInfo: null
  },

  async onGetUserProfile() {
    try {
      // 获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });
      
      this.setData({ userInfo });
      
      // 保存用户信息到云数据库
      await this.saveUserInfo(userInfo);
      
      // 保存到本地缓存
      wx.setStorageSync('userInfo', userInfo);
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 跳转到首页
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }, 1500);
      
    } catch (err) {
      console.error('获取用户信息失败:', err);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    }
  },

  async saveUserInfo(userInfo) {
    try {
      // 获取openid
      const { result } = await wx.cloud.callFunction({
        name: 'login'
      });
      
      const openid = result.openid;
      
      // 检查用户是否已存在
      const userRes = await db.collection('users').where({
        _openid: openid
      }).get();
      
      if (userRes.data.length === 0) {
        // 新用户，添加记录
        await db.collection('users').add({
          data: {
            userInfo: userInfo,
            createTime: db.serverDate(),
            openid: openid
          }
        });
      } else {
        // 老用户，更新信息
        await db.collection('users').doc(userRes.data[0]._id).update({
          data: {
            userInfo: userInfo,
            updateTime: db.serverDate()
          }
        });
      }
    } catch (err) {
      console.error('保存用户信息失败:', err);
    }
  }
});
