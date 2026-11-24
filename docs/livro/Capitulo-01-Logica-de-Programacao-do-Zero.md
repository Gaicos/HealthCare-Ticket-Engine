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
