using HealthCare_Ticket_Engine.Models;

namespace HealthCare_Ticket_Engine.Repositories;

/// <summary>
/// Contrato de persistência para gestão de incidentes N2.
/// </summary>
public interface IIncidentRepository
{
    Task<IReadOnlyCollection<IncidentTicket>> GetAllAsync(
        IncidentStatus? status = null,
        CancellationToken cancellationToken = default);

    Task<IncidentTicket?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IncidentTicket> CreateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default);

    Task<IncidentTicket?> UpdateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default);
}
