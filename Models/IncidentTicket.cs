namespace HealthCare_Ticket_Engine.Models;

/// <summary>
/// Representa um chamado de incidente N2 em sistemas de saúde e operações hospitalares.
/// </summary>
public class IncidentTicket
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public IncidentPriority Priority { get; set; }

    public IncidentStatus Status { get; set; } = IncidentStatus.Aberto;

    public string ServiceAffected { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }

    /// <summary>
    /// Prazo limite de SLA N2 calculado automaticamente conforme a prioridade:
    /// Critica = 1h | Alta = 4h | Media = 8h | Baixa = 24h.
    /// </summary>
    public DateTime SlaDeadline => CreatedAt.AddHours(Priority switch
    {
        IncidentPriority.Critica => 1,
        IncidentPriority.Alta => 4,
        IncidentPriority.Media => 8,
        _ => 24
    });

    /// <summary>
    /// Indica se o prazo de SLA foi ultrapassado considerando a resolução ou o instante atual (UTC).
    /// </summary>
    public bool IsSlaBreached => (ResolvedAt ?? DateTime.UtcNow) > SlaDeadline;

    /// <summary>
    /// Coloca o incidente em análise técnica N2.
    /// </summary>
    /// <exception cref="InvalidOperationException">Lançada quando o incidente já está em análise ou já foi resolvido.</exception>
    public void StartAnalysis()
    {
        if (Status == IncidentStatus.Resolvido)
        {
            throw new InvalidOperationException(
                $"O incidente '{Id}' já foi resolvido e não pode voltar para análise.");
        }

        if (Status == IncidentStatus.EmAnalise)
        {
            throw new InvalidOperationException(
                $"O incidente '{Id}' já está em análise.");
        }

        Status = IncidentStatus.EmAnalise;
    }

    /// <summary>
    /// Conclui o atendimento do incidente e registra o timestamp UTC de resolução.
    /// </summary>
    /// <exception cref="InvalidOperationException">Lançada quando o incidente já se encontra resolvido.</exception>
    public void Resolve()
    {
        if (Status == IncidentStatus.Resolvido)
        {
            throw new InvalidOperationException(
                $"O incidente '{Id}' já foi resolvido em {ResolvedAt:O}.");
        }

        Status = IncidentStatus.Resolvido;
        ResolvedAt = DateTime.UtcNow;
    }
}
