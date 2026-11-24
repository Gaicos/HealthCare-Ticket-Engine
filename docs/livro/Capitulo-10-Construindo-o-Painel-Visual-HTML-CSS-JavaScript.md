# Capítulo 10 — Construindo o Painel Visual com HTML, CSS e JavaScript

Um back-end robusto com Swagger é ótimo para desenvolvedores, mas imagine mostrar apenas uma tela técnica de endpoints (`GET`, `POST`, `PUT`) para um gerente de hospital, um cliente ou um recrutador com 30 segundos para avaliar seu portfólio. Sem uma interface visual, fica difícil entender rapidamente o valor do produto!

Por isso, dentro da pasta `wwwroot/`, construímos um **Painel Web completo, responsivo e sem bibliotecas externas pesadas**, usando o trio fundamental da Web:
1. **HTML (`wwwroot/index.html`)** → O esqueleto e o conteúdo da página (títulos, cartões, botões, modais).
2. **CSS (`wwwroot/styles.css`)** → A aparência, cores clínicas, espaçamentos e adaptação para celular.
3. **JavaScript (`wwwroot/app.js`)** → O cérebro no navegador que conversa com a nossa API C# usando `fetch(...)` e atualiza a tela em tempo real.

---

## 10.1 A estrutura semântica em `wwwroot/index.html`

O HTML funciona como blocos organizados de cima para baixo:

1. **Barra Superior (`<header class="topbar">`)**:
   - Mostra o logotipo (ícone SVG inline de cruz médica), o nome **HealthCare Ticket Engine** e a etiqueta `Suporte N2 Hospitalar`.
   - À direita, traz dois botões principais:
     - **`API Técnica (Swagger)`**: link `<a href="/swagger" target="_blank">` para quem quiser estudar ou testar a API técnica diretamente.
     - **`+ Abrir Chamado`**: botão `#openCreateModalBtn` que abre o formulário modal.
2. **Cabeçalho Explicativo (`<section class="hero">`)**:
   - Explica em linguagem simples o propósito do sistema (*"Central de Chamados Hospitalares"*) junto com a legenda visual das metas de SLA (`Crítica · 1h`, `Alta · 4h`, `Média · 8h`, `Baixa · 24h`).
3. **4 Cartões de Indicadores (`<section class="kpi-grid">`)**:
   - `#kpiTotal`, `#kpiOpen`, `#kpiAnalysis` e `#kpiResolved` + `#kpiSlaHint` (mostrando se há chamados ativos com SLA estourado).
4. **Barra de Filtros e Ações (`<section class="toolbar">`)**:
   - Abas de filtro com contadores (`Todos`, `Abertos`, `Em Análise`, `Resolvidos`).
   - Caixa de busca instantânea (`#searchInput`), botão `Atualizar` (`#refreshBtn`) e botão `Restaurar Demo` (`#resetDemoBtn`).
5. **Lista de Chamados (`#ticketList`) + Esqueleto de Carregamento (`#loadingSkeleton`) + Estado Vazio (`#emptyState`)**.
6. **Barra Educativa "Raio-X da API" (`#apiInspector`)**:
   - Exibe em tempo real o último verbo (`GET`/`POST`/`PUT`), rota, código HTTP (`200`, `201`, `409`), latência em `ms` e um botão `Ver JSON` que abre o JSON real recebido do servidor!
7. **Dois Modais Acessíveis (`role="dialog"`)**:
   - `#createModal` (formulário amigável com seletores visuais de prioridade/SLA).
   - `#detailModal` (detalhes completos + linha do tempo + copiar ID + botões de ação).

Veja um trecho real da barra de ferramentas no `wwwroot/index.html`:

```html
      <div class="toolbar-right">
        <label class="search-box" for="searchInput">
          <!-- Ícone de lupa em SVG -->
          <input
            type="search"
            id="searchInput"
            placeholder="Buscar por título, sistema afetado ou descrição..."
            autocomplete="off"
          >
        </label>

        <button type="button" id="refreshBtn" class="btn btn-subtle" title="Recarregar fila de chamados">
          <span>Atualizar</span>
        </button>

        <button type="button" id="resetDemoBtn" class="btn btn-subtle" title="Restaurar os 3 chamados hospitalares de exemplo">
          <span>Restaurar Demo</span>
        </button>
      </div>
```

> **Dica Sênior (Acessibilidade e HTML Semântico):** Repare em atributos como `aria-label`, `role="tablist"`, `aria-selected`, `role="dialog"` e `aria-live="polite"`. Eles permitem que leitores de tela usados por pessoas com deficiência visual naveguem pelo painel com perfeição.

---

## 10.2 O visual clínico moderno em `wwwroot/styles.css`

Em vez de espalhar códigos de cor repetidos pelo CSS inteiro, declaramos **Variáveis CSS** no bloco `:root` lá no topo do arquivo:

```css
:root {
  --bg: #f4f7fb;
  --surface: #ffffff;
  --border: #e2e8f0;
  --text: #0f172a;
  --primary: #0f766e;
  --primary-hover: #0d9488;
  --critica: #dc2626;
  --alta: #d97706;
  --media: #2563eb;
  --baixa: #0f766e;
}
```

### Três recursos de CSS que dão acabamento profissional

1. **CSS Grid para os KPIs e Responsividade**:
   Em telas grandes, `.kpi-grid` usa `grid-template-columns: repeat(4, minmax(0, 1fr));` (4 colunas iguais). Quando a tela encolhe abaixo de `960px` ou `680px`, as regras `@media (max-width: ...)` diminuem automaticamente para 2 colunas (tablet) e 1 coluna (celular)!
2. **Faixa lateral de urgência nos cartões**:
   ```css
   .ticket-card { border-left: 5px solid var(--border-strong); }
   .ticket-card.priority-critica { border-left-color: var(--critica); }
   .ticket-card.priority-alta    { border-left-color: var(--alta); }
   ```
   Apenas olhando a cor da borda esquerda, qualquer pessoa identifica instantaneamente o nível de urgência do chamado.
3. **Efeito de carregamento (*Skeleton Shimmer*)**:
   Enquanto o JavaScript busca os dados na API, `.skeleton-card` anima um gradiente suave (`@keyframes shimmer`), evitando que a tela pisque vazia.

---

## 10.3 O cérebro no navegador: `wwwroot/app.js`

Todo o JavaScript fica isolado dentro de uma função autoexecutável `'use strict'; (() => { ... })();` para não poluir variáveis globais do navegador. Vamos estudar os 5 pilares desse arquivo!

### Pilar 1: Traduzindo termos técnicos para português humano

No banco em memória, o sistema afetado chama-se `"AutorizacaoMedica"` (sem espaço) e a prioridade chama-se `"Critica"` (sem acento). No `app.js`, traduzimos na hora da exibição:

```javascript
  const SERVICE_LABELS = {
    AutorizacaoMedica: 'Autorização Médica',
    PortalDoMedico: 'Portal do Médico',
    ProntuarioEletronico: 'Prontuário Eletrônico',
    LaboratorioExames: 'Laboratório e Exames',
    FaturamentoTISS: 'Faturamento TISS'
  };

  function formatServiceName(serviceKey) {
    if (!serviceKey) return 'Sistema não informado';
    if (SERVICE_LABELS[serviceKey]) return SERVICE_LABELS[serviceKey];
    return serviceKey.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
```

Se alguém cadastrar um sistema novo personalizado como `"FarmaciaCentral"`, a expressão regular `replace(/([a-z])([A-Z])/g, '$1 $2')` separa automaticamente em `"Farmacia Central"`!

### Pilar 2: Segurança contra XSS (`escapeHtml`)

> **Atenção — Nunca confie em texto vindo de fora ao montar HTML!**  
> Se um usuário mal-intencionado criar um chamado com o título `<script>alert('hack')</script>` e o front-end inserir isso direto com `innerHTML`, o navegador executaria o script! Esse ataque chama-se **XSS (*Cross-Site Scripting*)**.

Para blindar 100% o painel, criamos `escapeHtml(value)` e passamos **todo** dado dinâmico por ela antes de montar o HTML dos cards:

```javascript
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
```

Ela transforma `<` em `&lt;` e `>` em `&gt;` — fazendo o navegador exibir o texto como texto inofensivo, nunca como código executável.

### Pilar 3: Centralizando as chamadas HTTP (`apiRequest`) + Raio-X da API

Em vez de espalhar `fetch(...)` repetido em 6 funções diferentes, criamos uma única função `apiRequest(method, url, body, explain)` que:
1. Cronometra o tempo exato da requisição com `performance.now()`.
2. Envia o pedido via `fetch(url, options)` com cabeçalhos JSON.
3. Atualiza automaticamente a barra **Raio-X da API** lá embaixo (verbo, rota, status HTTP, milissegundos e o JSON formatado com `JSON.stringify(payload, null, 2)`).
4. Se `!response.ok` (erro `400`, `404`, `409` ou `500`), lê os campos `data.errors` (do `ValidationProblemDetails`) ou `data.detail` (do `GlobalExceptionHandler`) e lança uma mensagem clara para o usuário!

```javascript
    const latencyMs = performance.now() - start;
    updateApiInspector({
      method,
      url,
      status: response.status,
      latencyMs,
      explain,
      payload: data
    });

    if (!response.ok) {
      const messages = [];
      if (data && data.errors && typeof data.errors === 'object') {
        Object.values(data.errors).forEach((arr) => {
          if (Array.isArray(arr)) messages.push(...arr);
        });
      } else if (data && data.detail) {
        messages.push(data.detail);
      } else if (data && data.title) {
        messages.push(data.title);
      } else {
        messages.push(`Erro inesperado (HTTP ${response.status}).`);
      }

      const error = new Error(messages[0]);
      error.messages = messages;
      throw error;
    }
```

### Pilar 4: Contagem regressiva de SLA ao vivo

A função `getSlaBadgeInfo(ticket)` compara `ticket.slaDeadline` com `Date.now()` no navegador:
- Se `Resolvido`: mostra `"Resolvido no prazo"` ou `"Resolvido fora do SLA"`.
- Se estourado: mostra `"SLA estourado há X min"`.
- Se faltarem 30 minutos ou menos: muda a etiqueta para amarelo de alerta (`"Restam X min"`).
- E um `setInterval(..., 30000)` no final do arquivo recalcula os prazos na tela automaticamente a cada 30 segundos!

### Pilar 5: Delegação de Eventos e Proteção contra Cliques Duplos

Os cartões são criados dinamicamente pelo JavaScript depois que os dados chegam da API. Em vez de anexar um evento de clique em cada botão novo toda vez que a lista redesenha, colocamos **um único ouvinte** no container pai `#ticketList`:

```javascript
    el.ticketList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'detail') openDetailModal(id);
      if (action === 'analyze' || action === 'resolve') transitionTicket(id, action);
    });
```

Além disso, `state.pendingIds` guarda o ID de qualquer chamado que está sendo atualizado naquele instante, desabilitando o botão até a API responder para evitar cliques duplos acidentais!

---

> **Resumo do Capítulo:**
> - `wwwroot/index.html` organiza cabeçalho, legenda de SLAs, KPIs, filtros, modais e barra **Raio-X da API** com acessibilidade.
> - `wwwroot/styles.css` usa variáveis CSS, Grid/Flexbox e `@media` queries para funcionar em desktop e celular.
> - `wwwroot/app.js` centraliza o `fetch` em `apiRequest()`, protege contra **XSS** com `escapeHtml()`, trata erros `ProblemDetails` da API e atualiza prazos de SLA em tempo real.

---

## Exercícios de Fixação

1. Por que o `app.js` passa os textos dos chamados pela função `escapeHtml()` antes de inseri-los dentro do `innerHTML`?
2. Como o painel sabe exibir `"Autorização Médica"` na tela se a API devolveu `"serviceAffected": "AutorizacaoMedica"`?
3. O que a função `apiRequest` faz além de buscar ou enviar dados para a API C#?
4. Como evitamos que um usuário dispare duas requisições `PUT .../resolve` ao clicar duas vezes muito rápido no botão?

---

## Gabarito Comentado

1. Para prevenir ataques de **XSS (*Cross-Site Scripting*)**, garantindo que caracteres como `<` e `>` sejam exibidos como texto comum e jamais executados como tags HTML ou `<script>` pelo navegador.
2. Através do mapa `SERVICE_LABELS` e da função `formatServiceName(serviceKey)` no `app.js`, que traduz chaves conhecidas para nomes amigáveis e separa palavras em *PascalCase* quando for um sistema personalizado.
3. Ela também mede o tempo de resposta com `performance.now()`, atualiza a barra educativa **Raio-X da API** (verbo, caminho, status, latência e JSON) e extrai mensagens de erro amigáveis de `data.errors` ou `data.detail` quando `response.ok` for falso.
4. Guardamos o `id` dentro de um `Set` chamado `state.pendingIds` enquanto a requisição está em andamento, desabilitando (`disabled`) os botões daquele cartão até o bloco `finally` liberar novamente.
