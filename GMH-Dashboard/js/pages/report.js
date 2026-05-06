window.GMH = window.GMH || {};

GMH.PageReport = (() => {
  function render(container) {
    const now = new Date();
    const maxMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Relatório Mensal</h1>
          <p class="page-sub">Gere e baixe o relatório em PDF</p>
        </div>
      </div>

      <div class="card" style="margin-bottom:1.5rem">
        <div class="report-controls">
          <div class="month-picker-wrap">
            <label class="input-label">Competência</label>
            <input type="month" id="report-month" class="input-field" value="${maxMonth}" max="${maxMonth}" min="2024-01" />
          </div>
          <div>
            <button class="btn-primary" id="btn-download-pdf">⬇ Baixar PDF</button>
            <div id="pdf-status" style="margin-top:0.5rem;font-size:0.78rem;color:var(--muted)"></div>
          </div>
        </div>
      </div>

      <div id="report-preview">${GMH.spinner()}</div>
    `;

    document.getElementById("report-month").addEventListener("change", () => loadReport(container));
    document.getElementById("btn-download-pdf").addEventListener("click", () => downloadPDF(container));
    loadReport(container);
  }

  async function loadReport(container) {
    const preview = container.querySelector("#report-preview");
    preview.innerHTML = GMH.spinner();
    try {
      const [portfolios, selic] = await Promise.all([GMH.Api.getPortfolios(), GMH.Api.getSelic()]);
      const month = document.getElementById("report-month").value;
      preview.innerHTML = buildReport(portfolios, selic, month);
    } catch (e) {
      preview.innerHTML = GMH.errorBox("Erro ao carregar dados para o relatório.");
    }
  }

  function buildReport(portfolios, selic, month) {
    const totalInit = portfolios.reduce((s, p) => s + p.initialBRL, 0);
    const totalCurrent = portfolios.reduce((s, p) => s + p.currentBRL, 0);
    const totalPnl = totalCurrent - totalInit;
    const totalPct = totalInit > 0 ? (totalPnl / totalInit) * 100 : 0;
    const isPos = totalPct >= 0;
    const cdi = ((Math.pow(1 + (selic.monthly * 0.999) / 100, 12) - 1) * 100).toFixed(2);
    const monthLabel = GMH.fmt.monthLabel(month);
    const generatedAt = new Date().toLocaleString("pt-BR");

    return `
      <div id="pdf-report" class="report-doc">
        <!-- Cover -->
        <div class="report-cover">
          <div class="report-cover-overlay"></div>
          <div class="report-cover-content">
            <img src="img/logo.png" alt="GMH" class="report-logo" />
            <h1 class="report-cover-title">Relatório Mensal</h1>
            <p class="report-cover-sub" style="text-transform:capitalize">${monthLabel}</p>
          </div>
        </div>

        <div class="report-body">
          <!-- Summary -->
          <div class="report-section-title">Resumo Consolidado</div>
          <div class="report-summary-grid">
            <div class="report-stat">
              <div class="rs-label">Capital Alocado</div>
              <div class="rs-value">${GMH.fmt.brl(totalInit)}</div>
              <div class="rs-sub">${portfolios.length} carteiras</div>
            </div>
            <div class="report-stat">
              <div class="rs-label">Patrimônio Atual</div>
              <div class="rs-value">${GMH.fmt.brl(totalCurrent)}</div>
            </div>
            <div class="report-stat">
              <div class="rs-label">P&amp;L Consolidado</div>
              <div class="rs-value ${isPos ? "pos" : "neg"}">${GMH.fmt.brl(totalPnl)}</div>
              <div class="rs-sub ${isPos ? "pos" : "neg"}">${GMH.fmt.pct(totalPct)}</div>
            </div>
            <div class="report-stat">
              <div class="rs-label">Selic (benchmark)</div>
              <div class="rs-value amber">${selic.annual.toFixed(2)}% a.a.</div>
              <div class="rs-sub">CDI ${cdi}% a.a.</div>
            </div>
          </div>

          <!-- Portfolios -->
          <div class="report-section-title" style="margin-top:2rem">Detalhamento por Carteira</div>
          ${portfolios.map(p => buildPortfolioSection(p)).join("")}

          <!-- Footer -->
          <div class="report-footer">
            <span>GMH Asset Management · Relatório Mensal — ${monthLabel}</span>
            <span>Gerado em ${generatedAt}</span>
          </div>
          <p class="report-disclaimer">
            Este documento é de uso interno e confidencial. As cotações refletem os valores de mercado no momento da geração do relatório.
          </p>
        </div>
      </div>
    `;
  }

  function buildPortfolioSection(p) {
    const isPos = p.pnlPct >= 0;
    return `
      <div class="report-portfolio">
        <div class="rp-header">
          <div class="rp-title">
            <span class="rp-dot" style="background:${p.color}"></span>
            <span>${p.name}</span>
          </div>
          <div>
            <div class="rp-pct ${isPos ? "pos" : "neg"}">${GMH.fmt.pct(p.pnlPct)}</div>
            <div class="rp-brl ${isPos ? "pos" : "neg"}">${isPos ? "+" : ""}${GMH.fmt.brl(p.pnlBRL)}</div>
          </div>
        </div>
        <div class="rp-values">
          <div><div class="rv-label">Capital Inicial</div><div class="rv-val">${GMH.fmt.brl(p.initialBRL)}</div><div class="rv-sub">${GMH.fmt.usd(p.initialUSD)}</div></div>
          <div class="rv-arrow">→</div>
          <div><div class="rv-label">Valor Atual</div><div class="rv-val ${isPos ? "pos" : "neg"}">${GMH.fmt.brl(p.currentBRL)}</div><div class="rv-sub">${GMH.fmt.usd(p.currentUSD)}</div></div>
        </div>
        <table class="positions-table" style="margin-top:1rem">
          <thead>
            <tr>
              <th>Ativo</th><th class="right">Qtde</th><th class="right">Preço Entrada</th>
              <th class="right">Preço Atual</th><th class="right">Valor BRL</th><th class="right">P&L</th>
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
    `;
  }

  async function downloadPDF(container) {
    const reportEl = document.getElementById("pdf-report");
    if (!reportEl) { alert("Aguarde o relatório carregar."); return; }
    const statusEl = document.getElementById("pdf-status");
    const btn = document.getElementById("btn-download-pdf");
    btn.disabled = true;
    btn.textContent = "⏳ Gerando PDF...";
    statusEl.textContent = "Processando... pode levar alguns segundos.";

    try {
      const month = document.getElementById("report-month").value;

      // Stamp RGB computed styles to avoid oklab parsing errors in html2canvas
      const allEls = [reportEl, ...reportEl.querySelectorAll("*")];
      const savedCss = allEls.map(el => el.style.cssText);
      const PROPS = ["color","backgroundColor","borderColor","borderTopColor","borderBottomColor","borderLeftColor","borderRightColor"];
      allEls.forEach(el => {
        const cs = window.getComputedStyle(el);
        PROPS.forEach(prop => {
          const v = cs[prop];
          if (v && v !== "rgba(0, 0, 0, 0)" && v !== "transparent") el.style[prop] = v;
        });
      });

      const canvas = await html2canvas(reportEl, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: "#0f1729", imageTimeout: 15000, logging: false,
        onclone: (_doc, el) => {
          el.querySelectorAll("img").forEach(img => { img.crossOrigin = "anonymous"; });
        },
      });

      allEls.forEach((el, i) => { el.style.cssText = savedCss[i] || ""; });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const imgW = pw;
      const imgH = (canvas.height * imgW) / canvas.width;
      let left = imgH, pos = 0;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, pos, imgW, imgH);
      left -= ph;
      while (left > 0) {
        pos = left - imgH;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, pos, imgW, imgH);
        left -= ph;
      }
      pdf.save(`GMH_Relatorio_${month}.pdf`);
      statusEl.textContent = "PDF gerado com sucesso!";
    } catch (e) {
      console.error(e);
      statusEl.textContent = "Erro ao gerar PDF: " + e.message;
    } finally {
      btn.disabled = false;
      btn.textContent = "⬇ Baixar PDF";
      setTimeout(() => { statusEl.textContent = ""; }, 5000);
    }
  }

  return { render };
})();
