const db = wx.cloud.database();

Page({
  data: {
    habitTitle: '',
    isBattling: false,
    advices: [],
    currentAdvice: '',
    isOver: false,
    customBg: '',
    
    // 滚轮相关数据
    habitList: [],
    defaultHabits: [
      '吃瓜子', 
      '刷短视频', 
      '熬夜', 
      '吃零食', 
      '拖延症',
      '玩手机',
      '抽烟',
      '喝酒',
      '吃糖',
      '咬指甲'
    ],
    selectedHabitIndex: 0
  },

  onHabitChange(e) {
    const index = e.detail.value;
    const habits = this.data.habitList.length > 0 ? this.data.habitList : this.data.defaultHabits;
    this.setData({
      selectedHabitIndex: index,
      habitTitle: habits[index]
    });
  },

  async onLoad() {
    const customBg = wx.getStorageSync('customBg');
    if (customBg) {
      this.setData({ customBg });
    }
    
    // 加载所有习惯
    await this.loadAllHabits();
  },
  
  async loadAllHabits() {
    try {
      const res = await db.collection('habits').field({
        title: true
      }).get();
      
      // 去重：使用Set过滤重复的习惯
      const uniqueHabits = [...new Set(res.data.map(item => item.title))];
      
      if (uniqueHabits.length > 0) {
        // 有习惯，使用真实数据
        this.setData({
          habitList: uniqueHabits,
          habitTitle: uniqueHabits[0]
        });
      } else {
        // 没有习惯，使用范例数据
        this.setData({
          habitTitle: this.data.defaultHabits[0]
        });
      }
    } catch (err) {
      console.error('加载习惯列表失败:', err);
      // 失败时使用范例数据
      this.setData({
        habitTitle: this.data.defaultHabits[0]
      });
    }
  },
  
  onInput(e) {
    this.setData({ habitTitle: e.detail.value });
  },

  async startJudge() {
    if (!this.data.habitTitle) return;
    
    // 从云数据库查询该习惯下的所有劝告
    const res = await db.collection('habits').where({
      title: this.data.habitTitle
    }).get();

    if (res.data.length > 0) {
      let list = res.data[0].advices;
      this.setData({
        isBattling: true,
        advices: list.sort(() => Math.random() - 0.5), // 随机排序
        isOver: false
      });
      this.showNext();
    } else {
      wx.showToast({ title: '尚未添加该习惯的劝告', icon: 'none' });
    }
  },

  showNext() {
    let list = this.data.advices;
    if (list.length > 0) {
      const current = list.pop();
      this.setData({ 
        currentAdvice: current,
        advices: list
      });
    } else {
      this.setData({ 
        currentAdvice: "你开心最重要，吃完有什么想法可以继续分享给我哦",
        isOver: true 
      });
    }
  },

  nextAdvice() {
    // 触发短震动
    wx.vibrateShort({
      type: 'heavy'
    });
    this.showNext();
  },

  win() {
    this.setData({
      currentAdvice: "你真棒，你又一次战胜了自己的猪瘾！",
      isOver: true
    });
  },

  reset() {
    wx.navigateBack({
      delta: 1
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});