using HealthCare_Ticket_Engine.DTOs;
using HealthCare_Ticket_Engine.Models;
using HealthCare_Ticket_Engine.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HealthCare_Ticket_Engine.Controllers;

/// <summary>
/// Endpoints REST para triagem, consulta e resolução de incidentes N2 de saúde/hospitalar.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentRepository _repository;
    private readonly ILogger<IncidentsController> _logger;

    public IncidentsController(
        IIncidentRepository repository,
        ILogger<IncidentsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Lista todos os incidentes ordenados por prioridade (Crítica primeiro) e antiguidade, com filtro opcional por status.
    /// </summary>
    /// <param name="status">Filtro opcional de status: Aberto, EmAnalise ou Resolvido.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Lista de incidentes retornada com sucesso.</response>
    /// <response code="400">Parâmetro de filtro inválido.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<IncidentTicket>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyCollection<IncidentTicket>>> GetAll(
        [FromQuery] IncidentStatus? status,
        CancellationToken cancellationToken)
    {
        var tickets = await _repository.GetAllAsync(status, cancellationToken);
        return Ok(tickets);
    }

    /// <summary>
    /// Busca um incidente específico pelo seu identificador único (GUID).
    /// </summary>
    /// <param name="id">GUID do incidente.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Incidente encontrado.</response>
    /// <response code="400">Formato de GUID inválido.</response>
    /// <response code="404">Incidente não encontrado.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IncidentTicket>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(id, cancellationToken);

        if (ticket is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        return Ok(ticket);
    }

    /// <summary>
    /// Abre um novo chamado de incidente N2 com cálculo automático de SLA.
    /// </summary>
    /// <param name="request">Dados validados do novo incidente.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="201">Incidente criado com sucesso.</response>
    /// <response code="400">Payload inválido ou campos obrigatórios ausentes.</response>
    [HttpPost]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IncidentTicket>> Create(
        [FromBody] CreateIncidentRequest request,
        CancellationToken cancellationToken)
    {
        var ticket = new IncidentTicket
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Priority = request.Priority!.Value,
            Status = IncidentStatus.Aberto,
            ServiceAffected = request.ServiceAffected.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(ticket, cancellationToken);

        _logger.LogInformation(
            "Incidente {TicketId} criado para o serviço {ServiceAffected} com prioridade {Priority}. SLA limite: {SlaDeadline:O}",
            created.Id,
            created.ServiceAffected,
            created.Priority,
            created.SlaDeadline);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Coloca um incidente aberto em análise técnica pela sustentação N2.
    /// </summary>
    /// <param name="id">GUID do incidente a ser analisado.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Incidente movido para EmAnalise com sucesso.</response>
    /// <response code="404">Incidente não encontrado.</response>
    /// <response code="409">Incidente já está em análise ou já foi resolvido.</response>
    [HttpPut("{id}/analyze")]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<IncidentTicket>> StartAnalysis(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(id, cancellationToken);

        if (ticket is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        ticket.StartAnalysis();

        var updated = await _repository.UpdateAsync(ticket, cancellationToken);
        if (updated is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        _logger.LogInformation(
            "Incidente {TicketId} movido para análise N2 (status {Status}).",
            updated.Id,
            updated.Status);

        return Ok(updated);
    }

    /// <summary>
    /// Marca um incidente existente como resolvido e registra o timestamp UTC de resolução.
    /// </summary>
    /// <param name="id">GUID do incidente a ser resolvido.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Incidente resolvido com sucesso.</response>
    /// <response code="404">Incidente não encontrado.</response>
    /// <response code="409">Incidente já estava resolvido anteriormente.</response>
    [HttpPut("{id}/resolve")]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<IncidentTicket>> Resolve(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(id, cancellationToken);

        if (ticket is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        ticket.Resolve();

        var updated = await _repository.UpdateAsync(ticket, cancellationToken);
        if (updated is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        _logger.LogInformation(
            "Incidente {TicketId} resolvido em {ResolvedAt:O}. SLA violado: {IsSlaBreached}",
            updated.Id,
            updated.ResolvedAt,
            updated.IsSlaBreached);

        return Ok(updated);
    }
}
