/**
 * nv-macro Cloudflare Worker
 * Routes:
 *   /quotes      → Frankfurter FX + gold-api.com + fawazahmed0 prev close + Yahoo VIX + computed DXY
 *   /fred        → FRED: US 10Y, US 2Y, yield curve spread, HY credit spread
 *   /ecb-bund    → ECB SDW: DE 10Y AAA govt bond yield
 *   /uk-gilt     → Yahoo Finance: UK 10Y Gilt yield
 *   /ff-calendar → Forex Factory calendar
 *   /finnhub     → Finnhub: SPY, QQQ, TLT, HYG, UUP quotes
 *   /mfxbook-login → MyFxBook login
 *
 * Env vars (Cloudflare Worker → Settings → Variables):
 *   FRED_KEY     = 040085d7ef6668a63a371dfa37dc107d
 *   FINNHUB_KEY  = d75mmm9r01qk56kdb0m0d75mmm9r01qk56kdb0mg
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// DXY formula: 50.14348112 × EURUSD^(-0.576) × USDJPY^(0.136) × GBPUSD^(-0.119)
//              × USDCAD^(0.091) × USDSEK^(0.042) × USDCHF^(0.036)
function computeDXY(rates) {
  const { eurusd, usdjpy, gbpusd, usdcad, usdsek, usdchf } = rates;
  if (!eurusd || !usdjpy || !gbpusd || !usdcad || !usdsek || !usdchf) return null;
  return 50.14348112
    * Math.pow(eurusd, -0.576)
    * Math.pow(usdjpy,  0.136)
    * Math.pow(gbpusd, -0.119)
    * Math.pow(usdcad,  0.091)
    * Math.pow(usdsek,  0.042)
    * Math.pow(usdchf,  0.036);
}

// Convert Frankfurter USD-base rates to standard pair prices
function pairFromFrankfurter(lat, prev, pair) {
  const inv = ['EUR', 'GBP', 'AUD'].includes(pair.quote);
  const key = pair.quote === 'EUR' ? 'EUR'
             : pair.quote === 'GBP' ? 'GBP'
             : pair.quote === 'AUD' ? 'AUD'
             : pair.base !== 'USD' ? pair.base : pair.quote;
  const latRate  = lat.rates[pair.quote] || lat.rates[pair.base];
  const prevRate = prev.rates[pair.quote] || prev.rates[pair.base];
  if (!latRate || !prevRate) return null;
  const c  = inv ? 1 / latRate  : latRate;
  const pc = inv ? 1 / prevRate : prevRate;
  return { c, pc, h: null, l: null };
}

export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    /* ── /quotes ── */
    if (path === '/quotes') {
      try {
        // Step 1: Frankfurter latest (gives us the actual current business date)
        const latRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CHF,AUD,CAD,SEK');
        const lat = await latRes.json();

        // Step 2: previous business day
        const d = new Date(lat.date + 'T12:00:00Z');
        let prev = new Date(d.getTime() - 86400000);
        while (prev.getUTCDay() === 0 || prev.getUTCDay() === 6) {
          prev = new Date(prev.getTime() - 86400000);
        }
        const prevStr = prev.toISOString().slice(0, 10);
        const prevRes = await fetch(`https://api.frankfurter.app/${prevStr}?from=USD&to=EUR,GBP,JPY,CHF,AUD,CAD,SEK`);
        const prevData = await prevRes.json();

        // Step 3: Gold (current + prev close)
        const [goldNow, goldPrev] = await Promise.all([
          fetch('https://api.gold-api.com/price/XAU').then(r => r.json()).catch(() => null),
          fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${prevStr}/v1/currencies/xau.min.json`).then(r => r.json()).catch(() => null),
        ]);

        // Step 4: VIX via Yahoo Finance
        const vixRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=5d', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then(r => r.json()).catch(() => null);

        // Build quotes
        function inv(key) { return ['EUR','GBP','AUD'].includes(key); }
        function rate(data, key) {
          if (!data || !data.rates) return null;
          const r = data.rates[key];
          return r ? (inv(key) ? 1/r : r) : null;
        }
        const quotes = {
          eurusd: { c: rate(lat,'EUR'),  pc: rate(prevData,'EUR'),  h: null, l: null },
          gbpusd: { c: rate(lat,'GBP'),  pc: rate(prevData,'GBP'),  h: null, l: null },
          usdjpy: { c: rate(lat,'JPY'),  pc: rate(prevData,'JPY'),  h: null, l: null },
          usdchf: { c: rate(lat,'CHF'),  pc: rate(prevData,'CHF'),  h: null, l: null },
          audusd: { c: rate(lat,'AUD'),  pc: rate(prevData,'AUD'),  h: null, l: null },
          usdcad: { c: rate(lat,'CAD'),  pc: rate(prevData,'CAD'),  h: null, l: null },
          usdsek: { c: rate(lat,'SEK'),  pc: rate(prevData,'SEK'),  h: null, l: null },
        };

        // Gold
        const gp  = goldNow ? (goldNow.price || null) : null;
        const gpr = (goldPrev && goldPrev.xau && goldPrev.xau.usd) ? goldPrev.xau.usd : null;
        quotes.xauusd = { c: gp, pc: gpr, h: null, l: null };

        // Compute DXY
        const dxyCur  = computeDXY({ eurusd: quotes.eurusd.c, usdjpy: quotes.usdjpy.c, gbpusd: quotes.gbpusd.c, usdcad: quotes.usdcad.c, usdsek: quotes.usdsek.c, usdchf: quotes.usdchf.c });
        const dxyPrev = computeDXY({ eurusd: quotes.eurusd.pc, usdjpy: quotes.usdjpy.pc, gbpusd: quotes.gbpusd.pc, usdcad: quotes.usdcad.pc, usdsek: quotes.usdsek.pc, usdchf: quotes.usdchf.pc });

        // VIX
        const vixResult  = vixRes?.chart?.result?.[0];
        const vixCur     = vixResult?.meta?.regularMarketPrice ?? null;
        const vixHistory = vixResult?.indicators?.quote?.[0]?.close?.filter(v => v != null).slice(-5) ?? [];

        return json({
          quotes,
          date: lat.date,
          dxy: dxyCur !== null ? {
            current: parseFloat(dxyCur.toFixed(3)),
            prev:    dxyPrev !== null ? parseFloat(dxyPrev.toFixed(3)) : null,
          } : null,
          vix: vixCur !== null ? {
            current: parseFloat(vixCur.toFixed(2)),
            history: vixHistory.map(v => parseFloat(v.toFixed(2))),
          } : null,
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    /* ── /fred ── */
    if (path === '/fred') {
      try {
        const SERIES = ['DGS10', 'DGS2', 'T10Y2Y', 'BAMLH0A0HYM2'];
        const results = await Promise.all(SERIES.map(id =>
          fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${env.FRED_KEY}&limit=5&sort_order=desc&file_type=json`)
            .then(r => r.json())
            .then(d => {
              const obs = (d.observations || []).filter(o => o.value !== '.');
              return {
                id,
                latest: obs[0]?.value ? parseFloat(obs[0].value) : null,
                prev:   obs[1]?.value ? parseFloat(obs[1].value) : null,
                date:   obs[0]?.date ?? null,
              };
            })
            .catch(() => ({ id, latest: null, prev: null, date: null }))
        ));
        return json(results);
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    /* ── /ecb-bund ── */
    if (path === '/ecb-bund') {
      try {
        const r = await fetch(
          'https://data-api.ecb.europa.eu/service/data/YC/B.U2.EUR.4F.G_N_A.SV_C_YM.SR_10Y?lastNObservations=2&format=jsondata',
          { headers: { 'Accept': 'application/json' } }
        );
        const d = await r.json();
        const series    = d?.dataSets?.[0]?.series;
        const seriesKey = series ? Object.keys(series)[0] : null;
        const obs       = seriesKey ? series[seriesKey]?.observations : null;
        const times     = d?.structure?.dimensions?.observation?.[0]?.values;
        if (!obs || !times) return json({ latest: null, prev: null });
        const sortedKeys = Object.keys(obs).sort((a, b) => parseInt(b) - parseInt(a));
        return json({
          latest: obs[sortedKeys[0]]?.[0] ?? null,
          prev:   obs[sortedKeys[1]]?.[0] ?? null,
          date:   times[parseInt(sortedKeys[0])]?.id ?? null,
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    /* ── /uk-gilt ── */
    if (path === '/uk-gilt') {
      try {
        // 1. Try Bank of England IADB CSV — IUDMNPY = 10Y nominal par yield
        const boeUrl = 'https://www.bankofengland.co.uk/boeapps/database/_iadb-FromShowColumns.asp?csv.x=yes&Datefrom=01/Jan/2026&Dateto=now&SeriesCodes=IUDMNPY&CSVF=TN&UsingCodes=Y';
        const boeRaw = await fetch(boeUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/csv,text/plain,*/*' } })
          .then(r => r.ok ? r.text() : null).catch(() => null);
        if (boeRaw) {
          const lines = boeRaw.trim().split('\n').filter(l => l.trim() && !l.startsWith('"') && !l.toLowerCase().startsWith('date'));
          const vals = lines.map(l => parseFloat(l.split(',').pop())).filter(v => !isNaN(v));
          if (vals.length > 0) {
            return json({ latest: parseFloat(vals[vals.length - 1].toFixed(3)), prev: vals.length > 1 ? parseFloat(vals[vals.length - 2].toFixed(3)) : null, source: 'boe' });
          }
        }
        // 2. Fallback: FRED IRLTLT01GBM156N — UK 10Y monthly (stale by ~1 month but real)
        if (env.FRED_KEY) {
          const fredR = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=IRLTLT01GBM156N&api_key=${env.FRED_KEY}&limit=3&sort_order=desc&file_type=json`)
            .then(r => r.json()).catch(() => null);
          const obs = (fredR?.observations || []).filter(o => o.value !== '.');
          if (obs[0]?.value) {
            return json({ latest: parseFloat(parseFloat(obs[0].value).toFixed(3)), prev: obs[1]?.value ? parseFloat(parseFloat(obs[1].value).toFixed(3)) : null, source: 'fred-monthly' });
          }
        }
        return json({ latest: null, prev: null });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    /* ── /ff-calendar ── */
    if (path === '/ff-calendar') {
      try {
        const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return json(await r.json());
      } catch (e) {
        return json({ error: 'calendar unavailable' }, 500);
      }
    }

    /* ── /finnhub ── */
    if (path === '/finnhub') {
      try {
        const SYMS = ['SPY', 'QQQ', 'TLT', 'HYG', 'UUP'];
        const results = await Promise.all(SYMS.map(sym =>
          fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${env.FINNHUB_KEY}`)
            .then(r => r.json())
            .then(d => ({
              sym,
              c:  d.c  ?? null,
              pc: d.pc ?? null,
              d:  d.d  ?? null,
              dp: d.dp ?? null,
              h:  d.h  ?? null,
              l:  d.l  ?? null,
            }))
            .catch(() => ({ sym, c: null, pc: null, d: null, dp: null, h: null, l: null }))
        ));
        return json(results);
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    /* ── /mfxbook-login ── */
    if (path === '/mfxbook-login') {
      const email = url.searchParams.get('email');
      const pass  = url.searchParams.get('password');
      if (!email || !pass) return json({ error: true, message: 'missing creds' }, 400);
      try {
        const r = await fetch(
          'https://www.myfxbook.com/api/login.json?email=' + encodeURIComponent(email) +
          '&password=' + encodeURIComponent(pass)
        );
        return json(await r.json());
      } catch (e) {
        return json({ error: true, message: 'login failed' }, 500);
      }
    }

    return new Response('Not found', { status: 404, headers: CORS });
  },
};
