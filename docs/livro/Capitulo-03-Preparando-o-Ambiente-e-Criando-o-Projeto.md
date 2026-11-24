# Capítulo 3 — Preparando o Ambiente e Criando o Projeto

Chegou a hora de colocar a mão no teclado! Neste capítulo, vamos preparar seu computador Windows, criar o esqueleto oficial do projeto **HealthCare-Ticket-Engine** usando o terminal e entender cada arquivo de configuração que nasce junto com ele.

---

## 3.1 SDK vs Runtime: a armadilha mais comum de iniciantes

Muitas pessoas tentam rodar o comando `dotnet new` e levam um susto ao ver a mensagem *"Nenhum SDK do .NET foi encontrado"*, mesmo tendo instalado algo da Microsoft antes. Isso acontece por causa da diferença entre **Runtime** e **SDK**:

> **Analogia:** O **Runtime** é como um **leitor de PDF** — ele só serve para abrir e rodar programas prontos que outra pessoa criou. O **SDK** (*Software Development Kit*) é a **oficina completa** — ele traz o compilador, os modelos de projeto e todas as ferramentas para você *escrever e construir* novos sistemas.

Para desenvolver, precisamos obrigatoriamente do **.NET 8 SDK**.

### Instalando as ferramentas no Windows

Abra o **PowerShell** e confira o que você já tem instalado:

```powershell
dotnet --list-sdks
git --version
code --version
```

Se algum deles faltar:
1. **Instalar .NET 8 SDK:**
   ```powershell
   winget install Microsoft.DotNet.SDK.8
   ```
   *(Depois de instalar, feche e abra um novo PowerShell para o sistema reconhecer o comando `dotnet`.)*
2. **VS Code (Editor de Código):** baixe em [code.visualstudio.com](https://code.visualstudio.com/) e instale a extensão oficial **C# Dev Kit** (da Microsoft).
3. **Git:** baixe em [git-scm.com](https://git-scm.com/) para versionar e enviar seu projeto ao GitHub.

---

## 3.2 Criando o projeto e as pastas pelo PowerShell

Vamos usar o **CLI** (*Command-Line Interface*) do .NET. Em vez de depender de telas ocultas, aprender os comandos no terminal faz você dominar a ferramenta de verdade.

Execute estes comandos passo a passo no PowerShell:

```powershell
# 1. Crie ou entre na pasta onde você guarda seus projetos
mkdir "d:\PROGRAMAÇÃO\PROJETO C#" -Force
cd "d:\PROGRAMAÇÃO\PROJETO C#"

# 2. Crie a Web API em .NET 8 já configurada com Controllers e Swagger
dotnet new webapi -o HealthCare-Ticket-Engine --use-controllers -f net8.0

# 3. Entre na pasta recém-criada do projeto
cd HealthCare-Ticket-Engine

# 4. Crie as pastas da nossa arquitetura limpa
mkdir Models, DTOs, Repositories, Middlewares, wwwroot

# 5. Remova os arquivos de exemplo de previsão do tempo que vêm no template padrão
Remove-Item WeatherForecast.cs, Controllers\WeatherForecastController.cs -ErrorAction SilentlyContinue

# 6. Crie o arquivo .gitignore oficial para projetos .NET
dotnet new gitignore

# 7. Teste se a compilação inicial funciona e abra no VS Code
dotnet build
code .
```

### Por que passamos `--use-controllers -f net8.0`?

- **`-o HealthCare-Ticket-Engine`:** cria uma pasta com esse nome (*output*) e coloca todos os arquivos dentro dela.
- **`--use-controllers`:** no .NET 8, o modelo padrão cria *Minimal APIs* (todas as rotas soltas no `Program.cs`). Como queremos uma arquitetura organizada por pastas e fácil de escalar em times corporativos, `--use-controllers` gera a pasta `Controllers/` e configura o **Swagger (`Swashbuckle.AspNetCore`)** automaticamente.
- **`-f net8.0`:** trava a versão do projeto no **.NET 8**, mesmo se no futuro você instalar o .NET 9 ou 10 no seu PC.
- **`dotnet new gitignore`:** gera um arquivo `.gitignore` perfeito que impede subir pastas pesadas geradas automaticamente (`bin/` e `obj/`) para o GitHub.

---

## 3.3 Anatomia dos Arquivos de Configuração

Antes de escrever nosso código C#, vamos abrir os três arquivos de configuração que sustentam o projeto.

### 1. `HealthCare-Ticket-Engine.csproj` (A carteira de identidade do projeto)

Este arquivo XML diz ao compilador qual versão do .NET usar, como compilar e quais pacotes externos (bibliotecas NuGet) o projeto precisa:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>HealthCare_Ticket_Engine</RootNamespace>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);1591</NoWarn>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />
  </ItemGroup>

</Project>
```

Vamos dissecar cada linha:
- `<Project Sdk="Microsoft.NET.Sdk.Web">`: avisa que este não é um programinha simples de console, e sim uma **aplicação Web ASP.NET Core** com servidor HTTP embutido.
- `<TargetFramework>net8.0</TargetFramework>`: define o alvo como .NET 8.
- `<Nullable>enable</Nullable>`: ativa a proteção contra nulos que vimos no Capítulo 1 (obrigando a usar `?` quando algo puder ser `null`).
- `<ImplicitUsings>enable</ImplicitUsings>`: importa automaticamente pacotes básicos (`System`, `System.Collections.Generic`, etc.) para não precisarmos repetir dezenas de linhas `using` no topo de cada arquivo.
- `<RootNamespace>HealthCare_Ticket_Engine</RootNamespace>`: **detalhe importante!** Como nomes de namespace em C# não aceitam hífen (`-`), o .NET troca os hífens da pasta por *underscores* (`_`). Todos os nossos arquivos usarão `namespace HealthCare_Ticket_Engine...`.
- `<GenerateDocumentationFile>true</GenerateDocumentationFile>`: pede ao compilador para salvar todos os comentários `///` que escrevermos em cima dos endpoints dentro de um arquivo `.xml`. O **Swagger** lerá esse `.xml` para mostrar descrições ricas na documentação da API!
- `<NoWarn>$(NoWarn);1591</NoWarn>`: ao ligar a geração de XML, o compilador gera o aviso `CS1591` para qualquer classe/propriedade sem comentário `///`. Essa linha silencia esse aviso específico para manter nosso build limpo com **0 avisos**.
- `<PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />`: instala a biblioteca responsável pela interface interativa do **Swagger / OpenAPI**.

---

### 2. `appsettings.json` (Configurações gerais e nível de logs)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Aqui controlamos o quanto o servidor "conversa" no terminal (logs). `"Default": "Information"` mostra nossos logs úteis de abertura/resolução de chamados, enquanto `"Microsoft.AspNetCore": "Warning"` evita que o terminal fique poluído com dezenas de logs internos a cada segundo.

---

### 3. `Properties/launchSettings.json` (Como o projeto abre no seu PC)

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "",
      "applicationUrl": "http://localhost:5214",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

*(Versão simplificada mostrando o perfil principal `http`.)*

Veja o que acontece quando você digita `dotnet run` no seu computador:
1. O .NET lê `Properties/launchSettings.json` (esse arquivo só vale para rodar localmente — na nuvem ele é ignorado).
2. `"applicationUrl": "http://localhost:5214"` coloca o servidor ouvindo na porta `5214` da sua máquina.
3. `"launchBrowser": true` + `"launchUrl": ""` abre seu navegador automaticamente direto na raiz `http://localhost:5214/` (onde ficará o nosso Painel Visual).
4. `"ASPNETCORE_ENVIRONMENT": "Development"` avisa ao servidor que você está em ambiente de desenvolvimento (local), e não em produção na nuvem.

---

> **Resumo do Capítulo:**
> - Precisamos do **.NET 8 SDK** (não apenas do Runtime) para criar e compilar projetos.
> - Criamos a estrutura com `dotnet new webapi -o HealthCare-Ticket-Engine --use-controllers -f net8.0`.
> - O `.csproj` define o `.NET 8`, ativa o suporte a nulabilidade (`Nullable`), gera XML para o Swagger e referencia o `Swashbuckle.AspNetCore`.
> - O `launchSettings.json` define a porta local (`5214`) e o ambiente `Development`.

---

## Exercícios de Fixação

1. Por que o `<RootNamespace>` no arquivo `.csproj` apareceu como `HealthCare_Ticket_Engine` (com `_`) se o nome do projeto tem hífens (`HealthCare-Ticket-Engine`)?
2. Para que serve o comando `dotnet new gitignore` antes de enviar o projeto para o GitHub?
3. O que mudaria na sua API se você esquecesse `<GenerateDocumentationFile>true</GenerateDocumentationFile>` no `.csproj`?
4. Qual arquivo define que, ao rodar `dotnet run` localmente, o endereço padrão será `http://localhost:5214`?

---

## Gabarito Comentado

1. Porque em C# o caractere hífen (`-`) significa sinal de subtração e não é permitido em nomes de identificadores ou *namespaces*. O .NET converte automaticamente o hífen em underscore (`_`).
2. Ele cria o arquivo `.gitignore`, garantindo que pastas pesadas e temporárias geradas pela compilação (`bin/` e `obj/`) nunca sejam enviadas ao repositório no GitHub.
3. A API continuaria funcionando normalmente, porém o arquivo `.xml` não seria gerado na compilação — fazendo com que as descrições detalhadas em `///` não aparecessem dentro da interface do Swagger.
4. O arquivo `Properties/launchSettings.json` (usado apenas em desenvolvimento local).
