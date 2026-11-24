# Capítulo 9 — O Maestro do Sistema: `Program.cs` e Swagger

Agora temos todas as partes individuais prontas, mas quem liga tudo na tomada quando você digita `dotnet run`? Quem conecta a interface `IIncidentRepository` à classe `InMemoryIncidentRepository`? Quem ativa o Swagger, o tratador de erros e o servidor de páginas HTML?

Quem faz tudo isso é o arquivo **`Program.cs`** — o maestro da orquestra!

---

## 9.1 As duas metades do `Program.cs`

Todo `Program.cs` moderno no .NET 8 funciona em **duas fases muito claras**:

```text
FASE 1: Montando a Caixa de Ferramentas (builder.Services...)
  - Cadastra Controllers, conversão de Enums, Repository (DI),
    GlobalExceptionHandler, ForwardedHeaders e Swagger.
                  |
                  v
         var app = builder.Build();   <-- Liga o servidor!
                  |
                  v
FASE 2: Linha de Montagem da Requisição (app.Use...)
  Toda requisição HTTP atravessa os middlewares NESTA ORDEM EXATA:
  ForwardedHeaders -> ExceptionHandler -> Swagger -> Arquivos Estáticos -> Authorization -> Endpoints
```

> **Atenção:** Na Fase 2, **a ordem importa muito!** Por exemplo, `app.UseExceptionHandler()` precisa vir antes dos Controllers para conseguir capturar erros que acontecerem lá dentro.

---

## 9.2 Injeção de Dependência (`Transient`, `Scoped` e `Singleton`)

Quando colocamos `IIncidentRepository` no construtor do `IncidentsController`, o .NET precisa saber **como** e **quando** criar essa classe. Existem 3 tempos de vida principais na Injeção de Dependência (DI):

| Método de Registro | Quando uma nova instância é criada? | Uso típico |
| :--- | :--- | :--- |
| **`AddTransient`** | **Toda vez** que qualquer classe pedir (várias vezes por requisição) | Serviços leves sem estado |
| **`AddScoped`** | **Uma vez por requisição HTTP** (compartilhada durante aquela requisição) | Repositórios e bancos de dados (`DbContext`) |
| **`AddSingleton`** | **Uma única vez** enquanto o servidor estiver ligado | Cache global ou leitores de configuração fixa |

No nosso projeto, usamos **`builder.Services.AddScoped<IIncidentRepository, InMemoryIncidentRepository>();`** — exatamente o padrão corporativo usado com Entity Framework Core! E como aprendemos no Capítulo 6, deixamos o dicionário `_tickets` como `static` lá dentro para que os dados não sumam entre uma requisição e outra.

---

## 9.3 O código completo de `Program.cs`

Abra ou atualize seu `Program.cs` com o código exato abaixo:

```csharp
using System.Reflection;
using System.Text.Json.Serialization;
using HealthCare_Ticket_Engine.Middlewares;
using HealthCare_Ticket_Engine.Repositories;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
var isCloudContainer = !string.IsNullOrWhiteSpace(port);
if (isCloudContainer)
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddScoped<IIncidentRepository, InMemoryIncidentRepository>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HealthCare Ticket Engine API",
        Version = "v1",
        Description = "API RESTful em ASP.NET Core .NET 8 para gestão, triagem N2 e controle de SLA de incidentes hospitalares e de saúde (Crítica: 1h, Alta: 4h, Média: 8h, Baixa: 24h).",
        Contact = new OpenApiContact
        {
            Name = "João (Gaicos)",
            Url = new Uri("https://github.com/Gaicos")
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "HealthCare Ticket Engine API v1");
    options.RoutePrefix = "swagger";
});

app.UseDefaultFiles();
app.UseStaticFiles();

if (!app.Environment.IsDevelopment() && !isCloudContainer)
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "HealthCare-Ticket-Engine",
    timestamp = DateTime.UtcNow
})).ExcludeFromDescription();

app.MapControllers();

app.Run();
```

---

## 9.4 Dissecando cada bloco do `Program.cs`

### 1. Configuração de Porta na Nuvem (`PORT`) e Proxy Reverso (Linhas 10–22)
- Em nuvens como o **Render**, a plataforma escolhe uma porta dinâmica e coloca o número na variável de ambiente `PORT`. Se existir `PORT`, mandamos o servidor ouvir em `http://0.0.0.0:{port}` (`0.0.0.0` significa *"aceitar conexões de fora do container"*, diferente de `localhost` que só aceita do próprio PC).
- `ForwardedHeadersOptions`: na nuvem, o usuário acessa `https://...`, o servidor do Render recebe o HTTPS na porta da frente e repassa HTTP internamente para o nosso container. Limpar `KnownNetworks` e `KnownProxies` faz o ASP.NET Core confiar nos cabeçalhos `X-Forwarded-Proto` e `X-Forwarded-For` enviados pelo proxy do Render.

### 2. Controllers e `JsonStringEnumConverter` (Linhas 24–28)
Sem o `JsonStringEnumConverter()`, a API devolveria `"priority": 3` e `"status": 0` (números sem sentido para quem lê o JSON!). Com esse conversor, ela devolve **`"priority": "Critica"`** e **`"status": "Aberto"`**, e também aceita receber texto na criação de chamados!

### 3. Injeção de Dependência e Erros Globais (Linhas 30–33)
- `AddScoped<IIncidentRepository, InMemoryIncidentRepository>()`: conecta o contrato do Capítulo 6.
- `AddExceptionHandler<GlobalExceptionHandler>()` + `AddProblemDetails()`: registra nossa rede de proteção do Capítulo 7.

### 4. Swagger / OpenAPI com XML Comments (Linhas 35–56)
- Configura título, versão e dados de contato (`João (Gaicos)`).
- Monta o caminho do arquivo `.xml` gerado graças ao `<GenerateDocumentationFile>true</GenerateDocumentationFile>` do `.csproj` e verifica `if (File.Exists(xmlPath))` antes de ler (boa prática defensiva para nunca quebrar a inicialização caso o XML falte).

### 5. Pipeline de Requisição (Linhas 60–89)
- `app.UseForwardedHeaders();` e `app.UseExceptionHandler();` vêm no topo.
- `app.UseSwagger();` e `app.UseSwaggerUI(...)` publicam a documentação interativa em **`/swagger`** (tanto em Desenvolvimento quanto em Produção, para que recrutadores também possam explorar e testar o Swagger na nuvem!).
- **`app.UseDefaultFiles();` ANTES de `app.UseStaticFiles();`**:
  - `UseDefaultFiles()` procura automaticamente por `index.html` dentro da pasta `wwwroot/` quando alguém acessa `/`.
  - `UseStaticFiles()` entrega `index.html`, `styles.css` e `app.js` para o navegador.
- **`if (!app.Environment.IsDevelopment() && !isCloudContainer) app.UseHttpsRedirection();`**:
  - Evita redirecionamentos HTTPS quebrados em teste local simples ou dentro de containers onde quem cuida do HTTPS já é o Render na borda!
- **`app.MapGet("/health", ...).ExcludeFromDescription();`**:
  - Um endpoint ultraleve que devolve `200 OK` com `{ "status": "Healthy", ... }`. O Render chama `/health` automaticamente para ter certeza de que o sistema subiu saudável. `.ExcludeFromDescription()` mantém o `/health` escondido do Swagger para não poluir a documentação de chamados.
- **`app.MapControllers();`** e **`app.Run();`**: ativam as rotas do `IncidentsController` e deixam o servidor no ar ouvindo pedidos!

---

## 9.5 Testando a API sem abrir o navegador (`HealthCare-Ticket-Engine.http`)

Além do Swagger em `/swagger`, você pode testar todas as rotas direto dentro do VS Code usando o arquivo `HealthCare-Ticket-Engine.http` (com a extensão *REST Client*):

```http
@HealthCare_Ticket_Engine_HostAddress = http://localhost:5214

### Health check (200 OK)
GET {{HealthCare_Ticket_Engine_HostAddress}}/health
Accept: application/json

### Listar todos os incidentes (ordenados por prioridade e antiguidade)
GET {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents
Accept: application/json

### Filtrar incidentes por status (Aberto, EmAnalise, Resolvido)
GET {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents?status=Aberto
Accept: application/json

### Buscar incidente seedado por ID (200 OK)
GET {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents/11111111-1111-1111-1111-111111111111
Accept: application/json

### Buscar incidente inexistente (404 Not Found)
GET {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents/99999999-9999-9999-9999-999999999999
Accept: application/json

### Criar novo incidente N2 (201 Created)
POST {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents
Content-Type: application/json

{
  "title": "Erro 500 na validação de carteirinha do convênio",
  "description": "Recepção da emergência não consegue validar elegibilidade de pacientes do convênio parceiro.",
  "priority": "Critica",
  "serviceAffected": "AutorizacaoMedica"
}

### Mover incidente aberto para EmAnalise (200 OK; chamada duplicada ou já resolvido retorna 409 Conflict)
PUT {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents/11111111-1111-1111-1111-111111111111/analyze
Accept: application/json

### Resolver incidente existente (200 OK; segunda chamada retorna 409 Conflict)
PUT {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents/11111111-1111-1111-1111-111111111111/resolve
Accept: application/json

### Restaurar os 3 chamados iniciais de demonstração (200 OK)
POST {{HealthCare_Ticket_Engine_HostAddress}}/api/incidents/reset-demo
Accept: application/json
```

---

> **Resumo do Capítulo:**
> - O `Program.cs` registra serviços (`builder.Services`) antes de `builder.Build()`, e configura a ordem de execução (`app.Use...`) depois.
> - `JsonStringEnumConverter` transforma enums numéricos em texto legível no JSON.
> - `UseDefaultFiles()` + `UseStaticFiles()` servem o painel da pasta `wwwroot/` em `/`, enquanto `UseSwaggerUI` mantém a API técnica acessível em `/swagger`.
> - `PORT` + `UseForwardedHeaders()` preparam a aplicação para rodar em containers na nuvem.

---

## Exercícios de Fixação

1. O que aconteceria se removêssemos `.AddJsonOptions(... new JsonStringEnumConverter())` do `Program.cs`?
2. Por que `app.UseDefaultFiles()` deve ser chamado **antes** de `app.UseStaticFiles()`?
3. Para que serve o endpoint `/health` e por que colocamos `.ExcludeFromDescription()` nele?
4. Se você mudar `builder.Services.AddScoped<IIncidentRepository, InMemoryIncidentRepository>()` para um banco real amanhã, quantos arquivos na pasta `Controllers/` precisará alterar?

---

## Gabarito Comentado

1. Os campos `priority` e `status` passariam a ser serializados como números inteiros (`0`, `1`, `2`, `3`) em vez de nomes legíveis (`"Critica"`, `"Aberto"`), quebrando a leitura humana e o front-end que espera os nomes em texto.
2. Porque `UseDefaultFiles()` reescreve o pedido da raiz `/` para `/index.html`, e logo depois `UseStaticFiles()` entrega o arquivo `wwwroot/index.html`. Se a ordem fosse invertida, `UseStaticFiles()` já teria terminado antes de `/` ser traduzido para `index.html`, resultando em erro `404` na página inicial!
3. O `/health` serve para plataformas de nuvem (como o Render) verificarem automaticamente se a aplicação está de pé e saudável. `.ExcludeFromDescription()` evita que essa rota interna de infraestrutura polua o Swagger dos chamados.
4. **Zero!** Nenhum arquivo em `Controllers/` precisará ser modificado, pois o `IncidentsController` depende apenas da interface `IIncidentRepository`.
