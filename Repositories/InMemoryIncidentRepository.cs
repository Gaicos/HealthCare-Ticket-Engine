using System.Collections.Concurrent;
using HealthCare_Ticket_Engine.Models;

namespace HealthCare_Ticket_Engine.Repositories;

/// <summary>
/// Implementação em memória do repositório de incidentes para operação sem banco externo.
/// </summary>
public class InMemoryIncidentRepository : IIncidentRepository
{
    // A coleção é estática e thread-safe para preservar o estado entre requisições HTTP
    // mantendo o registro DI como Scoped (pronto para futura troca por EF Core DbContext).
    private static readonly ConcurrentDictionary<Guid, IncidentTicket> _tickets = SeedInitialData();

    public Task<IReadOnlyCollection<IncidentTicket>> GetAllAsync(
        IncidentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<IncidentTicket> query = _tickets.Values;

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        // Ordena por prioridade decrescente (Critica primeiro) e mais antigos primeiro para triagem N2.
        var result = query
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToList();

        return Task.FromResult<IReadOnlyCollection<IncidentTicket>>(result);
    }

    public Task<IncidentTicket?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        _tickets.TryGetValue(id, out var ticket);
        return Task.FromResult(ticket);
    }

    public Task<IncidentTicket> CreateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default)
    {
        if (ticket.Id == Guid.Empty)
        {
            ticket.Id = Guid.NewGuid();
        }

        _tickets[ticket.Id] = ticket;
        return Task.FromResult(ticket);
    }

    public Task<IncidentTicket?> UpdateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default)
    {
        if (!_tickets.ContainsKey(ticket.Id))
        {
            return Task.FromResult<IncidentTicket?>(null);
        }

        _tickets[ticket.Id] = ticket;
        return Task.FromResult<IncidentTicket?>(ticket);
    }

    private static ConcurrentDictionary<Guid, IncidentTicket> SeedInitialData()
    {
        var now = DateTime.UtcNow;

        var initialTickets = new[]
        {
            new IncidentTicket
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Title = "Lentidão crítica na fila de autorizações TISS",
                Description = "O gateway de integração com operadoras está acumulando solicitações acima de 45s no fluxo de urgência.",
                Priority = IncidentPriority.Critica,
                Status = IncidentStatus.Aberto,
                ServiceAffected = "AutorizacaoMedica",
                CreatedAt = now.AddMinutes(-35)
            },
            new IncidentTicket
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Title = "Timeout ao consultar histórico de exames laboratoriais",
                Description = "Médicos no plantão relatam erro 504 intermitente ao abrir laudos em PDF no Portal do Médico.",
                Priority = IncidentPriority.Alta,
                Status = IncidentStatus.EmAnalise,
                ServiceAffected = "PortalDoMedico",
                CreatedAt = now.AddHours(-2)
            },
            new IncidentTicket
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Title = "Falha na emissão de guia de internação eletiva",
                Description = "Erro de validação de código TUSS corrigido após atualização da tabela de domínio e reinício do worker.",
                Priority = IncidentPriority.Media,
                Status = IncidentStatus.Resolvido,
                ServiceAffected = "ProntuarioEletronico",
                CreatedAt = now.AddHours(-6),
                ResolvedAt = now.AddHours(-4)
            }
        };

        return new ConcurrentDictionary<Guid, IncidentTicket>(
            initialTickets.Select(t => new KeyValuePair<Guid, IncidentTicket>(t.Id, t)));
    }
}
