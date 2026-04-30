# KeyPal 库存管理后台

这是一个基于 `KeyPal 产品收发&库存&耗材 统计表-2026.xlsx` 分析结果编写的库存管理后台 MVP。

## 当前能力

- 管理者注册、登录、退出。
- SKU 管理：新增、编辑、启用/停用、筛选。
- 入库管理：登记到货入库，自动增加库存。
- 出库管理：登记销售、展会、拆样、售后补发，自动扣减库存并校验库存不足。
- 库存总览：当前库存、安全库存预警、库存流水。
- 销售汇总：按月份、SKU、平台汇总。
- 耗材管理：耗材库存、耗材到货、耗材消耗。
- 售后管理：售后工单新增、编辑、状态维护。
- 系统管理：账号列表、操作日志、重置演示数据。

## 运行方式

直接用浏览器打开 `index.html`。

首次进入时注册一个管理者账号，首个账号会自动成为超级管理员。应用数据保存在当前浏览器的 `localStorage` 中。

## 目录

- `index.html`：应用入口。
- `styles.css`：后台界面样式。
- `app.js`：业务逻辑和本地数据存储。
- `docs/inventory-admin-prd.md`：产品需求文档。
- `scripts/analyze_workbook.py`：Excel 结构分析脚本，运行时传入工作簿路径。

## 后续建议

下一阶段可以把当前 localStorage 数据层替换为真实后端：

- 后端：FastAPI / Django / Node.js 任一。
- 数据库：PostgreSQL 或 SQLite 起步。
- 导入：复用 `scripts/analyze_workbook.py <path-to-workbook.xlsx>`，扩展为 Excel 初始化导入命令。
- 权限：把当前角色字段升级为真正的接口权限校验。
