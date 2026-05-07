window.GMH = window.GMH || {};

GMH.PagePortfolios = (() => {
  async function render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestão de Carteiras</h1>
          <p class="page-sub">Valores em tempo real · P&amp;L desde o início</p>
        </div>
        <button class="btn-icon" id="btn-refresh-p" title="Atualizar">↻</button>
      </div>
      <div id="portfolios-body">${GMH.spinner()}</div>
    `;
    document.getElementById("btn-refresh-p").addEventListener("click", () => load(container));
    await load(container);
  }

  async function load(container) {
    const body = container.querySelector("#portfolios-body");
    body.innerHTML = GMH.spinner();
    try {
      const portfolios = await GMH.Api.getPortfolios();
      const totalBRL = portfolios.reduce((s, p) => s + p.currentBRL, 0);
      const totalInit = portfolios.reduce((s, p) => s + p.initialBRL, 0);
      const totalPnl = totalBRL - totalInit;
      const totalPct = totalInit > 0 ? (totalPnl / totalInit) * 100 : 0;

      body.innerHTML = `
        <div class="summary-bar">
          <div class="summary-item">
            <div class="summary-label">Capital Alocado</div>
            <div class="summary-value">${GMH.fmt.brl(totalInit)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Patrimônio Atual</div>
            <div class="summary-value">${GMH.fmt.brl(totalBRL)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">P&amp;L Consolidado</div>
            <div class="summary-value ${GMH.pctClass(totalPnl)}">${GMH.fmt.brl(totalPnl)}</div>
            <div class="summary-sub ${GMH.pctClass(totalPct)}">${GMH.fmt.pct(totalPct)}</div>
          </div>
        </div>

        ${portfolios.map(p => renderPortfolio(p)).join("")}
      `;
    } catch (e) {
      body.innerHTML = GMH.errorBox("Não foi possível carregar os dados. Verifique sua conexão.");
    }
  }

  function renderPortfolio(p) {
    const isPos = p.pnlPct >= 0;
    return `
      <div class="portfolio-card">
        <div class="portfolio-header">
          <div class="portfolio-title-row">
            <span class="portfolio-dot" style="background:${p.color}"></span>
            <div>
              <div class="portfolio-name">${p.name}</div>
              <div class="portfolio-meta">
                Início: ${GMH.fmt.date(p.startDate)} · USD/BRL entrada ${p.initialUSDRate.toFixed(2)}
              </div>
            </div>
          </div>
          <div class="portfolio-pnl">
            <div class="pnl-pct ${isPos ? "pos" : "neg"}">${GMH.fmt.pct(p.pnlPct)}</div>
            <div class="pnl-brl ${isPos ? "pos" : "neg"}">${isPos ? "+" : ""}${GMH.fmt.brl(p.pnlBRL)}</div>
          </div>
        </div>

        <div class="portfolio-values">
          <div class="val-block">
            <div class="val-label">Capital Inicial</div>
            <div class="val-main">${GMH.fmt.brl(p.initialBRL)}</div>
            <div class="val-sub">${GMH.fmt.usd(p.initialUSD)}</div>
          </div>
          <div class="val-arrow">→</div>
          <div class="val-block">
            <div class="val-label">Valor Atual</div>
            <div class="val-main ${isPos ? "pos" : "neg"}">${GMH.fmt.brl(p.currentBRL)}</div>
            <div class="val-sub">${GMH.fmt.usd(p.currentUSD)}</div>
          </div>
        </div>

        <div class="table-wrap">
          <table class="positions-table">
            <thead>
              <tr>
                <th>Ativo</th>
                <th class="right">Qtde</th>
                <th class="right">Preço Entrada</th>
                <th class="right">Preço Atual</th>
                <th class="right">Valor BRL</th>
                <th class="right">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              ${p.positions.map(pos => `
                <tr>
                  <td class="bold">${pos.asset}</td>
                  <td class="right mono">${GMH.fmt.num(pos.qty)}</td>
                  <td class="right mono">${GMH.fmt.usd(pos.buyPriceUSD)}</td>
                  <td class="right mono primary">${GMH.fmt.usd(pos.currentPriceUSD)}</td>
                  <td class="right mono">${GMH.fmt.brl(pos.currentValueBRL)}</td>
                  <td class="right bold ${GMH.pctClass(pos.pnlPct)}">${GMH.fmt.pct(pos.pnlPct)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return { render };
})();
