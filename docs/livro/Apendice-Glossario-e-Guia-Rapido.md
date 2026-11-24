# Apêndice — Glossário A–Z e Guia Rápido de Comandos

Use este apêndice como consulta rápida sempre que encontrar alguma palavra em inglês ou quiser relembrar um comando no terminal.

---

## A. Glossário A–Z em Português Simples

- **Algoritmo**: Sequência lógica e finita de passos para resolver um problema ou executar uma tarefa.
- **API (Application Programming Interface)**: "Garçom" digital que recebe pedidos (requisições HTTP) de clientes (navegador/app), entrega para o servidor processar e devolve a resposta (geralmente em JSON).
- **ASP.NET Core**: Framework Web oficial da Microsoft dentro do .NET para construir APIs, sites e microsserviços de alta performance.
- **Async / Await**: Palavras-chave do C# que permitem esperar operações demoradas (como banco de dados ou rede) sem travar o servidor para os outros usuários.
- **CancellationToken**: Sinal usado para cancelar uma operação assíncrona no meio do caminho se o usuário fechar a página ou cancelar a requisição.
- **Classe (`class`)**: Planta ou molde que define as propriedades (dados) e os métodos (ações) de um objeto.
- **Commit**: "Foto" salva pelo Git registrando exatamente como os arquivos do projeto estavam naquele instante, junto com uma mensagem descritiva.
- **ConcurrentDictionary**: Coleção de chave-valor do .NET preparada para receber leituras e escritas de várias requisições simultâneas sem corromper os dados (*thread-safe*).
- **Controller**: Classe no ASP.NET Core que recebe as rotas HTTP (`GET`, `POST`, `PUT`) e coordena DTOs, Domínio e Repositório para devolver uma resposta.
- **DataAnnotations**: Atributos colocados acima de propriedades (como `[Required]` e `[StringLength]`) para validar dados de entrada automaticamente.
- **Docker**: Plataforma de containerização que empacota o sistema e suas dependências em uma imagem portátil que roda igual em qualquer máquina.
- **DTO (Data Transfer Object)**: Objeto simples usado exclusivamente para transportar dados de entrada ou saída na API, protegendo entidades internas contra alterações indevidas (*Over-Posting*).
- **Encapsulamento**: Princípio de manter regras e proteção dentro da própria classe (ex.: método `Resolve()` alterando `Status` e `ResolvedAt` juntos).
- **Endpoint**: Endereço completo de uma operação na API combinando verbo HTTP e caminho (ex.: `PUT /api/incidents/{id}/resolve`).
- **Enum (`enum`)**: Tipo especial que restringe uma variável a uma lista fechada de opções válidas (ex.: `Baixa`, `Media`, `Alta`, `Critica`).
- **Exceção (`Exception`)**: Erro inesperado ou violação de regra disparada pelo código (com `throw`) que interrompe o fluxo normal até ser tratada.
- **Fetch API**: Função nativa do JavaScript nos navegadores usada para fazer requisições HTTP (`GET`, `POST`, `PUT`) ao servidor sem recarregar a página.
- **Git / GitHub**: Git é o sistema local de controle de versões; GitHub é o serviço na nuvem para hospedar repositórios Git.
- **GUID (Globally Unique Identifier)**: Identificador único de 128 bits no formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, praticamente impossível de duplicar.
- **Health Check (`/health`)**: Rota rápida usada por nuvens e balanceadores para verificar se o servidor está vivo e saudável (`200 OK`).
- **HTTP (Verbos e Status)**: Protocolo da Web. Verbos indicam a intenção (`GET`, `POST`, `PUT`); status indicam o resultado (`200`, `201`, `400`, `404`, `409`, `500`).
- **Injeção de Dependência (DI)**: Técnica onde o sistema entrega automaticamente as dependências necessárias no construtor de uma classe (ex.: entregando `InMemoryIncidentRepository` para quem pede `IIncidentRepository`), conforme configurado no `Program.cs`.
- **Interface (`interface`)**: Contrato que define *quais* métodos uma classe deve ter, sem dizer *como* são implementados por dentro.
- **JSON (JavaScript Object Notation)**: Formato leve de texto usando pares `"chave": valor` para troca de dados entre front-end e back-end.
- **LINQ (Language Integrated Query)**: Conjunto de comandos do C# (`.Where`, `.OrderByDescending`, `.ThenBy`) para filtrar e ordenar coleções com clareza.
- **Middleware**: Peça encadeada no pipeline HTTP que inspeciona ou modifica requisições e respostas (ex.: `UseExceptionHandler`, `UseStaticFiles`).
- **Multi-Stage Build**: Técnica de `Dockerfile` que usa uma imagem grande com compilador para gerar o projeto e copia apenas os binários prontos para uma imagem final leve.
- **Nullable (`?`)**: Marcação em C# permitindo que um tipo aceite `null` (ausência de valor), protegendo o sistema contra erros de referência nula.
- **Over-Posting**: Vulnerabilidade onde um usuário envia campos extras no JSON (como `id` ou `status`) tentando sobrescrever propriedades internas que não deveriam ser editáveis.
- **ProblemDetails (RFC 7807)**: Formato padrão internacional de JSON para respostas de erro em APIs HTTP (`title`, `status`, `detail`, `instance`).
- **Record (`record`)**: Tipo do C# focado em representar dados imutáveis com igualdade por valor — muito usado em DTOs.
- **Repository Pattern**: Padrão que isola a lógica de acesso a dados atrás de uma interface, permitindo trocar memória RAM por SQL Server/PostgreSQL sem alterar regras de negócio.
- **SDK vs. Runtime**: SDK traz ferramentas para construir e compilar código; Runtime traz apenas o motor para executar um programa já compilado.
- **SLA (Service Level Agreement)**: Acordo de nível de serviço definindo o prazo máximo de resolução conforme a criticidade do incidente.
- **Swagger / OpenAPI**: Ferramenta que gera documentação interativa automática da API em `/swagger`, permitindo testar rotas direto no navegador.
- **UTC (Coordinated Universal Time)**: Horário universal padrão sem variação de fuso ou horário de verão, recomendado para gravar datas em servidores.
- **XSS (Cross-Site Scripting)**: Ataque em que códigos HTML/JS maliciosos são inseridos em textos para tentar rodar no navegador de outra vítima — bloqueado pelo nosso `escapeHtml()`.

---

## B. Guia Rápido de Comandos (Cola do Dia a Dia)

### PowerShell e .NET CLI
```powershell
dotnet --list-sdks                     # Ver quais versões do .NET SDK estão instaladas
dotnet new webapi -o Nome --use-controllers -f net8.0   # Criar Web API .NET 8 com Controllers
dotnet new gitignore                   # Gerar .gitignore oficial para .NET
dotnet restore                         # Baixar pacotes NuGet do .csproj
dotnet build                           # Compilar o projeto para verificar erros/avisos
dotnet run                             # Compilar e iniciar o servidor local (http://localhost:5214)
dotnet publish -c Release -o ./pub     # Gerar versão otimizada para produção
```

### Git e GitHub
```powershell
git init                               # Iniciar repositório Git na pasta atual
git branch -M main                     # Garantir que a branch principal se chame 'main'
git status                             # Ver arquivos alterados, novos ou ignorados
git add .                              # Preparar todos os arquivos não ignorados para o commit
git commit -m "mensagem clara"         # Salvar uma nova versão (commit) no histórico local
git remote add origin URL              # Conectar pasta local ao repositório remoto no GitHub
git push -u origin main                # Enviar commits para o GitHub
git log -n 5 --oneline                 # Ver os últimos 5 commits resumidos
```

### Docker
```powershell
docker build -t healthcare-ticket-engine .          # Construir a imagem a partir do Dockerfile
docker run -p 8080:8080 healthcare-ticket-engine    # Subir o container localmente na porta 8080
docker ps                                           # Listar containers em execução
```
