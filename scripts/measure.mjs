// Measure load time + transfer size of public pages and the content API.
// Usage: node scripts/measure.mjs [baseUrl] [runs]
//   node scripts/measure.mjs http://localhost:3000 5
//   node scripts/measure.mjs https://<railway-url> 3
//
// Reports, per path: TTFB (time to first byte), total time, and payload size.
// The first run is shown separately (useful to spot a Railway cold start).

const baseUrl = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const runs = Number(process.argv[3] ?? 5);

const paths = ['/', '/umrah', '/api/content'];

function fmtMs(ms) {
  return `${ms.toFixed(0).padStart(6)} ms`;
}
function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(1).padStart(9)} KB`;
}

async function timeOne(url) {
  const start = performance.now();
  const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
  const ttfb = performance.now() - start;
  const buf = Buffer.from(await res.arrayBuffer());
  const total = performance.now() - start;
  return { status: res.status, ttfb, total, bytes: buf.byteLength };
}

async function run() {
  console.log(`\nMessung gegen ${baseUrl}  (${runs} Durchläufe pro Pfad)\n`);
  console.log('Pfad'.padEnd(16) + 'Lauf'.padEnd(8) + 'TTFB'.padStart(10) + 'Gesamt'.padStart(13) + 'Größe'.padStart(14) + '  Status');
  console.log('-'.repeat(76));

  for (const p of paths) {
    const url = baseUrl + p;
    const samples = [];
    for (let i = 0; i < runs; i++) {
      try {
        const r = await timeOne(url);
        samples.push(r);
        const label = i === 0 ? '1 (kalt)' : String(i + 1);
        console.log(
          p.padEnd(16) + label.padEnd(8) + fmtMs(r.ttfb).padStart(10) +
          fmtMs(r.total).padStart(13) + fmtKB(r.bytes).padStart(14) + '  ' + r.status
        );
      } catch (e) {
        console.log(p.padEnd(16) + String(i + 1).padEnd(8) + '  FEHLER: ' + e.message);
      }
    }
    if (samples.length > 1) {
      const warm = samples.slice(1);
      const avgTtfb = warm.reduce((a, b) => a + b.ttfb, 0) / warm.length;
      const avgTotal = warm.reduce((a, b) => a + b.total, 0) / warm.length;
      console.log(
        '  → warm Ø'.padEnd(24) + fmtMs(avgTtfb).padStart(10) + fmtMs(avgTotal).padStart(13) +
        fmtKB(samples[0].bytes).padStart(14)
      );
    }
    console.log('-'.repeat(76));
  }
  console.log('');
}

run();
