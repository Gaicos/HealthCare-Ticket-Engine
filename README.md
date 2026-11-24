# HealthCare-Ticket-Engine

![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?style=flat-square)
![Swagger / OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=flat-square&logo=swagger&logoColor=black)
![C#](https://img.shields.io/badge/C%23-12-239120?style=flat-square&logo=csharp)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![Livro Didático](https://img.shields.io/badge/Livro%20Didático-12%20Capítulos-0F766E?style=flat-square)

[🇧🇷 Português](#-português) | [🇺🇸 English](#-english)

---

## 🇧🇷 Português

API RESTful em **ASP.NET Core (.NET 8)** projetada para **gestão, triagem e sustentação N2 de incidentes em sistemas de saúde e operações hospitalares** (autorização médica, prontuário eletrônico, portal do médico e integrações TISS/TUSS).

### 🎯 Foco em Sustentação N2 e SLAs

Em ambientes hospitalares críticos, a velocidade de triagem impacta diretamente o atendimento assistencial. A engine ordena automaticamente a fila por **severidade decrescente** (`Critica` → `Baixa`) e **ordem de chegada** (`CreatedAt` crescente), calculando em tempo real o prazo limite (`SlaDeadline`) e o indicador de estouro (`IsSlaBreached`):

| Prioridade | Meta de SLA N2 | Cenário Hospitalar Típico |
| :--- | :--- | :--- |
| `Critica` | **1 hora** | Parada total de autorização médica, pronto-socorro ou prontuário |
| `Alta` | **4 horas** | Lentidão severa ou falhas parciais no Portal do Médico / exames |
| `Media` | **8 horas** | Erros pontuais em guias eletivas com contorno operacional |
| `Baixa` | **24 horas** | Ajustes cadastrais, dúvidas técnicas ou melhorias sem impacto assistencial |

### 🧱 Arquitetura e Padrões Aplicados

- **Painel Web Amigável (`wwwroot/`)**: Interface visual moderna servida diretamente pela aplicação em `/` para usuários não técnicos acompanharem KPIs, filtrarem chamados, abrirem novos incidentes e visualizarem prazos de SLA em tempo real — com barra **Raio-X da API** para aprendizado das chamadas HTTP (`GET`, `POST`, `PUT`) e acesso rápido ao Swagger.
- **Controllers + DTOs + Validação**: Separação entre o modelo de domínio (`IncidentTicket`) e o contrato de entrada (`CreateIncidentRequest`) com `DataAnnotations` e serialização de enums em string (`JsonStringEnumConverter`).
- **Repository Pattern + Injeção de Dependência**: Contrato `IIncidentRepository` desacoplado da implementação `InMemoryIncidentRepository` (base thread-safe com `ConcurrentDictionary` e dados iniciais seedados), registrado no `Program.cs` com `.AddScoped<IIncidentRepository, InMemoryIncidentRepository>()` — pronto para futura substituição por Entity Framework Core sem alterar os controllers.
- **Tratamento Global de Exceções (`.NET 8 IExceptionHandler`)**: `GlobalExceptionHandler` captura exceções não tratadas e violações de regra de negócio (como tentar resolver um incidente já encerrado), retornando JSON padronizado no formato **RFC 7807 (`ProblemDetails`)** com `traceId` e `timestamp`.
- **Documentação Interativa (Swagger / OpenAPI)**: Especificação completa gerada a partir de comentários XML e anotações `[ProducesResponseType]`.

#### Estrutura de Pastas

```text
HealthCare-Ticket-Engine/
├── Controllers/
│   └── IncidentsController.cs
├── DTOs/
│   └── CreateIncidentRequest.cs
├── Middlewares/
│   └── GlobalExceptionHandler.cs
├── Models/
│   ├── IncidentEnums.cs
│   └── IncidentTicket.cs
├── Repositories/
│   ├── IIncidentRepository.cs
│   └── InMemoryIncidentRepository.cs
├── wwwroot/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── docs/
│   └── livro/          # Livro didático completo (12 capítulos + apêndice + PDF/HTML)
├── Dockerfile
├── .dockerignore
├── render.yaml
├── Program.cs
├── HealthCare-Ticket-Engine.csproj
├── HealthCare-Ticket-Engine.http
└── README.md
```

### 🚀 Como Executar

Pré-requisito: [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).

```powershell
git clone https://github.com/Gaicos/HealthCare-Ticket-Engine.git
cd HealthCare-Ticket-Engine
dotnet restore
dotnet run
```

Acesse no navegador:

- **Painel Web (Front-End)**: `http://localhost:5214/`
- **API Técnica (Swagger UI)**: `http://localhost:5214/swagger` (ou `https://localhost:7074/swagger` com o perfil HTTPS)

### ☁️ Demo Online e Deploy (Docker + Render)

O repositório já inclui `Dockerfile` multi-stage (.NET 8) e `render.yaml` prontos para deploy gratuito no **Render**, com leitura automática da variável de ambiente `PORT`, suporte a cabeçalhos de proxy reverso (`ForwardedHeaders`), health check em `/health` e botão **Restaurar Demo** (`POST /api/incidents/reset-demo`).

#### Rodar via Docker localmente

```powershell
docker build -t healthcare-ticket-engine .
docker run -p 8080:8080 healthcare-ticket-engine
```

Acesse `http://localhost:8080/` (ou `http://localhost:8080/swagger`).

#### Publicar grátis no Render

1. Crie uma conta em [render.com](https://render.com) conectando seu GitHub.
2. Clique em **New +** → **Blueprint** (ou **Web Service**) e selecione `Gaicos/HealthCare-Ticket-Engine`.
3. O Render lerá automaticamente o `render.yaml` e o `Dockerfile` no plano **Free**.
4. Ao finalizar o build, qualquer recrutador poderá abrir e testar a URL pública diretamente do navegador.

### 📡 Endpoints da API

| Método | Rota | Descrição | Respostas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/incidents` | Lista todos os incidentes ordenados por prioridade e antiguidade. Aceita filtro `?status=Aberto\|EmAnalise\|Resolvido` | `200`, `400` |
| `GET` | `/api/incidents/{id}` | Busca um incidente específico pelo `Guid` | `200`, `400`, `404` |
| `POST` | `/api/incidents` | Cria um novo incidente N2 com cálculo automático de SLA | `201`, `400` |
| `PUT` | `/api/incidents/{id}/analyze` | Move um incidente `Aberto` para `EmAnalise` | `200`, `404`, `409` |
| `PUT` | `/api/incidents/{id}/resolve` | Marca o incidente como `Resolvido` e grava `ResolvedAt` (UTC) | `200`, `404`, `409` |
| `POST` | `/api/incidents/reset-demo` | Restaura os 3 chamados hospitalares iniciais para demonstração | `200` |
| `GET` | `/health` | Health check da aplicação para monitoramento em nuvem | `200` |

#### Exemplo de Payload (`POST /api/incidents`)

```json
{
  "title": "Falha na autorização de exames de imagem",
  "description": "Integração TISS retorna timeout intermitente no setor de radiologia.",
  "priority": "Critica",
  "serviceAffected": "AutorizacaoMedica"
}
```

#### Exemplo de Resposta de Erro (`409 Conflict` / `ProblemDetails`)

```json
{
  "title": "Conflito de estado do incidente",
  "status": 409,
  "detail": "O incidente '11111111-1111-1111-1111-111111111111' já foi resolvido em 2026-11-24T14:55:00.0000000Z.",
  "instance": "/api/incidents/11111111-1111-1111-1111-111111111111/resolve",
  "traceId": "0HN...",
  "timestamp": "2026-11-24T14:55:05Z"
}
```

### 🗺️ Roadmap

- [x] Containerização com Docker e blueprint de deploy para Render
- [ ] Persistência com Entity Framework Core (SQL Server / PostgreSQL)
- [ ] Testes unitários e de integração com xUnit + WebApplicationFactory
- [ ] Registro de notas de atendimento N2 e histórico de comentários

### 📚 Livro Didático Completo (Do Zero ao Ar em Produção)

Quer aprender como cada arquivo deste projeto foi construído **linha por linha** — começando pela lógica de programação básica até API REST, Painel Web, Docker e Deploy na Nuvem? Acesse o livro didático dentro do próprio repositório:

- 📖 [Sumário Navegável — 12 Capítulos + Apêndice](docs/livro/README.md)
- 📄 [LIVRO-COMPLETO.md (Leitura contínua direto no GitHub)](docs/livro/LIVRO-COMPLETO.md)
- 🌐 [LIVRO-COMPLETO.html (Leitor interativo com temas e impressão em PDF)](docs/livro/LIVRO-COMPLETO.html)

---

## 🇺🇸 English

RESTful API built with **ASP.NET Core (.NET 8)** for **Level 2 (N2) incident management, triage, and SLA tracking in healthcare and hospital operations** (medical authorization, EHR, physician portal, and healthcare integration pipelines).

### 🎯 N2 Operations & SLA Focus

In mission-critical healthcare environments, triage speed directly affects patient care workflows. The engine automatically sorts the queue by **highest severity first** (`Critica` → `Baixa`) and **oldest ticket first** (`CreatedAt` ascending), while computing the SLA target (`SlaDeadline`) and breach status (`IsSlaBreached`) in real time:

| Priority | N2 SLA Target | Typical Healthcare Scenario |
| :--- | :--- | :--- |
| `Critica` | **1 hour** | Total outage of medical authorization, ER intake, or EHR |
| `Alta` | **4 hours** | Severe latency or partial failures in Physician Portal / lab results |
| `Media` | **8 hours** | Isolated errors in elective workflows with operational workarounds |
| `Baixa` | **24 hours** | Configuration tweaks, technical questions, or non-blocking issues |

### 🧱 Architecture & Design Patterns

- **User-Friendly Web Dashboard (`wwwroot/`)**: Clean clinical dashboard served directly at `/` so non-technical users can monitor KPIs, filter tickets, open new incidents, and track SLA countdowns — with a live **API X-Ray** learning bar (`GET`, `POST`, `PUT`) and one-click access to Swagger UI.
- **Controllers + DTOs + Validation**: Clear separation between domain entity (`IncidentTicket`) and input contract (`CreateIncidentRequest`) using `DataAnnotations` and string-based enum JSON serialization (`JsonStringEnumConverter`).
- **Repository Pattern + Dependency Injection**: `IIncidentRepository` decoupled from `InMemoryIncidentRepository` (thread-safe `ConcurrentDictionary` preloaded with realistic seed tickets), registered in `Program.cs` via `.AddScoped<IIncidentRepository, InMemoryIncidentRepository>()` — ready to swap for an EF Core `DbContext` without touching controllers.
- **Global Exception Handling (`.NET 8 IExceptionHandler`)**: `GlobalExceptionHandler` intercepts unhandled failures and domain conflicts (e.g., resolving an already-resolved ticket) and returns clean **RFC 7807 `ProblemDetails`** JSON payloads enriched with `traceId` and `timestamp`.
- **Interactive Documentation (Swagger / OpenAPI)**: Full OpenAPI spec powered by XML doc comments and `[ProducesResponseType]` metadata.

### 🚀 Getting Started

Prerequisite: [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).

```powershell
git clone https://github.com/Gaicos/HealthCare-Ticket-Engine.git
cd HealthCare-Ticket-Engine
dotnet restore
dotnet run
```

Open in your browser:

- **Web Dashboard**: `http://localhost:5214/`
- **Technical API (Swagger UI)**: `http://localhost:5214/swagger` (or `https://localhost:7074/swagger` when using the HTTPS profile)

### ☁️ Live Demo & Cloud Deploy (Docker + Render)

This repository includes a multi-stage `.NET 8` `Dockerfile` and a `render.yaml` Blueprint for free deployment on **Render**, featuring automatic `PORT` binding, reverse-proxy `ForwardedHeaders` support, a `/health` probe, and a one-click **Restaurar Demo** (`POST /api/incidents/reset-demo`) reset action.

```powershell
docker build -t healthcare-ticket-engine .
docker run -p 8080:8080 healthcare-ticket-engine
```

### 📡 API Endpoints

| Method | Route | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/incidents` | Lists all incidents ordered by priority and age. Optional `?status=Aberto\|EmAnalise\|Resolvido` filter | `200`, `400` |
| `GET` | `/api/incidents/{id}` | Retrieves a single incident by `Guid` | `200`, `400`, `404` |
| `POST` | `/api/incidents` | Creates a new N2 incident with automatic SLA deadline calculation | `201`, `400` |
| `PUT` | `/api/incidents/{id}/analyze` | Moves an `Aberto` incident to `EmAnalise` | `200`, `404`, `409` |
| `PUT` | `/api/incidents/{id}/resolve` | Marks an incident as `Resolvido` and sets `ResolvedAt` (UTC) | `200`, `404`, `409` |
| `POST` | `/api/incidents/reset-demo` | Restores the 3 initial sample hospital incidents for live demos | `200` |
| `GET` | `/health` | Health check probe for cloud container platforms | `200` |

#### Sample Request (`POST /api/incidents`)

```json
{
  "title": "Imaging authorization service returning timeouts",
  "description": "TISS integration gateway is intermittently timing out for radiology orders.",
  "priority": "Critica",
  "serviceAffected": "AutorizacaoMedica"
}
```

### 📚 Complete Step-by-Step Book (Portuguese)

Want to learn how every single file in this repository works from programming fundamentals to .NET 8 Web API, Front-End, Docker, and Cloud Deploy?

- 📖 [Table of Contents — 12 Chapters + Appendix](docs/livro/README.md)
- 📄 [LIVRO-COMPLETO.md (Continuous GitHub reading)](docs/livro/LIVRO-COMPLETO.md)
- 🌐 [LIVRO-COMPLETO.html (Interactive reader & PDF export)](docs/livro/LIVRO-COMPLETO.html)

### 👤 Author / Autor

**João** — [github.com/Gaicos](https://github.com/Gaicos)
