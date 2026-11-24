using System.ComponentModel.DataAnnotations;
using HealthCare_Ticket_Engine.Models;

namespace HealthCare_Ticket_Engine.DTOs;

/// <summary>
/// Payload de entrada validado para abertura de um novo incidente N2.
/// </summary>
public record CreateIncidentRequest
{
    [Required(ErrorMessage = "O título do incidente é obrigatório.")]
    [StringLength(120, MinimumLength = 5, ErrorMessage = "O título deve ter entre 5 e 120 caracteres.")]
    public string Title { get; init; } = string.Empty;

    [Required(ErrorMessage = "A descrição do incidente é obrigatória.")]
    [StringLength(1000, MinimumLength = 10, ErrorMessage = "A descrição deve ter entre 10 e 1000 caracteres.")]
    public string Description { get; init; } = string.Empty;

    [Required(ErrorMessage = "A prioridade é obrigatória.")]
    [EnumDataType(typeof(IncidentPriority), ErrorMessage = "Prioridade inválida. Use: Baixa, Media, Alta ou Critica.")]
    public IncidentPriority? Priority { get; init; }

    [Required(ErrorMessage = "O serviço afetado é obrigatório (ex: AutorizacaoMedica, PortalDoMedico).")]
    [StringLength(80, MinimumLength = 3, ErrorMessage = "O serviço afetado deve ter entre 3 e 80 caracteres.")]
    public string ServiceAffected { get; init; } = string.Empty;
}
