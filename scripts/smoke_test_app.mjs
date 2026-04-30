import fs from "node:fs";
import vm from "node:vm";

const appCode = fs.readFileSync("app.js", "utf8");
const storage = new Map();
const appRoot = { innerHTML: "", querySelectorAll: () => [] };
const fakeDocument = {
  querySelector(selector) {
    if (selector === "#app") return appRoot;
    return null;
  },
  querySelectorAll() {
    return [];
  },
};

const context = {
  console,
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  document: fakeDocument,
  confirm: () => true,
  Date,
  Math,
  Number,
  String,
  Object,
  JSON,
};

vm.createContext(context);
vm.runInContext(appCode, context, { filename: "app.js" });

if (!appRoot.innerHTML.includes("KeyPal 库存管理后台")) {
  throw new Error("Initial render did not show the auth page.");
}

const saved = JSON.parse(storage.get("keypal_inventory_admin_v1"));
if (!Array.isArray(saved.products) || saved.products.length < 10) {
  throw new Error("Seed products were not initialized.");
}

console.log("smoke ok");
