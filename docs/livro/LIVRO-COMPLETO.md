# Do Zero ao Ar em Produção: Construindo o HealthCare Ticket Engine em C# (.NET 8)

> **Guia Didático Passo a Passo** — da Lógica de Programação Básica até API RESTful, Painel Web, Docker e Deploy na Nuvem.

**Autoria:** Material Didático Personalizado para João (`Gaicos`)  
**Projeto de Referência:** `HealthCare-Ticket-Engine` (ASP.NET Core .NET 8)

---

## Sumário

1. Capítulo 1 — Lógica de Programação do Zero
2. Capítulo 2 — Como a Web Funciona e o Mundo C# / .NET
3. Capítulo 3 — Preparando o Ambiente e Criando o Projeto
4. Capítulo 4 — Modelando o Coração do Sistema: Models e Enums
5. Capítulo 5 — Segurança na Entrada: DTOs e Validação
6. Capítulo 6 — Guardando Dados: Repository Pattern e Programação Assíncrona
7. Capítulo 7 — Tratamento Global de Exceções com ProblemDetails
8. Capítulo 8 — Criando os Endpoints REST no IncidentsController
9. Capítulo 9 — O Maestro do Sistema: Program.cs e Swagger
10. Capítulo 10 — Construindo o Painel Visual com HTML, CSS e JavaScript
11. Capítulo 11 — Docker, Git, GitHub e Deploy na Nuvem
12. Capítulo 12 — Próximos Passos e Evolução para Nível Sênior
13. Apêndice — Glossário A–Z e Guia Rápido de Comandos

---

# Capítulo 1 — Lógica de Programação do Zero

Antes de abrir qualquer editor de código ou digitar uma linha de C#, precisamos treinar a habilidade mais importante de qualquer pessoa desenvolvedora: **pensar em passos claros e sem ambiguidade**.

Se você já se sentiu intimidado por telas cheias de símbolos coloridos, respire fundo. Programar não é decorar palavras em inglês difíceis; programar é **descrever regras de organização para um computador obedecer**. E, como você vai ver neste capítulo, você já usa lógica de programação todos os dias sem perceber.

---

## 1.1 O que é um algoritmo? (A analogia da receita e do pronto-socorro)

Um **algoritmo** é simplesmente uma sequência finita de passos organizados para resolver um problema ou concluir uma tarefa.

Pense em uma receita de café coado:
1. Colocar 200 ml de água na chaleira.
2. Aquecer a água até ferver.
3. Colocar o filtro de papel no suporte.
4. Adicionar 2 colheres de pó de café.
5. Despejar a água quente devagar.

Se você inverter a ordem — tentar despejar a água antes de colocar o filtro — o resultado dá errado. Com computadores é exatamente igual: eles são incrivelmente rápidos, mas zero intuitivos. Se um passo estiver fora de ordem ou mal explicado, o programa falha.

Agora traga esse pensamento para o nosso projeto, o **HealthCare Ticket Engine** (um sistema de chamados técnicos para hospitais). Imagine a triagem de problemas em um hospital:

```text
Chegou um novo problema no sistema do hospital:
  1. Anotar o título e o sistema afetado (ex: Portal do Médico).
  2. Verificar a gravidade:
     - Se o sistema parou totalmente -> Prioridade Crítica (resolver em até 1 hora).
     - Se está muito lento no plantão -> Prioridade Alta (resolver em até 4 horas).
     - Se existe outra forma de trabalhar -> Prioridade Média (8 horas).
     - Se é apenas dúvida ou ajuste simples -> Prioridade Baixa (24 horas).
  3. Guardar o chamado na fila com status "Aberto".
```

Acabamos de escrever um algoritmo real de negócio. Tudo o que faremos no restante do livro será traduzir regras exatamente como essa para a linguagem **C#**.

---

## 1.2 Variáveis e Tipos de Dados: as caixinhas etiquetadas da memória

Um programa precisa guardar informações enquanto está funcionando: o título de um chamado, a hora em que ele foi aberto, se já foi resolvido ou não. Na memória do computador, cada informação fica dentro de uma **variável**.

> **Analogia:** Imagine uma estante de farmácia hospitalar cheia de gavetas. Cada gaveta tem uma **etiqueta com o nome do que está dentro** (nome da variável) e um **formato específico** (tipo de dado): uma gaveta guarda frascos líquidos, outra guarda comprimidos, outra guarda fichas de texto.

Em **C#**, toda variável precisa ter um **tipo**. Isso é ótimo para iniciantes, porque o próprio C# avisa antes de você rodar o programa se você tentar guardar um texto dentro de uma caixa feita para números.

Veja os tipos principais que usaremos no nosso sistema:

| Tipo em C# | O que guarda | Exemplo real no HealthCare Ticket Engine |
| :--- | :--- | :--- |
| `string` | Textos (sempre entre aspas duplas `"..."`) | `"Lentidão na fila de autorizações"` |
| `int` | Números inteiros (sem vírgula) | `1`, `4`, `8`, `24` (horas de prazo SLA) |
| `double` / `decimal` | Números com casas decimais | `12.5` (ex.: tempo médio em horas) |
| `bool` | Apenas dois valores possíveis: `true` ou `false` | `true` (SLA estourado) ou `false` (no prazo) |
| `DateTime` | Data e hora exatas | `2026-11-24 14:30:00` |
| `Guid` | Código identificador único mundial | `11111111-1111-1111-1111-111111111111` |

### Declarando variáveis na prática

Em C#, podemos declarar uma variável dizendo o tipo na frente ou deixando o C# descobrir automaticamente com `var`:

```csharp
string sistemaAfetado = "AutorizacaoMedica";
int horasDePrazoSla = 1;
bool estaResolvido = false;

// Com 'var', o C# olha o valor da direita e descobre que é string ou int:
var tituloDoChamado = "Sistema de pronto-socorro fora do ar";
var prioridadeNumerica = 3;
```

> **Atenção:** `var` em C# **não** deixa a variável mudar de tipo depois. Depois que `tituloDoChamado` recebeu um texto (`string`), ele será para sempre do tipo `string`. O `var` é apenas um atalho de digitação.

---

## 1.3 Operadores e Decisões (`if`, `else` e `switch`)

Um programa útil precisa tomar decisões com base nos dados que recebe. Para comparar valores, usamos **operadores de comparação** e **operadores lógicos**:

### Operadores de Comparação
- `==` : é igual a? *(cuidado: um único `=` guarda um valor na variável; dois `==` comparam dois valores!)*
- `!=` : é diferente de?
- `>` e `<` : maior que / menor que
- `>=` e `<=` : maior ou igual / menor ou igual

### Operadores Lógicos
- `&&` (**E**): as duas condições precisam ser verdadeiras.
- `||` (**OU**): basta uma das condições ser verdadeira.
- `!` (**NÃO**): inverte verdadeiro para falso e vice-versa.

### Estrutura `if` e `else` ("Se... Senão...")

Veja como verificamos se um chamado pode ser resolvido:

```csharp
string statusAtual = "Aberto";

if (statusAtual == "Resolvido")
{
    Console.WriteLine("Erro: este chamado já foi resolvido antes!");
}
else
{
    Console.WriteLine("Tudo certo, podemos concluir este chamado agora.");
}
```

Lendo em português:
1. *Se* (`if`) o `statusAtual` for igual (`==`) a `"Resolvido"`, execute o primeiro bloco `{ ... }`.
2. *Senão* (`else`), execute o segundo bloco.

### Encadeando decisões ou usando `switch`

Quando existem várias opções exatas para o mesmo valor — como as 4 prioridades do nosso hospital —, escrever muitos `if / else if` fica cansativo. Para isso existe o `switch`:

```csharp
string prioridade = "Critica";
int prazoEmHoras;

switch (prioridade)
{
    case "Critica":
        prazoEmHoras = 1;
        break;
    case "Alta":
        prazoEmHoras = 4;
        break;
    case "Media":
        prazoEmHoras = 8;
        break;
    default:
        prazoEmHoras = 24;
        break;
}
```

Nas versões modernas de C# (que usamos no .NET 8), existe uma forma ainda mais limpa chamada **switch expression** (expressão switch). Você vai vê-la exatamente assim no Capítulo 4 dentro de `IncidentTicket.cs`:

```csharp
int prazoEmHoras = prioridade switch
{
    "Critica" => 1,
    "Alta"    => 4,
    "Media"   => 8,
    _         => 24   // O '_' significa "qualquer outro caso" (equivalente ao default)
};
```

Repare como a seta `=>` lê como *"retorna"* ou *"vira"*: `"Critica"` vira `1`, `"Alta"` vira `4`, e qualquer outro caso (`_`) vira `24`. Muito mais fácil de ler, certo?

---

## 1.4 Laços de Repetição (`for` e `foreach`)

Imagine que o hospital tem **500 chamados** abertos. Você não vai escrever 500 linhas `if` para verificar um por um. Quando precisamos repetir uma ação várias vezes, usamos **laços de repetição** (loops).

### `for`: quando sabemos quantas vezes queremos repetir

```csharp
// Começa em 1; continua enquanto i <= 3; soma 1 ao final de cada volta (i++)
for (int i = 1; i <= 3; i++)
{
    Console.WriteLine($"Tentativa de verificação número {i}");
}
```

*(Observação: colocar `$` antes das aspas — `$"..."` — chama-se **interpolação de string**. Tudo que estiver entre `{ }` é substituído pelo valor da variável naquele momento.)*

### `foreach`: quando queremos percorrer uma coleção inteira

O `foreach` ("para cada") é o laço que mais usamos no dia a dia em C#. Ele visita cada item de uma lista automaticamente, do primeiro ao último:

```csharp
var chamados = new List<string>
{
    "Lentidão no Portal do Médico",
    "Erro na emissão de guia",
    "Impressora da triagem offline"
};

foreach (var chamado in chamados)
{
    Console.WriteLine($"Chamado na fila: {chamado}");
}
```

---

## 1.5 Coleções (`List` e `Dictionary`)

Uma variável comum guarda **um único** valor. Quando queremos guardar **vários valores juntos**, usamos coleções.

### `List<T>` (Lista ordenada)
Funciona como uma prancheta onde anotamos itens em sequência. O `<T>` indica o tipo dos itens dentro da lista:
- `List<string>` guarda vários textos.
- `List<IncidentTicket>` guarda vários chamados completos.

```csharp
var servicosHospitalares = new List<string>();
servicosHospitalares.Add("AutorizacaoMedica");
servicosHospitalares.Add("PortalDoMedico");

Console.WriteLine(servicosHospitalares.Count); // Imprime: 2
```

### `Dictionary<TKey, TValue>` (Dicionário Chave → Valor)
> **Analogia:** Pense em um arquivo de prontuários onde você não procura ficha por ficha desde a primeira gaveta; você vai direto pelo número do CPF ou código único do paciente.

No `Dictionary`, cada item é guardado por uma **chave única** (no nosso sistema, o `Guid Id` do chamado) que aponta diretamente para o **valor** (o objeto `IncidentTicket` completo). Buscar por chave em um dicionário é quase instantâneo, mesmo com 100.000 chamados!

No Capítulo 6, usaremos uma versão especial à prova de vários usuários simultâneos chamada `ConcurrentDictionary<Guid, IncidentTicket>`.

---

## 1.6 Funções / Métodos: empacotando ações reutilizáveis

Imagine que em 5 lugares diferentes do sistema você precisa calcular o prazo final de atendimento somando as horas da prioridade ao horário de abertura. Se você copiar a fórmula em 5 lugares, no dia em que o hospital mudar o prazo de 4 horas para 3 horas, terá que caçar os 5 lugares.

Um **método** (ou função) é um bloco de código com um nome próprio, que pode receber entradas (parâmetros) e devolver um resultado (retorno).

```csharp
// 'int' antes do nome indica o tipo do valor devolvido.
// '(string prioridade)' é o parâmetro de entrada.
int CalcularHorasSla(string prioridade)
{
    return prioridade switch
    {
        "Critica" => 1,
        "Alta"    => 4,
        "Media"   => 8,
        _         => 24
    };
}

// Chamando a função:
int horas = CalcularHorasSla("Alta"); // horas vale 4
```

Quando uma função apenas executa uma ação e **não devolve** nenhum valor, usamos a palavra `void` ("vazio"):

```csharp
void RegistrarLog(string mensagem)
{
    Console.WriteLine($"[LOG] {mensagem}");
}
```

---

## 1.7 O mistério do `null` e os Tipos Anuláveis (`?`)

Em programação, existe uma diferença gigantesca entre:
- Um chamado com `ResolvedAt` ainda **não preenchido** (porque ninguém resolveu o problema ainda), e
- Uma data inventada como `01/01/0001`.

Quando uma informação **ainda não existe** ou está **ausente**, usamos `null` (nulo).

> **Analogia:** Pense em um formulário de internação com o campo *"Data da Alta"*. Quando o paciente acabou de entrar no hospital, qual é a data da alta? Não é zero e não é hoje — o campo está **em branco (`null`)**.

No C# moderno (`.NET 8` com `<Nullable>enable</Nullable>`), somos obrigados a deixar claro quando uma variável **pode** ficar vazia, colocando uma interrogação `?` logo após o tipo:

- `DateTime CreatedAt` → **Obrigatório** ter uma data. Nunca deve ser `null`.
- `DateTime? ResolvedAt` → **Pode** ser `DateTime` ou `null` (enquanto o chamado estiver aberto).
- `IncidentPriority? Priority` → No formulário de criação, permite detectar se o usuário esqueceu de enviar a prioridade!

### O operador mágico `??` (Coalescência Nula)

Em nosso código real (`IncidentTicket.cs`), existe esta linha elegante:

```csharp
public bool IsSlaBreached => (ResolvedAt ?? DateTime.UtcNow) > SlaDeadline;
```

Veja como o `??` funciona em português claro:
- *"Pegue `ResolvedAt`. Se `ResolvedAt` for `null` (ou seja, o chamado ainda não foi resolvido), use `DateTime.UtcNow` (o horário atual). Depois compare se esse horário é maior (`>`) que o prazo limite (`SlaDeadline`)."*

Sem o `??`, precisaríamos de um `if/else` de várias linhas. Com ele, tudo cabe em uma frase direta e segura!

---

> **Resumo do Capítulo:**
> - **Algoritmos** são sequências lógicas de passos.
> - **Variáveis** guardam dados tipados (`string`, `int`, `bool`, `DateTime`, `Guid`).
> - **`if/else`** e **`switch`** permitem que o programa tome decisões.
> - **`for`** e **`foreach`** automatizam repetições sobre coleções como **`List`** e **`Dictionary`**.
> - **Métodos** evitam repetição de código, e **`?` / `??`** protegem nosso programa contra valores ausentes (`null`).

---

## Exercícios de Fixação

1. **(Variáveis e Tipos)** No sistema do hospital, qual tipo C# você escolheria para cada informação abaixo:
   a) Nome do médico solicitante  
   b) Quantidade de horas do prazo SLA  
   c) Se o SLA foi violado ou não  
   d) Data e hora em que o chamado foi resolvido (sabendo que pode ainda não ter sido resolvido)

2. **(Decisão com `switch`)** Escreva uma expressão `switch` que receba o texto `status` e devolva `"Aguardando equipe"` para `"Aberto"`, `"Em atendimento"` para `"EmAnalise"`, `"Finalizado"` para `"Resolvido"` e `"Desconhecido"` para qualquer outro texto.

3. **(Laço `foreach`)** Suponha que você tem uma `List<int> prazos = new List<int> { 1, 4, 8, 24 };`. Como você usaria `foreach` para imprimir apenas os prazos menores ou iguais a 4 horas?

4. **(Operador `??`)** Se `DateTime? dataResolucao = null;`, o que a expressão `dataResolucao ?? DateTime.UtcNow` retorna? E se `dataResolucao` tiver uma data de ontem?

---

## Gabarito Comentado

1. **Respostas:**
   - a) `string` (texto)
   - b) `int` (número inteiro de horas)
   - c) `bool` (verdadeiro ou falso)
   - d) `DateTime?` (data com `?`, pois enquanto o chamado não termina ela vale `null`)

2. **Código esperado:**
   ```csharp
   string descricaoAmigavel = status switch
   {
       "Aberto"    => "Aguardando equipe",
       "EmAnalise" => "Em atendimento",
       "Resolvido" => "Finalizado",
       _           => "Desconhecido"
   };
   ```

3. **Código esperado:**
   ```csharp
   foreach (var prazo in prazos)
   {
       if (prazo <= 4)
       {
           Console.WriteLine($"Prazo urgente: {prazo}h");
       }
   }
   ```

4. **Explicação:** Quando `dataResolucao` é `null`, o operador `??` descarta o lado esquerdo e devolve o valor reserva da direita (`DateTime.UtcNow`, a hora atual). Quando `dataResolucao` já possui a data de ontem (não é `null`), o `??` devolve a própria `dataResolucao` e ignora o lado direito.

---

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

---

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

---

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

---

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

---

# Capítulo 6 — Guardando Dados: Repository Pattern e Programação Assíncrona

Agora temos o molde do chamado (`Models`) e a portaria que valida o que entra (`DTOs`). Mas onde esses chamados ficam guardados?

Se colocássemos uma lista estática diretamente dentro do `IncidentsController`, o dia em que quiséssemos salvar em um banco de dados real como **PostgreSQL** ou **SQL Server**, teríamos que reescrever todos os controllers do sistema — correndo risco de quebrar regras que já funcionavam.

Para evitar esse acoplamento, usamos um dos padrões de arquitetura mais famosos da engenharia de software: o **Repository Pattern** (Padrão Repositório).

---

## 6.1 O Repository Pattern e a analogia da tomada elétrica

> **Analogia:** Pense na tomada da parede da sua casa. A tomada define um **formato padrão de contrato** (três pinos). Você pode ligar um ventilador, um carregador ou um computador nela sem precisar quebrar a parede para ver como os fios chegam lá trás — e a companhia elétrica pode trocar a usina de hidrelétrica para solar sem você precisar trocar seus aparelhos!

No nosso código:
- A **Tomada (Interface)** é `IIncidentRepository.cs`: diz *o que* o sistema sabe pedir ao armazenamento (`GetAllAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `ResetSeedDataAsync`).
- A **Usina atual (Implementação)** é `InMemoryIncidentRepository.cs`: guarda os dados na memória RAM usando um dicionário seguro.
- O **Controller** só conversa com a **Interface (`IIncidentRepository`)**. Ele nem sabe se os dados vêm da memória RAM, de um arquivo JSON ou de um banco SQL Server na nuvem!

---

## 6.2 Programação Assíncrona (`async`, `await`, `Task` e `CancellationToken`)

Antes de olhar o código do repositório, você verá palavras como `Task<...>`, `async`, `await` e `CancellationToken`. Por que elas estão lá se estamos guardando em memória?

> **Analogia da cafeteria:**  
> - **Código Síncrono (sem `async`):** O atendente tira seu pedido de café, fica parado olhando a máquina coar por 2 minutos sem atender mais ninguém na fila, entrega seu café e só então chama o próximo cliente.  
> - **Código Assíncrono (`async` / `await`):** O atendente envia o pedido para a máquina, libera a caixa para atender outras 20 pessoas enquanto o café passa, e quando a máquina apita, ele entrega seu café!

Em servidores Web, acessar um banco de dados ou disco demora milissegundos preciosos. Usar **`Task`** e **`async`/`await`** permite que o servidor .NET atenda milhares de usuários simultâneos sem travar esperando respostas de rede.

E o **`CancellationToken`**? É o sinal de "cancelar o pedido": se o usuário fechar a aba do navegador antes de a consulta ao banco terminar, o `CancellationToken` avisa o banco para interromper a busca e não desperdiçar processamento!

---

## 6.3 O Contrato: `Repositories/IIncidentRepository.cs`

Crie o arquivo `Repositories/IIncidentRepository.cs`:

```csharp
using HealthCare_Ticket_Engine.Models;

namespace HealthCare_Ticket_Engine.Repositories;

/// <summary>
/// Contrato de persistência para gestão de incidentes N2.
/// </summary>
public interface IIncidentRepository
{
    Task<IReadOnlyCollection<IncidentTicket>> GetAllAsync(
        IncidentStatus? status = null,
        CancellationToken cancellationToken = default);

    Task<IncidentTicket?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IncidentTicket> CreateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default);

    Task<IncidentTicket?> UpdateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<IncidentTicket>> ResetSeedDataAsync(
        CancellationToken cancellationToken = default);
}
```

### Entendendo os detalhes da interface

- **`interface` não tem corpo `{ ... }` nos métodos:** ela lista apenas a assinatura (nome, parâmetros e retorno).
- **`IReadOnlyCollection<IncidentTicket>`:** devolve uma coleção somente de leitura (quem chama pode ler e listar, mas não pode sair adicionando/removendo itens da lista interna por fora do repositório).
- **`IncidentStatus? status = null`:** o `= null` torna o parâmetro **opcional**. Se você chamar `GetAllAsync()` sem passar nada, ele traz todos os chamados; se passar `IncidentStatus.Aberto`, ele filtra.
- **`IncidentTicket?` (no `GetByIdAsync` e `UpdateAsync`):** o `?` avisa honestamente ao compilador que, se o `Id` não existir, esse método pode devolver `null`!

---

## 6.4 A Implementação em Memória: `Repositories/InMemoryIncidentRepository.cs`

Crie agora o arquivo `Repositories/InMemoryIncidentRepository.cs`:

```csharp
using System.Collections.Concurrent;
using HealthCare_Ticket_Engine.Models;

namespace HealthCare_Ticket_Engine.Repositories;

/// <summary>
/// Implementação em memória do repositório de incidentes para operação sem banco externo.
/// </summary>
public class InMemoryIncidentRepository : IIncidentRepository
{
    // A coleção é estática e thread-safe para preservar o estado entre requisições HTTP
    // mantendo o registro DI como Scoped (pronto para futura troca por EF Core DbContext).
    private static readonly ConcurrentDictionary<Guid, IncidentTicket> _tickets = SeedInitialData();
    private static readonly object _resetLock = new();

    public Task<IReadOnlyCollection<IncidentTicket>> GetAllAsync(
        IncidentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<IncidentTicket> query = _tickets.Values;

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        // Ordena por prioridade decrescente (Critica primeiro) e mais antigos primeiro para triagem N2.
        var result = query
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToList();

        return Task.FromResult<IReadOnlyCollection<IncidentTicket>>(result);
    }

    public Task<IncidentTicket?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        _tickets.TryGetValue(id, out var ticket);
        return Task.FromResult(ticket);
    }

    public Task<IncidentTicket> CreateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default)
    {
        if (ticket.Id == Guid.Empty)
        {
            ticket.Id = Guid.NewGuid();
        }

        _tickets[ticket.Id] = ticket;
        return Task.FromResult(ticket);
    }

    public Task<IncidentTicket?> UpdateAsync(
        IncidentTicket ticket,
        CancellationToken cancellationToken = default)
    {
        if (!_tickets.ContainsKey(ticket.Id))
        {
            return Task.FromResult<IncidentTicket?>(null);
        }

        _tickets[ticket.Id] = ticket;
        return Task.FromResult<IncidentTicket?>(ticket);
    }

    public Task<IReadOnlyCollection<IncidentTicket>> ResetSeedDataAsync(
        CancellationToken cancellationToken = default)
    {
        lock (_resetLock)
        {
            _tickets.Clear();

            foreach (var entry in SeedInitialData())
            {
                _tickets[entry.Key] = entry.Value;
            }
        }

        return GetAllAsync(null, cancellationToken);
    }

    private static ConcurrentDictionary<Guid, IncidentTicket> SeedInitialData()
    {
        var now = DateTime.UtcNow;

        var initialTickets = new[]
        {
            new IncidentTicket
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Title = "Lentidão crítica na fila de autorizações TISS",
                Description = "O gateway de integração com operadoras está acumulando solicitações acima de 45s no fluxo de urgência.",
                Priority = IncidentPriority.Critica,
                Status = IncidentStatus.Aberto,
                ServiceAffected = "AutorizacaoMedica",
                CreatedAt = now.AddMinutes(-35)
            },
            new IncidentTicket
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Title = "Timeout ao consultar histórico de exames laboratoriais",
                Description = "Médicos no plantão relatam erro 504 intermitente ao abrir laudos em PDF no Portal do Médico.",
                Priority = IncidentPriority.Alta,
                Status = IncidentStatus.EmAnalise,
                ServiceAffected = "PortalDoMedico",
                CreatedAt = now.AddHours(-2)
            },
            new IncidentTicket
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Title = "Falha na emissão de guia de internação eletiva",
                Description = "Erro de validação de código TUSS corrigido após atualização da tabela de domínio e reinício do worker.",
                Priority = IncidentPriority.Media,
                Status = IncidentStatus.Resolvido,
                ServiceAffected = "ProntuarioEletronico",
                CreatedAt = now.AddHours(-6),
                ResolvedAt = now.AddHours(-4)
            }
        };

        return new ConcurrentDictionary<Guid, IncidentTicket>(
            initialTickets.Select(t => new KeyValuePair<Guid, IncidentTicket>(t.Id, t)));
    }
}
```

---

## 6.5 Os 5 pontos-chave desta classe que diferenciam código júnior de código sênior

### 1. Por que `private static readonly ConcurrentDictionary`?
No Capítulo 9, registraremos este repositório no `Program.cs` usando `.AddScoped<IIncidentRepository, InMemoryIncidentRepository>()`. Isso significa que **a cada requisição HTTP**, o .NET cria uma **nova instância** de `InMemoryIncidentRepository` e a descarta quando a resposta volta para o navegador.
- Se `_tickets` **não fosse `static`**, você criaria um chamado no `POST` e, quando fizesse o `GET` logo em seguida, ele teria sumido porque seria um novo objeto na memória!
- Sendo **`static`**, todas as instâncias compartilham o mesmo cofre em RAM enquanto o servidor estiver ligado — mantendo o contrato `Scoped` idêntico ao que o Entity Framework Core usa com bancos reais.
- E por que **`ConcurrentDictionary`** em vez de `Dictionary` comum? Porque se dois recrutadores clicarem em **Criar Chamado** exatamente no mesmo milissegundo em abas diferentes, um `Dictionary` comum pode corromper e quebrar o programa; o `ConcurrentDictionary` é *thread-safe* (seguro para múltiplas requisições simultâneas).

### 2. LINQ: filtrando e ordenando com elegância (`GetAllAsync`)
Veja como o **LINQ** (*Language Integrated Query*) do C# lê quase como inglês natural:
```csharp
if (status.HasValue)
{
    query = query.Where(t => t.Status == status.Value);
}

var result = query
    .OrderByDescending(t => t.Priority)
    .ThenBy(t => t.CreatedAt)
    .ToList();
```
1. Se veio filtro `status` (`HasValue`), `.Where(...)` mantém apenas os chamados com aquele status.
2. `.OrderByDescending(t => t.Priority)` coloca `Critica` (3) no topo, depois `Alta` (2), `Media` (1) e `Baixa` (0).
3. `.ThenBy(t => t.CreatedAt)` desempata chamados de mesma prioridade colocando o **mais antigo primeiro** (regra de ouro de fila de triagem N2!).

### 3. `Task.FromResult(...)`
Como a operação em memória é instantânea e não espera rede, não precisamos da palavra `async` nos métodos — apenas embrulhamos o resultado dentro de uma `Task` já concluída com `Task.FromResult(...)` para cumprir o contrato assíncrono da interface `IIncidentRepository`.

### 4. `lock (_resetLock)` em `ResetSeedDataAsync`
Ao clicar no botão **Restaurar Demo**, o método limpa o dicionário (`_tickets.Clear()`) e reinsere os 3 chamados iniciais. O bloco `lock (_resetLock)` cria um "banheiro com chave": garante que duas pessoas não consigam limpar e reinserir ao mesmo tempo, evitando que a lista fique duplicada ou pela metade.

### 5. `SeedInitialData()` (Dados iniciais realistas)
Em vez de o sistema abrir com uma tela vazia e sem graça quando um recrutador acessa pela primeira vez, `SeedInitialData()` já cria **3 chamados realistas** com IDs fáceis de testar (`11111111-...`, `22222222-...`, `33333333-...`), cobrindo os três estados (`Aberto`, `EmAnalise`, `Resolvido`).

---

> **Resumo do Capítulo:**
> - O **Repository Pattern** separa o *que fazer* (`IIncidentRepository`) do *como armazenar* (`InMemoryIncidentRepository`).
> - `ConcurrentDictionary` + `static` preservam os dados entre requisições `Scoped` com segurança contra acessos simultâneos.
> - **LINQ** ordena nossa fila exatamente como um time N2 trabalha: maior gravidade primeiro, mais antigo primeiro.

---

## Exercícios de Fixação

1. O que aconteceria se removêssemos a palavra `static` da linha `private static readonly ConcurrentDictionary<Guid, IncidentTicket> _tickets`, mantendo o registro `AddScoped` no `Program.cs`?
2. Para que serve o parâmetro `CancellationToken cancellationToken = default` nos métodos da interface `IIncidentRepository`?
3. Olhando o método `GetAllAsync`, se houver dois chamados com prioridade `Alta`, um criado às `10:00` e outro às `10:30`, qual aparecerá primeiro na lista? Qual linha garante isso?
4. Se amanhã você quiser salvar os chamados em um banco PostgreSQL, você precisará editar a interface `IIncidentRepository`? Explique.

---

## Gabarito Comentado

1. Como `AddScoped` cria uma nova instância de `InMemoryIncidentRepository` a cada requisição HTTP, sem `static` cada requisição teria um dicionário novo reiniciado com os 3 dados iniciais — todo chamado criado via `POST` desapareceria na requisição seguinte!
2. Permite cancelar operações assíncronas caso o cliente desista ou feche a requisição antes da conclusão, economizando recursos quando migrarmos para banco de dados real.
3. O chamado criado às **`10:00`** (mais antigo) aparecerá primeiro, graças ao `.ThenBy(t => t.CreatedAt)` (ordenação crescente de data de criação como critério de desempate).
4. Não! Bastará criar uma nova classe (ex.: `PostgresIncidentRepository : IIncidentRepository`) implementando os mesmos métodos e trocar uma única linha no `Program.cs`. A interface e o Controller permanecem intactos.

---

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

---

# Capítulo 8 — Criando os Endpoints REST no `IncidentsController`

Até agora construímos todas as peças nos bastidores: os moldes (`Models`), o formulário validado (`DTOs`), o cofre (`Repositories`) e a rede de proteção (`GlobalExceptionHandler`). Faltava o **balcão de atendimento**, ou seja, a porta de entrada que recebe as ligações da internet e entrega as respostas: o **Controller**.

---

## 8.1 Como o ASP.NET Core encontra o endereço certo (Roteamento)

Quando o navegador chama `GET /api/incidents`, como o .NET sabe qual arquivo e qual método executar?

Olhe para os atributos em cima da classe `IncidentsController`:

```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class IncidentsController : ControllerBase
```

- **`[ApiController]`**: liga superpoderes automáticos de API REST! Por exemplo: ele valida o `CreateIncidentRequest` antes de entrar no método e devolve `400 Bad Request` sozinho se faltar algum campo, além de já entender que parâmetros vêm do corpo JSON ou da URL.
- **`[Route("api/[controller]")]`**: a palavra mágica `[controller]` pega o nome da classe removendo o sufixo `Controller` (`IncidentsController` → `Incidents`). Então a rota base vira `/api/incidents`! *(Em rotas HTTP de ASP.NET Core, letras maiúsculas/minúsculas não impedem o acesso: `/api/incidents` e `/api/Incidents` funcionam igual.)*
- **`[Produces("application/json")]`**: avisa que todas as respostas deste controller falam JSON.
- **Herança `: ControllerBase`**: dá ao nosso controller métodos prontos como `Ok(...)`, `CreatedAtAction(...)` e `Problem(...)` (usamos `ControllerBase` e não `Controller`, porque `Controller` traz recursos extras de páginas Razor antigas que uma API REST não precisa).

---

## 8.2 O código completo de `Controllers/IncidentsController.cs`

Crie o arquivo `Controllers/IncidentsController.cs` com todas as 6 rotas completas:

```csharp
using HealthCare_Ticket_Engine.DTOs;
using HealthCare_Ticket_Engine.Models;
using HealthCare_Ticket_Engine.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HealthCare_Ticket_Engine.Controllers;

/// <summary>
/// Endpoints REST para triagem, consulta e resolução de incidentes N2 de saúde/hospitalar.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentRepository _repository;
    private readonly ILogger<IncidentsController> _logger;

    public IncidentsController(
        IIncidentRepository repository,
        ILogger<IncidentsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Lista todos os incidentes ordenados por prioridade (Crítica primeiro) e antiguidade, com filtro opcional por status.
    /// </summary>
    /// <param name="status">Filtro opcional de status: Aberto, EmAnalise ou Resolvido.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Lista de incidentes retornada com sucesso.</response>
    /// <response code="400">Parâmetro de filtro inválido.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<IncidentTicket>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyCollection<IncidentTicket>>> GetAll(
        [FromQuery] IncidentStatus? status,
        CancellationToken cancellationToken)
    {
        var tickets = await _repository.GetAllAsync(status, cancellationToken);
        return Ok(tickets);
    }

    /// <summary>
    /// Busca um incidente específico pelo seu identificador único (GUID).
    /// </summary>
    /// <param name="id">GUID do incidente.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Incidente encontrado.</response>
    /// <response code="400">Formato de GUID inválido.</response>
    /// <response code="404">Incidente não encontrado.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IncidentTicket>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(id, cancellationToken);

        if (ticket is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        return Ok(ticket);
    }

    /// <summary>
    /// Abre um novo chamado de incidente N2 com cálculo automático de SLA.
    /// </summary>
    /// <param name="request">Dados validados do novo incidente.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="201">Incidente criado com sucesso.</response>
    /// <response code="400">Payload inválido ou campos obrigatórios ausentes.</response>
    [HttpPost]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IncidentTicket>> Create(
        [FromBody] CreateIncidentRequest request,
        CancellationToken cancellationToken)
    {
        var ticket = new IncidentTicket
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Priority = request.Priority!.Value,
            Status = IncidentStatus.Aberto,
            ServiceAffected = request.ServiceAffected.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(ticket, cancellationToken);

        _logger.LogInformation(
            "Incidente {TicketId} criado para o serviço {ServiceAffected} com prioridade {Priority}. SLA limite: {SlaDeadline:O}",
            created.Id,
            created.ServiceAffected,
            created.Priority,
            created.SlaDeadline);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Coloca um incidente aberto em análise técnica pela sustentação N2.
    /// </summary>
    /// <param name="id">GUID do incidente a ser analisado.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Incidente movido para EmAnalise com sucesso.</response>
    /// <response code="404">Incidente não encontrado.</response>
    /// <response code="409">Incidente já está em análise ou já foi resolvido.</response>
    [HttpPut("{id}/analyze")]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<IncidentTicket>> StartAnalysis(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(id, cancellationToken);

        if (ticket is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        ticket.StartAnalysis();

        var updated = await _repository.UpdateAsync(ticket, cancellationToken);
        if (updated is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        _logger.LogInformation(
            "Incidente {TicketId} movido para análise N2 (status {Status}).",
            updated.Id,
            updated.Status);

        return Ok(updated);
    }

    /// <summary>
    /// Marca um incidente existente como resolvido e registra o timestamp UTC de resolução.
    /// </summary>
    /// <param name="id">GUID do incidente a ser resolvido.</param>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Incidente resolvido com sucesso.</response>
    /// <response code="404">Incidente não encontrado.</response>
    /// <response code="409">Incidente já estava resolvido anteriormente.</response>
    [HttpPut("{id}/resolve")]
    [ProducesResponseType(typeof(IncidentTicket), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<IncidentTicket>> Resolve(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(id, cancellationToken);

        if (ticket is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        ticket.Resolve();

        var updated = await _repository.UpdateAsync(ticket, cancellationToken);
        if (updated is null)
        {
            return Problem(
                title: "Incidente não encontrado",
                detail: $"Nenhum incidente foi localizado com o ID '{id}'.",
                statusCode: StatusCodes.Status404NotFound);
        }

        _logger.LogInformation(
            "Incidente {TicketId} resolvido em {ResolvedAt:O}. SLA violado: {IsSlaBreached}",
            updated.Id,
            updated.ResolvedAt,
            updated.IsSlaBreached);

        return Ok(updated);
    }

    /// <summary>
    /// Restaura a fila em memória para os 3 chamados hospitalares iniciais de demonstração.
    /// </summary>
    /// <param name="cancellationToken">Token de cancelamento da requisição.</param>
    /// <response code="200">Fila de demonstração restaurada com sucesso.</response>
    [HttpPost("reset-demo")]
    [ProducesResponseType(typeof(IReadOnlyCollection<IncidentTicket>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<IncidentTicket>>> ResetDemo(
        CancellationToken cancellationToken)
    {
        var tickets = await _repository.ResetSeedDataAsync(cancellationToken);

        _logger.LogInformation(
            "Fila de demonstração restaurada com {TicketCount} chamados iniciais.",
            tickets.Count);

        return Ok(tickets);
    }
}
```

---

## 8.3 Dissecando cada rota e seus truques de arquitetura

### 1. O Construtor (Injeção de Dependência)
Repare que o `IncidentsController` **não faz `new InMemoryIncidentRepository()`**! Ele pede no construtor `IIncidentRepository repository`. O `Program.cs` entrega automaticamente a implementação configurada lá.

### 2. `GetAll` — `[HttpGet]` (`GET /api/incidents`)
- **`[FromQuery] IncidentStatus? status`**: lê o texto que vem depois da interrogação na URL, como `/api/incidents?status=Aberto`. Se não vier nada, `status` é `null` e traz todos. Se alguém escrever `?status=Batata`, o `[ApiController]` rejeita na hora com `400 Bad Request`!

### 3. `GetById` — `[HttpGet("{id}")]` (`GET /api/incidents/{id}`)
> **Dica Sênior:** Repare que escrevemos `[HttpGet("{id}")]` em vez de `[HttpGet("{id:guid}")]`. Por quê?  
> Se colocássemos `:guid` na rota e alguém digitasse `/api/incidents/abc`, a rota nem bateria no método e devolveria um `404` vazio sem JSON. Deixando apenas `{id}` e recebendo `Guid id`, quando alguém envia `"abc"`, o sistema devolve um JSON `400 Bad Request` limpo explicando que o formato do GUID está inválido!

Quando o `id` tem formato válido de GUID, mas não existe na fila (`ticket is null`), devolvemos `Problem(..., statusCode: StatusCodes.Status404NotFound)`.

### 4. `Create` — `[HttpPost]` (`POST /api/incidents`)
- `[FromBody]` lê o JSON enviado pelo cliente e monta o `CreateIncidentRequest` (já validado!).
- `.Trim()` remove espaços acidentais antes e depois do texto digitado pelo usuário.
- `request.Priority!.Value`: aqui usamos `!` (*null-forgiving operator*) com total segurança porque `[Required]` já garantiu que `Priority` não é `null`.
- **`CreatedAtAction(nameof(GetById), new { id = created.Id }, created)`**: é a forma padrão REST mais elegante! Além de devolver **`201 Created`** com o objeto criado em JSON, ela adiciona automaticamente um cabeçalho HTTP `Location` apontando para a URL onde o novo chamado pode ser consultado (`.../api/Incidents/{id}`).

### 5. `StartAnalysis` e `Resolve` (`PUT /api/incidents/{id}/analyze` e `/resolve`)
Veja como os dois métodos são enxutos:
1. Buscam o chamado no repositório (`GetByIdAsync`). Se não existir, devolvem `404`.
2. Chamam `ticket.StartAnalysis()` ou `ticket.Resolve()`. Note que **não há `if` de conflito nem `try/catch` aqui!** Se a regra falhar (ex.: já resolvido), a exceção sobe limpa para o `GlobalExceptionHandler` devolver `409 Conflict`.
3. Salvam no repositório (`UpdateAsync`), registram um log e devolvem `200 OK` com o chamado atualizado.

### 6. `ResetDemo` (`POST /api/incidents/reset-demo`)
Restaura os 3 chamados originais da demonstração e devolve `200 OK` com a lista restaurada — facilitando testes repetidos por recrutadores no portfólio!

---

## 8.4 Acompanhe uma requisição de ponta a ponta

Veja o caminho completo quando você clica em **"Marcar como Resolvido"** na interface:

```text
1. Navegador envia:  PUT /api/incidents/11111111-.../resolve
2. IncidentsController.Resolve(id) recebe o pedido
3.   -> Chama _repository.GetByIdAsync(id) -> Encontra o ticket
4.   -> Chama ticket.Resolve()
        - Se status != Resolvido -> muda status, grava ResolvedAt
        - Se status == Resolvido -> lança InvalidOperationException -> GlobalExceptionHandler -> 409 JSON
5.   -> Chama _repository.UpdateAsync(ticket) -> Atualiza no dicionário
6.   -> Grava LogInformation no console do servidor
7.   -> Devolve 200 OK + JSON do chamado atualizado para o navegador!
```

---

> **Resumo do Capítulo:**
> - O `IncidentsController` traduz verbos e URLs HTTP (`GET`, `POST`, `PUT`) em chamadas ao domínio e ao repositório.
> - `[ApiController]` automatiza validações de DTOs e formatação de erros de entrada.
> - `[ProducesResponseType]` e comentários XML `///` alimentam o Swagger com documentação profissional.

---

## Exercícios de Fixação

1. Qual é a URL completa da ação `StartAnalysis` sabendo que a classe se chama `IncidentsController` com `[Route("api/[controller]")]` e o método tem `[HttpPut("{id}/analyze")]`?
2. Por que `Create` usa `CreatedAtAction(...)` em vez de `Ok(...)`?
3. Onde fica a validação que impede `Resolve` de aceitar um chamado já resolvido: dentro do `IncidentsController` ou dentro do `IncidentTicket`? Por que essa escolha é melhor?
4. O que aconteceria se o cliente mandasse um JSON inválido na rota `POST /api/incidents` (por exemplo, `title` com apenas 2 letras)?

---

## Gabarito Comentado

1. `PUT /api/incidents/{id}/analyze` (ex.: `PUT /api/incidents/11111111-1111-1111-1111-111111111111/analyze`).
2. Porque pela convenção REST, criar um recurso novo deve responder **`201 Created`** (em vez de `200 OK`) e informar no cabeçalho HTTP `Location` onde esse novo item pode ser consultado (`GetById`).
3. Fica dentro do método `ticket.Resolve()` em `Models/IncidentTicket.cs`! Isso mantém as regras de negócio encapsuladas no domínio (e não espalhadas pelos controllers) e garante que qualquer parte do sistema que tente resolver um ticket respeite a mesma regra.
4. O atributo `[ApiController]` intercepta antes mesmo de o método `Create` executar, valida as `DataAnnotations` do `CreateIncidentRequest` e devolve automaticamente **`400 Bad Request`** com os detalhes do erro em JSON.

---

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

---

# Capítulo 10 — Construindo o Painel Visual com HTML, CSS e JavaScript

Um back-end robusto com Swagger é ótimo para desenvolvedores, mas imagine mostrar apenas uma tela técnica de endpoints (`GET`, `POST`, `PUT`) para um gerente de hospital, um cliente ou um recrutador com 30 segundos para avaliar seu portfólio. Sem uma interface visual, fica difícil entender rapidamente o valor do produto!

Por isso, dentro da pasta `wwwroot/`, construímos um **Painel Web completo, responsivo e sem bibliotecas externas pesadas**, usando o trio fundamental da Web:
1. **HTML (`wwwroot/index.html`)** → O esqueleto e o conteúdo da página (títulos, cartões, botões, modais).
2. **CSS (`wwwroot/styles.css`)** → A aparência, cores clínicas, espaçamentos e adaptação para celular.
3. **JavaScript (`wwwroot/app.js`)** → O cérebro no navegador que conversa com a nossa API C# usando `fetch(...)` e atualiza a tela em tempo real.

---

## 10.1 A estrutura semântica em `wwwroot/index.html`

O HTML funciona como blocos organizados de cima para baixo:

1. **Barra Superior (`<header class="topbar">`)**:
   - Mostra o logotipo (ícone SVG inline de cruz médica), o nome **HealthCare Ticket Engine** e a etiqueta `Suporte N2 Hospitalar`.
   - À direita, traz dois botões principais:
     - **`API Técnica (Swagger)`**: link `<a href="/swagger" target="_blank">` para quem quiser estudar ou testar a API técnica diretamente.
     - **`+ Abrir Chamado`**: botão `#openCreateModalBtn` que abre o formulário modal.
2. **Cabeçalho Explicativo (`<section class="hero">`)**:
   - Explica em linguagem simples o propósito do sistema (*"Central de Chamados Hospitalares"*) junto com a legenda visual das metas de SLA (`Crítica · 1h`, `Alta · 4h`, `Média · 8h`, `Baixa · 24h`).
3. **4 Cartões de Indicadores (`<section class="kpi-grid">`)**:
   - `#kpiTotal`, `#kpiOpen`, `#kpiAnalysis` e `#kpiResolved` + `#kpiSlaHint` (mostrando se há chamados ativos com SLA estourado).
4. **Barra de Filtros e Ações (`<section class="toolbar">`)**:
   - Abas de filtro com contadores (`Todos`, `Abertos`, `Em Análise`, `Resolvidos`).
   - Caixa de busca instantânea (`#searchInput`), botão `Atualizar` (`#refreshBtn`) e botão `Restaurar Demo` (`#resetDemoBtn`).
5. **Lista de Chamados (`#ticketList`) + Esqueleto de Carregamento (`#loadingSkeleton`) + Estado Vazio (`#emptyState`)**.
6. **Barra Educativa "Raio-X da API" (`#apiInspector`)**:
   - Exibe em tempo real o último verbo (`GET`/`POST`/`PUT`), rota, código HTTP (`200`, `201`, `409`), latência em `ms` e um botão `Ver JSON` que abre o JSON real recebido do servidor!
7. **Dois Modais Acessíveis (`role="dialog"`)**:
   - `#createModal` (formulário amigável com seletores visuais de prioridade/SLA).
   - `#detailModal` (detalhes completos + linha do tempo + copiar ID + botões de ação).

Veja um trecho real da barra de ferramentas no `wwwroot/index.html`:

```html
      <div class="toolbar-right">
        <label class="search-box" for="searchInput">
          <!-- Ícone de lupa em SVG -->
          <input
            type="search"
            id="searchInput"
            placeholder="Buscar por título, sistema afetado ou descrição..."
            autocomplete="off"
          >
        </label>

        <button type="button" id="refreshBtn" class="btn btn-subtle" title="Recarregar fila de chamados">
          <span>Atualizar</span>
        </button>

        <button type="button" id="resetDemoBtn" class="btn btn-subtle" title="Restaurar os 3 chamados hospitalares de exemplo">
          <span>Restaurar Demo</span>
        </button>
      </div>
```

> **Dica Sênior (Acessibilidade e HTML Semântico):** Repare em atributos como `aria-label`, `role="tablist"`, `aria-selected`, `role="dialog"` e `aria-live="polite"`. Eles permitem que leitores de tela usados por pessoas com deficiência visual naveguem pelo painel com perfeição.

---

## 10.2 O visual clínico moderno em `wwwroot/styles.css`

Em vez de espalhar códigos de cor repetidos pelo CSS inteiro, declaramos **Variáveis CSS** no bloco `:root` lá no topo do arquivo:

```css
:root {
  --bg: #f4f7fb;
  --surface: #ffffff;
  --border: #e2e8f0;
  --text: #0f172a;
  --primary: #0f766e;
  --primary-hover: #0d9488;
  --critica: #dc2626;
  --alta: #d97706;
  --media: #2563eb;
  --baixa: #0f766e;
}
```

### Três recursos de CSS que dão acabamento profissional

1. **CSS Grid para os KPIs e Responsividade**:
   Em telas grandes, `.kpi-grid` usa `grid-template-columns: repeat(4, minmax(0, 1fr));` (4 colunas iguais). Quando a tela encolhe abaixo de `960px` ou `680px`, as regras `@media (max-width: ...)` diminuem automaticamente para 2 colunas (tablet) e 1 coluna (celular)!
2. **Faixa lateral de urgência nos cartões**:
   ```css
   .ticket-card { border-left: 5px solid var(--border-strong); }
   .ticket-card.priority-critica { border-left-color: var(--critica); }
   .ticket-card.priority-alta    { border-left-color: var(--alta); }
   ```
   Apenas olhando a cor da borda esquerda, qualquer pessoa identifica instantaneamente o nível de urgência do chamado.
3. **Efeito de carregamento (*Skeleton Shimmer*)**:
   Enquanto o JavaScript busca os dados na API, `.skeleton-card` anima um gradiente suave (`@keyframes shimmer`), evitando que a tela pisque vazia.

---

## 10.3 O cérebro no navegador: `wwwroot/app.js`

Todo o JavaScript fica isolado dentro de uma função autoexecutável `'use strict'; (() => { ... })();` para não poluir variáveis globais do navegador. Vamos estudar os 5 pilares desse arquivo!

### Pilar 1: Traduzindo termos técnicos para português humano

No banco em memória, o sistema afetado chama-se `"AutorizacaoMedica"` (sem espaço) e a prioridade chama-se `"Critica"` (sem acento). No `app.js`, traduzimos na hora da exibição:

```javascript
  const SERVICE_LABELS = {
    AutorizacaoMedica: 'Autorização Médica',
    PortalDoMedico: 'Portal do Médico',
    ProntuarioEletronico: 'Prontuário Eletrônico',
    LaboratorioExames: 'Laboratório e Exames',
    FaturamentoTISS: 'Faturamento TISS'
  };

  function formatServiceName(serviceKey) {
    if (!serviceKey) return 'Sistema não informado';
    if (SERVICE_LABELS[serviceKey]) return SERVICE_LABELS[serviceKey];
    return serviceKey.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
```

Se alguém cadastrar um sistema novo personalizado como `"FarmaciaCentral"`, a expressão regular `replace(/([a-z])([A-Z])/g, '$1 $2')` separa automaticamente em `"Farmacia Central"`!

### Pilar 2: Segurança contra XSS (`escapeHtml`)

> **Atenção — Nunca confie em texto vindo de fora ao montar HTML!**  
> Se um usuário mal-intencionado criar um chamado com o título `<script>alert('hack')</script>` e o front-end inserir isso direto com `innerHTML`, o navegador executaria o script! Esse ataque chama-se **XSS (*Cross-Site Scripting*)**.

Para blindar 100% o painel, criamos `escapeHtml(value)` e passamos **todo** dado dinâmico por ela antes de montar o HTML dos cards:

```javascript
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
```

Ela transforma `<` em `&lt;` e `>` em `&gt;` — fazendo o navegador exibir o texto como texto inofensivo, nunca como código executável.

### Pilar 3: Centralizando as chamadas HTTP (`apiRequest`) + Raio-X da API

Em vez de espalhar `fetch(...)` repetido em 6 funções diferentes, criamos uma única função `apiRequest(method, url, body, explain)` que:
1. Cronometra o tempo exato da requisição com `performance.now()`.
2. Envia o pedido via `fetch(url, options)` com cabeçalhos JSON.
3. Atualiza automaticamente a barra **Raio-X da API** lá embaixo (verbo, rota, status HTTP, milissegundos e o JSON formatado com `JSON.stringify(payload, null, 2)`).
4. Se `!response.ok` (erro `400`, `404`, `409` ou `500`), lê os campos `data.errors` (do `ValidationProblemDetails`) ou `data.detail` (do `GlobalExceptionHandler`) e lança uma mensagem clara para o usuário!

```javascript
    const latencyMs = performance.now() - start;
    updateApiInspector({
      method,
      url,
      status: response.status,
      latencyMs,
      explain,
      payload: data
    });

    if (!response.ok) {
      const messages = [];
      if (data && data.errors && typeof data.errors === 'object') {
        Object.values(data.errors).forEach((arr) => {
          if (Array.isArray(arr)) messages.push(...arr);
        });
      } else if (data && data.detail) {
        messages.push(data.detail);
      } else if (data && data.title) {
        messages.push(data.title);
      } else {
        messages.push(`Erro inesperado (HTTP ${response.status}).`);
      }

      const error = new Error(messages[0]);
      error.messages = messages;
      throw error;
    }
```

### Pilar 4: Contagem regressiva de SLA ao vivo

A função `getSlaBadgeInfo(ticket)` compara `ticket.slaDeadline` com `Date.now()` no navegador:
- Se `Resolvido`: mostra `"Resolvido no prazo"` ou `"Resolvido fora do SLA"`.
- Se estourado: mostra `"SLA estourado há X min"`.
- Se faltarem 30 minutos ou menos: muda a etiqueta para amarelo de alerta (`"Restam X min"`).
- E um `setInterval(..., 30000)` no final do arquivo recalcula os prazos na tela automaticamente a cada 30 segundos!

### Pilar 5: Delegação de Eventos e Proteção contra Cliques Duplos

Os cartões são criados dinamicamente pelo JavaScript depois que os dados chegam da API. Em vez de anexar um evento de clique em cada botão novo toda vez que a lista redesenha, colocamos **um único ouvinte** no container pai `#ticketList`:

```javascript
    el.ticketList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'detail') openDetailModal(id);
      if (action === 'analyze' || action === 'resolve') transitionTicket(id, action);
    });
```

Além disso, `state.pendingIds` guarda o ID de qualquer chamado que está sendo atualizado naquele instante, desabilitando o botão até a API responder para evitar cliques duplos acidentais!

---

> **Resumo do Capítulo:**
> - `wwwroot/index.html` organiza cabeçalho, legenda de SLAs, KPIs, filtros, modais e barra **Raio-X da API** com acessibilidade.
> - `wwwroot/styles.css` usa variáveis CSS, Grid/Flexbox e `@media` queries para funcionar em desktop e celular.
> - `wwwroot/app.js` centraliza o `fetch` em `apiRequest()`, protege contra **XSS** com `escapeHtml()`, trata erros `ProblemDetails` da API e atualiza prazos de SLA em tempo real.

---

## Exercícios de Fixação

1. Por que o `app.js` passa os textos dos chamados pela função `escapeHtml()` antes de inseri-los dentro do `innerHTML`?
2. Como o painel sabe exibir `"Autorização Médica"` na tela se a API devolveu `"serviceAffected": "AutorizacaoMedica"`?
3. O que a função `apiRequest` faz além de buscar ou enviar dados para a API C#?
4. Como evitamos que um usuário dispare duas requisições `PUT .../resolve` ao clicar duas vezes muito rápido no botão?

---

## Gabarito Comentado

1. Para prevenir ataques de **XSS (*Cross-Site Scripting*)**, garantindo que caracteres como `<` e `>` sejam exibidos como texto comum e jamais executados como tags HTML ou `<script>` pelo navegador.
2. Através do mapa `SERVICE_LABELS` e da função `formatServiceName(serviceKey)` no `app.js`, que traduz chaves conhecidas para nomes amigáveis e separa palavras em *PascalCase* quando for um sistema personalizado.
3. Ela também mede o tempo de resposta com `performance.now()`, atualiza a barra educativa **Raio-X da API** (verbo, caminho, status, latência e JSON) e extrai mensagens de erro amigáveis de `data.errors` ou `data.detail` quando `response.ok` for falso.
4. Guardamos o `id` dentro de um `Set` chamado `state.pendingIds` enquanto a requisição está em andamento, desabilitando (`disabled`) os botões daquele cartão até o bloco `finally` liberar novamente.

---

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

---

# Capítulo 12 — Próximos Passos e Evolução para Nível Sênior

Parabéns! Se você acompanhou até aqui, você não apenas copiou um projeto: você entendeu desde variáveis, `null` e verbos HTTP até Repository Pattern, Injeção de Dependência, `IExceptionHandler`, Front-End sem XSS, Docker e Cloud Deploy.

Neste último capítulo, vamos olhar para o futuro: **como transformar este projeto em um sistema corporativo ainda mais robusto** e **como explicá-lo com confiança em entrevistas de emprego**.

---

## 12.1 Passo 1 de Evolução: Banco de Dados Real com Entity Framework Core

Hoje nossos chamados vivem na memória RAM (`InMemoryIncidentRepository`). Se o servidor reiniciar, os chamados criados durante o teste somem. Como migramos para **PostgreSQL** ou **SQL Server** sem quebrar o resto da API?

Graças ao **Repository Pattern** do Capítulo 6, você não altera uma vírgula em `Controllers/IncidentsController.cs` nem no front-end! Os passos são apenas:

1. Instalar os pacotes do **Entity Framework Core** (o ORM oficial da Microsoft que traduz classes C# em tabelas SQL):
   ```powershell
   dotnet add package Microsoft.EntityFrameworkCore
   dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
   ```
2. Criar uma classe `AppDbContext : DbContext` expondo `public DbSet<IncidentTicket> Incidents => Set<IncidentTicket>();`.
3. Criar uma nova classe **`EfCoreIncidentRepository : IIncidentRepository`** (mantendo os exatos mesmos métodos do contrato!). Veja uma prévia de como ela ficaria:

```csharp
using HealthCare_Ticket_Engine.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthCare_Ticket_Engine.Repositories;

public class EfCoreIncidentRepository(AppDbContext context) : IIncidentRepository
{
    public async Task<IReadOnlyCollection<IncidentTicket>> GetAllAsync(
        IncidentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.Incidents.AsNoTracking().AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        return await query
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<IncidentTicket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => context.Incidents.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<IncidentTicket> CreateAsync(IncidentTicket ticket, CancellationToken cancellationToken = default)
    {
        context.Incidents.Add(ticket);
        await context.SaveChangesAsync(cancellationToken);
        return ticket;
    }

    public async Task<IncidentTicket?> UpdateAsync(IncidentTicket ticket, CancellationToken cancellationToken = default)
    {
        context.Incidents.Update(ticket);
        await context.SaveChangesAsync(cancellationToken);
        return ticket;
    }

    public Task<IReadOnlyCollection<IncidentTicket>> ResetSeedDataAsync(CancellationToken cancellationToken = default)
        => GetAllAsync(null, cancellationToken);
}
```
4. No `Program.cs`, trocar **apenas uma linha**:
   `builder.Services.AddScoped<IIncidentRepository, EfCoreIncidentRepository>();`

Viu por que tanto esforço em desacoplamento valeu a pena?

---

## 12.2 Passo 2 de Evolução: Testes Automatizados com xUnit

Engenheiros sêniores nunca dependem apenas de clicar na tela para saber se o sistema não quebrou. Você pode criar um projeto paralelo de testes com `dotnet new xunit -o HealthCare-Ticket-Engine.Tests` e testar suas regras de domínio em milissegundos!

Veja um exemplo real de teste unitário para `IncidentTicket.Resolve()`:

```csharp
using HealthCare_Ticket_Engine.Models;
using Xunit;

namespace HealthCare_Ticket_Engine.Tests;

public class IncidentTicketTests
{
    [Fact]
    public void Resolve_ShouldSetStatusResolvidoAndTimestamp_WhenTicketIsOpen()
    {
        // Arrange (Preparação)
        var ticket = new IncidentTicket
        {
            Title = "Erro no prontuário",
            Description = "Falha intermitente ao salvar evolução médica.",
            Priority = IncidentPriority.Critica,
            ServiceAffected = "ProntuarioEletronico"
        };

        // Act (Ação)
        ticket.Resolve();

        // Assert (Verificação)
        Assert.Equal(IncidentStatus.Resolvido, ticket.Status);
        Assert.NotNull(ticket.ResolvedAt);
    }

    [Fact]
    public void Resolve_ShouldThrowInvalidOperationException_WhenAlreadyResolved()
    {
        // Arrange
        var ticket = new IncidentTicket { Priority = IncidentPriority.Alta };
        ticket.Resolve();

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => ticket.Resolve());
    }
}
```

Esse padrão **Arrange → Act → Assert (AAA)** garante que ninguém nunca introduza um bug silencioso nas regras de SLA ou transição de status!

---

## 12.3 Passo 3 de Evolução: Autenticação JWT e Notas de Atendimento

Quando o sistema crescer para múltiplos analistas N2 em um hospital real:
- **Autenticação JWT (JSON Web Token) + Perfis (Roles):** diferenciar quem pode *Abrir Chamado* (ex.: Recepção / Enfermagem) de quem pode *Iniciar Análise / Resolver* (Analista N2) usando `[Authorize(Roles = "AnalystN2")]`.
- **Histórico de Comentários N2:** criar uma tabela relacionada `IncidentComment` (`Author`, `Message`, `CreatedAt`) para o analista registrar o passo a passo da investigação antes de encerrar o chamado.

---

## 12.4 Como apresentar este projeto em uma entrevista técnica (Roteiro de 2 minutos)

Se um recrutador ou líder técnico perguntar *"Me conte sobre um projeto que você construiu em C#"*, você pode usar esta estrutura direta e segura:

> *"Eu construí o **HealthCare Ticket Engine**, uma API RESTful em **ASP.NET Core .NET 8** com painel Web integrado para triagem e controle de SLA de incidentes hospitalares N2.*
>
> *Modelei a entidade `IncidentTicket` encapsulando as regras de negócio — como cálculo automático de SLA (1h Crítica até 24h Baixa) e proteção de transições de estado em `StartAnalysis()` e `Resolve()`. Separei a entrada da API com um DTO validado por `DataAnnotations` (inclusive usando enum anulável no DTO para evitar que campos omitidos caiam no valor padrão zero).*
>
> *Desacoplei a persistência com o **Repository Pattern** (`IIncidentRepository` registrado como `Scoped` via Injeção de Dependência), permitindo trocar o repositório em memória (`ConcurrentDictionary` thread-safe) por Entity Framework Core no futuro sem mexer nos Controllers.*
>
> *Para tratamento de erros, usei o `IExceptionHandler` nativo do .NET 8 devolvendo **RFC 7807 `ProblemDetails`** limpos (como `409 Conflict` ao tentar resolver um chamado já encerrado). Também criei uma interface Web amigável em `wwwroot/` protegida contra XSS com barra de inspeção HTTP em tempo real, Swagger com XML docs, `Dockerfile` multi-stage e deploy contínuo em nuvem no Render."*

---

## Desafios Finais Práticos

1. **(Novo Endpoint)** Como você adicionaria um endpoint `GET /api/incidents/breached` que retorna apenas os chamados ativos cujo SLA já foi estourado (`!Status.Equals(Resolvido)` e `IsSlaBreached`)? Quais arquivos precisaria atualizar?
2. **(Teste xUnit)** Escreva o padrão *Arrange / Act / Assert* de um teste unitário verificando que `StartAnalysis()` lança `InvalidOperationException` se o chamado já estiver `Resolvido`.
3. **(Arquitetura)** Na frase do roteiro de entrevista, por que explicamos o uso de `ConcurrentDictionary` estático junto com `.AddScoped<>`?

---

## Gabarito Comentado

1. Você pode adicionar `GetBreachedAsync` na interface `IIncidentRepository` e em `InMemoryIncidentRepository` filtrando `t.Status != IncidentStatus.Resolvido && t.IsSlaBreached`, e expor `[HttpGet("breached")]` no `IncidentsController`. *(Alternativamente, o próprio `GetAll` já traz todos ordenados e `IsSlaBreached` calculado em tempo real).*
2. **Arrange:** crie um `IncidentTicket` e chame `ticket.Resolve()`. **Act & Assert:** `Assert.Throws<InvalidOperationException>(() => ticket.StartAnalysis());`.
3. Porque demonstra que você entende o ciclo de vida `Scoped` da Injeção de Dependência (uma instância nova por requisição HTTP) e resolveu conscientemente a persistência em memória entre requisições mantendo thread-safety para acessos simultâneos.

---

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
