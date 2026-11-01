import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync('src/lib/server/ga4Reporting.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const range = { startDate: '2026-09-27', endDate: '2026-10-26' };
const metricValues = values => values.map(value => ({ value: String(value) }));
const row = (dimension, values) => ({ dimensionValues: [{ value: dimension }], metricValues: metricValues(values) });
const overviewMetrics = ['totalUsers', 'activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'engagementRate', 'userEngagementDuration', 'purchaseRevenue'];

async function scenario({ empty = false, noActiveUsers = false, productsFail = false } = {}) {
  const requests = [];
  let authCalls = 0;
  const auth = class {
    constructor(options) { assert.deepEqual(options.scopes, ['https://www.googleapis.com/auth/analytics.readonly']); }
    async getClient() { authCalls++; return { getAccessToken: async () => ({ token: 'fixture-token' }) }; }
  };
  const reports = {
    date: [row('20261025', [11,9,23,64])],
    pagePathPlusQueryString: [row('/menu', [40,6,14]), row('/', [24,5,9])],
    sessionDefaultChannelGroup: [row('Organic Search', [7,19,0.6]), row('Direct', [4,4,0.9])],
    sessionSourceMedium: [row('google / organic', [7,19]), row('(direct) / (none)', [4,4])],
    deviceCategory: [row('desktop', [7,15,44]), row('mobile', [4,8,20])],
    country: [row('Estonia', [7,15,44]), row('Nigeria', [4,8,20])],
    eventName: [row('purchase', [1,1,1])],
    itemName: [row('Fixture Product', [3,2,1,19.9])],
  };
  const fakeFetch = async (_, options) => {
    const request = JSON.parse(options.body);
    requests.push(request);
    assert.deepEqual(request.dateRanges, [range], 'All reports must use the same date range');
    const dimension = request.dimensions?.[0]?.name;
    if (!dimension) {
      assert.deepEqual(request.metrics.map(metric => metric.name), overviewMetrics);
      assert.equal(request.metricAggregations, undefined, 'Regression: response has rows but no requested totals');
      return { ok: true, json: async () => ({ metricHeaders: overviewMetrics.map(name => ({ name })), rows: empty ? [] : [{ metricValues: metricValues([11, noActiveUsers ? 0 : 9, 5, 23, 64, 0.65, noActiveUsers ? 0 : 225, 19.9]) }] }) };
    }
    if (dimension === 'itemName') {
      assert.deepEqual(request.metrics.map(metric => metric.name), ['itemsViewed','itemsAddedToCart','itemsPurchased','itemRevenue']);
      if (productsFail) return { ok: false, status: 400 };
    }
    return { ok: true, json: async () => ({ rows: empty ? [] : reports[dimension] }) };
  };
  const loaded = { exports: {} };
  const fixtureProcess = { env: { GA4_PROPERTY_ID: '123', GA4_PROJECT_ID: 'fixture-project', GA4_CLIENT_EMAIL: 'fixture@example.invalid', GA4_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----fixture' } };
  new Function('require','exports','fetch','process', compiled)(name => { assert.equal(name, 'google-auth-library'); return { GoogleAuth: auth }; }, loaded.exports, fakeFetch, fixtureProcess);
  const data = await loaded.exports.getGa4ReportingData(range);
  assert.deepEqual(data.range, range);
  if (empty) {
    assert.ok(Object.values(data.overview).every(value => value === 0), 'A genuinely empty report remains zero');
    assert.deepEqual(data.pages, []);
  } else {
    assert.deepEqual(data.overview, { totalUsers: 11, activeUsers: noActiveUsers ? 0 : 9, newUsers: 5, sessions: 23, screenPageViews: 64, engagementRate: 0.65, averageEngagementTime: noActiveUsers ? 0 : 25, purchaseRevenue: 19.9 });
    assert.equal(data.overview.sessions, data.channels.reduce((total, item) => total + item.sessions, 0));
    assert.equal(data.overview.sessions, data.sourceMedium.reduce((total, item) => total + item.sessions, 0));
    assert.equal(data.overview.screenPageViews, data.pages.reduce((total, item) => total + item.screenPageViews, 0));
    assert.equal(data.overview.totalUsers, data.countries.reduce((total, item) => total + item.totalUsers, 0), 'Fixture users are disjoint across countries');
    assert.deepEqual(data.trends[0], { date:'20261025', totalUsers:11,activeUsers:9,sessions:23,screenPageViews:64 });
    assert.equal(data.devices.length, 2);
    assert.equal(data.ecommerceEvents[0].eventCount, 1);
    assert.deepEqual(data.products, productsFail ? [] : [{ itemName:'Fixture Product',itemViews:3,addToCarts:2,itemsPurchased:1,itemRevenue:19.9 }]);
  }
  assert.equal(requests.length, 9);
  assert.equal(await loaded.exports.getGa4ReportingData(range), data, 'Cached response retains mapped values');
  assert.equal(requests.length, 9);
  assert.equal(authCalls, 1);
}
await scenario();
await scenario({ empty: true });
await scenario({ noActiveUsers: true });
await scenario({ productsFail: true });
console.log('PASS: overview rows without totals, exact metric/property mapping, shared date ranges, comparable detail totals, engagement calculation, empty reports, zero-active-user handling, optional products failure, and caching.');
