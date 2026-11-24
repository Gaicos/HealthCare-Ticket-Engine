# Capítulo 7 — Tratamento Global de Exceções com ProblemDetails

Imagine o cenário: alguém clica em **Marcar como Resolvido** duas vezes rápido no mesmo chamado (ou manda uma requisição para resolver um chamado já encerrado). Lá dentro de `IncidentTicket.Resolve()`, nós escrevemos:

```csharp
throw new InvalidOperationException($"O incidente '{Id}' já foi resolvido em {ResolvedAt:O}.");
```

O que acontece se não existir ninguém para "aparar" esse erro (`Exception`)?
- Sem proteção, o servidor devolve **`500 Internal Server Error`**, às vezes com páginas HTML enormes cheias de caminhos de pastas do seu computador (*Stack Trace*), expondo detalhes internos da aplicação e quebrando o código JavaScript do front-end que esperava um JSON!
- Colocar `try { ... } catch { ... }` repetido dentro de todos os endpoints também sujaria e duplicaria código por todo o Controller.

A solução profissional do **.NET 8** é o **Tratador Global de Exceções (`IExceptionHandler`)** combinado com o padrão mundial de erros em JSON chamado **RFC 7807 (`ProblemDetails`)**.

---

## 7.1 A analogia da rede de proteção do trapezista

> **Analogia:** Em vez de cada trapezista carregar um colchão nas costas o tempo todo, o circo coloca uma **única rede de proteção esticada lá embaixo**. Se qualquer erro escapar lá de cima (Controller, Domínio ou Repositório), ele cai direto na rede global, que transforma a queda em uma resposta JSON limpa, educada e segura!

```text
[ Controller ] ---> [ IncidentTicket.Resolve() ]
                          |
                          | (lança InvalidOperationException)
                          v
              [ GlobalExceptionHandler ]  <-- A rede global captura!
                          |
                          v
         HTTP 409 Conflict + JSON ProblemDetails limpo
```

---

## 7.2 O código completo de `Middlewares/GlobalExceptionHandler.cs`

Crie o arquivo `Middlewares/GlobalExceptionHandler.cs`:

```csharp
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace HealthCare_Ticket_Engine.Middlewares;

/// <summary>
/// Tratador global de exceções (.NET 8 IExceptionHandler) que converte erros em respostas JSON ProblemDetails limpas.
/// </summary>
public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IHostEnvironment environment) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            InvalidOperationException => (
                StatusCodes.Status409Conflict,
                "Conflito de estado do incidente",
                exception.Message),
            ArgumentException => (
                StatusCodes.Status400BadRequest,
                "Requisição inválida",
                exception.Message),
            KeyNotFoundException => (
                StatusCodes.Status404NotFound,
                "Recurso não encontrado",
                exception.Message),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Erro interno no servidor",
                environment.IsDevelopment()
                    ? exception.Message
                    : "Ocorreu um erro inesperado ao processar a solicitação. Contate a equipe de sustentação N2.")
        };

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(
                exception,
                "Erro inesperado ao processar {Method} {Path}. TraceId: {TraceId}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                httpContext.TraceIdentifier);
        }
        else
        {
            logger.LogWarning(
                exception,
                "Erro de domínio/requisição ({StatusCode}) em {Method} {Path}. TraceId: {TraceId}",
                statusCode,
                httpContext.Request.Method,
                httpContext.Request.Path,
                httpContext.TraceIdentifier);
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;
        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}
```

---

## 7.3 Dissecando o código linha por linha

### 1. Primary Constructor do C# 12 (Linhas 9–11)
```csharp
public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IHostEnvironment environment) : IExceptionHandler
```
Repare que os parâmetros estão logo na frente do nome da classe! Essa é uma novidade elegante do **C# 12 (.NET 8)** chamada *Primary Constructor*. Ela recebe automaticamente por Injeção de Dependência:
- `logger`: para registrar o erro nos logs do servidor.
- `environment`: para saber se estamos rodando em `Development` (seu PC) ou `Production` (nuvem/Render).

E a palavra `sealed` ("selada") indica que nenhuma outra classe vai herdar dessa, o que traz até pequenas otimizações para o compilador.

### 2. Mapeando cada exceção para o código HTTP correto (Linhas 18–38)
Usamos **Pattern Matching** em uma expressão `switch` que devolve uma **tupla** (três valores juntos: `statusCode`, `title`, `detail`):
- `InvalidOperationException` → **`409 Conflict`** (quando um chamado já está resolvido ou já está em análise).
- `ArgumentException` → **`400 Bad Request`** (quando algum argumento veio fora das regras).
- `KeyNotFoundException` → **`404 Not Found`** (quando algo não foi encontrado).
- `_` (qualquer outro erro inesperado!) → **`500 Internal Server Error`**.

> **Atenção — Segurança entre Desenvolvimento e Produção (Linhas 35–37):**  
> Repare no operador ternário `environment.IsDevelopment() ? exception.Message : "Ocorreu um erro inesperado..."`:
> - No seu computador (`Development`), mostramos `exception.Message` para ajudar você a depurar rápido.
> - Na nuvem (`Production`), **escondemos a mensagem técnica real** do usuário externo (para nunca vazar detalhes internos do servidor ou banco) e gravamos tudo nos logs privados do servidor!

### 3. Logs Estruturados Diferenciados (Linhas 40–58)
- Erros `500` são falhas graves no código: usamos **`logger.LogError(...)`**.
- Erros `4xx` são regras de negócio normais ou tentativas inválidas do cliente: usamos **`logger.LogWarning(...)`** (assim não disparamos falsos alarmes críticos de monitoramento).
- O `TraceId` é um código único de rastreamento daquela requisição específica — se um usuário mandar um print com o `traceId`, a equipe N2 acha exatamente a linha correspondente no log do servidor!

### 4. Montando e devolvendo o `ProblemDetails` (Linhas 60–75)
- `ProblemDetails` segue o padrão oficial da Web (**RFC 7807**): `Status`, `Title`, `Detail` e `Instance` (o caminho da URL onde ocorreu).
- Adicionamos `Extensions["traceId"]` e `Extensions["timestamp"]`.
- Definimos `ContentType = "application/problem+json"`, escrevemos o JSON na resposta HTTP com `await httpContext.Response.WriteAsJsonAsync(...)` e retornamos **`true`** avisando ao ASP.NET Core: *"Pode deixar, eu já tratei essa exceção e enviei a resposta!"*.

---

> **Resumo do Capítulo:**
> - `GlobalExceptionHandler` implementa `IExceptionHandler` do .NET 8, evitando blocos `try/catch` espalhados pelos controllers.
> - Converte exceções de domínio (`InvalidOperationException`) em **`409 Conflict`** e protege erros **`500`** em Produção sem vazar dados internos.
> - Toda resposta de erro sai padronizada em **JSON `ProblemDetails` (RFC 7807)** com `traceId` e `timestamp`.

---

## Exercícios de Fixação

1. Se um erro imprevisto (como `NullReferenceException`) acontecer enquanto a aplicação estiver rodando na nuvem (`Production`), qual texto o usuário receberá no campo `detail` da resposta JSON? Por quê?
2. Qual código HTTP o `GlobalExceptionHandler` retorna quando `IncidentTicket.Resolve()` dispara uma `InvalidOperationException`?
3. Para que serve o campo `traceId` incluído em `problemDetails.Extensions["traceId"]`?
4. O que significa o `return true;` na última linha do método `TryHandleAsync`?

---

## Gabarito Comentado

1. Receberá a mensagem amigável e genérica `"Ocorreu um erro inesperado ao processar a solicitação. Contate a equipe de sustentação N2."`. Porque em `Production`, `environment.IsDevelopment()` é `false`, ocultando a mensagem técnica real do usuário por segurança (enquanto o erro completo fica gravado apenas nos logs internos do servidor via `logger.LogError`).
2. Retorna **`409 Conflict`** (`StatusCodes.Status409Conflict`).
3. É um identificador único da requisição HTTP que falhou. Com ele, o usuário pode informar o código no atendimento e o time técnico encontra exatamente o registro do erro nos logs do servidor.
4. Informa ao pipeline do ASP.NET Core que a exceção já foi completamente tratada e a resposta HTTP já foi escrita, evitando que o servidor tente repassar o erro para outro manipulador padrão.
