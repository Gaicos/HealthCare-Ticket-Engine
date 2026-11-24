# Capítulo 2 — Como a Web Funciona e o Mundo C# / .NET

Agora que você domina os blocos básicos da lógica de programação, vamos dar um passo para trás e enxergar o palco onde o nosso sistema trabalha: **a Web** e o ecossistema **C# / .NET 8**.

Você já abriu dezenas de sites e aplicativos hoje. Mas o que acontece exatamente nos 200 milissegundos depois que você clica em um botão? Entender isso vai transformar todo o código dos próximos capítulos em algo óbvio e previsível.

---

## 2.1 Cliente, Servidor e API: a analogia do restaurante

Imagine que você entrou em um restaurante para almoçar:
- **Você sentado na mesa** é o **Cliente** (no mundo Web, é o navegador Chrome/Edge rodando o nosso Painel Visual em HTML/JS, ou o Swagger, ou um aplicativo de celular).
- **A cozinha lá atrás** é o **Servidor** (o nosso programa em C# / ASP.NET Core processando regras de SLA e guardando os chamados).
- **O garçom** que anota o seu pedido no bloco, leva até a cozinha e traz o prato pronto na bandeja é a **API** (*Application Programming Interface*).

```text
[ Cliente / Navegador ]  -- Pedido (Requisição HTTP + JSON) -->  [ API C# / .NET 8 ]
[  (Mesa do Cliente)  ]  <-- Resposta (Status + JSON)        --  [ (Cozinha / Regras) ]
```

Por que você não entra direto na cozinha do restaurante para pegar a panela? Por segurança, organização e higiene! Da mesma forma, o usuário no navegador nunca acessa diretamente a memória ou o banco de dados do servidor; tudo passa pelas rotas controladas da **API RESTful**.

---

## 2.2 O idioma da Web: Verbos HTTP e Códigos de Status

Quando o navegador conversa com a API, ele usa um protocolo chamado **HTTP** (*HyperText Transfer Protocol*). Toda conversa HTTP tem um **Verbo** (o que você quer fazer) e uma **Resposta com Código Numérico** (se deu certo ou não).

### Os Verbos HTTP que usamos no HealthCare Ticket Engine

| Verbo | Significado em Português | Exemplo no Nosso Sistema |
| :--- | :--- | :--- |
| **`GET`** | **Buscar / Ler** (não altera nada) | `GET /api/incidents` → Listar chamados na tela |
| **`POST`** | **Criar / Enviar novo dado** | `POST /api/incidents` → Abrir um novo chamado |
| **`PUT`** | **Atualizar / Executar transição** | `PUT /api/incidents/{id}/resolve` → Marcar chamado como resolvido |
| **`DELETE`** | **Apagar** | *(Não usamos aqui; em hospitais preservamos histórico de incidentes!)* |

### Os Códigos de Status HTTP (o semáforo das respostas)

A família do número já entrega o resultado antes mesmo de você ler a mensagem:
- **Família `2xx` (Sucesso):**
  - **`200 OK`**: Deu tudo certo e aqui estão os dados pedidos.
  - **`201 Created`**: Novo recurso criado com sucesso no servidor (usado ao abrir chamado).
- **Família `4xx` (Erro do Cliente / Regra de Negócio):**
  - **`400 Bad Request`**: Você mandou dados inválidos ou faltando campos obrigatórios (ex.: título com 2 letras).
  - **`404 Not Found`**: O endereço ou ID procurado não existe (ex.: buscar um chamado com GUID inventado).
  - **`409 Conflict`**: A ação entra em conflito com o estado atual (ex.: tentar resolver um chamado que já está resolvido!).
- **Família `5xx` (Erro do Servidor):**
  - **`500 Internal Server Error`**: Algo inesperado quebrou dentro da cozinha (nosso código).

> **Dica Sênior:** Em entrevistas técnicas para vagas de API, saber a diferença entre **`400`** (formato/campo inválido), **`404`** (não encontrado) e **`409`** (conflito de estado de negócio) mostra maturidade imediata.

---

## 2.3 JSON: a caixa padrão de transporte de dados

Quando a API responde ao navegador, ela não manda uma tabela do Word nem um objeto C# bruto — porque o JavaScript do navegador não fala C# nativamente, e um app Android também não. Eles precisam de um formato universal de texto que qualquer linguagem entenda. Esse formato chama-se **JSON** (*JavaScript Object Notation*).

Veja um chamado real devolvido pela nossa API em JSON:

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "title": "Lentidão crítica na fila de autorizações TISS",
  "description": "O gateway de integração com operadoras está acumulando solicitações.",
  "priority": "Critica",
  "status": "Aberto",
  "serviceAffected": "AutorizacaoMedica",
  "createdAt": "2026-11-24T14:20:00Z",
  "resolvedAt": null,
  "slaDeadline": "2026-11-24T15:20:00Z",
  "isSlaBreached": false
}
```

Perceba como o JSON é intuitivo:
- Tudo fica dentro de chaves `{ ... }`.
- Cada linha tem `"nomeDoCampo": valor`.
- Textos ficam entre aspas; `false`/`true` e `null` ficam sem aspas.
- Se houver uma **lista** de vários chamados, eles ficam dentro de colchetes `[ { ... }, { ... } ]`.

No ASP.NET Core, existe um tradutor automático (chamado *serializador JSON*): ele transforma nossos objetos C# em texto JSON na saída, e transforma o JSON que chega do navegador de volta em objetos C# na entrada!

---

## 2.4 O que é C#, .NET 8 e ASP.NET Core?

É muito comum confundir esses três nomes. Veja a diferença em uma frase cada:
- **C# (C-Sharp):** É a **linguagem de programação** (o idioma que escrevemos: `if`, `class`, `string`, `async`).
- **.NET 8:** É a **plataforma completa** da Microsoft (o motor que compila e executa o código C#, junto com milhares de ferramentas prontas para datas, textos, listas e arquivos). A versão `8` é **LTS** (*Long-Term Support*), ou seja, uma versão estável e muito usada em empresas.
- **ASP.NET Core:** É o **framework Web** que vive dentro do .NET para construir APIs, sites, autenticação, Swagger e servidores HTTP de altíssima velocidade.

---

## 2.5 Orientação a Objetos (POO) em 5 minutos práticos

C# é uma linguagem **Orientada a Objetos**. Em vez de soltar centenas de variáveis avulsas pelo código, agrupamos dados e comportamentos que pertencem à mesma coisa do mundo real.

Para construir o HealthCare Ticket Engine, você só precisa entender 5 palavras de POO:

1. **Classe (`class`)**: É a **planta arquitetônica** ou o **molde**. A classe `IncidentTicket` descreve quais campos todo chamado tem (`Title`, `Priority`, `Status`) e o que ele sabe fazer (`StartAnalysis()`, `Resolve()`).
2. **Objeto / Instância**: É a **casa construída a partir da planta**. Se temos 3 chamados abertos na tela, temos **1 classe** `IncidentTicket` e **3 objetos** criados com a palavra `new IncidentTicket()`.
3. **Propriedade**: É uma característica guardada dentro do objeto (ex.: `ticket.Title`, `ticket.Priority`).
4. **Método**: É uma ação que o objeto sabe executar (ex.: `ticket.Resolve()`).
5. **Encapsulamento e Interface**:
   - **Encapsulamento** significa proteger regras importantes dentro do objeto em vez de deixar qualquer parte do código alterar um campo de qualquer jeito. Por exemplo, em vez de mudar `ticket.Status = IncidentStatus.Resolvido` manualmente esquecendo de gravar `ResolvedAt`, chamamos `ticket.Resolve()`, que faz os dois juntos e impede resolver duas vezes!
   - **Interface (`interface`)** é um **contrato** dizendo *quais ações* devem existir, sem dizer *como* são feitas por dentro (veremos no Capítulo 6 com `IIncidentRepository`).

---

## 2.6 O Domínio do Projeto: Sustentação N2 Hospitalar e SLAs

Todo software profissional resolve um problema de negócio real. O nosso resolve a **Sustentação Nível 2 (N2)** de sistemas de saúde:

- **N1 (Nível 1):** Atendimento inicial (troca de senha, dúvidas básicas de uso).
- **N2 (Nível 2):** Analistas e engenheiros de sustentação que investigam falhas técnicas em sistemas críticos: autorização de convênios médicos (`AutorizacaoMedica`), portal usado por plantonistas (`PortalDoMedico`), prontuário eletrônico (`ProntuarioEletronico`).

Em um hospital, falhas têm prazos máximos contratuais de resolução chamados **SLA (*Service Level Agreement*)**. No **HealthCare Ticket Engine**, definimos 4 níveis claros:

| Prioridade | Meta de SLA | Cenário Hospitalar Típico |
| :--- | :--- | :--- |
| **`Critica`** | **1 hora** | Parada total de autorização médica, pronto-socorro ou prontuário |
| **`Alta`** | **4 horas** | Lentidão severa ou erros intermitentes no Portal do Médico |
| **`Media`** | **8 horas** | Falha em guia eletiva com alternativa operacional temporária |
| **`Baixa`** | **24 horas** | Ajustes cadastrais ou dúvidas técnicas sem impacto no paciente |

E o ciclo de vida de todo chamado segue exatamente 3 etapas:

```text
  [ Aberto ]  --->  [ EmAnalise ]  --->  [ Resolvido ]
 (Recém-criado)    (N2 investigando)     (Concluído + ResolvedAt)
```

---

> **Resumo do Capítulo:**
> - O navegador (Cliente) conversa com o Servidor C# através de uma **API HTTP** trocando textos no formato **JSON**.
> - Usamos **`GET`** (ler), **`POST`** (criar) e **`PUT`** (atualizar estado), respondendo com códigos como `200`, `201`, `400`, `404`, `409` e `500`.
> - **C#** é a linguagem, **.NET 8** é a plataforma, **ASP.NET Core** é o framework Web.
> - **Classes** são moldes, **Objetos** são os registros concretos na memória.

---

## Exercícios de Fixação

1. Qual verbo HTTP e qual código de status a API deve usar quando um usuário preenche o formulário e **cria um novo chamado com sucesso**?
2. Se alguém tentar acessar `GET /api/incidents/99999999-9999-9999-9999-999999999999` (um ID que não existe), qual código HTTP faz mais sentido retornar: `400`, `404` ou `500`? Por quê?
3. Explique com suas palavras a diferença entre **Classe** e **Objeto** usando o exemplo de uma ficha médica.
4. Um chamado com prioridade `Critica` foi aberto às `10:00 UTC`. Qual será o `SlaDeadline` dele? Se a equipe resolver às `11:20 UTC`, qual deve ser o valor de `IsSlaBreached`?

---

## Gabarito Comentado

1. Verbo **`POST`** e código **`201 Created`** (pois um novo recurso foi criado no servidor).
2. **`404 Not Found`**. O formato do ID é válido (não é `400`), e o servidor não quebrou (não é `500`); o registro simplesmente não foi encontrado.
3. A **Classe** é o modelo em branco da ficha médica (define os campos: Nome, CPF, Sintomas). Cada **Objeto** é uma ficha preenchida de um paciente específico na recepção.
4. Para prioridade `Critica` (1 hora), o `SlaDeadline` será `11:00 UTC`. Como foi resolvido às `11:20 UTC` (depois do prazo limite), `IsSlaBreached` será **`true`** (SLA estourado).
