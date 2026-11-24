# Capítulo 11 — Docker, Git, GitHub e Deploy na Nuvem

Um sistema incrível que só roda na tela do seu computador ninguém consegue contratar ou testar. Nesta reta final, vamos transformar o **HealthCare-Ticket-Engine** em um produto acessível para qualquer pessoa ou recrutador no mundo usando três pilares profissionais:
1. **Git e GitHub** para guardar o histórico do seu código com segurança.
2. **Docker** para empacotar a aplicação de forma idêntica em qualquer computador.
3. **Render** para colocar esse pacote no ar com URL `https://` gratuita.

---

## 11.1 Git e GitHub: a máquina do tempo do seu código

Muita gente confunde os dois:
- **Git** é o programa instalado no seu PC que tira "fotos" (chamadas de **commits**) de como o código estava em cada momento da história. Se você quebrar algo amanhã, consegue voltar para o commit de ontem.
- **GitHub** é a rede social / nuvem na internet onde você sobe essas fotos para guardar backup, trabalhar em equipe e mostrar seu portfólio para empresas.

### Os comandos essenciais no fluxo real

```powershell
# 1. Configurar quem é o autor dos commits (vincular ao seu perfil GitHub)
git config --global user.name "Gaicos"
git config --global user.email "joaovitor.ribeirob@gmail.com"

# 2. Iniciar o Git na pasta do projeto e nomear a linha principal como 'main'
git init
git branch -M main

# 3. Selecionar os arquivos (respeitando o .gitignore) e gravar a foto (commit)
git add .
git status
git commit -m "feat: add HealthCare-Ticket-Engine .NET 8 Web API, N2 dashboard and Swagger"

# 4. Conectar ao repositório do GitHub e enviar
git remote add origin https://github.com/Gaicos/HealthCare-Ticket-Engine.git
git push -u origin main
```

> **Atenção:** Nunca envie as pastas `bin/` e `obj/` (que pesam dezenas de megabytes e mudam a cada compilação) nem senhas! O `.gitignore` gerado no Capítulo 3 garante que elas fiquem de fora automaticamente.

---

## 11.2 Docker: a analogia do contêiner de navio

Já ouviu a famosa piada da área de TI: *"Na minha máquina funciona!"*?
Às vezes você desenvolve no Windows com .NET 8.0.428 e envia para um servidor Linux na nuvem onde falta uma biblioteca ou a versão é outra.

> **Analogia:** Antes dos contêineres metálicos padronizados, carregar um navio exigia empilhar sacos, caixas de madeira e barris de formatos diferentes, demorava semanas e estragava carga no caminho. Quando inventaram o **contêiner padrão**, qualquer guindaste, caminhão ou navio no mundo inteiro consegue transportar a caixa fechada exatamente igual!
> 
> O **Docker** faz o mesmo com código: ele fecha seu projeto junto com o .NET 8 Linux exato dentro de uma **Imagem Docker**, que roda idêntica no seu notebook, no servidor da empresa ou na nuvem do Render.

---

## 11.3 O código completo do `Dockerfile` (Multi-Stage Build)

Crie na raiz do projeto o arquivo `Dockerfile` (sem extensão!):

```dockerfile
# Stage 1: Build & Publish (.NET 8 SDK)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["HealthCare-Ticket-Engine.csproj", "./"]
RUN dotnet restore "HealthCare-Ticket-Engine.csproj"

COPY . .
RUN dotnet publish "HealthCare-Ticket-Engine.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime (.NET 8 ASP.NET Core)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "HealthCare-Ticket-Engine.dll"]
```

### Por que dividimos o `Dockerfile` em 2 estágios (`build` e `final`)?

Esse truque chama-se **Multi-Stage Build** (construção em múltiplos estágios) e mostra cuidado sênior com performance e segurança:

```text
[ Stage 1: sdk:8.0 (~800 MB) ]           [ Stage 2: aspnet:8.0 (~220 MB) ]
  Copia .csproj -> dotnet restore   --->   Copia APENAS a pasta /app/publish
  Copia codigo  -> dotnet publish          (Sem SDK, sem codigo-fonte bruto!)
                                           Roda: dotnet HealthCare-Ticket-Engine.dll
```

1. **Estágio 1 (`AS build`):** Usa a imagem grande com o **.NET 8 SDK** completo para baixar pacotes (`dotnet restore`) e compilar em modo otimizado (`-c Release`).
   - *Detalhe inteligente de cache:* Copiamos o `.csproj` e rodamos `dotnet restore` **antes** de copiar o resto do código (`COPY . .`). Assim, quando você altera apenas uma frase no `README.md` ou no `app.js`, o Docker reaproveita os pacotes já baixados e o build fica muito mais rápido!
2. **Estágio 2 (`AS final`):** Descarta a oficina gigante do SDK e começa do zero em uma imagem leve que tem **apenas o Runtime ASP.NET Core** (`aspnet:8.0`). Copia somente os arquivos compilados (`COPY --from=build /app/publish .`), define `ASPNETCORE_ENVIRONMENT=Production`, define porta padrão `8080` e liga a API com `ENTRYPOINT ["dotnet", "HealthCare-Ticket-Engine.dll"]`.

---

## 11.4 Filtrando lixo da imagem: `.dockerignore`

Assim como o `.gitignore` protege o Git, o `.dockerignore` impede o Docker de copiar arquivos desnecessários da sua máquina para dentro do build:

```gitignore
**/.git
**/.gitignore
**/.vs
**/.vscode
**/bin
**/obj
**/*.user
**/*.suo
README.md
HealthCare-Ticket-Engine.http
```

---

## 11.5 Automatizando a nuvem com `render.yaml`

O arquivo `render.yaml` funciona como um mapa de instruções (**Infraestrutura como Código** / *Blueprint*) para o **Render**:

```yaml
services:
  - type: web
    name: healthcare-ticket-engine
    runtime: docker
    plan: free
    dockerfilePath: ./Dockerfile
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
```

Veja como tudo o que fizemos nos capítulos anteriores se encaixa perfeitamente aqui:
- `runtime: docker` + `dockerfilePath: ./Dockerfile`: manda o Render construir o nosso `Dockerfile`.
- `plan: free`: usa o plano gratuito (sem precisar cadastrar cartão de crédito).
- `healthCheckPath: /health`: o Render chama o endpoint `/health` que criamos no `Program.cs` (Capítulo 9) para confirmar que o container iniciou sem erros antes de liberar o tráfego.
- `autoDeploy: true`: sempre que você fizer um `git push` para a branch `main`, o Render atualiza o site no ar automaticamente!
- O Render injeta uma variável `PORT` dinâmica, nosso `Program.cs` lê essa `PORT` e configura `UseForwardedHeaders()`, entregando o site pronto em `https://...`!

### Como publicar e exibir para recrutadores

1. Acesse [render.com](https://render.com) e entre com sua conta do GitHub (`Gaicos`).
2. Clique em **New +** → **Blueprint** → selecione `Gaicos/HealthCare-Ticket-Engine` → **Apply**.
3. Em ~2 a 3 minutos, você receberá sua URL pública (ex.: `https://healthcare-ticket-engine.onrender.com`).
4. Cole essa URL:
   - No campo **Website** da caixa **About** (engrenagem no topo direito do repositório no GitHub).
   - No topo do seu `README.md` e nas experiências/projetos do seu **LinkedIn**!
5. *(Lembrete de plano gratuito)*: Se ninguém acessar por 15 minutos, o Render coloca o container para dormir e acorda em ~30 segundos no próximo acesso — reiniciando automaticamente a lista com os 3 chamados limpos de exemplo (além de o recrutador poder clicar em **Restaurar Demo** a qualquer momento).

---

> **Resumo do Capítulo:**
> - **Git** grava histórico local; **GitHub** hospeda na nuvem.
> - **Docker** empacota a aplicação de forma portátil usando **Multi-Stage Build** (`sdk:8.0` → `aspnet:8.0`).
> - `render.yaml` automatiza o deploy gratuito na nuvem com `healthCheckPath: /health` e `autoDeploy: true`.

---

## Exercícios de Fixação

1. Qual a diferença prática entre **Git** e **GitHub**?
2. Por que o `Dockerfile` copia o `.csproj` e executa `dotnet restore` antes de executar `COPY . .`?
3. O que aconteceria com o tamanho da imagem Docker e com a segurança se usássemos apenas o estágio `sdk:8.0` em vez de trocar para `aspnet:8.0` no Estágio 2?
4. Por que o `render.yaml` aponta `healthCheckPath: /health`?

---

## Gabarito Comentado

1. **Git** é a ferramenta instalada localmente para rastrear versões (commits) e branches do código. **GitHub** é a plataforma online onde hospedamos repositórios Git na nuvem para backup, colaboração e portfólio.
2. Para aproveitar o sistema de **cache de camadas do Docker**. Como as dependências NuGet do `.csproj` mudam muito menos do que os arquivos de código, o Docker pula o download de pacotes nas compilações seguintes sempre que o `.csproj` não tiver sido alterado.
3. A imagem ficaria quase 4 vezes maior (cerca de 800 MB em vez de ~220 MB), demoraria mais para subir na nuvem e carregaria compilador e arquivos-fonte desnecessários em ambiente de produção.
4. Para o Render testar periodicamente se a aplicação ASP.NET Core subiu corretamente e está respondendo `200 OK` antes de direcionar os usuários reais para o novo container.
