import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function load(file, dependencies, globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'exports', ...Object.keys(globals), output)(name => {
    assert.ok(name in dependencies, name);
    return dependencies[name];
  }, loaded.exports, ...Object.values(globals));
  return loaded.exports;
}

async function checkSave({ image = false, fail = false } = {}) {
  let index = 0;
  let saved = false;
  let closed = false;
  let uploads = 0;
  let cleanup = 0;
  let releaseCleanup;
  const item = { id: 'test-meal', name: 'Meal', image: '/original.jpg', imagePublicId: 'old-image', category: 'MAIN DISHES', sizes: [{ label: 'Regular', price: 12 }] };
  const jsx = (type, props) => ({ type, props });
  const { default: Form } = load('src/components/admin/AdminFoodForm.tsx', {
    'react': { useState: value => { const position = index++; return [position === 6 && image ? new File(['photo'], 'food.jpg', { type: 'image/jpeg' }) : value, () => {}]; }, useMemo: fn => fn(), useEffect: () => {} },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/image': {},
    'lucide-react': {},
    '@/lib/firebase/client': { db: {} },
    'firebase/firestore': { doc: () => ({}), collection: () => ({}), serverTimestamp: () => 'timestamp', setDoc: async () => { if (fail) throw Error('Save rejected'); saved = true; }, addDoc: async () => { throw Error('Unexpected create'); } },
    '@/lib/cloudinaryUpload': { uploadMenuImage: async () => { uploads++; return { secureUrl: 'https://res.cloudinary.com/new.webp', publicId: 'new-image' }; }, deleteMenuImage: id => { cleanup++; assert.equal(id, fail ? 'new-image' : 'old-image'); return fail ? Promise.resolve() : new Promise(resolve => { releaseCleanup = resolve; }); } },
  }, { console: { ...console, error: () => {} } });
  const tree = Form({ item, onClose: () => { assert.ok(saved); closed = true; } });
  const queue = [tree];
  let form;
  while (queue.length) {
    const node = queue.shift();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'form') { form = node; break; }
    const children = node.props?.children;
    queue.push(...(Array.isArray(children) ? children.flat(Infinity) : [children]));
  }
  assert.ok(form, 'Form is reachable');
  await Promise.race([form.props.onSubmit({ preventDefault() {} }), new Promise((_, reject) => { const timer = setTimeout(() => reject(Error('Save waited for image cleanup')), 1000); timer.unref(); })]);
  assert.equal(closed, !fail);
  assert.equal(uploads, image ? 1 : 0);
  assert.equal(cleanup, image ? 1 : 0);
  releaseCleanup?.();
}
await checkSave();
await checkSave({ image: true });
await checkSave({ image: true, fail: true });

const input = new File([new Uint8Array(500000)], 'food.jpg', { type: 'image/jpeg' });
let closed = 0;
const canvas = { width: 0, height: 0, getContext: () => ({ drawImage() {} }), toBlob: callback => callback(new Blob([new Uint8Array(50000)], { type: 'image/webp' })) };
const { prepareMenuImage } = load('src/lib/prepareMenuImage.ts', {}, { createImageBitmap: async () => ({ width: 4000, height: 3000, close: () => closed++ }), document: { createElement: () => canvas } });
const compressed = await prepareMenuImage(input);
assert.equal(compressed.type, 'image/webp');
assert.ok(compressed.size < input.size);
assert.equal(canvas.width, 1600);
assert.equal(canvas.height, 1200);
assert.equal(closed, 1);
const small = new File(['small'], 'small.jpg', { type: 'image/jpeg' });
assert.equal(await prepareMenuImage(small), small);
canvas.toBlob = callback => callback(null);
assert.equal(await prepareMenuImage(input), input, 'Failed conversion keeps the original');
console.log('PASS: text-only save, nonblocking image cleanup, rejected save recovery, image resize/compression, and original-file fallback.');
