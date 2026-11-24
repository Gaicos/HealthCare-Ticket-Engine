# Capítulo 8 — Criando os Endpoints REST no `IncidentsController`

Até agora construímos todas as peças nos bastidores: os moldes (`Models`), o formulário validado (`DTOs`), o cofre (`Repositories`) e a rede de proteção (`GlobalExceptionHandler`). Faltava o **balcão de atendimento**, ou seja, a porta de entrada que recebe as ligações da internet e entrega as respostas: o **Controller**.

---

## 8.1 Como o ASP.NET Core encontra o endereço certo (Roteamento)

Quando o navegador chama `GET /api/incidents`, como o .NET sabe qual arquivo e qual método executar?

Olhe para os atributos em cima da classe `IncidentsController`:

```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class IncidentsController : ControllerBase
```

- **`[ApiController]`**: liga superpoderes automáticos de API REST! Por exemplo: ele valida o `CreateIncidentRequest` antes de entrar no método e devolve `400 Bad Request` sozinho se faltar algum campo, além de já entender que parâmetros vêm do corpo JSON ou da URL.
- **`[Route("api/[controller]")]`**: a palavra mágica `[controller]` pega o nome da classe removendo o sufixo `Controller` (`IncidentsController` → `Incidents`). Então a rota base vira `/api/incidents`! *(Em rotas HTTP de ASP.NET Core, letras maiúsculas/minúsculas não impedem o acesso: `/api/incidents` e `/api/Incidents` funcionam igual.)*
- **`[Produces("application/json")]`**: avisa que todas as respostas deste controller falam JSON.
- **Herança `: ControllerBase`**: dá ao nosso controller métodos prontos como `Ok(...)`, `CreatedAtAction(...)` e `Problem(...)` (usamos `ControllerBase` e não `Controller`, porque `Controller` traz recursos extras de páginas Razor antigas que uma API REST não precisa).

---

## 8.2 O código completo de `Controllers/IncidentsController.cs`

Crie o arquivo `Controllers/IncidentsController.cs` com todas as 6 rotas completas:

```csharp
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

    /// <summary>
    /// Restaura a fila em memória para os 3 chamados hospitalares iniciais de demonstração.
    /// </summary>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Fila de demonstração restaurada com sucesso.</response>
    [HttpPost("reset-demo")]
    [ProducesResponseType(typeof(IReadOnlyCollection<IncidentTicket>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<IncidentTicket>>> ResetDemo(
        CancellationToken cancellationToken)
    {
        var tickets = await _repository.ResetSeedDataAsync(cancellationToken);

        _logger.LogInformation(
            "Fila de demonstração restaurada com {TicketCount} chamados iniciais.",
            tickets.Count);

        return Ok(tickets);
    }
}
```

---

## 8.3 Dissecando cada rota e seus truques de arquitetura

### 1. O Construtor (Injeção de Dependência)
Repare que o `IncidentsController` **não faz `new InMemoryIncidentRepository()`**! Ele pede no construtor `IIncidentRepository repository`. O `Program.cs` entrega automaticamente a implementação configurada lá.

### 2. `GetAll` — `[HttpGet]` (`GET /api/incidents`)
- **`[FromQuery] IncidentStatus? status`**: lê o texto que vem depois da interrogação na URL, como `/api/incidents?status=Aberto`. Se não vier nada, `status` é `null` e traz todos. Se alguém escrever `?status=Batata`, o `[ApiController]` rejeita na hora com `400 Bad Request`!

### 3. `GetById` — `[HttpGet("{id}")]` (`GET /api/incidents/{id}`)
> **Dica Sênior:** Repare que escrevemos `[HttpGet("{id}")]` em vez de `[HttpGet("{id:guid}")]`. Por quê?  
> Se colocássemos `:guid` na rota e alguém digitasse `/api/incidents/abc`, a rota nem bateria no método e devolveria um `404` vazio sem JSON. Deixando apenas `{id}` e recebendo `Guid id`, quando alguém envia `"abc"`, o sistema devolve um JSON `400 Bad Request` limpo explicando que o formato do GUID está inválido!

Quando o `id` tem formato válido de GUID, mas não existe na fila (`ticket is null`), devolvemos `Problem(..., statusCode: StatusCodes.Status404NotFound)`.

### 4. `Create` — `[HttpPost]` (`POST /api/incidents`)
- `[FromBody]` lê o JSON enviado pelo cliente e monta o `CreateIncidentRequest` (já validado!).
- `.Trim()` remove espaços acidentais antes e depois do texto digitado pelo usuário.
- `request.Priority!.Value`: aqui usamos `!` (*null-forgiving operator*) com total segurança porque `[Required]` já garantiu que `Priority` não é `null`.
- **`CreatedAtAction(nameof(GetById), new { id = created.Id }, created)`**: é a forma padrão REST mais elegante! Além de devolver **`201 Created`** com o objeto criado em JSON, ela adiciona automaticamente um cabeçalho HTTP `Location` apontando para a URL onde o novo chamado pode ser consultado (`.../api/Incidents/{id}`).

### 5. `StartAnalysis` e `Resolve` (`PUT /api/incidents/{id}/analyze` e `/resolve`)
Veja como os dois métodos são enxutos:
1. Buscam o chamado no repositório (`GetByIdAsync`). Se não existir, devolvem `404`.
2. Chamam `ticket.StartAnalysis()` ou `ticket.Resolve()`. Note que **não há `if` de conflito nem `try/catch` aqui!** Se a regra falhar (ex.: já resolvido), a exceção sobe limpa para o `GlobalExceptionHandler` devolver `409 Conflict`.
3. Salvam no repositório (`UpdateAsync`), registram um log e devolvem `200 OK` com o chamado atualizado.

### 6. `ResetDemo` (`POST /api/incidents/reset-demo`)
Restaura os 3 chamados originais da demonstração e devolve `200 OK` com a lista restaurada — facilitando testes repetidos por recrutadores no portfólio!

---

## 8.4 Acompanhe uma requisição de ponta a ponta

Veja o caminho completo quando você clica em **"Marcar como Resolvido"** na interface:

```text
1. Navegador envia:  PUT /api/incidents/11111111-.../resolve
2. IncidentsController.Resolve(id) recebe o pedido
3.   -> Chama _repository.GetByIdAsync(id) -> Encontra o ticket
4.   -> Chama ticket.Resolve()
        - Se status != Resolvido -> muda status, grava ResolvedAt
        - Se status == Resolvido -> lança InvalidOperationException -> GlobalExceptionHandler -> 409 JSON
5.   -> Chama _repository.UpdateAsync(ticket) -> Atualiza no dicionário
6.   -> Grava LogInformation no console do servidor
7.   -> Devolve 200 OK + JSON do chamado atualizado para o navegador!
```

---

> **Resumo do Capítulo:**
> - O `IncidentsController` traduz verbos e URLs HTTP (`GET`, `POST`, `PUT`) em chamadas ao domínio e ao repositório.
> - `[ApiController]` automatiza validações de DTOs e formatação de erros de entrada.
> - `[ProducesResponseType]` e comentários XML `///` alimentam o Swagger com documentação profissional.

---

## Exercícios de Fixação

1. Qual é a URL completa da ação `StartAnalysis` sabendo que a classe se chama `IncidentsController` com `[Route("api/[controller]")]` e o método tem `[HttpPut("{id}/analyze")]`?
2. Por que `Create` usa `CreatedAtAction(...)` em vez de `Ok(...)`?
3. Onde fica a validação que impede `Resolve` de aceitar um chamado já resolvido: dentro do `IncidentsController` ou dentro do `IncidentTicket`? Por que essa escolha é melhor?
4. O que aconteceria se o cliente mandasse um JSON inválido na rota `POST /api/incidents` (por exemplo, `title` com apenas 2 letras)?

---

## Gabarito Comentado

1. `PUT /api/incidents/{id}/analyze` (ex.: `PUT /api/incidents/11111111-1111-1111-1111-111111111111/analyze`).
2. Porque pela convenção REST, criar um recurso novo deve responder **`201 Created`** (em vez de `200 OK`) e informar no cabeçalho HTTP `Location` onde esse novo item pode ser consultado (`GetById`).
3. Fica dentro do método `ticket.Resolve()` em `Models/IncidentTicket.cs`! Isso mantém as regras de negócio encapsuladas no domínio (e não espalhadas pelos controllers) e garante que qualquer parte do sistema que tente resolver um ticket respeite a mesma regra.
4. O atributo `[ApiController]` intercepta antes mesmo de o método `Create` executar, valida as `DataAnnotations` do `CreateIncidentRequest` e devolve automaticamente **`400 Bad Request`** com os detalhes do erro em JSON.
