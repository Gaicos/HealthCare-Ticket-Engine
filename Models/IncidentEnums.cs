namespace HealthCare_Ticket_Engine.Models;

/// <summary>
/// Níveis de prioridade para triagem N2 e cálculo de SLA hospitalar.
/// </summary>
public enum IncidentPriority
{
    Baixa,
    Media,
    Alta,
    Critica
}

/// <summary>
/// Ciclo de vida de um incidente de sustentação N2.
/// </summary>
public enum IncidentStatus
{
    Aberto,
    EmAnalise,
    Resolvido
}
