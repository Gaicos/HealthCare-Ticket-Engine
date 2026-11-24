# Capítulo 6 — Guardando Dados: Repository Pattern e Programação Assíncrona

Agora temos o molde do chamado (`Models`) e a portaria que valida o que entra (`DTOs`). Mas onde esses chamados ficam guardados?

Se colocássemos uma lista estática diretamente dentro do `IncidentsController`, o dia em que quiséssemos salvar em um banco de dados real como **PostgreSQL** ou **SQL Server**, teríamos que reescrever todos os controllers do sistema — correndo risco de quebrar regras que já funcionavam.

Para evitar esse acoplamento, usamos um dos padrões de arquitetura mais famosos da engenharia de software: o **Repository Pattern** (Padrão Repositório).

---

## 6.1 O Repository Pattern e a analogia da tomada elétrica

> **Analogia:** Pense na tomada da parede da sua casa. A tomada define um **formato padrão de contrato** (três pinos). Você pode ligar um ventilador, um carregador ou um computador nela sem precisar quebrar a parede para ver como os fios chegam lá trás — e a companhia elétrica pode trocar a usina de hidrelétrica para solar sem você precisar trocar seus aparelhos!

No nosso código:
- A **Tomada (Interface)** é `IIncidentRepository.cs`: diz *o que* o sistema sabe pedir ao armazenamento (`GetAllAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `ResetSeedDataAsync`).
- A **Usina atual (Implementação)** é `InMemoryIncidentRepository.cs`: guarda os dados na memória RAM usando um dicionário seguro.
- O **Controller** só conversa com a **Interface (`IIncidentRepository`)**. Ele nem sabe se os dados vêm da memória RAM, de um arquivo JSON ou de um banco SQL Server na nuvem!

---

## 6.2 Programação Assíncrona (`async`, `await`, `Task` e `CancellationToken`)

Antes de olhar o código do repositório, você verá palavras como `Task<...>`, `async`, `await` e `CancellationToken`. Por que elas estão lá se estamos guardando em memória?

> **Analogia da cafeteria:**  
> - **Código Síncrono (sem `async`):** O atendente tira seu pedido de café, fica parado olhando a máquina coar por 2 minutos sem atender mais ninguém na fila, entrega seu café e só então chama o próximo cliente.  
> - **Código Assíncrono (`async` / `await`):** O atendente envia o pedido para a máquina, libera a caixa para atender outras 20 pessoas enquanto o café passa, e quando a máquina apita, ele entrega seu café!

Em servidores Web, acessar um banco de dados ou disco demora milissegundos preciosos. Usar **`Task`** e **`async`/`await`** permite que o servidor .NET atenda milhares de usuários simultâneos sem travar esperando respostas de rede.

E o **`CancellationToken`**? É o sinal de "cancelar o pedido": se o usuário fechar a aba do navegador antes de a consulta ao banco terminar, o `CancellationToken` avisa o banco para interromper a busca e não desperdiçar processamento!

---

## 6.3 O Contrato: `Repositories/IIncidentRepository.cs`

Crie o arquivo `Repositories/IIncidentRepository.cs`:

```csharp
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

    Task<IReadOnlyCollection<IncidentTicket>> ResetSeedDataAsync(
        CancellationToken cancellationToken = default);
}
```

### Entendendo os detalhes da interface

- **`interface` não tem corpo `{ ... }` nos métodos:** ela lista apenas a assinatura (nome, parâmetros e retorno).
- **`IReadOnlyCollection<IncidentTicket>`:** devolve uma coleção somente de leitura (quem chama pode ler e listar, mas não pode sair adicionando/removendo itens da lista interna por fora do repositório).
- **`IncidentStatus? status = null`:** o `= null` torna o parâmetro **opcional**. Se você chamar `GetAllAsync()` sem passar nada, ele traz todos os chamados; se passar `IncidentStatus.Aberto`, ele filtra.
- **`IncidentTicket?` (no `GetByIdAsync` e `UpdateAsync`):** o `?` avisa honestamente ao compilador que, se o `Id` não existir, esse método pode devolver `null`!

---

## 6.4 A Implementação em Memória: `Repositories/InMemoryIncidentRepository.cs`

Crie agora o arquivo `Repositories/InMemoryIncidentRepository.cs`:

```csharp
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
    private static readonly object _resetLock = new();

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

    public Task<IReadOnlyCollection<IncidentTicket>> ResetSeedDataAsync(
        CancellationToken cancellationToken = default)
    {
        lock (_resetLock)
        {
            _tickets.Clear();

            foreach (var entry in SeedInitialData())
            {
                _tickets[entry.Key] = entry.Value;
            }
        }

        return GetAllAsync(null, cancellationToken);
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
```

---

## 6.5 Os 5 pontos-chave desta classe que diferenciam código júnior de código sênior

### 1. Por que `private static readonly ConcurrentDictionary`?
No Capítulo 9, registraremos este repositório no `Program.cs` usando `.AddScoped<IIncidentRepository, InMemoryIncidentRepository>()`. Isso significa que **a cada requisição HTTP**, o .NET cria uma **nova instância** de `InMemoryIncidentRepository` e a descarta quando a resposta volta para o navegador.
- Se `_tickets` **não fosse `static`**, você criaria um chamado no `POST` e, quando fizesse o `GET` logo em seguida, ele teria sumido porque seria um novo objeto na memória!
- Sendo **`static`**, todas as instâncias compartilham o mesmo cofre em RAM enquanto o servidor estiver ligado — mantendo o contrato `Scoped` idêntico ao que o Entity Framework Core usa com bancos reais.
- E por que **`ConcurrentDictionary`** em vez de `Dictionary` comum? Porque se dois recrutadores clicarem em **Criar Chamado** exatamente no mesmo milissegundo em abas diferentes, um `Dictionary` comum pode corromper e quebrar o programa; o `ConcurrentDictionary` é *thread-safe* (seguro para múltiplas requisições simultâneas).

### 2. LINQ: filtrando e ordenando com elegância (`GetAllAsync`)
Veja como o **LINQ** (*Language Integrated Query*) do C# lê quase como inglês natural:
```csharp
if (status.HasValue)
{
    query = query.Where(t => t.Status == status.Value);
}

var result = query
    .OrderByDescending(t => t.Priority)
    .ThenBy(t => t.CreatedAt)
    .ToList();
```
1. Se veio filtro `status` (`HasValue`), `.Where(...)` mantém apenas os chamados com aquele status.
2. `.OrderByDescending(t => t.Priority)` coloca `Critica` (3) no topo, depois `Alta` (2), `Media` (1) e `Baixa` (0).
3. `.ThenBy(t => t.CreatedAt)` desempata chamados de mesma prioridade colocando o **mais antigo primeiro** (regra de ouro de fila de triagem N2!).

### 3. `Task.FromResult(...)`
Como a operação em memória é instantânea e não espera rede, não precisamos da palavra `async` nos métodos — apenas embrulhamos o resultado dentro de uma `Task` já concluída com `Task.FromResult(...)` para cumprir o contrato assíncrono da interface `IIncidentRepository`.

### 4. `lock (_resetLock)` em `ResetSeedDataAsync`
Ao clicar no botão **Restaurar Demo**, o método limpa o dicionário (`_tickets.Clear()`) e reinsere os 3 chamados iniciais. O bloco `lock (_resetLock)` cria um "banheiro com chave": garante que duas pessoas não consigam limpar e reinserir ao mesmo tempo, evitando que a lista fique duplicada ou pela metade.

### 5. `SeedInitialData()` (Dados iniciais realistas)
Em vez de o sistema abrir com uma tela vazia e sem graça quando um recrutador acessa pela primeira vez, `SeedInitialData()` já cria **3 chamados realistas** com IDs fáceis de testar (`11111111-...`, `22222222-...`, `33333333-...`), cobrindo os três estados (`Aberto`, `EmAnalise`, `Resolvido`).

---

> **Resumo do Capítulo:**
> - O **Repository Pattern** separa o *que fazer* (`IIncidentRepository`) do *como armazenar* (`InMemoryIncidentRepository`).
> - `ConcurrentDictionary` + `static` preservam os dados entre requisições `Scoped` com segurança contra acessos simultâneos.
> - **LINQ** ordena nossa fila exatamente como um time N2 trabalha: maior gravidade primeiro, mais antigo primeiro.

---

## Exercícios de Fixação

1. O que aconteceria se removêssemos a palavra `static` da linha `private static readonly ConcurrentDictionary<Guid, IncidentTicket> _tickets`, mantendo o registro `AddScoped` no `Program.cs`?
2. Para que serve o parâmetro `CancellationToken cancellationToken = default` nos métodos da interface `IIncidentRepository`?
3. Olhando o método `GetAllAsync`, se houver dois chamados com prioridade `Alta`, um criado às `10:00` e outro às `10:30`, qual aparecerá primeiro na lista? Qual linha garante isso?
4. Se amanhã você quiser salvar os chamados em um banco PostgreSQL, você precisará editar a interface `IIncidentRepository`? Explique.

---

## Gabarito Comentado

1. Como `AddScoped` cria uma nova instância de `InMemoryIncidentRepository` a cada requisição HTTP, sem `static` cada requisição teria um dicionário novo reiniciado com os 3 dados iniciais — todo chamado criado via `POST` desapareceria na requisição seguinte!
2. Permite cancelar operações assíncronas caso o cliente desista ou feche a requisição antes da conclusão, economizando recursos quando migrarmos para banco de dados real.
3. O chamado criado às **`10:00`** (mais antigo) aparecerá primeiro, graças ao `.ThenBy(t => t.CreatedAt)` (ordenação crescente de data de criação como critério de desempate).
4. Não! Bastará criar uma nova classe (ex.: `PostgresIncidentRepository : IIncidentRepository`) implementando os mesmos métodos e trocar uma única linha no `Program.cs`. A interface e o Controller permanecem intactos.
