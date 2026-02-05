const db = wx.cloud.database();

Page({
  data: {
    habitTitle: '',
    currentAdvice: '',
    advices: [],
    customBg: ''
  },

  onLoad() {
    const customBg = wx.getStorageSync('customBg');
    if (customBg) {
      this.setData({ customBg });
    }
  },

  onHabitInput(e) {
    const value = e.detail.value;
    this.setData({ habitTitle: value });
  },

  onAdviceInput(e) {
    const value = e.detail.value;
    this.setData({ currentAdvice: value });
  },

  addAdviceToList() {
    const advice = this.data.currentAdvice;
    if (!advice || !advice.trim()) {
      wx.showToast({ title: '请输入劝告内容', icon: 'none' });
      return;
    }
    
    const newAdvices = this.data.advices.slice();
    newAdvices.push(advice.trim());
    
    this.setData({
      advices: newAdvices,
      currentAdvice: ''
    });
  },

  addAdviceToList() {
    if (!this.data.currentAdvice || !this.data.currentAdvice.trim()) return;
    this.setData({
      advices: [...this.data.advices, this.data.currentAdvice.trim()],
      currentAdvice: ''
    });
    
    // 清空输入框
    const query = wx.createSelectorQuery();
    query.select('.input-advice').fields({ node: true });
    query.exec((res) => {
      if (res[0] && res[0].node) {
        res[0].node.value = '';
      }
    });
  },

  async saveToCloud() {
    const habitTitle = this.data.habitTitle ? this.data.habitTitle.trim() : '';
    const advices = this.data.advices;
    
    if (!habitTitle || advices.length === 0) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      await db.collection('habits').add({
        data: {
          title: habitTitle,
          advices: advices,
          createTime: db.serverDate()
        }
      });
      
      wx.hideLoading();
      wx.showToast({ 
        title: '保存成功', 
        icon: 'success',
        duration: 1500
      });
      
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 1500);
      
    } catch (err) {
      wx.hideLoading();
      console.error('保存失败:', err);
      wx.showToast({ 
        title: '保存失败，请重试', 
        icon: 'none',
        duration: 2000
      });
    }
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});