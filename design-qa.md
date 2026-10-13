# 原图复刻修正 QA

2026-10-13。

上一版使用重绘人物、通用头像和不同的手机排版，未达到用户要求，本次撤销这些处理。

## 首页

使用用户上传的三张 1280 × 889 截图。保留 x=0…1280、y=48…858 的网站区域。只在注意力点数、红色破译侧条的位置移除游戏 HUD；顶部活动按钮和底部 UID 位于裁切范围外。原人物、文字、签名、卡片没有重绘或独立缩放。

浏览器在 1280 × 810 下渲染三张页面后，分别与处理后的原图逐像素比较，三张差异边界均为 `None`（没有差异）。

- [哈德森](docs/qa-original/home-hudson.png)
- [德穆兰](docs/qa-original/home-demulan.png)
- [曼德尔](docs/qa-original/home-mandel.png)
- [手机竖屏](docs/qa-original/chromium-390-home.png)
- [手机横屏](docs/qa-original/chromium-844-home.png)

## 功能与布局

Chromium 实测通过：

- 原图轮播及对应点击区域。
- 四个栏目导航、员工卡片查看。
- 论坛回复、装备详情、演示采购、寻人线索表单。
- 390 × 844 和 844 × 390 下完整画面等比显示，无横向溢出、无缺图，点击区域与图片一起缩放。
- 无 JavaScript 异常或 HTTP 资源加载错误。

结果记录：[regression-results.json](docs/qa-original/regression-results.json)。脚本：[verify-original.py](scripts/verify-original.py)。

尝试安装 WebKit 以验证 Safari 同系列渲染引擎，但执行环境缺少 GTK 等系统库且无法安装系统依赖；没有声称完成 WebKit 或真实 iPhone Safari 测试。

## 仍未解决的素材缺口

- “想尽办法搞钱”等部分论坛头像没有可读取的原文件，暂留空。
- HVK 横幅、已恢复的论坛头像与寻人卡来自低分辨率原站攻略截图，清晰度低于用户先前展示的截图。
- MHS、图灵砖的原宣传横幅尚未取得，当前只显示 HVK 原横幅。
- 论坛完整正文与全部回复仍需原始资料进一步核对。

首页原图修正已验证；**不将整个网站标记为完整复刻验收通过**。以上缺口需要原始截图文件补齐，不用生成图片替代。
