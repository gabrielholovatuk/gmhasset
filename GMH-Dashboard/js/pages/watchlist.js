window.GMH = window.GMH || {};

GMH.PageWatchlist = (() => {
  async function render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Watchlist</h1>
          <p class="page-sub">Ativos favoritados · Clique na estrela no Monitor para adicionar</p>
        </div>
        <button class="btn-icon" id="btn-refresh-wl" title="Atualizar">↻</button>
      </div>
      <div id="watchlist-body">${GMH.spinner()}</div>
    `;
    document.getElementById("btn-refresh-wl").addEventListener("click", () => load(container));
    await load(container);
  }

  async function load(container) {
    const body = container.querySelector("#watchlist-body");
    const wl = GMH.Api.getWatchlist();

    if (wl.length === 0) {
      body.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">★</div>
          <p>Sua watchlist está vazia.</p>
          <p class="text-muted">Clique na estrela ★ de qualquer ativo no Monitor de Mercado para adicioná-lo aqui.</p>
        </div>`;
      return;
    }

    body.innerHTML = GMH.spinner();
    try {
      const [fiat, crypto] = await Promise.all([GMH.Api.getFiatRates(), GMH.Api.getCryptoPrices()]);
      const allData = buildAllData(fiat, crypto);

      const items = wl.map(code => {
        const d = allData[code];
        if (!d) return "";
        const isPos = d.pct >= 0;
        return `
          <div class="currency-card">
            <div class="currency-header">
              <div>
                <div class="currency-code">${code}</div>
                <div class="currency-name">${GMH.FIAT_NAMES[code] || code}</div>
              </div>
              <button class="star-btn active" data-code="${code}" title="Remover da watchlist">★</button>
            </div>
            <div class="currency-price">${GMH.fmt.brl(d.bid)}</div>
            <div class="currency-change ${isPos ? "pos" : "neg"}">${GMH.pctIcon(d.pct)} ${GMH.fmt.pct(d.pct)}</div>
            <div class="currency-meta">Max ${GMH.fmt.brl(d.high)} · Min ${GMH.fmt.brl(d.low)}</div>
          </div>`;
      }).join("");

      body.innerHTML = `<div class="cards-grid">${items}</div>`;
      body.querySelectorAll(".star-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          GMH.Api.toggleWatchlist(btn.dataset.code);
          load(container);
        });
      });
    } catch (e) {
      body.innerHTML = GMH.errorBox("Erro ao carregar cotações.");
    }
  }

  function buildAllData(fiat, crypto) {
    const result = {};
    GMH.FIAT_PAIRS.forEach(p => {
      const code = p.split("-")[0];
      const key = p.replace("-", "");
      const d = fiat[key];
      if (d) result[code] = { bid: parseFloat(d.bid), high: parseFloat(d.high), low: parseFloat(d.low), pct: parseFloat(d.pctChange) };
    });
    const cryptoMap = { BTC: crypto.bitcoin, ETH: crypto.ethereum, SOL: crypto.solana };
    Object.entries(cryptoMap).forEach(([code, d]) => {
      if (d) result[code] = { bid: d.brl, high: d.brl * 1.01, low: d.brl * 0.99, pct: d.usd_24h_change || 0 };
    });
    return result;
  }

  return { render };
})();
