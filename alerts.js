window.GMH = window.GMH || {};

GMH.PageAlerts = (() => {
  const ALL_CODES = ["BTC","ETH","SOL","USD","EUR","GBP","CAD","ARS","JPY","CNY","CHF"];

  function render(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Ordens de Alerta</h1>
          <p class="page-sub">Defina preços de referência para acompanhar</p>
        </div>
      </div>

      <div class="card form-card">
        <h3 class="card-title">Criar Alerta</h3>
        <div class="alert-form">
          <select id="alert-code" class="input-field">
            ${ALL_CODES.map(c => `<option value="${c}">${c} — ${GMH.FIAT_NAMES[c] || c}</option>`).join("")}
          </select>
          <select id="alert-dir" class="input-field">
            <option value="above">Acima de (≥)</option>
            <option value="below">Abaixo de (≤)</option>
          </select>
          <input type="number" id="alert-price" class="input-field" placeholder="Preço alvo em BRL" step="0.01" min="0" />
          <button class="btn-primary" id="btn-add-alert">+ Criar Alerta</button>
        </div>
        <div id="alert-form-msg"></div>
      </div>

      <div id="alerts-list"></div>
    `;

    document.getElementById("btn-add-alert").addEventListener("click", () => {
      const code = document.getElementById("alert-code").value;
      const dir = document.getElementById("alert-dir").value;
      const price = parseFloat(document.getElementById("alert-price").value);
      const msg = document.getElementById("alert-form-msg");

      if (!price || price <= 0) {
        msg.innerHTML = `<p class="text-error">Informe um preço válido.</p>`;
        return;
      }
      GMH.Api.addAlert({ currencyCode: code, direction: dir, targetPrice: price });
      document.getElementById("alert-price").value = "";
      msg.innerHTML = `<p class="text-success">Alerta criado com sucesso!</p>`;
      setTimeout(() => { msg.innerHTML = ""; }, 3000);
      renderList(container);
    });

    renderList(container);
  }

  function renderList(container) {
    const alerts = GMH.Api.getAlerts();
    const el = container.querySelector("#alerts-list");

    if (alerts.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><p>Nenhum alerta criado ainda.</p></div>`;
      return;
    }

    el.innerHTML = `
      <div class="card">
        <h3 class="card-title">Alertas Cadastrados <span class="badge">${alerts.length}</span></h3>
        <div class="alerts-table-wrap">
          <table class="positions-table">
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Condição</th>
                <th class="right">Preço Alvo</th>
                <th>Criado em</th>
                <th class="right">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${alerts.map(a => `
                <tr>
                  <td class="bold">${a.currencyCode}</td>
                  <td>${a.direction === "above" ? "≥ (acima)" : "≤ (abaixo)"}</td>
                  <td class="right mono">${GMH.fmt.brl(a.targetPrice)}</td>
                  <td class="text-muted">${GMH.fmt.date(a.createdAt)}</td>
                  <td class="right">
                    <button class="btn-danger-sm" data-id="${a.id}">Remover</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    el.querySelectorAll(".btn-danger-sm").forEach(btn => {
      btn.addEventListener("click", () => {
        GMH.Api.deleteAlert(parseInt(btn.dataset.id));
        renderList(container);
      });
    });
  }

  return { render };
})();
