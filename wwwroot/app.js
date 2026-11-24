'use strict';

(() => {
  const SERVICE_LABELS = {
    AutorizacaoMedica: 'Autorização Médica',
    PortalDoMedico: 'Portal do Médico',
    ProntuarioEletronico: 'Prontuário Eletrônico',
    LaboratorioExames: 'Laboratório e Exames',
    FaturamentoTISS: 'Faturamento TISS'
  };

  const PRIORITY_META = {
    Critica: { label: 'Crítica', slaHours: 1, css: 'critica' },
    Alta: { label: 'Alta', slaHours: 4, css: 'alta' },
    Media: { label: 'Média', slaHours: 8, css: 'media' },
    Baixa: { label: 'Baixa', slaHours: 24, css: 'baixa' }
  };

  const STATUS_META = {
    Aberto: { label: 'Aberto', css: 'aberto' },
    EmAnalise: { label: 'Em Análise', css: 'emanalise' },
    Resolvido: { label: 'Resolvido', css: 'resolvido' }
  };

  const state = {
    allTickets: [],
    visibleTickets: [],
    currentFilter: 'ALL',
    searchQuery: '',
    loading: false,
    pendingIds: new Set()
  };

  const el = {
    kpiTotal: document.getElementById('kpiTotal'),
    kpiOpen: document.getElementById('kpiOpen'),
    kpiAnalysis: document.getElementById('kpiAnalysis'),
    kpiResolved: document.getElementById('kpiResolved'),
    kpiSlaHint: document.getElementById('kpiSlaHint'),
    countAll: document.getElementById('countAll'),
    countAberto: document.getElementById('countAberto'),
    countEmAnalise: document.getElementById('countEmAnalise'),
    countResolvido: document.getElementById('countResolvido'),
    filterTabs: Array.from(document.querySelectorAll('.filter-tab')),
    searchInput: document.getElementById('searchInput'),
    refreshBtn: document.getElementById('refreshBtn'),
    loadingSkeleton: document.getElementById('loadingSkeleton'),
    ticketList: document.getElementById('ticketList'),
    emptyState: document.getElementById('emptyState'),
    emptyStateMessage: document.getElementById('emptyStateMessage'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),
    openCreateModalBtn: document.getElementById('openCreateModalBtn'),
    createModal: document.getElementById('createModal'),
    createTicketForm: document.getElementById('createTicketForm'),
    createErrorBox: document.getElementById('createErrorBox'),
    ticketTitle: document.getElementById('ticketTitle'),
    servicePreset: document.getElementById('servicePreset'),
    customServiceGroup: document.getElementById('customServiceGroup'),
    customServiceInput: document.getElementById('customServiceInput'),
    prioritySelector: document.getElementById('prioritySelector'),
    ticketDescription: document.getElementById('ticketDescription'),
    descriptionCount: document.getElementById('descriptionCount'),
    submitCreateBtn: document.getElementById('submitCreateBtn'),
    detailModal: document.getElementById('detailModal'),
    detailBadges: document.getElementById('detailBadges'),
    detailTitle: document.getElementById('detailTitle'),
    detailMetaRow: document.getElementById('detailMetaRow'),
    detailDescription: document.getElementById('detailDescription'),
    detailTimeline: document.getElementById('detailTimeline'),
    detailTicketId: document.getElementById('detailTicketId'),
    copyIdBtn: document.getElementById('copyIdBtn'),
    detailFooterActions: document.getElementById('detailFooterActions'),
    inspectorVerb: document.getElementById('inspectorVerb'),
    inspectorPath: document.getElementById('inspectorPath'),
    inspectorStatus: document.getElementById('inspectorStatus'),
    inspectorLatency: document.getElementById('inspectorLatency'),
    inspectorExplain: document.getElementById('inspectorExplain'),
    toggleJsonBtn: document.getElementById('toggleJsonBtn'),
    apiJsonPreview: document.getElementById('apiJsonPreview'),
    toastContainer: document.getElementById('toastContainer')
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatServiceName(serviceKey) {
    if (!serviceKey) return 'Sistema não informado';
    if (SERVICE_LABELS[serviceKey]) return SERVICE_LABELS[serviceKey];
    return serviceKey.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  function formatDateTime(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDuration(ms) {
    const absMinutes = Math.max(1, Math.round(Math.abs(ms) / 60000));
    if (absMinutes < 60) return `${absMinutes} min`;
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function formatRelativeTime(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    return `há ${formatDuration(diff)}`;
  }

  function getSlaBadgeInfo(ticket) {
    const deadlineMs = new Date(ticket.slaDeadline).getTime();
    if (ticket.status === 'Resolvido') {
      return ticket.isSlaBreached
        ? { text: 'Resolvido fora do SLA', css: 'badge-sla-warn' }
        : { text: 'Resolvido no prazo', css: 'badge-sla-done' };
    }

    const remainingMs = deadlineMs - Date.now();
    if (remainingMs <= 0 || ticket.isSlaBreached) {
      return {
        text: `SLA estourado há ${formatDuration(remainingMs)}`,
        css: 'badge-sla-breach'
      };
    }

    if (remainingMs <= 30 * 60000) {
      return {
        text: `Restam ${formatDuration(remainingMs)}`,
        css: 'badge-sla-warn'
      };
    }

    return {
      text: `Prazo restante: ${formatDuration(remainingMs)}`,
      css: 'badge-sla-ok'
    };
  }

  function updateApiInspector({ method, url, status, latencyMs, explain, payload }) {
    el.inspectorVerb.textContent = method;
    el.inspectorVerb.className = 'verb-badge';
    if (method === 'POST') el.inspectorVerb.classList.add('verb-post');
    if (method === 'PUT') el.inspectorVerb.classList.add('verb-put');

    el.inspectorPath.textContent = url;
    el.inspectorStatus.textContent = String(status);
    el.inspectorStatus.classList.toggle('is-error', status >= 400 || status === 0);
    el.inspectorLatency.textContent = `${Math.round(latencyMs)} ms`;
    el.inspectorExplain.textContent = explain;
    el.apiJsonPreview.textContent = payload ? JSON.stringify(payload, null, 2) : '(sem corpo JSON)';
  }

  async function apiRequest(method, url, body = null, explain = '') {
    const start = performance.now();
    const options = {
      method,
      headers: { Accept: 'application/json' }
    };

    if (body !== null) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    let response;
    let data = null;

    try {
      response = await fetch(url, options);
      const raw = await response.text();
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { raw };
        }
      }
    } catch (networkErr) {
      updateApiInspector({
        method,
        url,
        status: 0,
        latencyMs: performance.now() - start,
        explain: 'Falha de conexão com o servidor local.',
        payload: { error: networkErr.message }
      });
      throw new Error('Não foi possível conectar ao servidor da API.');
    }

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

    return data;
  }

  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast${isError ? ' is-error' : ''}`;
    toast.textContent = message;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3600);
  }

  function updateKpis() {
    const tickets = state.allTickets;
    const total = tickets.length;
    const abertos = tickets.filter((t) => t.status === 'Aberto').length;
    const emAnalise = tickets.filter((t) => t.status === 'EmAnalise').length;
    const resolvidos = tickets.filter((t) => t.status === 'Resolvido').length;
    const activeBreached = tickets.filter(
      (t) => t.status !== 'Resolvido' && (t.isSlaBreached || new Date(t.slaDeadline).getTime() <= Date.now())
    ).length;

    el.kpiTotal.textContent = total;
    el.kpiOpen.textContent = abertos;
    el.kpiAnalysis.textContent = emAnalise;
    el.kpiResolved.textContent = resolvidos;

    el.countAll.textContent = total;
    el.countAberto.textContent = abertos;
    el.countEmAnalise.textContent = emAnalise;
    el.countResolvido.textContent = resolvidos;

    if (activeBreached > 0) {
      el.kpiSlaHint.textContent = `${activeBreached} ativo(s) com SLA estourado`;
      el.kpiSlaHint.classList.add('is-alert');
    } else {
      el.kpiSlaHint.textContent = 'Todos os ativos dentro do SLA';
      el.kpiSlaHint.classList.remove('is-alert');
    }
  }

  function renderTickets() {
    const query = state.searchQuery.trim().toLowerCase();
    const filtered = state.visibleTickets.filter((ticket) => {
      if (!query) return true;
      const friendlyService = formatServiceName(ticket.serviceAffected).toLowerCase();
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.serviceAffected.toLowerCase().includes(query) ||
        friendlyService.includes(query)
      );
    });

    if (state.loading) {
      el.loadingSkeleton.hidden = false;
      el.ticketList.innerHTML = '';
      el.emptyState.hidden = true;
      return;
    }

    el.loadingSkeleton.hidden = true;

    if (filtered.length === 0) {
      el.ticketList.innerHTML = '';
      el.emptyState.hidden = false;
      el.emptyStateMessage.textContent = query
        ? `Nenhum chamado corresponde a "${state.searchQuery}".`
        : 'Não existem chamados nesta categoria no momento.';
      return;
    }

    el.emptyState.hidden = true;
    el.ticketList.innerHTML = filtered.map((ticket) => {
      const pMeta = PRIORITY_META[ticket.priority] || PRIORITY_META.Media;
      const sMeta = STATUS_META[ticket.status] || STATUS_META.Aberto;
      const sla = getSlaBadgeInfo(ticket);
      const isBusy = state.pendingIds.has(ticket.id);
      const friendlyService = formatServiceName(ticket.serviceAffected);

      const analyzeBtn = ticket.status === 'Aberto'
        ? `<button type="button" class="btn btn-sm btn-analysis" data-action="analyze" data-id="${escapeHtml(ticket.id)}" ${isBusy ? 'disabled' : ''}>Iniciar Análise</button>`
        : '';

      const resolveBtn = ticket.status !== 'Resolvido'
        ? `<button type="button" class="btn btn-sm btn-resolve" data-action="resolve" data-id="${escapeHtml(ticket.id)}" ${isBusy ? 'disabled' : ''}>Marcar como Resolvido</button>`
        : '';

      return `
        <article class="ticket-card priority-${escapeHtml(pMeta.css)}">
          <div class="ticket-main">
            <div class="ticket-badges">
              <span class="badge badge-priority-${escapeHtml(pMeta.css)}">${escapeHtml(pMeta.label)} · SLA ${pMeta.slaHours}h</span>
              <span class="badge badge-status-${escapeHtml(sMeta.css)}">${escapeHtml(sMeta.label)}</span>
              <span class="badge badge-service">${escapeHtml(friendlyService)}</span>
              <span class="badge ${escapeHtml(sla.css)}">${escapeHtml(sla.text)}</span>
            </div>

            <h3 class="ticket-title">${escapeHtml(ticket.title)}</h3>
            <p class="ticket-desc">${escapeHtml(ticket.description)}</p>

            <div class="ticket-meta">
              <span>Aberto ${escapeHtml(formatRelativeTime(ticket.createdAt))}</span>
              <span>•</span>
              <span>Prazo limite: ${escapeHtml(formatDateTime(ticket.slaDeadline))}</span>
              ${ticket.resolvedAt ? `<span>•</span><span>Resolvido em: ${escapeHtml(formatDateTime(ticket.resolvedAt))}</span>` : ''}
            </div>
          </div>

          <div class="ticket-actions">
            <button type="button" class="btn btn-sm btn-outline" data-action="detail" data-id="${escapeHtml(ticket.id)}">Detalhes</button>
            ${analyzeBtn}
            ${resolveBtn}
          </div>
        </article>
      `;
    }).join('');
  }

  async function refreshDashboard(showSkeleton = false) {
    if (showSkeleton) {
      state.loading = true;
      renderTickets();
    }

    try {
      if (state.currentFilter === 'ALL') {
        const all = await apiRequest(
          'GET',
          '/api/incidents',
          null,
          'Buscou todos os chamados ordenados por prioridade e antiguidade.'
        );
        state.allTickets = all;
        state.visibleTickets = all;
      } else {
        const [all, filtered] = await Promise.all([
          fetch('/api/incidents', { headers: { Accept: 'application/json' } }).then((r) => r.json()),
          apiRequest(
            'GET',
            `/api/incidents?status=${encodeURIComponent(state.currentFilter)}`,
            null,
            `Filtrou chamados com status "${STATUS_META[state.currentFilter]?.label || state.currentFilter}".`
          )
        ]);
        state.allTickets = Array.isArray(all) ? all : [];
        state.visibleTickets = Array.isArray(filtered) ? filtered : [];
      }

      updateKpis();
    } catch (err) {
      showToast(err.message || 'Erro ao carregar os chamados.', true);
    } finally {
      state.loading = false;
      renderTickets();
    }
  }

  function openModal(modalElement) {
    modalElement.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalElement) {
    modalElement.hidden = true;
    if (el.createModal.hidden && el.detailModal.hidden) {
      document.body.style.overflow = '';
    }
  }

  function openCreateModal() {
    el.createTicketForm.reset();
    el.customServiceGroup.hidden = true;
    el.createErrorBox.hidden = true;
    el.createErrorBox.innerHTML = '';
    el.descriptionCount.textContent = '0 / 1000';
    syncPriorityCardSelection();
    openModal(el.createModal);
    setTimeout(() => el.ticketTitle.focus(), 40);
  }

  function syncPriorityCardSelection() {
    const cards = el.prioritySelector.querySelectorAll('.priority-option');
    cards.forEach((card) => {
      const radio = card.querySelector('input[type="radio"]');
      card.classList.toggle('is-selected', Boolean(radio && radio.checked));
    });
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();
    el.createErrorBox.hidden = true;
    el.createErrorBox.innerHTML = '';

    const preset = el.servicePreset.value;
    const serviceAffected = preset === '__custom__'
      ? el.customServiceInput.value.trim()
      : preset;

    const selectedPriority = el.prioritySelector.querySelector('input[name="priority"]:checked');

    const payload = {
      title: el.ticketTitle.value.trim(),
      description: el.ticketDescription.value.trim(),
      priority: selectedPriority ? selectedPriority.value : null,
      serviceAffected
    };

    el.submitCreateBtn.disabled = true;
    el.submitCreateBtn.textContent = 'Salvando...';

    try {
      const created = await apiRequest(
        'POST',
        '/api/incidents',
        payload,
        `Criou novo chamado "${payload.title}" com prioridade ${payload.priority}.`
      );
      closeModal(el.createModal);
      showToast(`Chamado criado para ${formatServiceName(created.serviceAffected)}.`);
      await refreshDashboard(false);
    } catch (err) {
      const list = err.messages && err.messages.length ? err.messages : [err.message];
      el.createErrorBox.innerHTML = `<strong>Verifique os campos abaixo:</strong><ul>${list.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`;
      el.createErrorBox.hidden = false;
    } finally {
      el.submitCreateBtn.disabled = false;
      el.submitCreateBtn.textContent = 'Criar Chamado';
    }
  }

  async function openDetailModal(id) {
    try {
      const ticket = await apiRequest(
        'GET',
        `/api/incidents/${encodeURIComponent(id)}`,
        null,
        `Carregou os detalhes completos do chamado ${id.slice(0, 8)}...`
      );

      const pMeta = PRIORITY_META[ticket.priority] || PRIORITY_META.Media;
      const sMeta = STATUS_META[ticket.status] || STATUS_META.Aberto;
      const sla = getSlaBadgeInfo(ticket);

      el.detailBadges.innerHTML = `
        <span class="badge badge-priority-${escapeHtml(pMeta.css)}">${escapeHtml(pMeta.label)} · SLA ${pMeta.slaHours}h</span>
        <span class="badge badge-status-${escapeHtml(sMeta.css)}">${escapeHtml(sMeta.label)}</span>
        <span class="badge ${escapeHtml(sla.css)}">${escapeHtml(sla.text)}</span>
      `;

      el.detailTitle.textContent = ticket.title;
      el.detailMetaRow.innerHTML = `
        <span><strong>Sistema:</strong> ${escapeHtml(formatServiceName(ticket.serviceAffected))} (<code>${escapeHtml(ticket.serviceAffected)}</code>)</span>
      `;
      el.detailDescription.textContent = ticket.description;

      el.detailTimeline.innerHTML = `
        <div class="timeline-step">
          <div class="timeline-step-label">Abertura do Chamado</div>
          <div class="timeline-step-value">${escapeHtml(formatDateTime(ticket.createdAt))}</div>
        </div>
        <div class="timeline-step">
          <div class="timeline-step-label">Prazo Limite SLA</div>
          <div class="timeline-step-value">${escapeHtml(formatDateTime(ticket.slaDeadline))}</div>
        </div>
        <div class="timeline-step">
          <div class="timeline-step-label">Resolução</div>
          <div class="timeline-step-value">${ticket.resolvedAt ? escapeHtml(formatDateTime(ticket.resolvedAt)) : 'Em andamento'}</div>
        </div>
      `;

      el.detailTicketId.textContent = ticket.id;

      const actions = [];
      if (ticket.status === 'Aberto') {
        actions.push(`<button type="button" class="btn btn-analysis" data-modal-action="analyze" data-id="${escapeHtml(ticket.id)}">Iniciar Análise</button>`);
      }
      if (ticket.status !== 'Resolvido') {
        actions.push(`<button type="button" class="btn btn-resolve" data-modal-action="resolve" data-id="${escapeHtml(ticket.id)}">Marcar como Resolvido</button>`);
      }
      actions.push(`<button type="button" class="btn btn-outline" data-close-modal="detailModal">Fechar</button>`);
      el.detailFooterActions.innerHTML = actions.join('');

      openModal(el.detailModal);
    } catch (err) {
      showToast(err.message || 'Não foi possível carregar os detalhes do chamado.', true);
    }
  }

  async function transitionTicket(id, action) {
    if (state.pendingIds.has(id)) return;
    state.pendingIds.add(id);
    renderTickets();

    const isAnalyze = action === 'analyze';
    const endpoint = `/api/incidents/${encodeURIComponent(id)}/${isAnalyze ? 'analyze' : 'resolve'}`;
    const explain = isAnalyze
      ? `Alterou o chamado ${id.slice(0, 8)}... para "Em Análise".`
      : `Concluiu o chamado ${id.slice(0, 8)}... e gravou o horário de resolução.`;

    try {
      await apiRequest('PUT', endpoint, null, explain);
      showToast(isAnalyze ? 'Chamado movido para Em Análise N2.' : 'Chamado marcado como Resolvido!');
      if (!el.detailModal.hidden) {
        closeModal(el.detailModal);
      }
      await refreshDashboard(false);
    } catch (err) {
      showToast(err.message || 'Erro ao atualizar o status do chamado.', true);
    } finally {
      state.pendingIds.delete(id);
      renderTickets();
    }
  }

  function bindEvents() {
    el.filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const nextStatus = tab.dataset.status || 'ALL';
        if (nextStatus === state.currentFilter) return;

        state.currentFilter = nextStatus;
        el.filterTabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });

        refreshDashboard(true);
      });
    });

    el.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTickets();
    });

    el.refreshBtn.addEventListener('click', () => refreshDashboard(true));

    el.emptyResetBtn.addEventListener('click', () => {
      state.searchQuery = '';
      el.searchInput.value = '';
      if (state.currentFilter !== 'ALL') {
        el.filterTabs[0].click();
      } else {
        renderTickets();
      }
    });

    el.openCreateModalBtn.addEventListener('click', openCreateModal);

    el.servicePreset.addEventListener('change', () => {
      const isCustom = el.servicePreset.value === '__custom__';
      el.customServiceGroup.hidden = !isCustom;
      if (isCustom) {
        el.customServiceInput.focus();
      }
    });

    el.prioritySelector.addEventListener('change', syncPriorityCardSelection);

    el.ticketDescription.addEventListener('input', () => {
      el.descriptionCount.textContent = `${el.ticketDescription.value.length} / 1000`;
    });

    el.createTicketForm.addEventListener('submit', handleCreateSubmit);

    el.ticketList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'detail') openDetailModal(id);
      if (action === 'analyze' || action === 'resolve') transitionTicket(id, action);
    });

    el.detailFooterActions.addEventListener('click', (e) => {
      const closeTarget = e.target.closest('[data-close-modal]');
      if (closeTarget) {
        closeModal(el.detailModal);
        return;
      }

      const btn = e.target.closest('button[data-modal-action]');
      if (!btn) return;
      transitionTicket(btn.dataset.id, btn.dataset.modalAction);
    });

    el.copyIdBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(el.detailTicketId.textContent);
        showToast('Código do chamado copiado!');
      } catch {
        showToast('Não foi possível copiar automaticamente.', true);
      }
    });

    el.toggleJsonBtn.addEventListener('click', () => {
      const willOpen = el.apiJsonPreview.hidden;
      el.apiJsonPreview.hidden = !willOpen;
      el.toggleJsonBtn.setAttribute('aria-expanded', String(willOpen));
      el.toggleJsonBtn.textContent = willOpen ? 'Ocultar JSON' : 'Ver JSON';
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.closeModal);
        if (modal) closeModal(modal);
      });
    });

    [el.createModal, el.detailModal].forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!el.createModal.hidden) closeModal(el.createModal);
      if (!el.detailModal.hidden) closeModal(el.detailModal);
    });
  }

  bindEvents();
  refreshDashboard(true);
  setInterval(() => {
    if (!state.loading) {
      updateKpis();
      renderTickets();
    }
  }, 30000);
})();
