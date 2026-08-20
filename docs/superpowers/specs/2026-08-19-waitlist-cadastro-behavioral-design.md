# Waitlist → Cadastro Behavioral Design

**Data:** 2026-08-19  
**Status:** aprovado para planejamento; implementação dos mocks fora do escopo deste documento.

## 1. Objetivo

Transformar contatos da waitlist em contas gratuitas por meio de uma campanha evergreen, comportamental e coordenada com o ciclo de rodada. A campanha demonstra uma única diferença de valor:

> O e-mail orienta e informa. A conta grátis abre números exatos, histórico, contexto e análises exclusivas atualizadas que nunca são entregues integralmente no inbox.

O resultado esperado é cadastro concluído com atribuição preservada, retorno ao conteúdo que motivou a ação e transição imediata para onboarding.

## 2. Decisões definitivas

- Descartar integralmente a sequência linear atual de quatro e-mails.
- Descartar o conceito de quatro landing pages temáticas.
- Manter no máximo três mensagens da jornada Waitlist → Cadastro por contato, contando mensagens regulares e recuperações.
- Manter o Bloco 8 em paralelo e com prioridade de envio.
- Não repetir calendário, jogos, placares, matchday ou conteúdo semanal do Bloco 8.
- Reutilizar Hub, Página da Rodada e Blog/artigo como destinos, pois essas superfícies já apresentam teasers de cadastro.
- Preservar a rota `pagina_lps_waitlist.html`, substituindo seu conteúdo por uma única LP institucional. Isso evita links quebrados e mantém sete documentos no menu canônico.
- Tratar a LP institucional como prova de valor e confiança, não como explicação abstrata da empresa.
- Separar o que a conta grátis entrega do que pertence ao Premium.
- Não usar taxa de acerto, urgência artificial, promessa de lucro, odd, stake ou imperativo de aposta.

## 3. Encaixe na estrutura Astro atual

O projeto possui sete páginas em `src/pages/`, um menu canônico derivado de `src/lib/documents.ts`, shell compartilhado em `src/layouts/BaseLayout.astro`, componentes de navegação em `src/components/` e testes do HTML gerado em `tests/site.test.ts`.

A implementação futura deve:

- manter `src/pages/sequencia_emails_waitlist.astro`;
- manter `src/pages/pagina_lps_waitlist.astro`;
- substituir o conteúdo de `src/components/pages/sequencia_emails_waitlist/Section01.astro` e `Section02.astro`;
- substituir o conteúdo das cinco seções de `src/components/pages/pagina_lps_waitlist/`;
- atualizar `src/components/pages/index/Section10.astro`, que hoje descreve quatro e-mails e quatro LPs;
- atualizar o registro canônico em `src/lib/documents.ts` de “LPs Waitlist” para “LP institucional”;
- conservar `BaseLayout`, `SiteNavigation`, a legenda de estados e os contratos de acessibilidade existentes.

Não será criado runtime real de automação, analytics, cadastro ou Mautic neste repositório. Instrumentação e decisão comportamental serão representadas visualmente como documentação de planejamento.

## 4. Arquitetura da jornada

### 4.1 Entrada

O contato entra em `waitlist_value_nurture` após confirmação da waitlist e associação à liga. Antes de cada envio, a jornada recalcula o estado usando eventos dos últimos 14 dias.

### 4.2 Estados comportamentais

1. `never_viewed`: nunca viu Hub, Rodada ou Blog no período.
2. `viewed_hub`: viu apenas o Hub.
3. `viewed_round`: viu apenas a Página da Rodada.
4. `viewed_blog`: viu apenas Blog/artigo.
5. `viewed_2_plus`: viu duas ou mais superfícies.
6. `gate_intent`: clicou em teaser/gate e não concluiu cadastro.
7. `registration_abandonment`: iniciou cadastro e não concluiu.

### 4.3 Prioridade determinística

Quando mais de um estado for verdadeiro, usar:

`registration_abandonment > gate_intent > viewed_2_plus > viewed_round > viewed_blog > viewed_hub > never_viewed`

Dentro do mesmo nível, vence o evento mais recente. Empate de timestamp é resolvido por `registration_started`, `access_teaser_clicked`, `content_engaged`, `content_viewed`.

### 4.4 Variantes

- `discovery`: apresenta a próxima superfície útil para quem ainda não demonstrou o comportamento correspondente.
- `deepening`: reconhece o que a pessoa já viu e avança para profundidade, prova ou decisão sem repetir a introdução.
- `gate_recovery`: retoma exatamente o teaser clicado.
- `registration_recovery`: retoma o cadastro iniciado.

As duas primeiras são as variantes editoriais regulares. As duas últimas substituem mensagens regulares quando há intenção explícita.

## 5. Cadência e controle de pressão

### 5.1 Janelas regulares

- E-mail 1 — Orientação: elegível 30 minutos após a entrada.
- E-mail 2 — Prova institucional: elegível 72 horas após o último envio da jornada.
- E-mail 3 — Decisão: elegível 96 horas após o último envio da jornada.

Essas janelas são elegibilidade, não reserva de calendário. O envio só ocorre após recálculo do estado e aplicação dos limites globais.

### 5.2 Recuperações

- Gate sem cadastro: primeira recuperação 2 horas após `access_teaser_clicked`; no máximo um lembrete adicional 72 horas depois.
- Cadastro abandonado: primeira recuperação 1 hora após abandono; lembrete opcional 24 horas depois.
- Recuperações cancelam todas as mensagens regulares pendentes.
- O total da jornada continua limitado a três mensagens; recuperações ocupam os slots restantes e nunca ampliam o teto.

### 5.3 Frequency cap

- no máximo 1 mensagem de marketing em 24 horas;
- no máximo 5 mensagens de marketing em 7 dias, somando todas as campanhas;
- mensagens transacionais não entram nesses limites;
- Bloco 8 tem prioridade sobre `waitlist_value_nurture`;
- se o Bloco 8 ocupar a janela, a mensagem da waitlist é adiada;
- mensagem da waitlist atrasada por mais de 72 horas deve ser recalculada; se o job ou destino não for mais o próximo passo correto, deve ser descartada;
- bounce definitivo, reclamação, opt-out ou cadastro concluído produzem saída imediata.

## 6. Matriz comportamental e destinos

| Estado vencedor | Tratamento | Mensagem e destino | Supressão |
| --- | --- | --- | --- |
| Nunca viu | `discovery` | E1 → Hub; E2 → LP institucional; E3 → artigo/Blog | Nenhuma além do cap |
| Viu Hub | `deepening` | E1 reconhece o panorama e aponta para Rodada; E2 → LP institucional; E3 → artigo/Blog | Suprimir apresentação do Hub |
| Viu Rodada | `deepening` | E1 é omitido; E2 → LP institucional; E3 → artigo metodológico ou cadastro com `return_url` da Rodada | Suprimir calendário, jogos e introdução da Rodada |
| Viu Blog | `deepening` | E1 usa “números por trás da análise” e aponta para Hub; E2 → LP institucional; E3 retorna ao artigo | Suprimir apresentação genérica do Blog |
| Viu 2+ | `deepening` | E1 é omitido; E2 → recorte curto do benefício grátis na LP; E3 → cadastro direto com `return_url` da superfície mais recente | Suprimir descoberta |
| Tocou gate | `gate_recovery` | 2h → cadastro com `return_url` exata; lembrete único até 72h se houver slot | Suprimir toda a sequência regular |
| Abandonou cadastro | `registration_recovery` | 1h → retomar cadastro; lembrete opcional 24h se houver slot | Suprimir sequência regular e recuperação de gate |

## 7. Conteúdo dos e-mails

O corpo dos e-mails não deve expor termos internos como Bloco 8, gate, evento, segmento, estado ou atribuição. Esses termos aparecem somente nos painéis de planejamento ao redor do mock.

### 7.1 E-mail 1 — Orientação

**Job:** levar à próxima superfície útil sem repetir conteúdo já visto.

**Descoberta**

- Assunto: “Sua conta grátis abre o que o e-mail não consegue mostrar”
- Preview: “Comece pelo panorama do campeonato e veja onde a análise continua.”
- Argumento: a lista mantém o leitor orientado; o Hub organiza o panorama e mostra onde existem camadas atualizadas.
- CTA: “Explorar o Hub”
- Destino: `pagina_hub_campeonato.html#hub-overview`

**Aprofundamento — viu Hub**

- Assunto: “Você já viu o panorama. Agora veja o que muda na rodada.”
- Preview: “O contexto aparece quando os dados saem da tabela e entram no confronto.”
- Argumento: reconhecer a visita e avançar para a Página da Rodada.
- CTA: “Ver a análise da rodada”
- Destino: `pagina_rodada.html#round-overview`

**Aprofundamento — viu Blog**

- Assunto: “Os números por trás da análise estão no Hub”
- Preview: “Do artigo ao panorama atualizado do campeonato.”
- Argumento: conectar a leitura editorial ao acompanhamento estruturado.
- CTA: “Ver o panorama completo”
- Destino: `pagina_hub_campeonato.html#hub-overview`

O E1 é suprimido para `viewed_round`, `viewed_2_plus`, `gate_intent` e `registration_abandonment`.

### 7.2 E-mail 2 — Prova institucional

**Job:** provar por que as análises completas vivem na plataforma e reduzir objeções ao cadastro.

**Descoberta**

- Assunto: “Por que as análises mais importantes não chegam por e-mail”
- Preview: “Números exatos, histórico e contexto mudam; a plataforma mantém tudo atualizado.”
- Argumento: o inbox não comporta a análise viva nem seu histórico.
- CTA: “Ver o que a conta grátis libera”
- Destino: `pagina_lps_waitlist.html#lp-exclusive-comparison`

**Aprofundamento**

- Assunto: “O que estava por trás dos trechos que você abriu”
- Preview: “Veja contexto, cenários e síntese sem perder o ponto em que você parou.”
- Argumento: reconhecer teaser ou leitura anterior e demonstrar as três camadas exclusivas.
- CTA: “Conhecer as análises exclusivas”
- Destino: `pagina_lps_waitlist.html#lp-exclusive-demo`, preservando `return_url`.

Para `gate_intent` e `registration_abandonment`, E2 regular é substituído pela recuperação correspondente.

### 7.3 E-mail 3 — Decisão ou recuperação

**Job:** oferecer uma decisão clara, retornando ao conteúdo de maior intenção.

**Descoberta**

- Assunto: “Veja uma análise completa antes de decidir”
- Preview: “O artigo mostra o método; a conta abre os números e o histórico.”
- Argumento: usar um artigo/metodologia como prova final sem promessa de resultado.
- CTA: “Ler a análise”
- Destino: `pagina_blog.html#article-methodology`

**Aprofundamento**

- Assunto: “Retome exatamente de onde você parou”
- Preview: “Sua conta grátis abre a camada que você tentou consultar.”
- Argumento: reduzir fricção e preservar contexto.
- CTA: “Criar conta e continuar”
- Destino: cadastro com `return_url` da superfície mais recente.

**Recuperação de gate**

- Assunto: “A análise que você abriu continua disponível”
- Preview: “Crie a conta grátis e volte ao mesmo ponto.”
- CTA: “Continuar a análise”
- Destino: cadastro com a `return_url` exata do teaser.

**Recuperação de cadastro**

- Assunto: “Seu cadastro ficou no meio do caminho”
- Preview: “Retome sem perder a análise que trouxe você até aqui.”
- CTA: “Retomar cadastro”
- Destino: sessão de cadastro retomável com `return_url` preservada.

## 8. Única LP institucional

### 8.1 Identidade e rota

- Rota de preview preservada: `pagina_lps_waitlist.html`.
- Label canônico: “LP institucional”.
- Título do documento: “Macro Markets — Análises exclusivas com conta grátis”.
- Âncora inicial: `lp-exclusive-hero`.

### 8.2 Estrutura

1. **Hero**
   - Headline: “A análise que muda com os dados não cabe num e-mail.”
   - Subheadline: “A conta grátis abre números exatos, histórico, contexto e análises exclusivas atualizadas na plataforma.”
   - CTA: “Criar conta grátis e ver as análises”.
   - O CTA carrega UTMs, `click_id` e `return_url`.
2. **Trust row**
   - “Conta grátis”
   - “Sem cartão”
   - “Análises atualizadas”
3. **Comparação visitante/e-mail × conta grátis**
   - Visitante/e-mail: orientação, recorte público, fatos e contexto resumido.
   - Conta grátis: números exatos, histórico, contexto aprofundado, cenários e síntese.
   - Premium permanece fora da promessa principal.
4. **Demonstração de análise exclusiva**
   - mostrar um recorte público ao lado da análise completa;
   - manter títulos e natureza do conteúdo legíveis;
   - não apresentar dado ilustrativo como resultado real;
   - incluir retrospecto encerrado com acerto e erro, sem taxa agregada.
5. **Método**
   - reproduzir conceitualmente o padrão visual `MethodologyBand`;
   - fatores: Dados, Contexto, Tendências;
   - resultado: Leitura de cenário;
   - implementação futura em Astro, sem copiar JSX ou componente React.
6. **Depoimentos**
   - reproduzir conceitualmente o padrão `TestimonialsSection`: três cards, identidade, contexto e citação;
   - conteúdo provisório marcado apenas em comentário ou metadata interna.
7. **Métricas e cases**
   - métrica provisória `+12 mil leitores`;
   - métrica factual de produto `3 camadas exclusivas`: contexto aprofundado, cenários e síntese;
   - case “e-mail × conta”;
   - case “retrospecto encerrado, incluindo o que confirmou e o que não confirmou”.
8. **Ecossistema**
   - cards para Hub, Rodada e Blog existentes;
   - cada card explica seu papel e aponta para a rota Astro correspondente.
9. **FAQ**
   - “A conta é grátis?” — Sim; cadastro não exige cartão.
   - “Vou receber palpites?” — Não; o produto entrega leitura de dados, contexto, tendências e cenários.
   - “Por que a análise não vem inteira no e-mail?” — Porque números, histórico e contexto mudam; a plataforma mantém a versão atualizada.
   - “O que acontece depois do cadastro?” — O leitor volta ao conteúdo de origem e inicia onboarding.
   - “Isso é o Premium?” — Não; a LP trata apenas dos benefícios da conta grátis.
10. **CTA final**
    - repetir “Criar conta grátis e ver as análises”;
    - preservar `return_url`;
    - fallback seguro para o Hub quando `return_url` estiver ausente ou inválida.

### 8.3 Prova social provisória aprovada

O mock deve usar comentários como `<!-- [PROVISÓRIO] Substituir por prova autorizada antes de publicação externa. -->`. O rótulo não aparece visualmente.

- Marina, Brasileirão: “No e-mail eu já sabia o que estava em jogo. Na conta encontrei os cenários e a síntese que não cabiam na mensagem.”
- Rafael, Copa do Brasil: “O e-mail prepara. A conta entrega os números e o contexto completo.”
- Camila, Libertadores: “Criei a conta para comparar o recorte público com a análise completa. A diferença ficou evidente.”

Não usar avatar que implique pessoa real identificável sem autorização. O mock pode usar iniciais abstratas.

## 9. Instrumentação

### 9.1 Eventos de conteúdo e cadastro

- `content_viewed`
- `content_engaged`
- `access_teaser_viewed`
- `access_teaser_clicked`
- `registration_cta_clicked`
- `registration_started`
- `registration_completed`
- `registration_abandoned`
- `lp_exclusive_viewed`

### 9.2 Eventos de e-mail e preferência

- `email_queued`
- `email_sent`
- `email_delivered`
- `email_opened`
- `email_clicked`
- `email_bounced`
- `email_unsubscribed`
- `email_preferences_updated`
- `journey_exited`

### 9.3 Propriedades comuns obrigatórias

- `event_id`
- `contact_id`
- `anonymous_id`
- `session_id`
- `surface`
- `content_id`
- `gate_id`
- `access_state`
- `source_campaign`
- `source_email`
- `email_variant`
- `journey_state`
- `league`
- `referrer`
- `return_url`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `click_id`
- `timestamp`

Eventos anteriores à identificação usam `anonymous_id`. Após `registration_started` ou identificação do contato, o histórico é unido a `contact_id` sem alterar `event_id`.

### 9.4 Semântica mínima

- `surface`: `hub`, `round`, `blog`, `institutional_lp`, `registration`.
- `access_state`: `visitor`, `waitlist`, `registered`, `premium`.
- `email_variant`: `discovery`, `deepening`, `gate_recovery`, `registration_recovery`.
- `journey_state`: um dos sete estados comportamentais.
- `content_engaged`: disparado após 30 segundos ativos ou 50% de profundidade; uma vez por `session_id + content_id`.
- `registration_abandoned`: disparado quando houve `registration_started`, não houve `registration_completed` em 30 minutos e a sessão foi encerrada ou expirou.

### 9.5 Deduplicação

- Eventos são idempotentes por `event_id`.
- Exposição de teaser deduplica por `session_id + gate_id`.
- Abertura de e-mail não altera estado de superfície.
- Cliques carregam `click_id` único e são unidos ao evento de página seguinte.
- `registration_completed` vence qualquer evento posterior atrasado da mesma jornada.

## 10. Atribuição

### 10.1 Campanhas

- Bloco 8: `utm_campaign=block8_round_cycle`.
- Waitlist: `utm_campaign=waitlist_value_nurture`.
- `utm_source=mautic`.
- `utm_medium=email`.
- `utm_content` identifica peça e variante, por exemplo `e2_deepening` ou `gate_recovery_1`.

### 10.2 Modelos preservados

- **First touch:** primeiro toque identificável da jornada, imutável.
- **Last meaningful touch:** último clique, teaser, início de cadastro ou visita engajada antes do cadastro; abertura isolada não conta.
- **Multi-touch:** sequência ordenada de toques com campanha, conteúdo, variante, `click_id` e timestamp.

O cadastro deve registrar os três modelos. A passagem para onboarding não pode apagar a origem waitlist nem a contribuição do Bloco 8.

## 11. Saída e pós-cadastro

Ao receber `registration_completed`:

1. cancelar mensagens regulares e recuperações pendentes;
2. registrar `journey_exited` com motivo `registration_completed`;
3. preservar first touch, last meaningful touch e multi-touch;
4. validar `return_url` contra uma allowlist de caminhos do mesmo domínio;
5. retornar à superfície e âncora de origem; se inválida ou ausente, retornar ao Hub;
6. iniciar onboarding;
7. impedir reentrada na jornada Waitlist → Cadastro.

Opt-out cancela a jornada imediatamente. Preferência por menor frequência é respeitada antes do próximo cálculo. Bounce definitivo e reclamação bloqueiam novos envios de marketing.

## 12. Mock visual da documentação

A página `sequencia_emails_waitlist.html` deve conter, fora do corpo dos e-mails:

- fluxograma resumido da prioridade;
- matriz dos sete estados;
- régua de recência e frequency cap;
- catálogo visual dos eventos e propriedades;
- exemplos de UTMs e atribuição;
- cartões das variantes Descoberta, Aprofundamento e recuperações;
- indicação explícita de que o Bloco 8 roda em paralelo e tem prioridade.

O conteúdo técnico deve estar em painéis de planejamento, não dentro dos clientes de e-mail.

## 13. Critérios de aceitação

- A sequência visual apresenta no máximo três mensagens por caminho.
- Nenhum e-mail duplica jogo, placar, calendário, matchday ou rodada corrente.
- Cada estado comportamental possui tratamento, supressão e destino definidos.
- Hub, Rodada, Blog e LP institucional usam rotas e âncoras válidas.
- A LP é única e preserva `pagina_lps_waitlist.html`.
- Hero, CTA e dez seções da LP correspondem ao design aprovado.
- Depoimentos, métrica de leitores e cases provisórios têm marcação interna `[PROVISÓRIO]` e nenhuma etiqueta visual.
- Não existe promessa de lucro, urgência inventada ou taxa de acerto.
- Instrumentação inclui todos os eventos e propriedades definidos.
- UTMs separam `block8_round_cycle` de `waitlist_value_nurture`.
- Cadastro encerra a jornada, preserva atribuição, retorna ao conteúdo e inicia onboarding.
- Menu canônico e documento-mãe deixam de apresentar “quatro LPs”.
- HTML gerado mantém `noindex`, navegação compartilhada, acessibilidade, links válidos e ausência de JavaScript cliente desnecessário.
