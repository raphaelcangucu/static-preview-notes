# Auditoria visual E2E — 20 de agosto de 2026

## Escopo e baseline

- Projeto: `static-preview-notes`
- URL auditada: `https://raphaelcangucu.github.io/static-preview-notes/`
- Baseline confirmado: `6de3d09 feat: align previews with simulator design`
- Viewports: desktop `1440×1000`; mobile `390×844`
- Referência canônica: `Macro-Markets/world-cup-2026-simulator`, branch `master`
- Rotas: 7/7 visitadas no site publicado antes de qualquer correção
- Estado local preservado: alterações de conteúdo pré-existentes e concorrentes permaneceram intactas e fora do escopo dos commits da auditoria.

## Inventário inicial priorizado

### Crítico

Nenhum defeito crítico de indisponibilidade, perda de conteúdo ou quebra total de navegação foi observado.

### Alto

1. **Conteúdo recortado no mobile sem overflow detectável no documento**
   - Evidência: em `390px`, elementos internos ultrapassam a viewport, mas `document.documentElement.scrollWidth` continua igual a `clientWidth` porque `.astro-document` usa `overflow-x: clip`.
   - Casos medidos:
     - Índice: tabela com `491px` dentro de área útil de `370px`.
     - E-mails da rodada: tabela com `560px`; borda direita em `588px`.
     - Hub, Rodada e Blog: labels de controles chegam a `454px`, `462px` e `786px`.
   - Impacto: colunas, rótulos e valores ficam invisíveis, sem possibilidade de rolagem.

2. **Controles CSS de cenário sem foco visível**
   - Evidência: os radios `.tt`, `.t3` e `.t13` têm caixa `0×0`, `opacity: 0` e `pointer-events: none`; ao focar `#sc-b`, o input permanece ativo, porém input e label computam `outline: none`.
   - Impacto: usuários de teclado não identificam qual cenário será acionado; parte dos controles não aparece adequadamente na árvore de acessibilidade.

3. **Orientação mobile incompleta nas últimas rotas**
   - Evidência: a navegação horizontal inicia sempre no primeiro item. Em `Waitlist → Cadastro` e `LPs Waitlist`, o item com `aria-current="page"` fica fora da área visível inicial.
   - Impacto: o estado ativo existe no DOM, mas o usuário não vê onde está sem descobrir e rolar a navegação.

### Médio

1. **Topo excessivamente denso nas páginas com cenários**
   - O shell global, a legenda global, o header, a navegação de cenário, o gate Premium e uma segunda legenda interna ocupam grande parte da primeira viewport.
   - Impacto: o conteúdo específico demora a aparecer e a hierarquia entre “documentação” e “mock” fica menos clara.

2. **Controles de cenário duplicados**
   - Hub, Rodada e Blog apresentam navegação compartilhada por âncoras e um segundo seletor CSS dentro do documento.
   - Impacto: dois controles visualmente semelhantes operam conceitos diferentes sem explicação suficiente.

3. **Tipografia interna muito pequena**
   - Diversos estilos de documento usam `8.5px` a `11px`, abaixo da escala da referência canônica (`0.7rem` a `0.95rem`).
   - Impacto: leitura cansativa em mobile e baixa tolerância a zoom/font scaling.

4. **Tabelas sem estratégia responsiva consistente**
   - Algumas tabelas mantêm largura intrínseca; outras são comprimidas. Não há um wrapper compartilhado que ofereça rolagem local e indicação de conteúdo adicional.

### Baixo

1. **Inconsistência residual de nomenclatura de estado**
   - Há variantes `pt`, `pa`, `off` e `of` para os mesmos estados em CSS de páginas.
   - Impacto: aumenta a chance de divergência visual e dificulta manutenção.

2. **Sombras e raios variam entre documentos internos**
   - A família visual canônica está preservada nos tokens principais, mas componentes locais ainda usam combinações antigas antes dos overrides finais.

## Evidência objetiva do baseline

### Disponibilidade e contratos existentes

- Vitest: `28/28` testes passando.
- `astro check`: `0` erros, `0` avisos, `0` hints.
- Build: `7` páginas geradas.
- Navegação compartilhada: 7 links em todas as rotas; item ativo presente via `aria-current="page"`.
- Meta robots: `noindex, nofollow, noarchive` presente.
- Overflow do documento: `scrollWidth === clientWidth` em todas as medições; este indicador isolado produz falso negativo por causa de `overflow-x: clip`.
- Link de salto: validado por teclado e por Playwright em desktop e mobile; torna-se visível ao receber foco. A hipótese inicial de defeito foi descartada após a medição reproduzível.
- Playwright de baseline: falhas reproduzidas para conteúdo recortado, foco ausente nos radios CSS e legendas internas sticky concorrendo com o shell.

### Contraste dos tokens críticos

- Texto principal `#d8dbe4` sobre `#111318`: `13.43:1`.
- Texto secundário `#aeb3c1` sobre `#111318`: `8.86:1`.
- Texto de apoio `#858c9a` sobre `#111318`: `5.50:1`.
- Texto de botão `#052e16` sobre verde `#22c55e`: `6.54:1`.
- Âmbar claro sobre superfície âmbar escura: `11.93:1`.
- Azul claro sobre superfície azul escura: `8.82:1`.

Os pares críticos dos tokens compartilhados atendem WCAG AA. O problema de acessibilidade observado é principalmente de foco, recorte e escala, não de contraste dos tokens-base.

## Coerência com o simulador canônico

### Preservado

- Mesmos tokens centrais: canvas `#111318`, superfícies `#1b1e25`/`#212632`, primário `#22c55e`, secundário `#368bc9`.
- Mesma escala de raios `6/10/16/20px`.
- Mesma linguagem de cards escuros, bordas discretas e foco verde.
- Mesmos princípios de largura `min(1400px, 100vw - 28px)` e breakpoint mobile em `760px`.

### Divergente

- O simulador mantém radios reais com área `18×18` e transfere o foco para um marcador visível; os previews escondem radios em `0×0`.
- O simulador troca estruturas largas por variantes mobile ou rolagem local; os previews cortam estruturas dentro do container.
- A referência usa escala textual mínima mais confortável e reduz densidade por seção.

## Capturas

As capturas persistentes foram geradas com Playwright nos caminhos:

- Antes: [`before/`](./before/)
- Depois: [`after/`](./after/)
- Comparações: [`comparison/`](./comparison/)

Convenção principal: `{rota}-{desktop|mobile}-{top|full}.png`. A evidência de foco usa `pagina_rodada-{viewport}-focus.png`.

## Causas-raiz confirmadas e correções

1. O recorte global foi removido. Tabelas largas agora têm rolagem local; frames, grids e labels recebem contenção explícita, quebra segura e `min-width: 0`.
2. Radios CSS permanecem semanticamente reais por uma técnica de ocultação acessível de `1px`; `:focus-visible` é refletido no label correspondente. Áreas dos controles foram elevadas para no mínimo `44px`.
3. Em mobile, o item com `aria-current="page"` recebe prioridade visual no início do trilho. A ordem de leitura do DOM e as sete rotas foram preservadas.
4. Legendas internas deixaram de competir como elementos sticky com o shell global; o header compartilhado continua fixo.
5. Microtextos críticos receberam piso tipográfico centralizado em mobile, sem alterar o conteúdo.
6. A regressão foi automatizada em Playwright para 7 rotas × 2 viewports, incluindo links, assets, console, foco, controles, `noindex`, `robots.txt` e overflow.

## Evidências de correção

- Recorte mobile:
  - Antes: [`index-mobile-full.png`](./before/index-mobile-full.png), [`sequencia_emails-mobile-full.png`](./before/sequencia_emails-mobile-full.png)
  - Depois: [`index-mobile-full.png`](./after/index-mobile-full.png), [`sequencia_emails-mobile-full.png`](./after/sequencia_emails-mobile-full.png)
- Foco de cenário:
  - Antes: [`pagina_rodada-mobile-focus.png`](./before/pagina_rodada-mobile-focus.png)
  - Depois: [`pagina_rodada-mobile-focus.png`](./after/pagina_rodada-mobile-focus.png)
- Orientação na navegação:
  - Antes: [`pagina_lps_waitlist-mobile-top.png`](./before/pagina_lps_waitlist-mobile-top.png)
  - Depois: [`pagina_lps_waitlist-mobile-top.png`](./after/pagina_lps_waitlist-mobile-top.png)

## Validação local após correções

- Vitest: `51/51` testes passando.
- Astro check: `0` erros, `0` avisos, `0` hints.
- Build: `7/7` páginas geradas.
- Playwright local: `51` testes passando, `15` capturas condicionais ignoradas sem `VISUAL_AUDIT_DIR`.
- Captura Playwright: `14/14` matrizes rota/viewport e `2/2` evidências de foco.

## Status das fases

- Fase 1 — inventário inicial: concluída.
- Fase 2 — Playwright e testes de regressão: concluída.
- Fase 3 — correções: concluída e validada localmente.
- Fase 4 — evidência final local: concluída; publicação e nova validação pública pendentes.
