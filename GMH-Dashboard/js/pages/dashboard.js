window.GMH = window.GMH || {};

GMH.PageDashboard = (() => {
  let refreshTimer = null;

  async function render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Monitor de Mercado</h1>
          <p class="page-sub">Cotações em tempo real · Atualiza a cada 2 minutos</p>
        </div>
        <button class="btn-icon" id="btn-refresh" title="Atualizar agora">↻</button>
      </div>

      <div class="benchmarks-row" id="benchmarks">
        ${GMH.spinner()}
      </div>

      <div class="section-label">Moedas &amp; Câmbio</div>
      <div class="cards-grid" id="fiat-cards">${GMH.spinner()}</div>

      <div class="section-label" style="margin-top:2rem">Criptomoedas</div>
      <div class="cards-grid" id="crypto-cards">${GMH.spinner()}</div>
    `;

    document.getElementById("btn-refresh").addEventListener("click", () => load(container));
    await load(container);

    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => load(container), 2 * 60 * 1000);
  }

  async function load(container) {
    try {
      const [fiat, crypto, selic, ipca] = await Promise.all([
        GMH.Api.getFiatRates(),
        GMH.Api.getCryptoPrices(),
        GMH.Api.getSelic(),
        GMH.Api.getIPCA(),
      ]);
      renderBenchmarks(container, selic, ipca);
      renderFiat(container, fiat);
      renderCrypto(container, crypto);
    } catch (e) {
      container.querySelector("#fiat-cards").innerHTML = GMH.errorBox("Erro ao carregar dados. Verifique sua conexão.");
    }
  }

  function renderBenchmarks(container, selic, ipca) {
    const cdi = selic.monthly * 0.999;
    const items = [
      { label: "Selic", value: `${selic.annual.toFixed(2)}% a.a.`, sub: `${selic.monthly.toFixed(4)}% a.m.`, color: "#fbbf24" },
      { label: "CDI",   value: `${((Math.pow(1 + cdi/100, 12)-1)*100).toFixed(2)}% a.a.`, sub: `${cdi.toFixed(4)}% a.m.`, color: "#60a5fa" },
      { label: "IPCA",  value: `${ipca.monthly.toFixed(2)}% a.m.`, sub: `Ref: ${ipca.date}`, color: "#34d399" },
    ];
    container.querySelector("#benchmarks").innerHTML = items.map(i => `
      <div class="benchmark-card">
        <div class="benchmark-label">${i.label}</div>
        <div class="benchmark-value" style="color:${i.color}">${i.value}</div>
        <div class="benchmark-sub">${i.sub}</div>
      </div>
    `).join("");
  }

  function renderFiat(container, fiat) {
    const watchlist = GMH.Api.getWatchlist();
    const pairs = GMH.FIAT_PAIRS.map(p => {
      const key = p.replace("-", "");
      const d = fiat[key];
      if (!d) return null;
      const code = p.split("-")[0];
      const bid = parseFloat(d.bid);
      const pct = parseFloat(d.pctChange);
      const inWL = watchlist.includes(code);
      return `
        <div class="currency-card" data-code="${code}">
          <div class="currency-header">
            <div>
              <div class="currency-code">${code}</div>
              <div class="currency-name">${GMH.FIAT_NAMES[code] || code}</div>
            </div>
            <button class="star-btn ${inWL ? "active" : ""}" data-code="${code}" title="Adicionar à watchlist">★</button>
          </div>
          <div class="currency-price">${GMH.fmt.brl(bid)}</div>
          <div class="currency-change ${GMH.pctClass(pct)}">
            ${GMH.pctIcon(pct)} ${GMH.fmt.pct(pct)}
          </div>
          <div class="currency-meta">
            Max ${GMH.fmt.brl(parseFloat(d.high))} · Min ${GMH.fmt.brl(parseFloat(d.low))}
          </div>
        </div>`;
    }).filter(Boolean).join("");
    const el = container.querySelector("#fiat-cards");
    el.innerHTML = pairs;
    el.querySelectorAll(".star-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const code = btn.dataset.code;
        GMH.Api.toggleWatchlist(code);
        btn.classList.toggle("active");
      });
    });
  }

  function renderCrypto(container, crypto) {
    const watchlist = GMH.Api.getWatchlist();
    const coins = [
      { code: "BTC", data: crypto.bitcoin },
      { code: "ETH", data: crypto.ethereum },
      { code: "SOL", data: crypto.solana },
    ];
    const html = coins.map(({ code, data }) => {
      const bid = data.brl;
      const pct = data.usd_24h_change || 0;
      const inWL = watchlist.includes(code);
      return `
        <div class="currency-card crypto-card" data-code="${code}">
          <div class="currency-header">
            <div>
              <div class="currency-code">${code}</div>
              <div class="currency-name">${GMH.FIAT_NAMES[code] || code}</div>
            </div>
            <button class="star-btn ${inWL ? "active" : ""}" data-code="${code}" title="Watchlist">★</button>
          </div>
          <div class="currency-price">${GMH.fmt.brl(bid)}</div>
          <div class="currency-change ${GMH.pctClass(pct)}">
            ${GMH.pctIcon(pct)} ${GMH.fmt.pct(pct)} (24h)
          </div>
          <div class="currency-meta">${GMH.fmt.usd(data.usd)} USD</div>
        </div>`;
    }).join("");
    const el = container.querySelector("#crypto-cards");
    el.innerHTML = html;
    el.querySelectorAll(".star-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        GMH.Api.toggleWatchlist(btn.dataset.code);
        btn.classList.toggle("active");
      });
    });
  }

  function destroy() { clearInterval(refreshTimer); }

  return { render, destroy };
})();
