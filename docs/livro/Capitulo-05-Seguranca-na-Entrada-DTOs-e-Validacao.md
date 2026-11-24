# Capítulo 5 — Segurança na Entrada: DTOs e Validação

Imagine que um cliente mal-intencionado (ou um erro de programação no aplicativo) envie este JSON ao tentar abrir um novo chamado:

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "title": "Oi",
  "status": "Resolvido",
  "resolvedAt": "2020-01-01T00:00:00Z"
}
```

Se a nossa rota `POST /api/incidents` recebesse diretamente a classe `IncidentTicket`, dois desastres aconteceriam ao mesmo tempo:
1. O usuário conseguiria forjar o próprio `Id`, forçar o chamado a já nascer `Resolvido` e falsificar datas (*ataque conhecido como **Over-Posting** ou **Mass Assignment***).
2. Títulos inúteis como `"Oi"` e chamados sem descrição ou sem sistema afetado sujariam a fila da equipe hospitalar.

É exatamente para evitar isso que existem os **DTOs** (*Data Transfer Objects* — Objetos de Transferência de Dados).

---

## 5.1 Entidade vs. DTO: o balcão de triagem do hospital

> **Analogia:** Pense na diferença entre a **ficha interna do hospital** (`IncidentTicket`) e o **formulário de abertura da recepção** (`CreateIncidentRequest`). Na recepção, o paciente/solicitante só preenche título do problema, descrição, sistema afetado e urgência. Quem gera o número de protocolo (`Id`), carimba o horário de entrada (`CreatedAt`) e define a situação inicial (`Aberto`) é **exclusivamente o sistema interno**!

---

## 5.2 O código completo de `DTOs/CreateIncidentRequest.cs`

Crie o arquivo `DTOs/CreateIncidentRequest.cs`:

```csharp
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
```

---

## 5.3 Dissecando cada técnica deste arquivo

### 1. `public record` e `{ get; init; }` (Imutabilidade)
- Em vez de `class`, usamos **`record`**: um tipo moderno do C# feito especialmente para pacotes de dados de entrada/saída.
- Em vez de `set`, usamos **`init`**: significa que os valores podem ser preenchidos no momento em que o JSON chega e é montado, mas **ninguém pode sair modificando os dados recebidos depois**. Dados de entrada devem ser confiáveis e imutáveis.

### 2. DataAnnotations: validações declarativas com `[Colchetes]`
O pacote `System.ComponentModel.DataAnnotations` traz etiquetas que colocamos em cima de cada propriedade:
- **`[Required(...)]`**: proíbe que o campo venha vazio (`""`), nulo ou só com espaços.
- **`[StringLength(max, MinimumLength = min)]`**: garante tamanho mínimo e máximo (ex.: título entre 5 e 120 letras; descrição entre 10 e 1000 letras).
- **`[EnumDataType(typeof(IncidentPriority))]`**: garante que o valor enviado exista dentro do enum `IncidentPriority` (impedindo alguém de mandar um número inválido como `99`).

### 3. O truque sênior em `public IncidentPriority? Priority { get; init; }`

Preste muita atenção nessa linha! Por que colocamos um **`?`** em `IncidentPriority?` se a prioridade é **obrigatória**?

> **Atenção — Armadilha silenciosa de `enum` em C#:**  
> Em C#, todo `enum` é um número por trás, e o valor padrão de um número não preenchido é **`0`**.  
> Se declarássemos `public IncidentPriority Priority` (sem `?`) e alguém mandasse um JSON **esquecendo** o campo `priority`:
> ```json
> { "title": "Erro no portal", "description": "Tela branca no login", "serviceAffected": "PortalDoMedico" }
> ```
> O C# preencheria `Priority` silenciosamente com `0` — que equivale a **`Baixa`**! O `[Required]` nem reclamaria, e um chamado potencialmente crítico entraria errado como `Baixa`!  
>
> Quando colocamos **`IncidentPriority?`** (anulável), se o cliente esquecer o campo no JSON, o valor fica `null`. Aí o `[Required]` detecta o `null` na hora e barra a requisição devolvendo erro **`400 Bad Request`**!

---

## 5.4 A resposta automática `400 Bad Request` (`ValidationProblemDetails`)

Como nosso Controller terá o atributo `[ApiController]` (veremos no Capítulo 8), não precisamos escrever nenhum `if` manual para validar esses 4 campos! Antes mesmo de o código do Controller rodar, o ASP.NET Core lê as anotações do `CreateIncidentRequest`.

Se alguém enviar um JSON vazio `{}`, a própria API devolve automaticamente HTTP `400 Bad Request` com este JSON limpo:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Title": ["O título do incidente é obrigatório."],
    "Priority": ["A prioridade é obrigatória."],
    "Description": ["A descrição do incidente é obrigatória."],
    "ServiceAffected": ["O serviço afetado é obrigatório (ex: AutorizacaoMedica, PortalDoMedico)."]
  }
}
```

E lá no Capítulo 10, o nosso Painel Visual vai ler exatamente esse objeto `errors` do JSON para mostrar as mensagens em vermelho dentro da janela **Abrir Novo Chamado**!

---

> **Resumo do Capítulo:**
> - Nunca exponha entidades internas diretamente na entrada da API: use **DTOs** para evitar *Over-Posting*.
> - `record` + `init` criam contratos de entrada limpos e imutáveis.
> - **DataAnnotations** (`[Required]`, `[StringLength]`, `[EnumDataType]`) validam os dados antes mesmo de entrarem no Controller.
> - Usar `IncidentPriority?` (anulável) evita que campos omitidos caiam silenciosamente no valor `0` (`Baixa`).

---

## Exercícios de Fixação

1. Explique com suas palavras qual problema de segurança evitamos ao criar `CreateIncidentRequest` separado de `IncidentTicket`.
2. Por que `Priority` em `CreateIncidentRequest` tem um `?` (`IncidentPriority?`), mas na entidade `IncidentTicket` não tem (`IncidentPriority`)?
3. O que o atributo `[StringLength(120, MinimumLength = 5)]` faz se alguém enviar `"Erro"` (4 letras) no campo `Title`?
4. Se quiséssemos limitar a descrição para aceitar no máximo 500 caracteres, qual linha de `CreateIncidentRequest.cs` você alteraria?

---

## Gabarito Comentado

1. Evitamos o *Over-Posting* (*Mass Assignment*): impedimos que quem faz a requisição envie campos internos que só o servidor deve controlar, como `Id`, `Status` (tentar abrir um chamado já `Resolvido`), `CreatedAt` ou `ResolvedAt`.
2. No DTO (`CreateIncidentRequest`), `IncidentPriority?` precisa aceitar `null` temporariamente para que o `[Required]` perceba quando o usuário esqueceu de enviar o campo e devolva `400 Bad Request` (em vez de assumir `0 = Baixa`). Já na entidade `IncidentTicket`, depois que a validação passou, a prioridade garantidamente tem um valor válido (`request.Priority!.Value`).
3. A validação do ASP.NET Core barra a requisição automaticamente e devolve `400 Bad Request` com a mensagem `"O título deve ter entre 5 e 120 caracteres."` dentro de `errors.Title`.
4. Alteraríamos o primeiro parâmetro do `[StringLength]` acima de `Description` para `[StringLength(500, MinimumLength = 10, ...)]` (atualizando também o texto da `ErrorMessage`).
