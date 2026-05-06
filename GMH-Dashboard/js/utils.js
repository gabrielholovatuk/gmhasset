window.GMH = window.GMH || {};

GMH.fmt = {
  brl(v) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  },
  usd(v) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
  },
  pct(v, showSign = true) {
    const s = showSign && v > 0 ? "+" : "";
    return `${s}${v.toFixed(2)}%`;
  },
  num(v, decimals = 4) {
    return v.toLocaleString("pt-BR", { maximumSignificantDigits: decimals });
  },
  date(iso) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  },
  datetime(iso) {
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  },
  monthLabel(yyyyMM) {
    const [y, m] = yyyyMM.split("-");
    return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  },
};

GMH.pctClass = (v) => v >= 0 ? "pos" : "neg";
GMH.pctIcon  = (v) => v >= 0 ? "▲" : "▼";

GMH.el = (html) => {
  const t = document.createElement("div");
  t.innerHTML = html.trim();
  return t.firstChild;
};

GMH.spinner = () => `<div class="spinner"></div>`;
GMH.errorBox = (msg) => `<div class="error-box">⚠ ${msg}</div>`;
