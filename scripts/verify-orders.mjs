import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Exercise checkout without sending emails or touching the live Firebase project.
const source = fs.readFileSync('src/app/api/orders/route.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
async function scenario({ unavailable = false, failEmail = false, invalid = false } = {}) {
  let saved;
  let batchReads = 0;
  let emailStarts = 0;
  const waits = [];
  const menu = { name: 'Jollof', available: !unavailable, isTodayMenu: true, sizes: [{ label: 'Regular', price: 10 }], addOns: [{ name: 'Plantain', price: 2 }] };
  const db = {
    collection: () => ({ doc: id => ({ id, get: async () => ({ exists: false }), create: async value => { saved = value; }, update: async () => {} }) }),
    getAll: async (...refs) => { batchReads++; assert.equal(refs.length, 1); return refs.map(ref => ({ id: ref.id, exists: true, data: () => menu })); },
  };
  async function email() {
    emailStarts++;
    if (emailStarts === 2) waits.forEach(resolve => resolve());
    else await new Promise(resolve => waits.push(resolve));
    if (failEmail) throw new Error('Simulated email outage');
  }
  const dependencies = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    'firebase-admin/firestore': { FieldValue: { serverTimestamp: () => 'timestamp' } },
    '@/lib/firebase/admin': { adminDb: db, adminAuth: {} },
    '@/lib/email/orderEmails': { sendRestaurantOrderEmail: email, sendCustomerOrderConfirmation: email },
    '@/lib/admin/notifications': { createAdminNotification: async () => {} },
    '@/lib/server/rateLimit': { allowPublicMutation: () => ({ allowed: true }) },
    '@/lib/server/guestSession': { getGuestTokenFromRequest: () => '', hashGuestToken: () => '' },
  };
  const loadedModule = { exports: {} };
  const errors = [];
  new Function('require', 'module', 'exports', 'console', compiled)(name => {
    assert.ok(name in dependencies, name);
    return dependencies[name];
  }, loadedModule, loadedModule.exports, { ...console, error: (...args) => errors.push(args) });
  const item = { menuItemId: 'jollof', quantity: 2, size: { label: 'Regular', price: 0.01 }, addOns: [{ name: 'Plantain', price: 0 }] };
  const response = await loadedModule.exports.POST(new Request('https://example.com/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idempotencyKey: '12345678-1234-1234-1234-123456789012', details: { fulfilment: 'pickup', name: 'Test Customer', phone: '+3721234567', email: 'test@example.com' }, items: invalid ? [null] : [item, item] }) }));
  assert.equal(response.status, invalid ? 400 : unavailable ? 409 : 201);
  if (!invalid && !unavailable) {
    assert.equal(response.body.subtotal, 48, 'Use database prices, ignoring submitted prices');
    assert.equal(saved.items.length, 2, 'Keep separate order lines');
    assert.equal(batchReads, 1);
    assert.equal(errors.length, failEmail ? 2 : 0);
    assert.equal(emailStarts, 2, 'Attempt both emails even during an outage');
  } else assert.equal(saved, undefined);
}
await Promise.race([
  (async () => { await scenario(); await scenario({ unavailable: true }); await scenario({ invalid: true }); await scenario({ failEmail: true }); })(),
  new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('Checkout verification timed out')), 5000); timer.unref(); }),
]);
console.log('PASS: validated prices, repeated meals, unavailable meals, malformed items, and concurrent email failure handling.');
