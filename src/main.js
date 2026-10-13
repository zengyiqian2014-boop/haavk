import "@phosphor-icons/web/regular";
import "./style.css";
import {
  heroes,
  employees,
  voices,
  threads,
  products,
  banners,
} from "./data.js";
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
const $ = (s, root = document) => root.querySelector(s);
const icon = (name) => `<i class="ph ph-${name}" aria-hidden="true"></i>`;
const esc = (str = "") =>
  String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const paragraphs = (str) =>
  str
    .split("\n\n")
    .map((p) => `<p>${esc(p).replaceAll("\n", "<br>")}</p>`)
    .join("");
const storageKey = "haavk-website-v1";
let state = {
  read: [],
  likes: [],
  replies: {},
  posts: [],
  orders: {},
  clues: {},
  favorites: [],
};
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (saved && Array.isArray(saved.read) && Array.isArray(saved.posts))
    state = { ...state, ...saved };
} catch {}
const save = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {}
};
const orderCount = (p) =>
  Math.max(p.initialCount || 0, state.orders[p.id] || 0);
const allThreads = () => [...state.posts, ...threads];
const threadById = (id) => allThreads().find((x) => x.id === id);
const repliesFor = (t) => [...t.replies, ...(state.replies[t.id] || [])];
let currentHero = 0,
  currentBanner = 0,
  heroTimer,
  bannerTimer,
  toastTimer,
  focusBeforeModal;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3400);
}
function avatar(type = "") {
  if (type === "brand")
    return `<span class="avatar brand-avatar"><span class="brand-image" aria-hidden="true"></span></span>`;
  const original = ["claire", "bear", "red", "soldier", "blue"].includes(type);
  return `<span class="avatar">${original ? `<img src="${asset(`avatar-${type}.png`)}" alt="">` : ""}</span>`;
}
function header(page) {
  return `<header class="site-header ${["about", "solutions"].includes(page) ? "original-header" : ""}"><a href="#about" class="brand" aria-label="哈夫克集团首页"><span class="brand-image" role="img" aria-label="HAAVK"></span></a><nav aria-label="主导航">${[
    ["about", "关于我们"],
    ["forum", "员工论坛"],
    ["solutions", "解决方案"],
    ["wanted", "寻人启事"],
  ]
    .map(
      ([id, label]) =>
        `<a href="#${id}" ${page === id ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join("")}</nav></header>`;
}
function dots(items, active, action) {
  return `<div class="carousel-dots" aria-label="轮播切换">${items.map((item, i) => `<button class="${i === active ? "active" : ""}" data-action="${action}" data-index="${i}" aria-label="第 ${i + 1} 张：${esc(item.title)}" aria-pressed="${i === active}"></button>`).join("")}</div>`;
}
function home() {
  return `<main class="home-page original-home" aria-label="关于我们"><section class="original-slides" aria-label="集团宣传轮播">${heroes.map((h, i) => `<img class="original-screen ${i === currentHero ? "active" : ""}" src="${asset(h.image)}" alt="${h.name}：${h.title}，原站完整宣传画面" width="1280" height="810" ${i === 0 ? 'fetchpriority="high"' : ""}>`).join("")}</section><div id="hero-copy" class="sr-only">${heroCopy()}</div><div class="hero-controls">${dots(heroes, currentHero, "hero")}<button class="carousel-pause" data-action="pause-hero" aria-label="${reduced.matches ? "继续轮播" : "暂停轮播"}" aria-pressed="${reduced.matches}">${icon(reduced.matches ? "play" : "pause")}</button></div><section class="original-people" aria-label="优秀员工与员工之声">${employees.map((e, i) => `<button class="original-hotspot employee-hotspot employee-${i}" data-action="employee" data-index="${i}" aria-label="${e.name}：${e.quote.replaceAll("\n", "，")}"></button>`).join("")}${voices.map((v, i) => `<button class="original-hotspot voice-hotspot voice-${i}" data-action="voice" data-index="${i}" aria-label="${v.name}：${v.quote.replaceAll("\n", "，")}"></button>`).join("")}</section></main>`;
}
function heroCopy() {
  const h = heroes[currentHero];
  return `<h1>${h.title}</h1><p>${h.subtitle}</p>`;
}
function setHero(i) {
  currentHero = i;
  document
    .querySelectorAll(".original-screen")
    .forEach((el, j) => el.classList.toggle("active", i === j));
  if ($("#hero-copy")) $("#hero-copy").innerHTML = heroCopy();
  document.querySelectorAll('[data-action="hero"]').forEach((el, j) => {
    el.classList.toggle("active", i === j);
    el.setAttribute("aria-pressed", String(i === j));
  });
}
function sidebar(title, body, cards = [], button = "") {
  return `<aside class="sidebar"><h1 class="section-title">${title}</h1><div class="sidebar-body">${body}</div><div class="principle-cards">${cards.map((c) => `<div class="principle">${icon(c[0])}<div><strong>${c[1]}</strong><p>${c[2]}</p></div></div>`).join("")}</div>${button}<span class="sidebar-micro" aria-hidden="true">HAAVK / INTERNAL COMMUNICATION</span></aside>`;
}
const forumSidebar = () =>
  sidebar(
    "员工论坛",
    "<p>所有的发言都应符合集团内部交流规范。</p><p>请注意维护符合集团价值的舆论导向，曼德尔特智能系统将自动检测当前舆情的主要特点并总结如下：</p>",
    [
      [
        "arrows-left-right",
        "人效调和",
        "在人本关切与执行效率之间，我们正努力寻找平衡。",
      ],
      [
        "arrows-out-line-horizontal",
        "有限接触",
        "与阿萨拉的合作是权宜手段，对阿萨拉的警惕是长期原则。",
      ],
      [
        "clipboard-text",
        "门可罗雀",
        "多数员工认为论坛讨论不值得影响工作绩效。",
      ],
    ],
    '<button class="primary post-button" data-action="compose">发帖</button>',
  );
function forum() {
  return `<main class="interior forum-page">${forumSidebar()}<section class="forum-content"><div class="forum-table-head"><span>标题</span><span>发帖人</span><span>回复</span><span>最后回复</span></div><div class="thread-list">${allThreads()
    .map((t) => {
      const r = repliesFor(t),
        count =
          (t.referenceCount ?? t.replies.length) +
          (state.replies[t.id]?.length || 0),
        last =
          state.replies[t.id]?.at(-1)?.name ||
          t.referenceLast ||
          r.at(-1)?.name ||
          t.author,
        read = state.read.includes(t.id);
      return `<a href="#forum/${encodeURIComponent(t.id)}" class="thread-row ${read ? "read" : "unread"}"><span class="thread-title"><span class="read-square" aria-label="${read ? "已读" : "未读"}"></span><strong>${esc(t.title)}</strong></span><span class="thread-author">${avatar(t.avatar)}<span><strong>${esc(t.author)}</strong><span>${esc(t.dept)}</span></span></span><span class="reply-count">${count}/${count}</span><span class="last-reply">${esc(last)}</span></a>`;
    })
    .join(
      "",
    )}</div><div class="forum-legend"><span>${icon("push-pin")} 系统置顶</span><span><b class="read-square"></b> 全新未读</span><span><b class="read-square outline"></b> 有未读回复</span><button data-action="read-all">${icon("checks")} 全部已读</button></div></section></main>`;
}
function detail(id) {
  const t = threadById(id);
  if (!t)
    return '<main class="not-found"><h1>未找到这篇帖子</h1><a href="#forum">返回员工论坛</a></main>';
  if (!state.read.includes(id)) {
    state.read.push(id);
    save();
  }
  return `<main class="thread-detail"><article class="post-panel"><div class="post-author">${avatar(t.avatar)}<div><h1>${esc(t.author)}</h1><p>${esc(t.dept)}</p><span class="badge">${esc(t.role)}</span></div><span class="permit">OPERATION PERMIT<small>FREE SPEECH IS BASED ON EFFICIENCY</small></span></div><div class="post-scroll"><h2>${esc(t.title)}</h2><div class="post-body">${paragraphs(t.body)}</div></div><div class="post-meta"><time>${t.date}</time><button data-action="like" data-id="${id}" aria-label="点赞" aria-pressed="${state.likes.includes(id)}">${icon("thumbs-up")} ${t.likes + Number(state.likes.includes(id))}</button><span>${icon("chat-centered-dots")} ${repliesFor(t).length}</span></div></article><section class="reply-panel"><div class="reply-heading"><h2 class="section-title">员工论坛</h2><a href="#forum">${icon("arrow-left")} 返回列表</a></div><div class="replies" id="replies">${repliesFor(
    t,
  )
    .map(
      (r) =>
        `<article class="reply">${avatar(r.avatar)}<div><div class="reply-person"><strong>${esc(r.name)}</strong><span>${esc(r.dept)}</span>${r.role ? `<span class="badge">${esc(r.role)}</span>` : ""}</div><p>${esc(r.text).replaceAll("\n", "<br>")}</p><time>${r.time}</time></div></article>`,
    )
    .join(
      "",
    )}</div><form class="reply-form" data-form="reply" data-id="${id}"><label for="reply-text" class="reply-user">${icon("user-circle")}<span class="sr-only">回复内容</span></label><input id="reply-text" name="reply" placeholder="回复点什么…" required maxlength="1000" autocomplete="off"><button type="submit" aria-label="发送回复">${icon("paper-plane-right")}</button></form></section></main>`;
}
const shopSidebar = () =>
  sidebar(
    "解决方案",
    "<p>集团员工有义务在执行勤务时自费购买集团装备。<br>所有员工严禁使用来自第三方的不可靠装备。</p><p>集团致力于持续研发优质产品，为复杂的战场提供丰富的解决方案。</p>",
    [["truck", "军工品质", "哈夫克制品总能经受战火的考验"]],
  );
function bannerMarkup() {
  return `${banners.map((b, i) => `<img class="original-product-banner ${i === currentBanner ? "active" : ""}" src="${asset(b.image)}" alt="${b.title}：${b.subtitle}" width="909" height="169">`).join("")}${dots(banners, currentBanner, "banner")}`;
}
function productRow(p) {
  const count = orderCount(p);
  const disabled = count >= p.limit || p.available === false;
  const label = count >= p.limit ? "已售罄" : "购买";
  if (p.rowImage)
    return `<article class="product-row original-product-row" data-product-id="${p.id}"><img class="original-row-image" src="${asset(p.rowImage)}" alt="${p.name}，售价${p.price}，${p.desc}" width="889" height="130"><h2 class="sr-only">${p.name}</h2><button class="original-row-picture" data-action="product" data-id="${p.id}" aria-label="查看${p.name}详情"></button><button class="original-row-detail" data-action="product" data-id="${p.id}" aria-label="${p.name}物品详情"></button>${count ? `<span class="original-row-count" style="left:${p.countLeft}px">限购：${count}/${p.limit}</span>` : ""}<button class="original-row-buy ${count >= p.limit ? "sold-out" : ""}" data-action="buy" data-id="${p.id}" ${disabled ? "disabled" : ""} aria-label="${label}${p.name}">${count >= p.limit ? label : '<span class="sr-only">' + label + "</span>"}</button></article>`;
  return `<article class="product-row" data-product-id="${p.id}"><button class="product-picture" data-action="product" data-id="${p.id}" aria-label="查看${p.name}详情"><img src="${asset(p.image)}" alt="${p.name}" loading="lazy"></button><div class="product-description"><h2>${p.name}<span>限购：${count}/${p.limit}</span></h2><p>${p.desc}</p><button class="detail-link" data-action="product" data-id="${p.id}">物品详情 ${icon("caret-double-right")}</button></div><div class="product-buy"><span>${icon("coins")} ${p.price}</span><button class="primary" data-action="buy" data-id="${p.id}" ${disabled ? "disabled" : ""}>${label}</button></div></article>`;
}
function solutions() {
  return `<main class="original-solutions" aria-label="解决方案"><img class="solutions-original-shell" src="${asset("solutions-shell-original.png")}" alt="" width="1280" height="810"><div class="sr-only">${shopSidebar()}</div><section class="solutions-original-content"><div class="product-banner" aria-roledescription="轮播" aria-label="产品宣传">${bannerMarkup()}</div><div class="product-list">${products.map(productRow).join("")}</div></section></main>`;
}
function setBanner(i) {
  currentBanner = i;
  document
    .querySelectorAll(".original-product-banner")
    .forEach((el, j) => el.classList.toggle("active", i === j));
  document.querySelectorAll('[data-action="banner"]').forEach((el, j) => {
    el.classList.toggle("active", i === j);
    el.setAttribute("aria-pressed", String(i === j));
  });
}
function wanted() {
  return `<main class="interior wanted-page">${sidebar("寻人启事", "<p>为保障集团员工与阿萨拉地区居民安全，哈夫克集团对部分失联人员持续加以特别关注。<br>集团员工或社会人士如能提供这些失联人士的有效信息，集团会发放合理的奖励。</p><p>我们相信，每一位失联人员都有回家的权利。让我们一起献出爱心，伸出援手，帮他们早日回家。</p><p>哈夫克集团保留对“回家”的全部解释权。</p>")}<section class="wanted-cards" aria-label="失联人员"><article class="wanted-card"><div class="wanted-tag">不善言语　神出鬼没</div><img src="${asset("wanted-h42-original.png")}" alt="H42失联人员肖像"><div class="wanted-name"><h2>H42</h2><p>需返回集团接受脑机康复训练</p></div><div class="wanted-reward"><span>悬赏哈夫币总额</span><strong class="number">99,999,999</strong><button data-action="clue" data-id="h42" ${state.clues.h42 ? "disabled" : ""}>${state.clues.h42 ? "已提交" : "提供线索"}</button></div></article><article class="wanted-card"><div class="wanted-tag">精瘦结实　暴躁冲动</div><img src="${asset("wanted-zoya-original.png")}" alt="佐娅失联人员肖像"><div class="wanted-name"><h2>佐娅</h2><p>亟需集团帮助继续其科研工作</p></div><div class="wanted-reward"><span>举报奖励</span><strong>脑机实验受试资格</strong><button data-action="clue" data-id="zoya" ${state.clues.zoya ? "disabled" : ""}>${icon("warning")} ${state.clues.zoya ? "已提交" : "提供线索"}</button></div></article></section></main>`;
}
function route() {
  closeModal(false);
  clearInterval(heroTimer);
  clearInterval(bannerTimer);
  const [raw, id] = location.hash.slice(1).split("/");
  const page = ["about", "forum", "solutions", "wanted"].includes(raw)
    ? raw
    : "about";
  document.body.dataset.page = page;
  $("#app").innerHTML =
    header(page) +
    (page === "about"
      ? home()
      : page === "forum"
        ? id
          ? detail(decodeURIComponent(id))
          : forum()
        : page === "solutions"
          ? solutions()
          : wanted());
  document.title = `${{ about: "关于我们", forum: "员工论坛", solutions: "解决方案", wanted: "寻人启事" }[page]} · HAAVK 哈夫克集团`;
  fitStage();
  window.scrollTo(0, 0);
  if (!reduced.matches) {
    if (page === "about")
      heroTimer = setInterval(() => {
        if (!document.hidden) setHero((currentHero + 1) % 3);
      }, 7000);
    if (page === "solutions")
      bannerTimer = setInterval(() => {
        if (!document.hidden) setBanner((currentBanner + 1) % banners.length);
      }, 6500);
  }
}
function modal(content, drawer = false) {
  focusBeforeModal = document.activeElement;
  $("#overlay-root").innerHTML =
    `<div class="modal-backdrop ${drawer ? "drawer-backdrop" : ""}"><section class="modal ${drawer ? "product-drawer" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close" aria-label="关闭">${icon("x")}</button>${content}</section></div>`;
  document.body.classList.add("modal-open");
  setTimeout(() => $(".modal input,.modal textarea,.modal-close")?.focus(), 20);
}
function closeModal(restore = true) {
  $("#overlay-root").innerHTML = "";
  document.body.classList.remove("modal-open");
  if (restore && focusBeforeModal?.isConnected) focusBeforeModal.focus();
}
function productModal(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  if (p.detailImage) {
    focusBeforeModal = document.activeElement;
    $("#overlay-root").innerHTML =
      `<div class="modal-backdrop original-equipment-backdrop"><div class="original-equipment-viewport"><div class="original-equipment-stage"><section class="modal original-equipment-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-product-id="${p.id}" style="top:${p.detailTop}px;height:${p.detailHeight}px"><img class="original-equipment-image" src="${asset(p.detailImage)}" width="402" height="${p.detailHeight}" alt="${p.detailName}原版详情：估价${p.referenceValue}，重量${p.weight}KG${p.durability ? `，耐久度${p.durability}` : ""}"><h2 id="modal-title" class="sr-only">${p.detailName}</h2><div class="sr-only"><span class="durability">${p.durability ? `${p.durability.toFixed(1)}/${p.durability.toFixed(1)}` : ""}</span>${p.stats.map(([k, v]) => `<p>${k}：${v}</p>`).join("")}</div><button class="modal-close original-panel-close" data-action="close" aria-label="关闭"></button><button class="original-panel-favorite" data-action="favorite" data-id="${p.id}" aria-label="收藏物品" aria-pressed="${state.favorites.includes(id)}"></button><button class="original-panel-source" data-action="source" data-id="${p.id}" aria-label="查看${p.name}来源"></button></section></div></div></div>`;
    document.body.classList.add("modal-open");
    setTimeout(() => $(".original-panel-close")?.focus(), 20);
    return;
  }
  modal(
    `<h2 id="modal-title">${p.name}</h2><img class="original-card-preview" src="${asset("banner-turing-original.png")}" alt="图灵砖原版宣传图"><p>${p.desc}</p><p>售价：${p.price} 哈夫币</p>`,
  );
}

function buyModal(id) {
  const p = products.find((x) => x.id === id);
  if (!p || orderCount(p) >= p.limit || p.available === false) return;
  modal(
    `<span class="modal-eyebrow">HAAVK / PROCUREMENT</span><h2 id="modal-title">装备采购</h2><div class="order-summary"><img src="${asset(p.image)}" alt="${p.name}"><div><h3>${p.name}</h3><p>${icon("coins")} ${p.price.toLocaleString()} 哈夫币</p><small>数量 1 · 剩余可购 ${p.limit - orderCount(p)}</small></div></div><p class="form-note">本次采购将保存为浏览器内的演示订单，不涉及真实支付或游戏道具发放。</p><div class="modal-actions"><button class="secondary" data-action="close">取消</button><button class="primary" data-action="confirm-buy" data-id="${id}">确认采购</button></div>`,
  );
}
function compose() {
  modal(
    `<span class="modal-eyebrow">HAAVK / EMPLOYEE FORUM</span><h2 id="modal-title">发布新帖</h2><form data-form="compose"><label>标题<input name="title" required maxlength="70" placeholder="想和同事聊些什么？"></label><label>内容<textarea name="body" required maxlength="4000" rows="6" placeholder="请在这里输入正文…"></textarea></label><p class="form-note">帖子保存在当前浏览器中。</p><button class="primary" type="submit">发布 ${icon("paper-plane-right")}</button></form>`,
  );
}
function clueModal(id) {
  if (state.clues[id]) return;
  modal(
    `<span class="modal-eyebrow">HAAVK / INFORMATION COLLECTION</span><h2 id="modal-title">提供关于 ${id === "h42" ? "H42" : "佐娅"} 的线索</h2><form data-form="clue" data-id="${id}"><label>发现地点<input name="location" required maxlength="100" placeholder="请填写发现地点"></label><label>线索描述<textarea name="clue" required maxlength="2000" rows="5" placeholder="您发现了什么？是如何发现的？"></textarea></label><p class="form-note">线索仅保存在当前浏览器，不会发送至游戏或官方服务器。</p><button class="primary" type="submit">提交线索 ${icon("arrow-right")}</button></form>`,
  );
}
document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal-backdrop") ||
    e.target.classList.contains("original-equipment-stage") ||
    e.target.classList.contains("original-equipment-viewport")
  )
    return closeModal();
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const { action, id, index } = el.dataset;
  if (action === "close") return closeModal();
  if (action === "hero") {
    clearInterval(heroTimer);
    setHero(Number(index));
    const b = $('[data-action="pause-hero"]');
    if (b) {
      b.setAttribute("aria-pressed", "true");
      b.setAttribute("aria-label", "继续轮播");
      b.innerHTML = icon("play");
    }
  }
  if (action === "pause-hero") {
    const paused = el.getAttribute("aria-pressed") === "true";
    el.setAttribute("aria-pressed", String(!paused));
    el.setAttribute("aria-label", paused ? "暂停轮播" : "继续轮播");
    el.innerHTML = icon(paused ? "pause" : "play");
    clearInterval(heroTimer);
    if (paused)
      heroTimer = setInterval(() => {
        if (!document.hidden) setHero((currentHero + 1) % 3);
      }, 7000);
  }
  if (action === "banner") {
    clearInterval(bannerTimer);
    setBanner(Number(index));
  }
  if (action === "employee") {
    const p = employees[index];
    modal(
      `<h2 id="modal-title" class="sr-only">${p.name}</h2><img class="original-card-preview" src="${asset(p.image)}" alt="${p.name}原站员工卡片">`,
    );
  }
  if (action === "voice") {
    const v = voices[index];
    modal(
      `<h2 id="modal-title" class="sr-only">${v.name}</h2><img class="original-card-preview" src="${asset(`voice-${index}-original.png`)}" alt="${v.name}原站员工之声卡片">`,
    );
  }
  if (action === "product") productModal(id);
  if (action === "buy") buyModal(id);
  if (action === "confirm-buy") {
    const p = products.find((x) => x.id === id);
    if (p && orderCount(p) < p.limit && p.available !== false) {
      state.orders[id] = orderCount(p) + 1;
      save();
      route();
      toast("采购完成，演示订单已保存在当前浏览器");
    }
  }
  if (action === "favorite") {
    const i = state.favorites.indexOf(id);
    i < 0 ? state.favorites.push(id) : state.favorites.splice(i, 1);
    save();
    el.setAttribute("aria-pressed", String(i < 0));
    toast(i < 0 ? "已收藏装备" : "已取消收藏");
  }
  if (action === "source") toast("来源：哈夫克集团 · 解决方案");
  if (action === "compose") compose();
  if (action === "clue") clueModal(id);
  if (action === "like") {
    const i = state.likes.indexOf(id);
    i < 0 ? state.likes.push(id) : state.likes.splice(i, 1);
    save();
    el.setAttribute("aria-pressed", String(i < 0));
    el.innerHTML =
      icon("thumbs-up") + " " + (threadById(id).likes + Number(i < 0));
  }
  if (action === "read-all") {
    state.read = allThreads().map((t) => t.id);
    save();
    route();
    toast("所有帖子已标记为已读");
  }
  if (action === "credits")
    modal(
      `<span class="modal-eyebrow">ABOUT THIS WEBSITE</span><h2 id="modal-title">HAAVK · 哈夫克集团</h2><p>基于《三角洲行动》「骇爪的网上冲浪」活动的非官方网页复刻。</p><p>首页人物、员工卡片及签名直接取自用户提供的原始截图；其他可获得的原站素材从截图中提取。本站不与游戏账户连接。</p><p>论坛、收藏、采购和线索提交均为当前浏览器内的演示交互。</p><a href="https://github.com/zengyiqian2014-boop/haavk" target="_blank" rel="noopener" class="text-link">查看项目 ${icon("arrow-up-right")}</a>`,
    );
});
document.addEventListener("submit", (e) => {
  const form = e.target;
  if (!form.dataset.form) return;
  e.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  if (form.dataset.form === "reply") {
    const text = values.reply.trim();
    if (!text) return;
    const id = form.dataset.id;
    state.replies[id] ??= [];
    state.replies[id].push({
      name: "访客",
      dept: "员工论坛",
      role: "",
      avatar: "blue",
      text,
      time: "刚刚",
    });
    save();
    route();
    $("#replies").scrollTop = $("#replies").scrollHeight;
    toast("回复已保存到当前浏览器");
  }
  if (form.dataset.form === "compose") {
    if (!values.title.trim() || !values.body.trim()) return;
    const id = "post-" + Date.now();
    state.posts.unshift({
      id,
      title: values.title.trim(),
      body: values.body.trim(),
      author: "访客",
      dept: "员工论坛",
      role: "新晋成员",
      avatar: "blue",
      date: new Date().toLocaleString("zh-CN", { hour12: false }),
      likes: 0,
      replies: [],
    });
    save();
    closeModal();
    location.hash = "forum/" + id;
    toast("帖子已发布到当前浏览器");
  }
  if (form.dataset.form === "clue") {
    if (!values.location.trim() || !values.clue.trim()) return;
    state.clues[form.dataset.id] = {
      location: values.location.trim(),
      clue: values.clue.trim(),
    };
    save();
    route();
    toast("线索已记录在当前浏览器");
  }
});
document.addEventListener("keydown", (e) => {
  const dialog = $(".modal");
  if (!dialog) return;
  if (e.key === "Escape") return closeModal();
  if (e.key === "Tab") {
    const nodes = [
      ...dialog.querySelectorAll(
        "button:not([disabled]),a[href],input,textarea",
      ),
    ];
    const first = nodes[0],
      last = nodes.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
function fitStage() {
  const scale = window.innerWidth / 1280;
  document.documentElement.style.setProperty("--stage-scale", scale);
  document.documentElement.style.setProperty(
    "--stage-height",
    `${810 * scale}px`,
  );
}
window.addEventListener("resize", fitStage);
window.addEventListener("orientationchange", fitStage);
window.addEventListener("hashchange", route);
route();
