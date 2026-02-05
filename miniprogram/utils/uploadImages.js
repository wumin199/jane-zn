// 一次性上传工具 - 将本地大图片上传到云存储
// 使用方法：在小程序中调用一次即可，上传后可以删除此文件

const uploadImagesToCloud = async () => {
  const images = [
    { localPath: '../../images/bg.png', cloudPath: 'default-images/bg.png' },
    { localPath: '../../images/battle1.png', cloudPath: 'default-images/battle1.png' },
    { localPath: '../../images/battle2.png', cloudPath: 'default-images/battle2.png' }
  ];

  console.log('开始上传图片到云存储...');
  
  for (const img of images) {
    try {
      // 注意：小程序中无法直接读取本地文件路径上传
      // 需要手动在云开发控制台上传，或通过其他方式
      console.log(`请手动上传: ${img.localPath} -> 云存储路径: ${img.cloudPath}`);
    } catch (err) {
      console.error('上传失败:', err);
    }
  }
};

module.exports = {
  uploadImagesToCloud
};
