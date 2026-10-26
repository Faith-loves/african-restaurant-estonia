import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const cache = new Map();
const dependencies = new Map();
function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const exports = {};
  cache.set(absolute, exports);
  const compiled = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', compiled)(name => {
    if (dependencies.has(name)) return dependencies.get(name);
    assert.ok(name.startsWith('@/'), name);
    return load('src/' + name.slice(2) + '.ts');
  }, exports);
  return exports;
}
const { menuItems } = load('src/data/menuData.ts');
const { restaurantDrinkAddOns, restaurantProteinAddOns } = load('src/data/menuAddOns.ts');
const { buildRequestedMenuPatch, MENU_UPDATE_REVISION } = load('src/data/menuPriceUpdate.ts');
const byId = new Map(menuItems.map(item => [item.id, item]));
const expected = {
  'jollof-rice': { Small: 9.5, Medium: 12.7, Large: 19.5 },
  'fried-rice': { Small: 10, Medium: 15, Large: 20 },
  'fried-plantain': { Small: 6, Medium: 12, Large: 24 },
  'fried-yam': { Medium: 11.5, Large: 16.9 },
  'roasted-plantains': { Medium: 14, Large: 28 },
  'ewedu-soup': { Regular: 6 },
  'combo-egusi-beef-eba-zobo-19': { Regular: 25 },
  'combo-egusi-beef-poundo-zobo-20': { Regular: 26 },
  'combo-fried-yam-plantain-tomato-zobo-23': { Regular: 22 },
  'combo-jollof-chicken-plantain-zobo-1': { Regular: 19 },
  'combo-jollof-turkey-plantain-zobo-2': { Regular: 20 },
  'combo-jollof-fish-plantain-zobo-3': { Regular: 21 },
  'combo-fried-rice-chicken-plantain-zobo-4': { Regular: 20 },
  'combo-fried-rice-turkey-plantain-zobo-5': { Regular: 21 },
  'combo-fried-rice-fish-plantain-zobo-6': { Regular: 22 },
  'combo-puffpuff-jollof-chicken-plantain-zobo-17': { Regular: 19 },
  'combo-puffpuff-friedrice-chicken-plantain-zobo-18': { Regular: 20 },
};
for (const [id, prices] of Object.entries(expected)) {
  const item = byId.get(id);
  assert.deepEqual(Object.fromEntries(item.sizes.map(size => [size.label, size.price])), prices, id);
  if (id.startsWith('combo-') || id === 'ewedu-soup') {
    assert.equal(item.available, true, id);
    assert.equal(item.isTodayMenu, true, id);
    assert.equal(item.pricePending, false, id);
  }
  const patch = buildRequestedMenuPatch(id, item, { sizes: item.sizes.map(size => ({ label: size.label, price: 1 })), available: false, pricePending: true });
  for (const size of patch.sizes) if (prices[size.label] && size.label !== 'Small') assert.equal(size.price, prices[size.label], id);
}
for (const [vegan, normal] of [['vegan-jollof-rice','jollof-rice'],['vegan-fried-rice','fried-rice']]) assert.deepEqual(byId.get(vegan).sizes, byId.get(normal).sizes);
assert.equal(byId.get('fish-pie').available, false);
assert.equal(byId.get('chicken-pie').available, false);
assert.deepEqual(restaurantDrinkAddOns.map(drink => drink.price), [3,3,3,2.45,2.45,2.45,2.45,2.15,3.99,3.99]);
for (const item of menuItems.filter(item => item.category !== 'DRINKS')) {
  for (const drink of restaurantDrinkAddOns) assert.ok(item.addOns.some(addOn => addOn.name === drink.name && addOn.price === drink.price), item.id + ': ' + drink.name);
  assert.equal(new Set(item.addOns.map(addOn => addOn.name.toLowerCase())).size, item.addOns.length);
  if (item.category === 'SOUP' || item.id === 'ofada-sauce') {
    for (const protein of restaurantProteinAddOns) assert.ok(item.addOns.some(addOn => addOn.name === protein.name && addOn.price === protein.price), item.id + ': ' + protein.name);
  }
}
const original = { image: 'custom-photo', description: 'Custom recipe', sizes: [{ label: 'Small', price: 9.75 }, { label: 'Medium', price: 1 }, { label: 'Large', price: 2 }], addOns: [{ name: 'Custom Extra', price: 1 }, { name: 'Zobo' }] };
const patch = buildRequestedMenuPatch('jollof-rice', byId.get('jollof-rice'), original);
assert.equal(patch.sizes[0].price, 9.75, 'Preserve unspecified portions');
assert.equal(patch.image, undefined);
assert.equal(patch.description, undefined);
assert.ok(patch.addOns.some(extra => extra.name === 'Custom Extra'));
assert.ok(!patch.addOns.some(extra => extra.name === 'Zobo'));
assert.equal(buildRequestedMenuPatch('jollof-rice', byId.get('jollof-rice'), { ...original, ...patch, menuUpdateRevision: MENU_UPDATE_REVISION }), null, 'Do not overwrite subsequent manual edits');
for (const id of ['coca-cola-zero','fanta','sprite','water','zobo','ginger-juice','coca-cola-can']) assert.ok(byId.get(id).sizes.every(size => size.price > 0), id);
console.log('PASS: requested prices, combo availability, pies, vegan matching, all ten drinks, soup/Ofada proteins, preserved custom fields, and repeat-update protection.');

// Apply the real migration against an in-memory Firestore double.
const rows = new Map([
  ['jollof-rice', { ...original, category: 'MAIN DISH' }],
  ['fish-pie', { name: 'Fish Pie', category: 'SNACKS', available: true }],
  ['custom-soup', { name: 'House Soup', category: 'SOUP', description: 'Keep this recipe', sizes: [{ label: 'Regular', price: 8 }] }],
]);
let commits = 0;
dependencies.set('@/lib/firebase/client', { db: {} });
dependencies.set('firebase/firestore', {
  collection: () => ({}), doc: (_, __, id) => ({ id }), serverTimestamp: () => 'timestamp',
  getDocs: async () => ({ docs: [...rows].map(([id, data]) => ({ id, data: () => data })) }),
  writeBatch: () => {
    const writes = [];
    return { set: (ref, payload) => writes.push([ref.id, payload]), commit: async () => { commits++; for (const [id,payload] of writes) rows.set(id, { ...rows.get(id), ...payload }); } };
  },
});
const { applyRequestedMenuUpdates } = load('src/lib/firebase/menuPriceUpdate.ts');
const count = await applyRequestedMenuUpdates();
assert.ok(count > 0);
assert.equal(commits, 1, 'One batch for the complete catalogue');
assert.equal(rows.get('jollof-rice').image, original.image);
assert.equal(rows.get('jollof-rice').description, original.description);
assert.deepEqual(rows.get('vegan-jollof-rice').sizes, rows.get('jollof-rice').sizes);
assert.equal(rows.get('fish-pie').available, false);
assert.equal(rows.get('custom-soup').description, 'Keep this recipe');
for (const protein of restaurantProteinAddOns) assert.ok(rows.get('custom-soup').addOns.some(extra => extra.name === protein.name && extra.price === protein.price));
for (const [id, prices] of Object.entries(expected)) {
  const row = rows.get(id);
  for (const [label, price] of Object.entries(prices)) {
    if (id === 'jollof-rice' && label === 'Small') continue;
    assert.equal(row.sizes.find(size => size.label === label)?.price, price, id + ' ' + label);
  }
}
rows.get('jollof-rice').sizes[0].price = 42;
assert.equal(await applyRequestedMenuUpdates(), 0);
assert.equal(rows.get('jollof-rice').sizes[0].price, 42, 'Keep later manual edits');
console.log('PASS: complete database update in one batch, custom records preserved, vegan price alignment, and no writes on repeat application.');
