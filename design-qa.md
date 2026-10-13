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

## 装备页补图验证

用户补充九张截图后，三张宣传横幅、四条完整商品行与六个详情面板已经按名称接入。详情为原图，不重新排版或绘制。

- MHS / HVK-2 / 图灵砖三张横幅与原裁切图逐像素一致。
- HLS2 / HMP / HVK2 / 突击手四条商品行与原裁切图逐像素一致。
- H09 / MHS / HLS-2 / HMP / Hvk-2 / 突击手六个详情面板与各自原裁切图逐像素一致。
- 详情关闭、收藏、横竖屏点击、原横幅轮播通过。
- H09 已售罄、HVK-2 灰色购买状态保留；其他商品本地演示采购限额与刷新持久化通过。

[装备页截图](docs/qa-original/equipment-original-overview.png) · [结果](docs/qa-original/equipment-results.json) · [验证脚本](scripts/verify-equipment.py)

## 仍未解决的素材缺口

- “想尽办法搞钱”等部分论坛头像没有可读取的原文件，暂留空。
- 已恢复的论坛头像、寻人卡、图灵砖缩略图来自低分辨率原站攻略截图。
- 本次装备截图未提供图灵砖、H09、MHS 三条完整且未被详情遮挡的商品行，也未提供图灵砖详情。前三行继续使用已知文字和可用原版图鉴图片；图灵砖弹层仅展示已知宣传图与售价，不编造装备参数。
- 论坛完整正文与全部回复仍需原始资料进一步核对。

已取得的首页与装备原图修正已验证；**不将缺失素材的部分标记为完整复刻验收通过**。
