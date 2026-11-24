# Do Zero ao Ar em Produção: Construindo o HealthCare Ticket Engine em C# (.NET 8)

> **Guia Didático Passo a Passo** — da Lógica de Programação Básica até API RESTful, Painel Web, Docker e Deploy na Nuvem.

**Autoria:** Material Didático Personalizado para João (`Gaicos`)  
**Projeto de Referência:** `HealthCare-Ticket-Engine` (ASP.NET Core .NET 8)  
**Público-Alvo:** Iniciantes absolutos em programação até desenvolvedores júnior que querem entender *cada linha* de um projeto profissional de portfólio.

---

## Prefácio: Para quem é este livro?

Muitos tutoriais de programação assumem que você já sabe o que é uma variável, como a internet conversa por baixo dos panos, o que significa `async` ou por que alguém cria uma "Interface" antes de escrever o código de verdade. O resultado costuma ser frustrante: você copia e cola comandos sem entender o que o sistema realmente faz.

Este livro segue o caminho oposto. Nós vamos construir juntos, **do zero absoluto**, um sistema real chamado **HealthCare Ticket Engine** — uma plataforma de triagem e atendimento de chamados técnicos hospitalares (Sustentação N2) com cálculo automático de prazos de urgência (SLA), painel visual amigável para pessoas leigas, documentação técnica interativa (Swagger), proteção contra erros inesperados, Docker e deploy gratuito na nuvem.

Se você nunca programou antes, comece no **Capítulo 1**. Se você já conhece variáveis e `if/else`, ainda assim vale passar os olhos pelos dois primeiros capítulos para alinhar os conceitos com o domínio hospitalar que usaremos até o fim do livro.

---

## Como aproveitar este livro ao máximo

1. **Não pule as analogias.** Toda peça técnica complicada aqui é apresentada primeiro com uma comparação do mundo real (pronto-socorro, restaurante, tomada elétrica, contêiner de navio).
2. **Digite ou acompanhe linha por linha.** Sempre que um arquivo aparecer, logo abaixo dele você encontrará uma dissecação explicando *o que* cada trecho faz e *por que* foi escrito daquela forma.
3. **Faça os exercícios do final de cada capítulo.** Cada capítulo termina com desafios práticos e um **Gabarito Comentado** para você testar o seu raciocínio antes de avançar.
4. **Use a edição HTML para ler com conforto ou gerar PDF.** Veja na seção abaixo como abrir o livro completo em formato de leitor digital.

---

## Visão Geral da Arquitetura do Sistema

Ao terminar este livro, você terá construído e entendido todas as caixas deste mapa:

```text
+-------------------------------------------------------------------------+
|                        NAVEGADOR DO USUÁRIO                             |
|                                                                         |
|   [ Painel Visual (/) ]                     [ Swagger UI (/swagger) ]   |
|   HTML + CSS + JavaScript                   Documentação Técnica        |
+----------------------------+-----------------------------+--------------+
                             |  Requisições HTTP (JSON)    |
                             v                             v
+-------------------------------------------------------------------------+
|                    SERVIDOR ASP.NET CORE (.NET 8)                       |
|                                                                         |
|  Program.cs (O Maestro: porta, headers, DI, Swagger, arquivos estáticos) |
|       |                                                                 |
|       v                                                                 |
|  GlobalExceptionHandler (Converte erros em JSON limpo - RFC 7807)       |
|       |                                                                 |
|       v                                                                 |
|  IncidentsController (Recebe GET / POST / PUT e valida DTOs)            |
|       |                                                                 |
|       v                                                                 |
|  IncidentTicket + Enums (Regras de negócio: SLA, Analyze, Resolve)      |
|       |                                                                 |
|       v                                                                 |
|  IIncidentRepository  --->  InMemoryIncidentRepository (Dados em RAM)   |
+-------------------------------------------------------------------------+
                                     |
                                     v
                     [ Container Docker + Nuvem Render ]
                      (URL Pública HTTPS para Recrutadores)
```

---

## Sumário Completo do Livro

### Parte I — Fundamentos e Preparação
- [Capítulo 1 — Lógica de Programação do Zero](Capitulo-01-Logica-de-Programacao-do-Zero.md)  
  *Algoritmos, variáveis, tipos (`string`, `int`, `bool`, `DateTime`, `Guid`), decisões (`if/else`, `switch`), repetições (`for`, `foreach`), coleções (`List`, `Dictionary`), funções e valores nulos (`null`).*
- [Capítulo 2 — Como a Web Funciona e o Mundo C# / .NET](Capitulo-02-Como-a-Web-Funciona-e-o-Mundo-CSharp-DotNet.md)  
  *Cliente e Servidor, verbos HTTP (`GET`, `POST`, `PUT`), códigos de status (`200`, `201`, `400`, `404`, `409`, `500`), JSON, Orientação a Objetos essencial e o domínio hospitalar N2 + SLAs.*
- [Capítulo 3 — Preparando o Ambiente e Criando o Projeto](Capitulo-03-Preparando-o-Ambiente-e-Criando-o-Projeto.md)  
  *SDK vs Runtime, PowerShell, `dotnet new webapi`, estrutura de pastas, `.gitignore` e anatomia completa de `.csproj`, `appsettings.json` e `launchSettings.json`.*

### Parte II — Construindo o Back-End Profissional em .NET 8
- [Capítulo 4 — Modelando o Coração do Sistema: Models e Enums](Capitulo-04-Modelando-o-Coracao-do-Sistema-Models-e-Enums.md)  
  *Código completo linha a linha de `Models/IncidentEnums.cs` e `Models/IncidentTicket.cs`: propriedades computadas de SLA, fuso UTC, `StartAnalysis()` e `Resolve()`.*
- [Capítulo 5 — Segurança na Entrada: DTOs e Validação](Capitulo-05-Seguranca-na-Entrada-DTOs-e-Validacao.md)  
  *Por que não expor entidades diretamente, proteção contra Over-Posting, `record` vs `class`, e cada anotação de `DTOs/CreateIncidentRequest.cs`.*
- [Capítulo 6 — Guardando Dados: Repository Pattern e Programação Assíncrona](Capitulo-06-Guardando-Dados-Repository-Pattern-e-Async.md)  
  *Interfaces, desacoplamento, `async`/`await`, `Task<T>`, `CancellationToken`, LINQ e código completo de `IIncidentRepository.cs` e `InMemoryIncidentRepository.cs`.*
- [Capítulo 7 — Tratamento Global de Exceções com ProblemDetails](Capitulo-07-Tratamento-Global-de-Excecoes-ProblemDetails.md)  
  *O que são exceções, padrão RFC 7807 (`ProblemDetails`) e dissecação completa de `Middlewares/GlobalExceptionHandler.cs`.*
- [Capítulo 8 — Criando os Endpoints REST no IncidentsController](Capitulo-08-Criando-os-Endpoints-REST-IncidentsController.md)  
  *Roteamento REST, atributos HTTP e código completo das 6 rotas de `Controllers/IncidentsController.cs`, acompanhando uma requisição de ponta a ponta.*
- [Capítulo 9 — O Maestro do Sistema: Program.cs e Swagger](Capitulo-09-O-Maestro-do-Sistema-Program-e-Swagger.md)  
  *Injeção de Dependência (`Transient`, `Scoped`, `Singleton`), ordem exata do pipeline HTTP, Swagger com XML docs, `/health` e testes no `.http`.*

### Parte III — Front-End, Nuvem e Carreira
- [Capítulo 10 — Construindo o Painel Visual com HTML, CSS e JavaScript](Capitulo-10-Construindo-o-Painel-Visual-HTML-CSS-JavaScript.md)  
  *Como `wwwroot/index.html`, `styles.css` e `app.js` transformam a API técnica em uma Central de Chamados clara para leigos — incluindo proteção XSS e a barra **Raio-X da API**.*
- [Capítulo 11 — Docker, Git, GitHub e Deploy na Nuvem](Capitulo-11-Docker-Git-GitHub-e-Deploy-na-Nuvem.md)  
  *Versionamento profissional com Git, build multi-stage em `Dockerfile`, `.dockerignore`, `render.yaml` e publicação gratuita no Render.*
- [Capítulo 12 — Próximos Passos e Evolução para Nível Sênior](Capitulo-12-Proximos-Passos-e-Evolucao-Senior.md)  
  *Migrando para banco de dados real com Entity Framework Core, escrevendo testes automatizados com xUnit, adicionando autenticação JWT e roteiro de entrevista técnica.*

### Material de Apoio
- [Apêndice — Glossário A–Z e Guia Rápido de Comandos](Apendice-Glossario-e-Guia-Rapido.md)  
  *Dicionário em português simples com todos os termos do livro + cola rápida de PowerShell, .NET CLI, Git e Docker.*

---

## Edições Consolidadas (Leitura Contínua e PDF)

Além dos arquivos individuais por capítulo acima, este diretório contém duas edições completas prontas para uso:

- **`LIVRO-COMPLETO.md`**: Todos os 12 capítulos e o Apêndice reunidos em um único arquivo Markdown.
- **`LIVRO-COMPLETO.html`**: Versão interativa com menu lateral de capítulos, barra de progresso de leitura, troca de tema (**Claro / Sépia / Escuro**), botão de copiar código e botão **"Imprimir / Salvar PDF"**.  
  > **Como gerar um PDF lindo:** Abra `LIVRO-COMPLETO.html` no Chrome ou Edge, clique no botão **Imprimir / Salvar PDF** (ou aperte `Ctrl + P`) e escolha o destino **Salvar como PDF**.
