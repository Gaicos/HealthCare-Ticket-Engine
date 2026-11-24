# Capítulo 4 — Modelando o Coração do Sistema: Models e Enums

Todo grande sistema nasce de dentro para fora: antes de pensar em rotas de internet ou botões na tela, precisamos definir com clareza **o que é um Chamado Hospitalar** e **quais regras ele precisa obedecer**.

Na pasta `Models/`, moram os moldes principais da nossa aplicação. São classes puras em C# que não dependem de banco de dados nem de navegador — se amanhã você trocar a Web API por um aplicativo de console ou desktop, essa camada continua funcionando intacta.

---

## 4.1 Por que usar `enum`? (`Models/IncidentEnums.cs`)

Imagine que deixássemos o usuário digitar a prioridade como um texto livre (`string`). Uma pessoa digitaria `"Crítica"` com acento, outra `"CRITICA"` em maiúsculas, outra `"Urgente"` e outra `"P1"`. Em menos de uma semana, filtros e cálculos de SLA quebrariam completamente.

Para resolver isso, usamos um **`enum`** (*Enumeração*): uma lista fechada com os únicos valores válidos aceitos pelo sistema.

Crie o arquivo `Models/IncidentEnums.cs` com o código completo abaixo:

```csharp
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
```

### Entendendo cada detalhe deste arquivo

1. **`namespace HealthCare_Ticket_Engine.Models;`**  
   Organiza o endereço lógico do arquivo dentro do projeto (usando a sintaxe moderna *file-scoped namespace* do C#, com `;` no final em vez de abrir chaves `{ }` em volta do arquivo inteiro).
2. **`public enum IncidentPriority`**  
   A palavra `public` permite que outras pastas (como `Controllers` e `DTOs`) enxerguem esse enum.
3. **O segredo da ordem numérica (`0, 1, 2, 3`)**  
   Por baixo dos panos, o C# atribui um número inteiro para cada item na ordem em que foi escrito:
   - `Baixa = 0`
   - `Media = 1`
   - `Alta = 2`
   - `Critica = 3`

> **Dica Sênior:** Repare que colocamos propositalmente `Baixa` (0) primeiro e `Critica` (3) por último! Por quê? Porque quando formos ordenar a fila de atendimento em ordem decrescente no Capítulo 6 (`OrderByDescending(t => t.Priority)`), os chamados `Critica` (3) sobem automaticamente para o topo da lista!

---

## 4.2 A Entidade Principal (`Models/IncidentTicket.cs`)

Agora vamos construir a planta principal de um chamado técnico hospitalar. Crie o arquivo `Models/IncidentTicket.cs` exatamente assim:

```csharp
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
```

---

## 4.3 Dissecando `IncidentTicket.cs` linha por linha

### Identidade, Strings e Valores Padrão (Linhas 8–22)

- **`public Guid Id { get; set; } = Guid.NewGuid();`**  
  Em vez de números sequenciais simples (`1`, `2`, `3`), sistemas distribuídos modernos usam **GUID** (*Globally Unique Identifier*), um código de 128 bits praticamente impossível de repetir (ex.: `59dd25b4-ab51-4675-9aa0-13858a8e890b`). Assim que fazemos `new IncidentTicket()`, ele já nasce com um `Id` exclusivo.
  - `{ get; set; }` significa que a propriedade pode ser lida (`get`) e alterada (`set`).
- **`= string.Empty;`**  
  Como ativamos `<Nullable>enable</Nullable>`, propriedades `string` não podem começar como `null`. Inicializá-las com `string.Empty` (que equivale a `""`) garante que o compilador fique satisfeito e evita erros de referência nula.
- **`public IncidentStatus Status { get; set; } = IncidentStatus.Aberto;`**  
  Todo chamado recém-aberto nasce automaticamente com status `Aberto`.
- **`public DateTime CreatedAt { get; set; } = DateTime.UtcNow;`**  
  > **Atenção — Por que `UtcNow` e não `Now`?**  
  > `DateTime.Now` usa o relógio local da máquina (no Brasil `-03:00`). Se seu servidor estiver hospedado nos Estados Unidos (`-05:00`) ou na Europa (`00:00`), o horário ficaria bagunçado! **UTC** (*Coordinated Universal Time*) é o relógio universal padrão de servidores no mundo todo. O navegador do usuário converte esse horário UTC para o fuso brasileiro na hora de exibir na tela!
- **`public DateTime? ResolvedAt { get; set; }`**  
  Repare no `?`: enquanto o chamado não termina, não existe data de resolução, então `ResolvedAt` vale `null`.

### Propriedades Computadas em Tempo Real (Linhas 28–39)

Olhe bem para `SlaDeadline` e `IsSlaBreached`: elas **não têm `{ get; set; }`** — elas usam `=>` (somente leitura calculada na hora)!

```csharp
public DateTime SlaDeadline => CreatedAt.AddHours(Priority switch
{
    IncidentPriority.Critica => 1,
    IncidentPriority.Alta => 4,
    IncidentPriority.Media => 8,
    _ => 24
});
```

Toda vez que alguém pergunta `ticket.SlaDeadline`, o C# pega `CreatedAt`, olha a `Priority` no `switch`, soma `1`, `4`, `8` ou `24` horas usando `.AddHours(...)` e devolve o prazo exato. Como é calculado na hora, nunca fica desatualizado!

```csharp
public bool IsSlaBreached => (ResolvedAt ?? DateTime.UtcNow) > SlaDeadline;
```

Aqui entra a joia que aprendemos no Capítulo 1:
- Se o chamado **ainda não foi resolvido** (`ResolvedAt == null`), o `??` substitui por `DateTime.UtcNow` e testa: *"o relógio de agora já passou do prazo?"*
- Se o chamado **já foi resolvido** (`ResolvedAt != null`), o `??` usa a data real em que ele foi resolvido (`ResolvedAt`) e congela para sempre a informação se foi resolvido dentro ou fora do prazo!

### Protegendo Regras de Negócio com Métodos de Domínio (Linhas 45–76)

Em sistemas mal estruturados (chamados de *modelos anêmicos*), qualquer tela ou controller altera `ticket.Status = IncidentStatus.Resolvido` diretamente. O problema é que alguém pode esquecer de preencher `ResolvedAt` ou acabar "reabrindo" por acidente um chamado já fechado.

No nosso código, colocamos essas guardas dentro de **`StartAnalysis()`** e **`Resolve()`**:
1. Em `StartAnalysis()`:
   - Se já estiver `Resolvido` ou já estiver `EmAnalise`, ele lança uma **`InvalidOperationException`** com uma mensagem clara em português (`throw new InvalidOperationException(...)`).
   - Se passar pelas verificações, muda `Status = IncidentStatus.EmAnalise`.
2. Em `Resolve()`:
   - Se já estiver `Resolvido`, lança `InvalidOperationException` avisando inclusive em qual data/hora já havia sido resolvido (`{ResolvedAt:O}`, onde `:O` formata a data no padrão ISO 8601 completo).
   - Caso contrário, marca `Status = IncidentStatus.Resolvido` e grava `ResolvedAt = DateTime.UtcNow`.

Mais à frente, no Capítulo 7, veremos como o nosso `GlobalExceptionHandler` captura essa `InvalidOperationException` e a transforma automaticamente em uma resposta HTTP **`409 Conflict`** elegante em JSON!

---

> **Resumo do Capítulo:**
> - **Enums** (`IncidentPriority`, `IncidentStatus`) restringem valores válidos e ajudam na ordenação por severidade (`Baixa = 0` até `Critica = 3`).
> - **`IncidentTicket`** concentra dados (`Id`, `Title`, `CreatedAt`), cálculos dinâmicos (`SlaDeadline`, `IsSlaBreached`) e transições protegidas (`StartAnalysis()`, `Resolve()`).
> - Sempre gravamos datas de servidor em **UTC (`DateTime.UtcNow`)**.

---

## Exercícios de Fixação

1. Por que `SlaDeadline` foi implementado com `=>` (propriedade computada) em vez de `{ get; set; }` comum?
2. O que acontece se alguém chamar `ticket.StartAnalysis()` em um chamado que já está com `Status == IncidentStatus.Resolvido`?
3. Por que usamos `DateTime.UtcNow` no back-end em vez de `DateTime.Now`?
4. Se `Baixa` fosse declarado por último no `enum IncidentPriority` (depois de `Critica`), o que aconteceria com a ordenação decrescente `OrderByDescending(t => t.Priority)`?

---

## Gabarito Comentado

1. Porque `SlaDeadline` depende diretamente de `CreatedAt` e `Priority`. Sendo computada com `=>`, ela calcula o prazo automaticamente toda vez que é lida e impede que alguém grave um prazo inconsistente manualmente.
2. O método entra no primeiro `if (Status == IncidentStatus.Resolvido)` e dispara uma `InvalidOperationException` com a mensagem de que o incidente já foi resolvido e não pode voltar para análise — impedindo a transição inválida.
3. Porque servidores na nuvem (como no Render, Azure ou AWS) costumam rodar em fuso horário UTC, diferente do horário do Brasil (`-03:00`). Salvar em UTC garante consistência mundial, e o front-end converte para o fuso do usuário na tela.
4. Como os valores padrão do enum crescem de cima para baixo (`0, 1, 2, 3`), colocar `Baixa` por último daria a ela o maior número (`3`), fazendo chamados de prioridade `Baixa` aparecerem no topo da fila como se fossem mais urgentes que `Critica`!
