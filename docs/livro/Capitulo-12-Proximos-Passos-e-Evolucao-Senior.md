# Capítulo 12 — Próximos Passos e Evolução para Nível Sênior

Parabéns! Se você acompanhou até aqui, você não apenas copiou um projeto: você entendeu desde variáveis, `null` e verbos HTTP até Repository Pattern, Injeção de Dependência, `IExceptionHandler`, Front-End sem XSS, Docker e Cloud Deploy.

Neste último capítulo, vamos olhar para o futuro: **como transformar este projeto em um sistema corporativo ainda mais robusto** e **como explicá-lo com confiança em entrevistas de emprego**.

---

## 12.1 Passo 1 de Evolução: Banco de Dados Real com Entity Framework Core

Hoje nossos chamados vivem na memória RAM (`InMemoryIncidentRepository`). Se o servidor reiniciar, os chamados criados durante o teste somem. Como migramos para **PostgreSQL** ou **SQL Server** sem quebrar o resto da API?

Graças ao **Repository Pattern** do Capítulo 6, você não altera uma vírgula em `Controllers/IncidentsController.cs` nem no front-end! Os passos são apenas:

1. Instalar os pacotes do **Entity Framework Core** (o ORM oficial da Microsoft que traduz classes C# em tabelas SQL):
   ```powershell
   dotnet add package Microsoft.EntityFrameworkCore
   dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
   ```
2. Criar uma classe `AppDbContext : DbContext` expondo `public DbSet<IncidentTicket> Incidents => Set<IncidentTicket>();`.
3. Criar uma nova classe **`EfCoreIncidentRepository : IIncidentRepository`** (mantendo os exatos mesmos métodos do contrato!). Veja uma prévia de como ela ficaria:

```csharp
using HealthCare_Ticket_Engine.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthCare_Ticket_Engine.Repositories;

public class EfCoreIncidentRepository(AppDbContext context) : IIncidentRepository
{
    public async Task<IReadOnlyCollection<IncidentTicket>> GetAllAsync(
        IncidentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.Incidents.AsNoTracking().AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        return await query
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<IncidentTicket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => context.Incidents.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<IncidentTicket> CreateAsync(IncidentTicket ticket, CancellationToken cancellationToken = default)
    {
        context.Incidents.Add(ticket);
        await context.SaveChangesAsync(cancellationToken);
        return ticket;
    }

    public async Task<IncidentTicket?> UpdateAsync(IncidentTicket ticket, CancellationToken cancellationToken = default)
    {
        context.Incidents.Update(ticket);
        await context.SaveChangesAsync(cancellationToken);
        return ticket;
    }

    public Task<IReadOnlyCollection<IncidentTicket>> ResetSeedDataAsync(CancellationToken cancellationToken = default)
        => GetAllAsync(null, cancellationToken);
}
```
4. No `Program.cs`, trocar **apenas uma linha**:
   `builder.Services.AddScoped<IIncidentRepository, EfCoreIncidentRepository>();`

Viu por que tanto esforço em desacoplamento valeu a pena?

---

## 12.2 Passo 2 de Evolução: Testes Automatizados com xUnit

Engenheiros sêniores nunca dependem apenas de clicar na tela para saber se o sistema não quebrou. Você pode criar um projeto paralelo de testes com `dotnet new xunit -o HealthCare-Ticket-Engine.Tests` e testar suas regras de domínio em milissegundos!

Veja um exemplo real de teste unitário para `IncidentTicket.Resolve()`:

```csharp
using HealthCare_Ticket_Engine.Models;
using Xunit;

namespace HealthCare_Ticket_Engine.Tests;

public class IncidentTicketTests
{
    [Fact]
    public void Resolve_ShouldSetStatusResolvidoAndTimestamp_WhenTicketIsOpen()
    {
        // Arrange (Preparação)
        var ticket = new IncidentTicket
        {
            Title = "Erro no prontuário",
            Description = "Falha intermitente ao salvar evolução médica.",
            Priority = IncidentPriority.Critica,
            ServiceAffected = "ProntuarioEletronico"
        };

        // Act (Ação)
        ticket.Resolve();

        // Assert (Verificação)
        Assert.Equal(IncidentStatus.Resolvido, ticket.Status);
        Assert.NotNull(ticket.ResolvedAt);
    }

    [Fact]
    public void Resolve_ShouldThrowInvalidOperationException_WhenAlreadyResolved()
    {
        // Arrange
        var ticket = new IncidentTicket { Priority = IncidentPriority.Alta };
        ticket.Resolve();

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => ticket.Resolve());
    }
}
```

Esse padrão **Arrange → Act → Assert (AAA)** garante que ninguém nunca introduza um bug silencioso nas regras de SLA ou transição de status!

---

## 12.3 Passo 3 de Evolução: Autenticação JWT e Notas de Atendimento

Quando o sistema crescer para múltiplos analistas N2 em um hospital real:
- **Autenticação JWT (JSON Web Token) + Perfis (Roles):** diferenciar quem pode *Abrir Chamado* (ex.: Recepção / Enfermagem) de quem pode *Iniciar Análise / Resolver* (Analista N2) usando `[Authorize(Roles = "AnalystN2")]`.
- **Histórico de Comentários N2:** criar uma tabela relacionada `IncidentComment` (`Author`, `Message`, `CreatedAt`) para o analista registrar o passo a passo da investigação antes de encerrar o chamado.

---

## 12.4 Como apresentar este projeto em uma entrevista técnica (Roteiro de 2 minutos)

Se um recrutador ou líder técnico perguntar *"Me conte sobre um projeto que você construiu em C#"*, você pode usar esta estrutura direta e segura:

> *"Eu construí o **HealthCare Ticket Engine**, uma API RESTful em **ASP.NET Core .NET 8** com painel Web integrado para triagem e controle de SLA de incidentes hospitalares N2.*
>
> *Modelei a entidade `IncidentTicket` encapsulando as regras de negócio — como cálculo automático de SLA (1h Crítica até 24h Baixa) e proteção de transições de estado em `StartAnalysis()` e `Resolve()`. Separei a entrada da API com um DTO validado por `DataAnnotations` (inclusive usando enum anulável no DTO para evitar que campos omitidos caiam no valor padrão zero).*
>
> *Desacoplei a persistência com o **Repository Pattern** (`IIncidentRepository` registrado como `Scoped` via Injeção de Dependência), permitindo trocar o repositório em memória (`ConcurrentDictionary` thread-safe) por Entity Framework Core no futuro sem mexer nos Controllers.*
>
> *Para tratamento de erros, usei o `IExceptionHandler` nativo do .NET 8 devolvendo **RFC 7807 `ProblemDetails`** limpos (como `409 Conflict` ao tentar resolver um chamado já encerrado). Também criei uma interface Web amigável em `wwwroot/` protegida contra XSS com barra de inspeção HTTP em tempo real, Swagger com XML docs, `Dockerfile` multi-stage e deploy contínuo em nuvem no Render."*

---

## Desafios Finais Práticos

1. **(Novo Endpoint)** Como você adicionaria um endpoint `GET /api/incidents/breached` que retorna apenas os chamados ativos cujo SLA já foi estourado (`!Status.Equals(Resolvido)` e `IsSlaBreached`)? Quais arquivos precisaria atualizar?
2. **(Teste xUnit)** Escreva o padrão *Arrange / Act / Assert* de um teste unitário verificando que `StartAnalysis()` lança `InvalidOperationException` se o chamado já estiver `Resolvido`.
3. **(Arquitetura)** Na frase do roteiro de entrevista, por que explicamos o uso de `ConcurrentDictionary` estático junto com `.AddScoped<>`?

---

## Gabarito Comentado

1. Você pode adicionar `GetBreachedAsync` na interface `IIncidentRepository` e em `InMemoryIncidentRepository` filtrando `t.Status != IncidentStatus.Resolvido && t.IsSlaBreached`, e expor `[HttpGet("breached")]` no `IncidentsController`. *(Alternativamente, o próprio `GetAll` já traz todos ordenados e `IsSlaBreached` calculado em tempo real).*
2. **Arrange:** crie um `IncidentTicket` e chame `ticket.Resolve()`. **Act & Assert:** `Assert.Throws<InvalidOperationException>(() => ticket.StartAnalysis());`.
3. Porque demonstra que você entende o ciclo de vida `Scoped` da Injeção de Dependência (uma instância nova por requisição HTTP) e resolveu conscientemente a persistência em memória entre requisições mantendo thread-safety para acessos simultâneos.
