╔══════════════════════════════════════════════════════════╗
║         GMH Asset Management — Dashboard Estático        ║
║              Versão para cPanel / Hostgator              ║
╚══════════════════════════════════════════════════════════╝

Este pacote é 100% HTML + CSS + JavaScript puro.
Não precisa de Node.js, PHP, banco de dados nem servidor especial.
Funciona em qualquer hospedagem compartilhada com suporte a arquivos estáticos.

─────────────────────────────────────────────
 ESTRUTURA DOS ARQUIVOS
─────────────────────────────────────────────

  index.html          → Entrada principal (login + dashboard)
  gerar-senha.html    → Ferramenta para criar hashes de senha
  css/
    app.css           → Todo o estilo do dashboard
  js/
    config.js         → ★ SENHAS E CONFIGURAÇÕES (edite aqui)
    auth.js           → Autenticação client-side
    api.js            → Busca dados em APIs públicas
    utils.js          → Funções auxiliares de formatação
    app.js            → Roteador e shell da aplicação
    pages/
      dashboard.js    → Monitor de Mercado
      portfolios.js   → Gestão de Carteiras
      watchlist.js    → Watchlist
      alerts.js       → Alertas
      report.js       → Relatório + geração de PDF
  img/
    logo.png          → Logotipo GMH

─────────────────────────────────────────────
 COMO INSTALAR NO HOSTGATOR (cPanel)
─────────────────────────────────────────────

1. Faça login no cPanel → Gerenciador de Arquivos
2. Navegue até public_html (ou o subdomínio desejado)
3. Clique em "Upload" e envie este arquivo .zip
4. Clique em "Extract" (Extrair) na pasta de destino
5. Certifique-se de que os arquivos ficaram em:
      public_html/index.html
      public_html/css/app.css
      public_html/js/...
      public_html/img/...
6. Acesse seu domínio — a tela de login aparecerá automaticamente.

─────────────────────────────────────────────
 SENHAS PADRÃO
─────────────────────────────────────────────

  Usuário: GMH          Senha: gmh2025       (perfil admin)
  Usuário: cliente      Senha: cliente2025   (perfil cliente)

⚠  TROQUE AS SENHAS ANTES DE PUBLICAR!

─────────────────────────────────────────────
 COMO TROCAR AS SENHAS
─────────────────────────────────────────────

Método 1 — Via ferramenta incluída (recomendado):
  1. Abra gerar-senha.html no navegador
  2. Digite a nova senha e clique em "Gerar Hash"
  3. Copie o hash gerado
  4. Abra js/config.js e substitua o campo "hash" do usuário
  5. Faça o upload do config.js atualizado para o servidor

Método 2 — Manual:
  1. Abra js/config.js em um editor de texto
  2. No campo "hash" do usuário desejado, coloque
     o SHA-256 da nova senha (em hexadecimal minúsculo)

─────────────────────────────────────────────
 FUNCIONALIDADES
─────────────────────────────────────────────

  ✓ Monitor de Mercado — câmbio e cripto em tempo real
  ✓ Gestão de Carteiras — P&L ao vivo (High Beta, Buy & Hold, Buy & Hold 2.0)
  ✓ Watchlist — favoritos salvos no navegador
  ✓ Alertas — preços-alvo salvos no navegador
  ✓ Relatório PDF — gera e baixa o relatório mensal
  ✓ 100% responsivo — mobile, tablet e desktop
  ✓ Sem banco de dados — watchlist e alertas salvos em localStorage

─────────────────────────────────────────────
 FONTES DE DADOS (APIs públicas com CORS)
─────────────────────────────────────────────

  • Criptomoedas:  CoinGecko API (gratuita, sem chave)
  • Câmbio:        AwesomeAPI (economia.awesomeapi.com.br)
  • Selic / IPCA:  Banco Central do Brasil (api.bcb.gov.br)

Os dados de câmbio e cripto atualizam automaticamente a cada 2 minutos.

─────────────────────────────────────────────
 OBSERVAÇÕES DE SEGURANÇA
─────────────────────────────────────────────

• As senhas são verificadas no navegador do cliente.
  Para uso interno e restrito, isso é suficiente.
• Não publique este site em URL pública sem senha segura.
• Para segurança máxima, use proteção por senha do cPanel
  (opção "Diretórios Protegidos por Senha") como camada extra.

─────────────────────────────────────────────
 SUPORTE
─────────────────────────────────────────────

  GMH Asset Management
  Versão 1.0 — 2025
