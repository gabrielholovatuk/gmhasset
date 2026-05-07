// ============================================================
//  GMH Asset Management — Configuração
//  ATENÇÃO: Este arquivo contém credenciais de acesso.
//  Mantenha-o protegido e não compartilhe publicamente.
// ============================================================

window.GMH = window.GMH || {};

// ── Senhas (SHA-256 em hexadecimal)
// Para gerar um novo hash abra: gerar-senha.html
GMH.USERS = [
  {
    username: "GMH",
    // hash padrão de "gmh2025" — troque em gerar-senha.html
    hash: "e96d9804c9fe771fb1b73ae959c53e4013062f1edac4a500b3e9b9dcf2f9adb8",
    role: "admin",
  },
  {
    username: "cliente",
    // hash padrão de "cliente2025" — troque em gerar-senha.html
    hash: "2f1bd22431f29fd2a848fd23f3e025b987bb5dad3165e66016b23da699e3c6de",
    role: "cliente",
  },
];

// ── Portfólios (dados conforme Relatório Mensal)
GMH.PORTFOLIOS = [
  {
    id: "high-beta",
    name: "High Beta",
    color: "#60a5fa",
    startDate: "2025-09-01",
    initialBRL: 17114.70,
    initialUSD: 3205.00,
    initialUSDRate: 5.32,
    positions: [
      { asset: "BTC", coinId: "bitcoin", qty: 0.011,   buyPriceUSD: 122012,   buyValueUSD: 1410.00 },
      { asset: "ETH", coinId: "ethereum", qty: 0.15,   buyPriceUSD: 4418.10,  buyValueUSD: 662.70  },
      { asset: "SOL", coinId: "solana",   qty: 4.02,   buyPriceUSD: 281.64,   buyValueUSD: 1133.00 },
    ],
  },
  {
    id: "buy-hold",
    name: "Buy & Hold",
    color: "#34d399",
    startDate: "2024-01-01",
    initialBRL: 10000.00,
    initialUSD: 1960.00,
    initialUSDRate: 5.10,
    positions: [
      { asset: "BTC", coinId: "bitcoin",  qty: 0.01847, buyPriceUSD: 51741.99, buyValueUSD: 979.89 },
      { asset: "ETH", coinId: "ethereum", qty: 0.17,    buyPriceUSD: 2884.53,  buyValueUSD: 490.37 },
      { asset: "SOL", coinId: "solana",   qty: 4.33,    buyPriceUSD: 113.18,   buyValueUSD: 490.08 },
    ],
  },
  {
    id: "buy-hold-2",
    name: "Buy & Hold 2.0",
    color: "#f472b6",
    startDate: "2025-01-01",
    initialBRL: 35000.00,
    initialUSD: 5769.24,
    initialUSDRate: 6.06,
    positions: [
      { asset: "BTC", coinId: "bitcoin",  qty: 0.0166,  buyPriceUSD: 98922.90, buyValueUSD: 1644.23 },
      { asset: "ETH", coinId: "ethereum", qty: 0.495,   buyPriceUSD: 3319.00,  buyValueUSD: 1644.23 },
      { asset: "SOL", coinId: "solana",   qty: 11.884,  buyPriceUSD: 208.76,   buyValueUSD: 2480.82 },
    ],
  },
];

// ── Moedas exibidas no Monitor de Mercado
GMH.FIAT_PAIRS = ["USD-BRL","EUR-BRL","GBP-BRL","CAD-BRL","ARS-BRL","JPY-BRL","CNY-BRL","CHF-BRL"];
GMH.FIAT_NAMES = {
  USD: "Dólar Americano", EUR: "Euro", GBP: "Libra Esterlina",
  CAD: "Dólar Canadense", ARS: "Peso Argentino", JPY: "Iene Japonês",
  CNY: "Yuan Chinês",     CHF: "Franco Suíço",
  BTC: "Bitcoin",         ETH: "Ethereum",       SOL: "Solana",
};
