const STORAGE_KEY = "keypal_inventory_admin_v1";

const seedProducts = [
  { sku: "FG-KP2-BLK", name: "KeyPal 2 黑色-喷油", type: "成品", variant: "黑色-喷油", unit: "台", weight: "50g", size: "86.5*54.5*8.1mm", safetyStock: 100, enabled: true },
  { sku: "FG-KP2-RED", name: "KeyPal 2 红色-喷油", type: "成品", variant: "红色-喷油", unit: "台", weight: "", size: "", safetyStock: 100, enabled: true },
  { sku: "FG-KP2-PNK", name: "KeyPal 2 粉色-喷油", type: "成品", variant: "粉色-喷油", unit: "台", weight: "", size: "", safetyStock: 100, enabled: true },
  { sku: "FG-KP2-BLU-TR", name: "KeyPal 2 蓝色-透明", type: "成品", variant: "蓝色-透明", unit: "台", weight: "", size: "", safetyStock: 100, enabled: true },
  { sku: "FG-PRO-G", name: "Pro 拉丝钛金（金色）", type: "成品", variant: "G=Gold", unit: "个", weight: "205g", size: "105mm*60mm*6mm", safetyStock: 50, enabled: true },
  { sku: "FG-PRO-S", name: "Pro 拉丝原色", type: "成品", variant: "Silver", unit: "个", weight: "205g", size: "105mm*60mm*6mm", safetyStock: 50, enabled: true },
  { sku: "FG-304-BASIC", name: "304基础版", type: "成品", variant: "基础版", unit: "个", weight: "", size: "", safetyStock: 50, enabled: true },
  { sku: "FG-CARD-BLU", name: "卡片蓝", type: "成品", variant: "蓝色", unit: "张", weight: "", size: "", safetyStock: 80, enabled: true },
  { sku: "FG-CARD-GRN", name: "卡片绿", type: "成品", variant: "绿色", unit: "张", weight: "", size: "", safetyStock: 80, enabled: true },
  { sku: "FG-CASE", name: "皮套", type: "配件", variant: "标准", unit: "个", weight: "", size: "", safetyStock: 30, enabled: true },
  { sku: "FG-KP2-HashKey", name: "KeyPal 2 万向联名款", type: "成品", variant: "联名款", unit: "台", weight: "", size: "", safetyStock: 30, enabled: true },
  { sku: "KP2-SHELL-BLK", name: "壳体-黑色", type: "耗材", variant: "黑色", unit: "套", weight: "", size: "", safetyStock: 200, enabled: true },
  { sku: "KP2-SHELL-RED", name: "壳体-红色", type: "耗材", variant: "红色", unit: "套", weight: "", size: "", safetyStock: 200, enabled: true },
  { sku: "KP2-SHELL-PNK", name: "壳体-粉色", type: "耗材", variant: "粉色", unit: "套", weight: "", size: "", safetyStock: 200, enabled: true },
  { sku: "KP2-SHELL-BLU", name: "壳体-透明蓝色", type: "耗材", variant: "透明蓝色", unit: "套", weight: "", size: "", safetyStock: 200, enabled: true },
  { sku: "PKG-KP2-BOX-BLK", name: "KeyPal 2 黑色天地盖", type: "耗材", variant: "黑色", unit: "套", weight: "", size: "", safetyStock: 200, enabled: true },
];

const seedBalances = {
  "FG-KP2-BLK": 307,
  "FG-KP2-RED": 166,
  "FG-KP2-PNK": 169,
  "FG-KP2-BLU-TR": 142,
  "FG-PRO-G": 80,
  "FG-PRO-S": 75,
  "FG-304-BASIC": 120,
  "FG-CARD-BLU": 260,
  "FG-CARD-GRN": 240,
  "FG-CASE": 60,
  "FG-KP2-HashKey": 32,
  "KP2-SHELL-BLK": 0,
  "KP2-SHELL-RED": 0,
  "KP2-SHELL-PNK": 0,
  "KP2-SHELL-BLU": 1200,
  "PKG-KP2-BOX-BLK": 1000,
};

const navItems = [
  ["dashboard", "仪表盘"],
  ["products", "SKU管理"],
  ["inbound", "入库管理"],
  ["outbound", "出库管理"],
  ["stock", "库存总览"],
  ["sales", "销售汇总"],
  ["consumables", "耗材管理"],
  ["afterSales", "售后管理"],
  ["settings", "系统管理"],
];

let state = loadState();
let view = "dashboard";
let modal = null;
let filters = {};
let authMode = "login";

function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value) {
  return Number(value || 0).toLocaleString("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 });
}

function number(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  const initialMovements = Object.entries(seedBalances).map(([sku, quantity]) => ({
    id: uid("MV"),
    date: "2026-02-28",
    sku,
    quantity,
    direction: "in",
    sourceType: "期初库存",
    sourceId: "OPENING-2026",
    warehouse: "深圳仓",
    location: "A-01",
    operator: "系统初始化",
    note: "由 Excel 库存表初始化",
  }));
  return {
    users: [],
    sessionUserId: null,
    products: seedProducts,
    inboundOrders: [],
    outboundOrders: [
      {
        id: "OUT20251229001",
        date: "2025-12-29",
        type: "销售",
        platform: "有赞",
        platformNo: "DEMO-ORDER-001",
        handler: "Warren",
        courier: "顺丰",
        trackingNo: "",
        shippingFee: 0,
        amount: 699,
        note: "历史样例",
        items: [{ sku: "FG-KP2-BLK", quantity: 1, price: 699 }],
      },
      {
        id: "OUT20251229002",
        date: "2025-12-29",
        type: "销售",
        platform: "有赞",
        platformNo: "DEMO-ORDER-002",
        handler: "Warren",
        courier: "顺丰",
        trackingNo: "",
        shippingFee: 0,
        amount: 699,
        note: "历史样例",
        items: [{ sku: "FG-KP2-RED", quantity: 1, price: 699 }],
      },
    ],
    consumableLogs: [
      { id: uid("CS"), date: "2026-02-28", sku: "KP2-SHELL-BLK", type: "到货", quantity: 1500, note: "Excel 耗材统计初始到货" },
      { id: uid("CS"), date: "2026-02-28", sku: "KP2-SHELL-RED", type: "到货", quantity: 1500, note: "Excel 耗材统计初始到货" },
      { id: uid("CS"), date: "2026-02-28", sku: "KP2-SHELL-PNK", type: "到货", quantity: 1500, note: "Excel 耗材统计初始到货" },
    ],
    afterSales: [
      {
        id: "AS20260104001",
        date: "2026-01-04",
        type: "设备异常",
        orderNo: "DEMO-AFTERSALE-001",
        customer: "示例客户",
        sku: "FG-KP2-BLK",
        issue: "设备无法通过校验，安卓可以校验，苹果不能校验",
        status: "已解决",
        owner: "售后",
        solution: "已定位并解决",
      },
      {
        id: "AS20250922001",
        date: "2025-09-22",
        type: "漏发",
        orderNo: "DEMO-AFTERSALE-002",
        customer: "",
        sku: "FG-KP2-BLK",
        issue: "黑色硬件钱包 1 个，一月中旬发",
        status: "待处理",
        owner: "仓库",
        solution: "",
      },
    ],
    movements: initialMovements,
    warehouses: ["深圳仓", "北京工厂", "展会临时仓"],
    auditLogs: [],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentUser() {
  return state.users.find((user) => user.id === state.sessionUserId);
}

function productBySku(sku) {
  return state.products.find((product) => product.sku === sku);
}

function getMovements() {
  const inbound = state.inboundOrders.flatMap((order) =>
    order.items.map((item) => ({
      id: `${order.id}-${item.sku}`,
      date: order.date,
      sku: item.sku,
      quantity: Number(item.quantity),
      direction: "in",
      sourceType: "入库",
      sourceId: order.id,
      warehouse: order.warehouse,
      location: order.location,
      operator: order.supplier || currentUser()?.name || "系统",
      note: order.note,
    })),
  );
  const outbound = state.outboundOrders.flatMap((order) =>
    order.items.map((item) => ({
      id: `${order.id}-${item.sku}`,
      date: order.date,
      sku: item.sku,
      quantity: -Number(item.quantity),
      direction: "out",
      sourceType: order.type || "出库",
      sourceId: order.id,
      warehouse: "深圳仓",
      location: "",
      operator: order.handler,
      note: order.note,
    })),
  );
  const consumables = state.consumableLogs.map((log) => ({
    id: log.id,
    date: log.date,
    sku: log.sku,
    quantity: log.type === "消耗" ? -Number(log.quantity) : Number(log.quantity),
    direction: log.type === "消耗" ? "out" : "in",
    sourceType: `耗材${log.type}`,
    sourceId: log.id,
    warehouse: "深圳仓",
    location: "",
    operator: currentUser()?.name || "系统",
    note: log.note,
  }));
  return [...state.movements, ...inbound, ...outbound, ...consumables].sort((a, b) => b.date.localeCompare(a.date));
}

function stockMap() {
  return getMovements().reduce((acc, movement) => {
    acc[movement.sku] = (acc[movement.sku] || 0) + Number(movement.quantity || 0);
    return acc;
  }, {});
}

function logAudit(action, target) {
  state.auditLogs.unshift({
    id: uid("LOG"),
    time: new Date().toLocaleString("zh-CN"),
    user: currentUser()?.name || "未登录",
    action,
    target,
  });
  state.auditLogs = state.auditLogs.slice(0, 80);
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = currentUser() ? renderShell() : renderAuth();
  bindEvents();
}

function renderAuth() {
  return `
    <main class="auth-shell">
      <section class="auth-panel">
        <div class="auth-brand">
          <div class="brand-mark">KP</div>
          <h1>KeyPal 库存管理后台</h1>
          <p>商品出入库、SKU、耗材、售后和销售汇总集中管理。</p>
        </div>
        <div class="auth-tabs">
          <button class="${authMode === "login" ? "active" : ""}" data-auth-tab="login">登录</button>
          <button class="${authMode === "register" ? "active" : ""}" data-auth-tab="register">注册管理者</button>
        </div>
        <form class="form" data-form="${authMode}">
          ${authMode === "register" ? field("姓名", "name", "text", "例如 Warren") : ""}
          ${field("邮箱", "email", "email", "admin@keypal.local")}
          ${field("密码", "password", "password", "至少 6 位")}
          <button class="btn primary" type="submit">${authMode === "login" ? "登录后台" : "创建账号"}</button>
          <div class="hint">首次注册账号会自动成为超级管理员。演示版数据保存在当前浏览器。</div>
        </form>
      </section>
      <section></section>
    </main>
  `;
}

function field(label, name, type = "text", placeholder = "", value = "", extra = "") {
  return `
    <div class="field ${extra}">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" value="${escapeHtml(value)}" />
    </div>
  `;
}

function renderShell() {
  const user = currentUser();
  return `
    <div class="layout">
      <aside class="sidebar">
        <div class="side-head">
          <div class="brand-mark">KP</div>
          <div>
            <div class="side-title">KeyPal Admin</div>
            <div class="side-subtitle">库存与销售后台</div>
          </div>
        </div>
        <nav class="nav">
          ${navItems.map(([id, label]) => `<button class="${view === id ? "active" : ""}" data-view="${id}">${label}</button>`).join("")}
        </nav>
        <div class="user-box">
          <strong>${escapeHtml(user.name)}</strong>
          <span class="side-subtitle">${escapeHtml(user.role)}</span>
          <button class="btn ghost" data-action="logout">退出登录</button>
        </div>
      </aside>
      <main class="content">
        ${renderView()}
      </main>
      ${modal ? renderModal() : ""}
    </div>
  `;
}

function page(title, subtitle, actions, body) {
  return `
    <div class="topbar">
      <div class="page-title">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="actions">${actions || ""}</div>
    </div>
    ${body}
  `;
}

function renderView() {
  const views = {
    dashboard: renderDashboard,
    products: renderProducts,
    inbound: renderInbound,
    outbound: renderOutbound,
    stock: renderStock,
    sales: renderSales,
    consumables: renderConsumables,
    afterSales: renderAfterSales,
    settings: renderSettings,
  };
  return views[view]();
}

function renderDashboard() {
  const stock = stockMap();
  const productRows = state.products.map((product) => ({ ...product, stock: stock[product.sku] || 0 }));
  const lowRows = productRows.filter((item) => item.stock < Number(item.safetyStock || 0));
  const currentMonth = today().slice(0, 7);
  const monthOrders = state.outboundOrders.filter((order) => order.date.slice(0, 7) === currentMonth);
  const monthQty = monthOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + Number(item.quantity), 0), 0);
  const monthAmount = monthOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  return page(
    "仪表盘",
    "从 Excel 台账整理出的库存、销售、耗材和售后经营视图。",
    `<button class="btn primary" data-open="outbound">新增出库</button><button class="btn" data-open="inbound">新增入库</button>`,
    `
      <section class="grid four">
        ${metric("本月出库", number(monthQty), "按出库单明细统计")}
        ${metric("本月销售额", money(monthAmount), "按订单金额统计")}
        ${metric("低库存 SKU", number(lowRows.length), "当前库存低于安全库存")}
        ${metric("待处理售后", number(state.afterSales.filter((x) => x.status !== "已解决" && x.status !== "已关闭").length), "需要跟进的工单")}
      </section>
      <section class="grid two" style="margin-top:14px">
        <div class="panel">
          <div class="panel-head"><h2>低库存预警</h2><span class="badge warn">${lowRows.length} 项</span></div>
          ${renderTable(lowRows.slice(0, 8), ["SKU", "名称", "当前库存", "安全库存", "状态"], (row) => [
            row.sku,
            row.name,
            number(row.stock),
            number(row.safetyStock),
            stockBadge(row.stock, row.safetyStock),
          ])}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>SKU 出库排行</h2><span class="badge info">近全部</span></div>
          ${renderSkuBars()}
        </div>
      </section>
      <section class="grid two" style="margin-top:14px">
        <div class="panel">
          <div class="panel-head"><h2>最近出库</h2></div>
          ${renderTable(state.outboundOrders.slice(0, 6), ["日期", "类型", "平台", "金额", "经手人"], (row) => [row.date, row.type, row.platform, money(row.amount), row.handler])}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>最近售后</h2></div>
          ${renderTable(state.afterSales.slice(0, 6), ["日期", "类型", "订单号", "状态"], (row) => [row.date, row.type, row.orderNo, statusBadge(row.status)])}
        </div>
      </section>
    `,
  );
}

function metric(label, value, note) {
  return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>`;
}

function renderProducts() {
  const rows = applyProductFilter(state.products);
  return page(
    "SKU 管理",
    "维护成品、配件、耗材的统一 SKU 档案。",
    `<button class="btn primary" data-open="product">新增 SKU</button>`,
    `
      ${toolbar("搜索 SKU / 名称", "productSearch", ["全部类型", "成品", "耗材", "配件"], "productType")}
      ${renderTable(rows, ["SKU", "名称", "类型", "颜色/版本", "单位", "安全库存", "状态", "操作"], (row) => [
        row.sku,
        row.name,
        row.type,
        row.variant,
        row.unit,
        number(row.safetyStock),
        row.enabled ? '<span class="badge ok">启用</span>' : '<span class="badge danger">停用</span>',
        `<div class="actions"><button class="action" data-edit-product="${row.sku}" title="编辑">改</button><button class="action" data-toggle-product="${row.sku}" title="启停">${row.enabled ? "停" : "启"}</button></div>`,
      ])}
    `,
  );
}

function renderInbound() {
  return page(
    "入库管理",
    "登记采购、生产、退回等到货记录，并自动增加库存。",
    `<button class="btn primary" data-open="inbound">新增入库</button>`,
    renderTable(state.inboundOrders, ["入库单号", "到货日期", "供应商", "SKU 明细", "质检", "仓库", "备注"], (row) => [
      row.id,
      row.date,
      row.supplier,
      itemsText(row.items),
      qcBadge(row.qcResult),
      `${row.warehouse || ""} ${row.location || ""}`,
      row.note,
    ]),
  );
}

function renderOutbound() {
  return page(
    "出库管理",
    "销售、展会、拆样、售后补发统一记录，保存后自动扣减库存。",
    `<button class="btn primary" data-open="outbound">新增出库</button>`,
    renderTable(state.outboundOrders, ["出库单号", "日期", "类型", "平台", "订单号", "SKU 明细", "金额", "经手人"], (row) => [
      row.id,
      row.date,
      row.type,
      row.platform,
      row.platformNo,
      itemsText(row.items),
      money(row.amount),
      row.handler,
    ]),
  );
}

function renderStock() {
  const stock = stockMap();
  const rows = state.products.map((product) => ({ ...product, stock: stock[product.sku] || 0 }));
  return page(
    "库存总览",
    "库存余额由期初、入库、出库、耗材消耗等流水汇总而来。",
    "",
    `
      ${renderTable(rows, ["SKU", "名称", "类型", "当前库存", "安全库存", "预警", "仓库"], (row) => [
        row.sku,
        row.name,
        row.type,
        number(row.stock),
        number(row.safetyStock),
        stockBadge(row.stock, row.safetyStock),
        "深圳仓",
      ])}
      <div class="panel" style="margin-top:14px">
        <div class="panel-head"><h2>库存流水</h2></div>
        ${renderTable(getMovements().slice(0, 80), ["日期", "SKU", "变化", "来源", "单号", "操作人", "备注"], (row) => [
          row.date,
          row.sku,
          `<strong class="${row.quantity >= 0 ? "text-ok" : "text-danger"}">${row.quantity >= 0 ? "+" : ""}${number(row.quantity)}</strong>`,
          row.sourceType,
          row.sourceId,
          row.operator,
          row.note,
        ])}
      </div>
    `,
  );
}

function renderSales() {
  const bySku = {};
  const byPlatform = {};
  const byMonth = {};
  state.outboundOrders.forEach((order) => {
    const month = order.date.slice(0, 7);
    byMonth[month] = byMonth[month] || { qty: 0, amount: 0 };
    byMonth[month].amount += Number(order.amount || 0);
    byPlatform[order.platform] = byPlatform[order.platform] || { orders: 0, amount: 0, qty: 0 };
    byPlatform[order.platform].orders += 1;
    byPlatform[order.platform].amount += Number(order.amount || 0);
    order.items.forEach((item) => {
      byMonth[month].qty += Number(item.quantity);
      byPlatform[order.platform].qty += Number(item.quantity);
      bySku[item.sku] = bySku[item.sku] || { sku: item.sku, qty: 0, amount: 0 };
      bySku[item.sku].qty += Number(item.quantity);
      bySku[item.sku].amount += Number(item.quantity) * Number(item.price || 0);
    });
  });
  return page(
    "销售汇总",
    "按月份、SKU 和平台汇总出库数量与订单金额。",
    "",
    `
      <section class="grid three">
        <div class="panel">
          <div class="panel-head"><h2>月度销售</h2></div>
          ${renderTable(Object.entries(byMonth).map(([month, value]) => ({ month, ...value })), ["月份", "数量", "金额"], (row) => [row.month, number(row.qty), money(row.amount)])}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>SKU 销售排行</h2></div>
          ${renderTable(Object.values(bySku).sort((a, b) => b.qty - a.qty), ["SKU", "名称", "数量", "金额"], (row) => [row.sku, productBySku(row.sku)?.name || "", number(row.qty), money(row.amount)])}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>平台汇总</h2></div>
          ${renderTable(Object.entries(byPlatform).map(([platform, value]) => ({ platform, ...value })), ["平台", "订单", "数量", "金额"], (row) => [row.platform, number(row.orders), number(row.qty), money(row.amount)])}
        </div>
      </section>
    `,
  );
}

function renderConsumables() {
  const stock = stockMap();
  const consumables = state.products.filter((product) => product.type === "耗材").map((product) => ({ ...product, stock: stock[product.sku] || 0 }));
  return page(
    "耗材管理",
    "维护壳体、天地盖等耗材库存，支持到货和消耗登记。",
    `<button class="btn primary" data-open="consumableLog">登记耗材</button>`,
    `
      ${renderTable(consumables, ["耗材 SKU", "名称", "单位", "当前库存", "安全库存", "预警"], (row) => [row.sku, row.name, row.unit, number(row.stock), number(row.safetyStock), stockBadge(row.stock, row.safetyStock)])}
      <div class="panel" style="margin-top:14px">
        <div class="panel-head"><h2>耗材流水</h2></div>
        ${renderTable(state.consumableLogs, ["日期", "类型", "SKU", "数量", "备注"], (row) => [row.date, row.type, row.sku, number(row.quantity), row.note])}
      </div>
    `,
  );
}

function renderAfterSales() {
  return page(
    "售后管理",
    "记录漏发、退换货、设备异常和处理结果，可作为补发出库依据。",
    `<button class="btn primary" data-open="afterSale">新增售后</button>`,
    renderTable(state.afterSales, ["工单号", "日期", "类型", "订单号", "SKU", "问题", "负责人", "状态", "操作"], (row) => [
      row.id,
      row.date,
      row.type,
      row.orderNo,
      row.sku,
      row.issue,
      row.owner,
      statusBadge(row.status),
      `<button class="action" data-edit-after-sale="${row.id}">改</button>`,
    ]),
  );
}

function renderSettings() {
  return page(
    "系统管理",
    "管理登录账号、仓库基础资料，并查看关键操作日志。",
    `<button class="btn" data-action="reset-demo">重置演示数据</button>`,
    `
      <section class="grid two">
        <div class="panel">
          <div class="panel-head"><h2>管理者账号</h2></div>
          ${renderTable(state.users, ["姓名", "邮箱", "角色"], (row) => [row.name, row.email, row.role])}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>操作日志</h2></div>
          ${renderTable(state.auditLogs.slice(0, 30), ["时间", "用户", "操作", "对象"], (row) => [row.time, row.user, row.action, row.target])}
        </div>
      </section>
    `,
  );
}

function toolbar(searchPlaceholder, searchKey, options, selectKey) {
  return `
    <div class="toolbar">
      <input data-filter="${searchKey}" placeholder="${searchPlaceholder}" value="${escapeHtml(filters[searchKey] || "")}" />
      <select data-filter="${selectKey}">
        ${options.map((option) => `<option ${filters[selectKey] === option ? "selected" : ""}>${option}</option>`).join("")}
      </select>
      <button class="btn" data-action="clear-filters">清空筛选</button>
    </div>
  `;
}

function applyProductFilter(rows) {
  const keyword = (filters.productSearch || "").trim().toLowerCase();
  const type = filters.productType || "全部类型";
  return rows.filter((row) => {
    const keywordOk = !keyword || `${row.sku} ${row.name} ${row.variant}`.toLowerCase().includes(keyword);
    const typeOk = type === "全部类型" || row.type === type;
    return keywordOk && typeOk;
  });
}

function renderTable(rows, headers, mapper) {
  if (!rows.length) return `<div class="empty-state">暂无数据</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${mapper(row).map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function itemsText(items) {
  return items.map((item) => `${productBySku(item.sku)?.name || item.sku} x ${number(item.quantity)}`).join("；");
}

function stockBadge(stock, safety) {
  return Number(stock) < Number(safety || 0) ? '<span class="badge danger">低库存</span>' : '<span class="badge ok">正常</span>';
}

function statusBadge(status) {
  const cls = status === "已解决" || status === "已关闭" ? "ok" : status === "处理中" ? "info" : "warn";
  return `<span class="badge ${cls}">${status}</span>`;
}

function qcBadge(result) {
  return `<span class="badge ${result === "合格" ? "ok" : result === "不合格" ? "danger" : "warn"}">${result || "待检"}</span>`;
}

function renderSkuBars() {
  const totals = {};
  state.outboundOrders.forEach((order) => order.items.forEach((item) => (totals[item.sku] = (totals[item.sku] || 0) + Number(item.quantity))));
  const rows = Object.entries(totals)
    .map(([sku, qty]) => ({ sku, name: productBySku(sku)?.name || sku, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);
  const max = Math.max(...rows.map((row) => row.qty), 1);
  if (!rows.length) return `<div class="empty-state">暂无出库数据</div>`;
  return `<div class="chart-bars">${rows
    .map(
      (row) => `
      <div class="bar-row">
        <span title="${escapeHtml(row.name)}">${escapeHtml(row.sku)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, (row.qty / max) * 100)}%"></div></div>
        <strong>${number(row.qty)}</strong>
      </div>`,
    )
    .join("")}</div>`;
}

function renderModal() {
  const configs = {
    product: productModal,
    inbound: inboundModal,
    outbound: outboundModal,
    consumableLog: consumableLogModal,
    afterSale: afterSaleModal,
  };
  return `<div class="modal"><div class="modal-card">${configs[modal.type]()}</div></div>`;
}

function modalHead(title) {
  return `<div class="modal-head"><h2>${title}</h2><button class="action" data-close-modal>×</button></div>`;
}

function productOptions(selected = "", type = "") {
  return state.products
    .filter((product) => product.enabled && (!type || product.type === type))
    .map((product) => `<option value="${product.sku}" ${selected === product.sku ? "selected" : ""}>${product.sku} · ${product.name}</option>`)
    .join("");
}

function productModal() {
  const item = modal.data || { sku: "", name: "", type: "成品", variant: "", unit: "台", weight: "", size: "", safetyStock: 0, enabled: true };
  return `
    ${modalHead(item.sku ? "编辑 SKU" : "新增 SKU")}
    <form class="form" data-form="product">
      <div class="form-grid">
        ${field("SKU", "sku", "text", "FG-KP2-BLK", item.sku)}
        ${field("名称", "name", "text", "KeyPal 2 黑色-喷油", item.name)}
        <div class="field"><label>类型</label><select name="type">${["成品", "耗材", "配件", "物料"].map((x) => `<option ${item.type === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        ${field("颜色/版本", "variant", "text", "黑色-喷油", item.variant)}
        ${field("单位", "unit", "text", "台", item.unit)}
        ${field("安全库存", "safetyStock", "number", "100", item.safetyStock)}
        ${field("重量", "weight", "text", "50g", item.weight)}
        ${field("尺寸", "size", "text", "86.5*54.5*8.1mm", item.size)}
      </div>
      <button class="btn primary" type="submit">保存 SKU</button>
    </form>
  `;
}

function inboundModal() {
  return `
    ${modalHead("新增入库")}
    <form class="form" data-form="inbound">
      <div class="form-grid">
        ${field("到货日期", "date", "date", "", today())}
        ${field("供应商", "supplier", "text", "北京工厂")}
        ${field("采购品名", "purchaseName", "text", "KeyPal 2 喷油批次")}
        <div class="field"><label>质检结果</label><select name="qcResult"><option>合格</option><option>待检</option><option>不合格</option><option>让步接收</option></select></div>
        ${field("仓库", "warehouse", "text", "深圳仓", "深圳仓")}
        ${field("库位", "location", "text", "A-01", "A-01")}
        <div class="field full"><label>备注</label><textarea name="note" placeholder="到货说明"></textarea></div>
      </div>
      ${lineItemsEditor("inbound")}
      <button class="btn primary" type="submit">保存入库单</button>
    </form>
  `;
}

function outboundModal() {
  return `
    ${modalHead("新增出库")}
    <form class="form" data-form="outbound">
      <div class="form-grid">
        ${field("出库日期", "date", "date", "", today())}
        <div class="field"><label>出库类型</label><select name="type"><option>销售</option><option>展会</option><option>拆样</option><option>售后补发</option><option>其他</option></select></div>
        ${field("平台", "platform", "text", "有赞")}
        ${field("平台编号", "platformNo", "text", "订单号")}
        ${field("经手人", "handler", "text", currentUser()?.name || "")}
        ${field("订单金额", "amount", "number", "699")}
        ${field("快递公司", "courier", "text", "顺丰")}
        ${field("快递单号", "trackingNo", "text", "")}
        ${field("快递费用", "shippingFee", "number", "0")}
        <div class="field full"><label>备注</label><textarea name="note" placeholder="出库说明"></textarea></div>
      </div>
      ${lineItemsEditor("outbound")}
      <button class="btn primary" type="submit">保存出库单</button>
    </form>
  `;
}

function lineItemsEditor(mode) {
  return `
    <div class="panel full">
      <div class="panel-head"><h2>商品明细</h2><button class="btn" type="button" data-add-line="${mode}">新增一行</button></div>
      <div class="line-items" data-lines="${mode}">
        ${lineItem(mode)}
      </div>
    </div>
  `;
}

function lineItem(mode) {
  const productType = mode === "consumable" ? "耗材" : "";
  return `
    <div class="line-item">
      <div class="field"><label>SKU</label><select name="itemSku">${productOptions("", productType)}</select></div>
      <div class="field"><label>数量</label><input name="itemQty" type="number" min="1" value="1" /></div>
      <div class="field"><label>${mode === "outbound" ? "单价" : "单价"}</label><input name="itemPrice" type="number" min="0" value="0" /></div>
      <button class="action" type="button" data-remove-line>删</button>
    </div>
  `;
}

function consumableLogModal() {
  return `
    ${modalHead("登记耗材")}
    <form class="form" data-form="consumableLog">
      <div class="form-grid">
        ${field("日期", "date", "date", "", today())}
        <div class="field"><label>类型</label><select name="type"><option>到货</option><option>消耗</option></select></div>
        <div class="field full"><label>耗材 SKU</label><select name="sku">${productOptions("", "耗材")}</select></div>
        ${field("数量", "quantity", "number", "100")}
        <div class="field full"><label>备注</label><textarea name="note"></textarea></div>
      </div>
      <button class="btn primary" type="submit">保存耗材记录</button>
    </form>
  `;
}

function afterSaleModal() {
  const item = modal.data || { id: "", date: today(), type: "设备异常", orderNo: "", customer: "", sku: "", issue: "", status: "待处理", owner: currentUser()?.name || "", solution: "" };
  return `
    ${modalHead(item.id ? "编辑售后工单" : "新增售后工单")}
    <form class="form" data-form="afterSale">
      <div class="form-grid">
        ${field("日期", "date", "date", "", item.date)}
        <div class="field"><label>问题类型</label><select name="type">${["退货", "换货", "漏发", "设备异常", "物流异常", "质量问题"].map((x) => `<option ${item.type === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        ${field("平台订单号", "orderNo", "text", "", item.orderNo)}
        ${field("客户/收件人", "customer", "text", "", item.customer)}
        <div class="field"><label>关联 SKU</label><select name="sku"><option value="">不关联</option>${productOptions(item.sku)}</select></div>
        <div class="field"><label>状态</label><select name="status">${["待处理", "处理中", "待寄回", "已补发", "已解决", "已关闭"].map((x) => `<option ${item.status === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        ${field("负责人", "owner", "text", "", item.owner)}
        <div class="field full"><label>问题描述</label><textarea name="issue">${escapeHtml(item.issue)}</textarea></div>
        <div class="field full"><label>处理方案</label><textarea name="solution">${escapeHtml(item.solution)}</textarea></div>
      </div>
      <button class="btn primary" type="submit">保存售后工单</button>
    </form>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authTab;
      render();
    });
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      modal = null;
      render();
    });
  });
  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      modal = { type: button.dataset.open };
      render();
    });
  });
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      modal = null;
      render();
    });
  });
  document.querySelectorAll("[data-filter]").forEach((input) => {
    input.addEventListener("input", () => {
      filters[input.dataset.filter] = input.value;
      render();
    });
  });
  document.querySelectorAll("form").forEach((form) => form.addEventListener("submit", handleSubmit));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => handleAction(button.dataset.action)));
  document.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => {
      modal = { type: "product", data: { ...productBySku(button.dataset.editProduct) } };
      render();
    });
  });
  document.querySelectorAll("[data-toggle-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = productBySku(button.dataset.toggleProduct);
      product.enabled = !product.enabled;
      logAudit(product.enabled ? "启用 SKU" : "停用 SKU", product.sku);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-edit-after-sale]").forEach((button) => {
    button.addEventListener("click", () => {
      modal = { type: "afterSale", data: { ...state.afterSales.find((item) => item.id === button.dataset.editAfterSale) } };
      render();
    });
  });
  document.querySelectorAll("[data-add-line]").forEach((button) => {
    button.addEventListener("click", () => {
      const box = document.querySelector(`[data-lines="${button.dataset.addLine}"]`);
      box.insertAdjacentHTML("beforeend", lineItem(button.dataset.addLine));
      bindLineRemove();
    });
  });
  bindLineRemove();
}

function bindLineRemove() {
  document.querySelectorAll("[data-remove-line]").forEach((button) => {
    button.onclick = () => {
      const lines = button.closest("[data-lines]");
      if (lines.querySelectorAll(".line-item").length > 1) button.closest(".line-item").remove();
    };
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.dataset.form;
  const data = Object.fromEntries(new FormData(form).entries());
  const handlers = {
    login: submitLogin,
    register: submitRegister,
    product: submitProduct,
    inbound: submitInbound,
    outbound: submitOutbound,
    consumableLog: submitConsumableLog,
    afterSale: submitAfterSale,
  };
  handlers[type](form, data);
}

function submitLogin(form, data) {
  const user = state.users.find((item) => item.email === data.email && item.password === data.password);
  if (!user) return showFormError(form, "邮箱或密码不正确。");
  state.sessionUserId = user.id;
  saveState();
  render();
}

function submitRegister(form, data) {
  if (!data.name || !data.email || !data.password) return showFormError(form, "请填写姓名、邮箱和密码。");
  if (data.password.length < 6) return showFormError(form, "密码至少需要 6 位。");
  if (state.users.some((user) => user.email === data.email)) return showFormError(form, "该邮箱已经注册。");
  const user = { id: uid("USER"), name: data.name, email: data.email, password: data.password, role: state.users.length ? "仓库管理员" : "超级管理员" };
  state.users.push(user);
  state.sessionUserId = user.id;
  logAudit("注册账号", user.email);
  saveState();
  render();
}

function submitProduct(form, data) {
  if (!data.sku || !data.name) return showFormError(form, "SKU 和名称不能为空。");
  const existing = productBySku(data.sku);
  if (existing && (!modal.data || modal.data.sku !== data.sku)) return showFormError(form, "SKU 已存在。");
  const product = { ...data, safetyStock: Number(data.safetyStock || 0), enabled: true };
  if (modal.data?.sku) {
    Object.assign(productBySku(modal.data.sku), product);
    logAudit("编辑 SKU", product.sku);
  } else {
    state.products.unshift(product);
    logAudit("新增 SKU", product.sku);
  }
  modal = null;
  saveState();
  render();
}

function submitInbound(form, data) {
  const items = collectLineItems(form);
  if (!items.length) return showFormError(form, "请至少添加一条入库明细。");
  const order = {
    id: uid("IN"),
    date: data.date,
    supplier: data.supplier,
    purchaseName: data.purchaseName,
    warehouse: data.warehouse,
    location: data.location,
    qcResult: data.qcResult,
    note: data.note,
    items: items.map((item) => ({ sku: item.sku, quantity: item.quantity, unitPrice: item.price })),
  };
  state.inboundOrders.unshift(order);
  logAudit("新增入库单", order.id);
  modal = null;
  view = "inbound";
  saveState();
  render();
}

function submitOutbound(form, data) {
  const items = collectLineItems(form);
  if (!items.length) return showFormError(form, "请至少添加一条出库明细。");
  const stock = stockMap();
  const shortage = items.find((item) => Number(item.quantity) > Number(stock[item.sku] || 0));
  if (shortage) return showFormError(form, `${shortage.sku} 当前库存不足，无法出库。`);
  const amount = Number(data.amount || items.reduce((sum, item) => sum + item.quantity * item.price, 0));
  const order = {
    id: uid("OUT"),
    date: data.date,
    type: data.type,
    platform: data.platform,
    platformNo: data.platformNo,
    handler: data.handler,
    courier: data.courier,
    trackingNo: data.trackingNo,
    shippingFee: Number(data.shippingFee || 0),
    amount,
    note: data.note,
    items: items.map((item) => ({ sku: item.sku, quantity: item.quantity, price: item.price })),
  };
  state.outboundOrders.unshift(order);
  logAudit("新增出库单", order.id);
  modal = null;
  view = "outbound";
  saveState();
  render();
}

function submitConsumableLog(form, data) {
  if (!data.sku || !Number(data.quantity)) return showFormError(form, "请选择耗材并填写数量。");
  if (data.type === "消耗" && Number(data.quantity) > Number(stockMap()[data.sku] || 0)) return showFormError(form, "耗材库存不足，无法消耗。");
  const log = { id: uid("CS"), date: data.date, sku: data.sku, type: data.type, quantity: Number(data.quantity), note: data.note };
  state.consumableLogs.unshift(log);
  logAudit(`耗材${data.type}`, data.sku);
  modal = null;
  view = "consumables";
  saveState();
  render();
}

function submitAfterSale(form, data) {
  if (!data.type || !data.issue) return showFormError(form, "问题类型和问题描述不能为空。");
  if (modal.data?.id) {
    Object.assign(state.afterSales.find((item) => item.id === modal.data.id), data);
    logAudit("编辑售后工单", modal.data.id);
  } else {
    const item = { id: uid("AS"), ...data };
    state.afterSales.unshift(item);
    logAudit("新增售后工单", item.id);
  }
  modal = null;
  view = "afterSales";
  saveState();
  render();
}

function collectLineItems(form) {
  return [...form.querySelectorAll(".line-item")]
    .map((row) => ({
      sku: row.querySelector('[name="itemSku"]').value,
      quantity: Number(row.querySelector('[name="itemQty"]').value || 0),
      price: Number(row.querySelector('[name="itemPrice"]').value || 0),
    }))
    .filter((item) => item.sku && item.quantity > 0);
}

function showFormError(form, message) {
  form.querySelector(".error")?.remove();
  form.insertAdjacentHTML("afterbegin", `<div class="error">${message}</div>`);
}

function handleAction(action) {
  if (action === "logout") {
    state.sessionUserId = null;
    saveState();
    render();
  }
  if (action === "clear-filters") {
    filters = {};
    render();
  }
  if (action === "reset-demo" && confirm("确定重置演示数据？本浏览器中的后台数据会恢复到初始状态。")) {
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    view = "dashboard";
    modal = null;
    render();
  }
}

saveState();
render();
