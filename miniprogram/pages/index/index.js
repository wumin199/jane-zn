const db = wx.cloud.database();

Page({
  data: {
    hasHabits: false,
    userInfo: null,
    customBg: '',
    showBgTip: false
  },

  onLoad() {
    // 检查用户登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 未登录，跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    this.setData({ userInfo });
    
    // 加载自定义背景并刷新临时链接
    this.loadCustomBg();
    
    // 首次显示背景提示
    if (!wx.getStorageSync('bgTipShown')) {
      this.setData({ showBgTip: true });
      setTimeout(() => {
        this.setData({ showBgTip: false });
        wx.setStorageSync('bgTipShown', true);
      }, 3000);
    }
    
    // 登录成功后立即检查习惯
    this.checkHabits();
  },

  onShow() {
    this.loadCustomBg();
    this.checkHabits();
  },

  async loadCustomBg() {
    try {
      const fileID = wx.getStorageSync('customBgFileID');
      if (fileID) {
        // 重新获取临时链接
        const res = await wx.cloud.getTempFileURL({
          fileList: [fileID]
        });
        
        if (res.fileList && res.fileList.length > 0) {
          const tempUrl = res.fileList[0].tempFileURL;
          // 更新缓存和页面
          wx.setStorageSync('customBg', tempUrl);
          this.setData({ customBg: tempUrl });
        }
      }
    } catch (err) {
      console.error('加载背景失败:', err);
      // 加载失败时清除缓存，使用默认背景
      wx.removeStorageSync('customBg');
      wx.removeStorageSync('customBgFileID');
      this.setData({ customBg: '' });
    }
  },

  async loadDefaultImages() {
    try {
      const cloudFiles = [
        'cloud://cloud1-0gtnqy3z1c048750.636c-cloud1-0gtnqy3z1c048750-1399255895/default-images/bg.png',
        'cloud://cloud1-0gtnqy3z1c048750.636c-cloud1-0gtnqy3z1c048750-1399255895/default-images/battle1.png',
        'cloud://cloud1-0gtnqy3z1c048750.636c-cloud1-0gtnqy3z1c048750-1399255895/default-images/battle2.png'
      ];
      
      console.log('开始加载云存储图片...');
      const res = await wx.cloud.getTempFileURL({
        fileList: cloudFiles
      });
      
      console.log('云存储图片加载结果:', res);
      console.log('fileList详细内容:', JSON.stringify(res.fileList));
      
      if (res.fileList && res.fileList.length === 3) {
        this.setData({
          defaultBg: res.fileList[0].tempFileURL || '',
          battle1: res.fileList[1].tempFileURL || '',
          battle2: res.fileList[2].tempFileURL || ''
        });
        console.log('图片链接已设置:', {
          defaultBg: res.fileList[0].tempFileURL,
          battle1: res.fileList[1].tempFileURL,
          battle2: res.fileList[2].tempFileURL
        });
      }
    } catch (err) {
      console.error('加载默认图片失败:', err);
    }
  },

  async checkHabits() {
    try {
      const res = await db.collection('habits').count();
      this.setData({
        hasHabits: res.total > 0
      });
    } catch (err) {
      console.error('查询习惯失败:', err);
    }
  },

  goToAddHabit() {
    wx.navigateTo({
      url: '/pages/addHabit/addHabit'
    });
  },

  goToBattle() {
    wx.navigateTo({
      url: '/pages/Battle/Battle'
    });
  },

  onContainerTap(e) {
    console.log('容器被点击');
    
    // 获取点击的元素类名
    const targetId = e.target.id || '';
    const targetClass = e.target.dataset.class || '';
    
    // 如果点击的是按钮区域，不触发
    if (targetId.includes('button') || targetClass.includes('button')) {
      console.log('点击了按钮，不更换背景');
      return;
    }
    
    // 检查是否点击的是overlay或container
    if (e.target === e.currentTarget || targetId === '' || targetClass === 'overlay') {
      console.log('触发背景更换');
      this.changeBg();
    }
  },

  async changeBg() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      
      const tempFilePath = res.tempFilePaths[0];
      
      wx.showLoading({ title: '上传中...' });
      
      // 上传到云存储
      const cloudPath = 'backgrounds/' + Date.now() + '-' + Math.random().toString(36).substr(2) + '.jpg';
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempFilePath
      });
      
      const fileID = uploadRes.fileID;
      
      // 获取临时链接
      const tempUrlRes = await wx.cloud.getTempFileURL({
        fileList: [fileID]
      });
      
      const tempUrl = tempUrlRes.fileList[0].tempFileURL;
      
      wx.hideLoading();
      
      // 保存到本地缓存
      wx.setStorageSync('customBg', tempUrl);
      wx.setStorageSync('customBgFileID', fileID);
      
      this.setData({ customBg: tempUrl });
      
      wx.showToast({
        title: '背景已更换',
        icon: 'success'
      });
      
    } catch (err) {
      wx.hideLoading();
      if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        console.error('更换背景失败:', err);
        wx.showToast({
          title: '更换失败',
          icon: 'none'
        });
      }
    }
  }
})