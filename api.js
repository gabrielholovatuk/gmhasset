// ── Camada de dados — busca direto de APIs públicas com CORS
window.GMH = window.GMH || {};

GMH.Api = (() => {
  // Cache simples em memória
  const cache = new Map();
  function cached(key, ttlMs, fn) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < ttlMs) return Promise.resolve(hit.data);
    return fn().then(data => { cache.set(key, { data, ts: Date.now() }); return data; });
  }

  // ── Preços de crypto (CoinGecko público)
  async function getCryptoPrices() {
    return cached("crypto", 2 * 60 * 1000, async () => {
      const r = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl,usd&include_24hr_change=true",
        { signal: AbortSignal.timeout(10000) }
      );
      if (!r.ok) throw new Error("CoinGecko error");
      return r.json();
    });
  }

  // ── Câmbio fiduciário (AwesomeAPI)
  async function getFiatRates() {
    return cached("fiat", 2 * 60 * 1000, async () => {
      const pairs = GMH.FIAT_PAIRS.join(",");
      const r = await fetch(`https://economia.awesomeapi.com.br/json/last/${pairs}`, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error("AwesomeAPI error");
      return r.json();
    });
  }

  // ── Taxa Selic (BCB)
  async function getSelic() {
    return cached("selic", 3600 * 1000, async () => {
      const r = await fetch(
        "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados/ultimos/1?formato=json",
        { signal: AbortSignal.timeout(10000) }
      );
      if (!r.ok) throw new Error("BCB Selic error");
      const data = await r.json();
      const monthly = parseFloat(data[0].valor);
      const annual = (Math.pow(1 + monthly / 100, 12) - 1) * 100;
      return { monthly, annual: parseFloat(annual.toFixed(2)), date: data[0].data };
    });
  }

  // ── IPCA (BCB série 433)
  async function getIPCA() {
    return cached("ipca", 3600 * 1000, async () => {
      const r = await fetch(
        "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json",
        { signal: AbortSignal.timeout(10000) }
      );
      if (!r.ok) throw new Error("BCB IPCA error");
      const data = await r.json();
      const monthly = parseFloat(data[0].valor);
      return { monthly, date: data[0].data };
    });
  }

  // ── Histórico de crypto (CoinGecko)
  async function getCryptoHistory(coinId, days) {
    return cached(`history-${coinId}-${days}`, 3600 * 1000, async () => {
      const r = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=brl&days=${days}&interval=daily`,
        { signal: AbortSignal.timeout(15000) }
      );
      if (!r.ok) throw new Error(`CoinGecko history error: ${r.status}`);
      const d = await r.json();
      return d.prices; // [[timestamp, price], ...]
    });
  }

  // ── Dados completos das carteiras
  async function getPortfolios() {
    return cached("portfolios", 2 * 60 * 1000, async () => {
      const crypto = await getCryptoPrices();
      const prices = {
        BTC: { brl: crypto.bitcoin.brl,  usd: crypto.bitcoin.usd,  pct: crypto.bitcoin.usd_24h_change  },
        ETH: { brl: crypto.ethereum.brl, usd: crypto.ethereum.usd, pct: crypto.ethereum.usd_24h_change },
        SOL: { brl: crypto.solana.brl,   usd: crypto.solana.usd,   pct: crypto.solana.usd_24h_change   },
      };

      return GMH.PORTFOLIOS.map(def => {
        const positions = def.positions.map(pos => {
          const p = prices[pos.asset] || { brl: 0, usd: 0, pct: 0 };
          const currentValueBRL = pos.qty * p.brl;
          const currentValueUSD = pos.qty * p.usd;
          const pnlPct = pos.buyValueUSD > 0 ? ((currentValueUSD - pos.buyValueUSD) / pos.buyValueUSD) * 100 : 0;
          return { ...pos, currentPriceUSD: p.usd, currentValueBRL, currentValueUSD, pnlPct };
        });

        const currentBRL = positions.reduce((s, p) => s + p.currentValueBRL, 0);
        const currentUSD = positions.reduce((s, p) => s + p.currentValueUSD, 0);
        const pnlBRL = currentBRL - def.initialBRL;
        const pnlPct = def.initialBRL > 0 ? (pnlBRL / def.initialBRL) * 100 : 0;

        return { ...def, positions, currentBRL, currentUSD, pnlBRL, pnlPct };
      });
    });
  }

  // ── Watchlist (localStorage)
  function getWatchlist() {
    try { return JSON.parse(localStorage.getItem("gmh_watchlist") || "[]"); } catch { return []; }
  }
  function toggleWatchlist(code) {
    const list = getWatchlist();
    const idx = list.indexOf(code);
    if (idx >= 0) list.splice(idx, 1); else list.push(code);
    localStorage.setItem("gmh_watchlist", JSON.stringify(list));
    return list;
  }

  // ── Alertas (localStorage)
  function getAlerts() {
    try { return JSON.parse(localStorage.getItem("gmh_alerts") || "[]"); } catch { return []; }
  }
  function addAlert(alert) {
    const list = getAlerts();
    list.push({ ...alert, id: Date.now(), active: true, createdAt: new Date().toISOString() });
    localStorage.setItem("gmh_alerts", JSON.stringify(list));
    return list;
  }
  function deleteAlert(id) {
    const list = getAlerts().filter(a => a.id !== id);
    localStorage.setItem("gmh_alerts", JSON.stringify(list));
    return list;
  }

  return { getCryptoPrices, getFiatRates, getSelic, getIPCA, getCryptoHistory, getPortfolios, getWatchlist, toggleWatchlist, getAlerts, addAlert, deleteAlert };
})();
