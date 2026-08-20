export type RoundEmailEvent =
  | 'pre_round'
  | 'first_main_block'
  | 'final_main_block'
  | 'post_round';

export type RoundEmailBodyRole =
  | 'greeting'
  | 'thesis'
  | 'evidence'
  | 'interpretation'
  | 'next-signal'
  | 'signoff';

export type RoundEmailVariantRole = 'control' | 'challenger';

export type RoundEmailBodyBlock = Readonly<{
  role: RoundEmailBodyRole;
  label?: string;
  text: string;
}>;

export type RoundEmailVariant = Readonly<{
  id: string;
  letter: 'A' | 'B' | 'C' | 'D';
  name: string;
  hypothesis: string;
  subject: string;
  preview: string;
  body: readonly RoundEmailBodyBlock[];
  cta: string;
  destinationHref: string;
  destinationIntent: string;
  role: RoundEmailVariantRole;
  requiredPayload: readonly string[];
  eligibility: string;
  postGameBlockers?: readonly string[];
}>;

export type RoundEmail = Readonly<{
  id: 'E1' | 'E2' | 'E3' | 'E4';
  event: RoundEmailEvent;
  title: string;
  trigger: string;
  purpose: string;
  queueGate: 'validated_editorial_payload' | 'confirmed_results_and_evidence';
  variants: readonly RoundEmailVariant[];
}>;

export type RoundEmailPayloadGroup = Readonly<{
  id: string;
  label: string;
  keys: readonly string[];
  rule: string;
}>;

const roundDestinationHref =
  '/static-preview-notes/pagina_rodada.html#round-overview';

const destinationIntent =
  'Cadastro gratuito → retorno à rodada corrente com dados, histórico e cenários adicionais.';

export const ROUND_EMAIL_PAYLOAD_CONTRACT = [
  {
    id: 'identity',
    label: 'Identidade da rodada',
    keys: ['first_name', 'round_number', 'round_slug', 'round_match_count'],
    rule: 'A mesma identidade alimenta assunto, preview e corpo.',
  },
  {
    id: 'calendar',
    label: 'Calendário real',
    keys: [
      'first_main_matchday_label',
      'final_main_matchday_label',
      'first_block_match_count',
      'final_block_match_count',
      'first_block_opening_time',
      'round_last_match_timestamp',
    ],
    rule:
      'Rótulos, quantidades e horários vêm do calendário validado; não existem dias fixos no contrato.',
  },
  {
    id: 'table',
    label: 'Tabela e tensões',
    keys: [
      'leader_name',
      'leader_points',
      'title_challenger_name',
      'title_challenger_points',
      'title_gap',
      'title_race_label',
      'title_race_fact',
      'title_race_implication',
      'g4_race_label',
      'g4_race_fact',
      'g4_key_match',
      'z4_race_label',
      'z4_race_fact',
      'z4_key_match',
      'z4_key_match_implication',
    ],
    rule:
      'Posições, pontos e diferenças precisam usar o mesmo snapshot editorial.',
  },
  {
    id: 'anchor',
    label: 'Confronto âncora',
    keys: [
      'anchor_match',
      'anchor_match_time',
      'anchor_match_implication',
      'anchor_match_short_implication',
      'anchor_team_a',
      'anchor_team_a_points',
      'anchor_team_a_context',
      'anchor_team_a_market_probability',
      'anchor_draw_market_probability',
      'anchor_team_b',
      'anchor_team_b_points',
      'anchor_team_b_context',
      'anchor_team_b_market_probability',
      'anchor_evidence_summary',
      'anchor_next_watch',
    ],
    rule:
      'Probabilidades e evidências devem compartilhar timestamp, locale e fuso.',
  },
  {
    id: 'e1',
    label: 'E1 · pré-rodada',
    keys: [
      'first_block_title_match',
      'first_block_title_match_time',
      'first_block_title_implication',
      'round_core_thesis',
      'e1_next_watch',
      'first_block_connection_match',
      'first_block_connection_implication',
      'final_block_affected_match',
      'connection_supporting_fact',
      'first_block_next_watch',
      'final_block_response_watch',
    ],
    rule:
      'Cada tensão precisa de fato, consequência e próximo sinal antes do CTA.',
  },
  {
    id: 'e2',
    label: 'E2 · primeiro bloco principal',
    keys: [
      'first_block_top_match',
      'first_block_top_match_time',
      'first_block_top_fact',
      'first_block_top_implication',
      'first_block_bottom_match',
      'first_block_bottom_match_time',
      'first_block_bottom_fact',
      'first_block_bottom_implication',
      'first_block_shared_consequence',
      'first_block_watch_1_label',
      'first_block_watch_1_fact',
      'first_block_watch_1_implication',
      'first_block_watch_2_label',
      'first_block_watch_2_fact',
      'first_block_watch_2_implication',
      'first_block_watch_3_label',
      'first_block_watch_3_fact',
      'first_block_watch_3_signal',
      'connection_trigger',
      'connection_first_consequence',
      'connection_final_implication',
      'connection_so_what',
      'first_block_metric_to_watch',
      'final_block_metric_to_watch',
    ],
    rule:
      'Variantes condicionais só participam quando a tensão descrita existe.',
  },
  {
    id: 'e3',
    label: 'E3 · bloco principal final',
    keys: [
      'final_tension_1_label',
      'final_tension_1_match',
      'final_tension_1_time',
      'final_tension_1_fact',
      'final_tension_1_implication',
      'final_tension_2_label',
      'final_tension_2_match',
      'final_tension_2_time',
      'final_tension_2_fact',
      'final_tension_3_label',
      'final_tension_3_match',
      'final_tension_3_time',
      'final_tension_3_fact',
      'final_block_core_thesis',
      'final_block_next_watch',
      'cross_table_match',
      'cross_table_match_time',
      'cross_table_top_team',
      'cross_table_top_objective',
      'cross_table_top_position',
      'cross_table_top_points',
      'cross_table_top_gap',
      'cross_table_top_reference',
      'cross_table_top_implication',
      'cross_table_bottom_team',
      'cross_table_bottom_objective',
      'cross_table_bottom_position',
      'cross_table_bottom_points',
      'cross_table_bottom_gap',
      'cross_table_bottom_implication',
      'z4_reference_team',
      'cross_table_next_match',
      'divergence_match_1',
      'market_probability_1',
      'model_target_team_1',
      'model_probability_1',
      'model_market_gap_pp_1',
      'divergence_match_2',
      'market_probability_2',
      'model_target_team_2',
      'model_probability_2',
      'model_market_gap_pp_2',
      'divergence_evidence_summary',
      'divergence_next_update',
      'updated_team_1',
      'updated_team_2',
      'updated_match_1',
      'updated_match_2',
      'confirmed_update_1',
      'confirmed_update_2',
      'probability_before_1',
      'probability_after_1',
      'probability_before_2',
      'probability_after_2',
      'updated_analysis_thesis',
      'updated_analysis_next_watch',
    ],
    rule:
      'Mercado, modelo e atualizações usam evidências confirmadas no mesmo corte temporal.',
  },
  {
    id: 'conversion',
    label: 'Conversão e renderização',
    keys: [
      'registration_url',
      'round_return_url',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'variant_id',
      'locale',
      'timezone',
      'editorial_validated_at',
    ],
    rule:
      'UTMs, retorno, locale, fuso e validação editorial são obrigatórios.',
  },
] as const satisfies readonly RoundEmailPayloadGroup[];

export const ROUND_EMAIL_PAYLOAD_KEYS = ROUND_EMAIL_PAYLOAD_CONTRACT.flatMap(
  (group) => group.keys,
);

export const ROUND_EMAIL_CAMPAIGN = {
  name: 'Campanha por rodada · Waitlist → Cadastro',
  promise:
    'Cada envio entrega uma tese esportiva completa; o CTA apenas aprofunda a experiência.',
  primaryMetric: 'registration_completed / email_delivered',
  calendarContract: [
    'Os envios são acionados por eventos da rodada, não por dias fixos.',
    'Dia, quantidade de jogos, horários e confrontos vêm de um payload editorial validado.',
    'Assunto, preview e corpo compartilham o mesmo payload.',
    'Token ausente, obsoleto ou contraditório bloqueia o envio.',
    'A variante só é elegível quando a tensão factual descrita existe.',
    'E4 exige resultados, movimentos e evidências confirmados após o último jogo real.',
  ],
  experimentRules: [
    'Teste A/B/n simultâneo entre as variantes elegíveis de cada envio.',
    'Definir a amostra antes do início; não encerrar por resultado parcial.',
    'Mesmo público elegível, remetente, janela de envio e frequência.',
    'Mesmo destino e intenção; cada variante altera apenas o ângulo editorial.',
    'Métrica principal por entregue; abertura é diagnóstico secundário.',
  ],
  emails: [
    {
      id: 'E1',
      event: 'pre_round',
      title: 'Pré-rodada',
      trigger: 'Antes do primeiro bloco real da rodada.',
      purpose:
        'Organizar a rodada com uma tese, evidências e sinais que o leitor pode acompanhar.',
      queueGate: 'validated_editorial_payload',
      variants: [
        {
          id: 'e1-a',
          letter: 'A',
          name: 'Perguntas da rodada',
          hypothesis:
            'Perguntas respondidas tornam a complexidade da rodada acessível e demonstram capacidade analítica.',
          subject: 'Três perguntas que organizam a rodada {{round_number}}',
          preview:
            'Liderança, Z4 e {{anchor_match}} conectam os principais movimentos.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Três perguntas ajudam a organizar a rodada {{round_number}}.',
            },
            {
              role: 'evidence',
              label: 'Quem começa em vantagem no topo?',
              text: '{{leader_name}} lidera com {{leader_points}} pontos. {{title_challenger_name}} tem {{title_challenger_points}}, uma diferença de {{title_gap}}.',
            },
            {
              role: 'evidence',
              label: 'Quem pode mudar essa conta primeiro?',
              text: '{{first_block_title_match}}, em {{first_main_matchday_label}} às {{first_block_title_match_time}}, pode {{first_block_title_implication}}.',
            },
            {
              role: 'interpretation',
              label: 'Qual confronto conecta os blocos?',
              text: '{{anchor_match}}, às {{anchor_match_time}}. O resultado pode {{anchor_match_implication}}. A tese da rodada é {{round_core_thesis}}.',
            },
            {
              role: 'next-signal',
              text: 'O próximo sinal será {{e1_next_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver o mapa e os dados da rodada',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: [
            'identity',
            'calendar',
            'table',
            'anchor',
            'e1',
            'conversion',
          ],
          eligibility:
            'Elegível quando topo, primeiro movimento e confronto âncora estiverem factualmente conectados.',
        },
        {
          id: 'e1-b',
          letter: 'B',
          name: 'Jogos conectados',
          hypothesis:
            'Mostrar causalidade entre os blocos converte leitores interessados na rodada como narrativa, não como agenda.',
          subject:
            '{{first_main_matchday_label}} deixa o cenário. {{final_main_matchday_label}} responde.',
          preview:
            '{{first_block_match_count}} jogos no primeiro bloco mudam o peso dos {{final_block_match_count}} finais.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'A rodada {{round_number}} tem uma sequência clara.',
            },
            {
              role: 'evidence',
              text: 'No primeiro bloco, {{first_block_connection_match}} pode {{first_block_connection_implication}}.',
            },
            {
              role: 'evidence',
              text: 'Isso muda diretamente a leitura de {{final_block_affected_match}}, no bloco final. A conexão é concreta: {{connection_supporting_fact}}.',
            },
            {
              role: 'interpretation',
              text: 'Por isso, não basta olhar os confrontos separadamente. O resultado inicial altera a pressão, as distâncias na tabela e o que cada equipe precisa buscar depois.',
            },
            {
              role: 'next-signal',
              text: 'Primeiro, acompanhe {{first_block_next_watch}}. Depois, observe {{final_block_response_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Acompanhar como os jogos se conectam',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: ['identity', 'calendar', 'e1', 'conversion'],
          eligibility:
            'Elegível quando um fato verificável do primeiro bloco altera um confronto do bloco final.',
        },
        {
          id: 'e1-c',
          letter: 'C',
          name: 'Guia prático',
          hypothesis:
            'Um checklist escaneável reduz esforço no celular e aumenta a percepção de utilidade.',
          subject: 'O que acompanhar na rodada {{round_number}}',
          preview:
            'Três movimentos explicam a rodada sem tratar {{round_match_count}} jogos como histórias isoladas.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Para acompanhar a rodada {{round_number}} sem se perder, observe três movimentos.',
            },
            {
              role: 'evidence',
              label: '1. {{title_race_label}}',
              text: '{{title_race_fact}}. Isso significa {{title_race_implication}}.',
            },
            {
              role: 'evidence',
              label: '2. {{g4_race_label}}',
              text: '{{g4_race_fact}}. O resultado-chave será {{g4_key_match}}.',
            },
            {
              role: 'evidence',
              label: '3. {{z4_race_label}}',
              text: '{{z4_race_fact}}. {{z4_key_match}} pode {{z4_key_match_implication}}.',
            },
            {
              role: 'interpretation',
              text: 'A rodada não será explicada por um único placar. A conclusão central é {{round_core_thesis}}.',
            },
            {
              role: 'next-signal',
              text: 'O próximo ponto a acompanhar é {{e1_next_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Abrir o guia da rodada',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'control',
          requiredPayload: ['identity', 'table', 'e1', 'conversion'],
          eligibility:
            'Controle amplo; exige fatos confirmados para título, G4 e Z4.',
        },
      ],
    },
    {
      id: 'E2',
      event: 'first_main_block',
      title: 'Primeiro bloco principal',
      trigger: 'Na janela editorial do primeiro bloco principal real.',
      purpose:
        'Explicar o que o primeiro bloco pode mudar e qual sinal conecta a etapa seguinte.',
      queueGate: 'validated_editorial_payload',
      variants: [
        {
          id: 'e2-a',
          letter: 'A',
          name: 'Dois extremos',
          hypothesis:
            'Apresentar simultaneamente topo e Z4 amplia a relevância para torcedores de clubes diferentes.',
          subject:
            '{{first_main_matchday_label}} pode mexer nos dois extremos',
          preview:
            '{{first_block_top_match}} movimenta o topo; {{first_block_bottom_match}} pressiona o Z4.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'O primeiro bloco principal da rodada {{round_number}} concentra duas tensões.',
            },
            {
              role: 'evidence',
              label: 'No topo',
              text: '{{first_block_top_match}}, às {{first_block_top_match_time}}. {{first_block_top_fact}}. O resultado pode {{first_block_top_implication}}.',
            },
            {
              role: 'evidence',
              label: 'Na parte de baixo',
              text: '{{first_block_bottom_match}}, às {{first_block_bottom_match_time}}. {{first_block_bottom_fact}}. Isso pode {{first_block_bottom_implication}}.',
            },
            {
              role: 'interpretation',
              text: 'São confrontos diferentes, mas ligados pela mesma consequência: {{first_block_shared_consequence}}.',
            },
            {
              role: 'next-signal',
              text: 'O próximo sinal será {{first_block_next_watch}}, que define como o bloco final recebe a tabela.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver os dois extremos da rodada',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'control',
          requiredPayload: ['identity', 'calendar', 'table', 'e2', 'conversion'],
          eligibility:
            'Somente se o primeiro bloco sustentar tensões reais no topo e no Z4.',
        },
        {
          id: 'e2-b',
          letter: 'B',
          name: 'Antes da bola',
          hypothesis:
            'Um roteiro cronológico reduz esforço e ajuda o leitor a acompanhar o bloco com intenção.',
          subject:
            'Antes de {{first_block_opening_time}}: o que acompanhar',
          preview:
            '{{first_block_match_count}} jogos e três sinais que podem reorganizar a rodada.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Antes do primeiro jogo do bloco, marque três pontos.',
            },
            {
              role: 'evidence',
              label: '{{first_block_watch_1_label}}',
              text: '{{first_block_watch_1_fact}}. Isso importa porque {{first_block_watch_1_implication}}.',
            },
            {
              role: 'evidence',
              label: '{{first_block_watch_2_label}}',
              text: '{{first_block_watch_2_fact}}. O resultado pode {{first_block_watch_2_implication}}.',
            },
            {
              role: 'evidence',
              label: '{{first_block_watch_3_label}}',
              text: '{{first_block_watch_3_fact}}. Observe {{first_block_watch_3_signal}}.',
            },
            {
              role: 'interpretation',
              text: 'Esses pontos não resumem todos os jogos. Eles concentram as consequências mais relevantes para a classificação e para o bloco seguinte.',
            },
            {
              role: 'next-signal',
              text: 'O primeiro sinal será {{first_block_next_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Consultar o roteiro do primeiro bloco',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: ['identity', 'calendar', 'e2', 'conversion'],
          eligibility:
            'Exige três histórias factualmente distintas e um horário de abertura confirmado.',
        },
        {
          id: 'e2-c',
          letter: 'C',
          name: 'Primeiro bloco muda o último',
          hypothesis:
            'Mostrar uma relação condicional entre os blocos prova método e cria continuidade editorial.',
          subject:
            'O que acontecer em {{first_main_matchday_label}} muda {{final_main_matchday_label}}',
          preview:
            '{{first_block_connection_match}} define a pressão sobre {{final_block_affected_match}}.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'O primeiro bloco não termina no último apito.',
            },
            {
              role: 'evidence',
              text: 'Em {{first_block_connection_match}}, o cenário principal é: se {{connection_trigger}}, então {{connection_first_consequence}}.',
            },
            {
              role: 'evidence',
              text: 'Essa consequência chega diretamente a {{final_block_affected_match}}: {{connection_final_implication}}. A evidência que sustenta essa relação é {{connection_supporting_fact}}.',
            },
            {
              role: 'interpretation',
              text: 'Isso importa porque {{connection_so_what}}. A classificação pode parecer estável entre os blocos, mas o nível de pressão já terá mudado.',
            },
            {
              role: 'next-signal',
              text: 'O próximo ponto é comparar {{first_block_metric_to_watch}} com {{final_block_metric_to_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver como o primeiro bloco muda o último',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: ['identity', 'calendar', 'e1', 'e2', 'conversion'],
          eligibility:
            'Somente quando houver uma relação causal sustentada por dado entre os blocos.',
        },
        {
          id: 'e2-d',
          letter: 'D',
          name: 'Jogo âncora',
          hypothesis:
            'Concentrar a narrativa no confronto de maior impacto aumenta especificidade e identificação.',
          subject:
            '{{anchor_match}}: o jogo que organiza o primeiro bloco',
          preview:
            'Às {{anchor_match_time}}, {{anchor_match_short_implication}}.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: '{{anchor_match}} é o confronto que organiza o primeiro bloco da rodada {{round_number}}.',
            },
            {
              role: 'evidence',
              text: '{{anchor_team_a}} chega com {{anchor_team_a_points}} pontos e {{anchor_team_a_context}}. {{anchor_team_b}} tem {{anchor_team_b_points}} e {{anchor_team_b_context}}.',
            },
            {
              role: 'evidence',
              text: 'O mercado está em {{anchor_team_a_market_probability}} para {{anchor_team_a}}, {{anchor_draw_market_probability}} para o empate e {{anchor_team_b_market_probability}} para {{anchor_team_b}}.',
            },
            {
              role: 'interpretation',
              text: 'A tese não está no número isolado. Ela vem de {{anchor_evidence_summary}}. O resultado pode {{anchor_match_implication}}.',
            },
            {
              role: 'next-signal',
              text: 'O próximo sinal será {{anchor_next_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Aprofundar {{anchor_match}}',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: ['identity', 'anchor', 'conversion'],
          eligibility:
            'Exige âncora real, contextos e probabilidades validadas no mesmo timestamp.',
        },
      ],
    },
    {
      id: 'E3',
      event: 'final_main_block',
      title: 'Bloco principal final',
      trigger: 'Na janela editorial do bloco principal final real.',
      purpose:
        'Atualizar a tese com o que já ocorreu e organizar as tensões que encerram a rodada.',
      queueGate: 'validated_editorial_payload',
      variants: [
        {
          id: 'e3-a',
          letter: 'A',
          name: 'Mapa do bloco final',
          hypothesis:
            'Um panorama amplo atende mais perfis de torcedor e cria uma referência estável para comparação.',
          subject:
            '{{final_main_matchday_label}}: {{final_block_match_count}} jogos, três tensões',
          preview:
            '{{final_tension_1_label}}, {{final_tension_2_label}} e {{final_tension_3_label}} organizam o bloco final.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'O bloco final tem {{final_block_match_count}} jogos, mas três tensões organizam a leitura.',
            },
            {
              role: 'evidence',
              label: '{{final_tension_1_label}}',
              text: '{{final_tension_1_match}}, às {{final_tension_1_time}}. {{final_tension_1_fact}}. Isso pode {{final_tension_1_implication}}.',
            },
            {
              role: 'evidence',
              label: '{{final_tension_2_label}}',
              text: '{{final_tension_2_match}}, às {{final_tension_2_time}}. {{final_tension_2_fact}}.',
            },
            {
              role: 'evidence',
              label: '{{final_tension_3_label}}',
              text: '{{final_tension_3_match}}, às {{final_tension_3_time}}. {{final_tension_3_fact}}.',
            },
            {
              role: 'interpretation',
              text: 'A conclusão é {{final_block_core_thesis}}.',
            },
            {
              role: 'next-signal',
              text: 'O próximo sinal será {{final_block_next_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver o mapa atualizado do bloco final',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'control',
          requiredPayload: ['identity', 'calendar', 'e3', 'conversion'],
          eligibility:
            'Controle amplo; exige três tensões reais com confronto, horário e fato.',
        },
        {
          id: 'e3-b',
          letter: 'B',
          name: 'Dois lados da tabela',
          hypothesis:
            'Um confronto que reúne objetivos opostos cria tensão fácil de compreender e forte relevância esportiva.',
          subject:
            '{{cross_table_match}} coloca {{cross_table_top_team}} e {{cross_table_bottom_team}} frente a frente',
          preview:
            'Um busca {{cross_table_top_objective}}; o outro precisa {{cross_table_bottom_objective}}.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: '{{cross_table_match}}, às {{cross_table_match_time}}, reúne dois lados da classificação.',
            },
            {
              role: 'evidence',
              text: '{{cross_table_top_team}} chega em {{cross_table_top_position}}, com {{cross_table_top_points}} pontos e {{cross_table_top_gap}} para {{cross_table_top_reference}}.',
            },
            {
              role: 'evidence',
              text: '{{cross_table_bottom_team}} está em {{cross_table_bottom_position}}, com {{cross_table_bottom_points}} e {{cross_table_bottom_gap}} para {{z4_reference_team}}.',
            },
            {
              role: 'interpretation',
              text: 'Isso muda a leitura do jogo: {{cross_table_top_implication}} para um lado; {{cross_table_bottom_implication}} para o outro.',
            },
            {
              role: 'next-signal',
              text: 'O resultado seguinte capaz de confirmar ou desfazer esse movimento é {{cross_table_next_match}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Abrir os cenários de {{cross_table_match}}',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: ['identity', 'table', 'e3', 'conversion'],
          eligibility:
            'Somente se o confronto reunir objetivos opostos reais na classificação.',
        },
        {
          id: 'e3-c',
          letter: 'C',
          name: 'Divergência analítica',
          hypothesis:
            'Uma diferença verificável entre modelo e mercado demonstra capacidade analítica proprietária.',
          subject:
            'Modelo e mercado divergem em dois jogos do bloco final',
          preview:
            '{{divergence_match_1}} e {{divergence_match_2}} pedem contexto, não números soltos.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Uma divergência não diz quem vai vencer. Ela mostra onde duas leituras usam premissas diferentes.',
            },
            {
              role: 'evidence',
              text: 'Em {{divergence_match_1}}, o mercado atribui {{market_probability_1}} a {{model_target_team_1}}; o modelo chega a {{model_probability_1}}. A diferença é de {{model_market_gap_pp_1}} pontos percentuais.',
            },
            {
              role: 'evidence',
              text: 'Em {{divergence_match_2}}, são {{market_probability_2}} no mercado e {{model_probability_2}} no modelo, diferença de {{model_market_gap_pp_2}} pontos.',
            },
            {
              role: 'interpretation',
              text: 'As causas são {{divergence_evidence_summary}}.',
            },
            {
              role: 'next-signal',
              text: 'O próximo sinal é verificar se {{divergence_next_update}} reduz ou amplia essas distâncias.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Comparar modelo, mercado e premissas',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: ['identity', 'e3', 'conversion'],
          eligibility:
            'Exige dois gaps calculados entre modelo e mercado no mesmo timestamp.',
        },
        {
          id: 'e3-d',
          letter: 'D',
          name: 'Análise atualizada',
          hypothesis:
            'Demonstrar que a leitura responde a fatos novos reforça atualidade e confiança.',
          subject: 'Duas atualizações mudaram a leitura do bloco final',
          preview:
            'Novidades em {{updated_team_1}} e {{updated_team_2}} alteraram premissas relevantes.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Dado novo só importa quando muda uma premissa.',
            },
            {
              role: 'evidence',
              text: 'Em {{updated_match_1}}, {{confirmed_update_1}}. Antes da confirmação, {{updated_team_1}} estava em {{probability_before_1}}; agora está em {{probability_after_1}}.',
            },
            {
              role: 'evidence',
              text: 'Em {{updated_match_2}}, {{confirmed_update_2}}. A leitura passou de {{probability_before_2}} para {{probability_after_2}}.',
            },
            {
              role: 'interpretation',
              text: 'O movimento não prova que o mercado está certo. Ele mostra que a informação foi incorporada e que a análise precisa ser relida. A conclusão atual é {{updated_analysis_thesis}}.',
            },
            {
              role: 'next-signal',
              text: 'O próximo sinal será {{updated_analysis_next_watch}}.',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver o que mudou nas análises',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: ['identity', 'e3', 'conversion'],
          eligibility:
            'Exige duas atualizações confirmadas e comparações antes/depois.',
        },
      ],
    },
    {
      id: 'E4',
      event: 'post_round',
      title: 'Pós-rodada',
      trigger: 'Imediatamente após o último jogo real da rodada.',
      purpose:
        'Comparar tese e evidência com transparência e explicar a nova configuração esportiva.',
      queueGate: 'confirmed_results_and_evidence',
      variants: [
        {
          id: 'e4-a',
          letter: 'A',
          name: 'Balanço honesto',
          hypothesis:
            'Comparar leituras confirmadas e refutadas aumenta confiança por transparência.',
          subject:
            'Rodada {{round_number}}: o que se confirmou — e o que não',
          preview:
            '[CENÁRIO QUE SE CONFIRMOU] apareceu em campo; [CENÁRIO QUE NÃO SE CONFIRMOU] perdeu força.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'O último apito deixou duas respostas importantes.',
            },
            {
              role: 'evidence',
              label: 'O que se confirmou',
              text: '[CENÁRIO QUE SE CONFIRMOU]. Em [JOGO], o [PLACAR CONFIRMADO] veio acompanhado de [DADO QUE SUSTENTA A LEITURA].',
            },
            {
              role: 'evidence',
              label: 'O que não se confirmou',
              text: '[CENÁRIO QUE NÃO SE CONFIRMOU]. O [PLACAR CONFIRMADO] e [DADO CONTRÁRIO À HIPÓTESE] mostraram que a premissa precisava ser revista.',
            },
            {
              role: 'interpretation',
              text: 'Isso importa porque [MOVIMENTO NA TABELA] alterou o contexto do campeonato.',
            },
            {
              role: 'next-signal',
              text: 'O próximo ponto a acompanhar é [PRÓXIMO PONTO A ACOMPANHAR].',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver o balanço e os dados pós-jogo',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'control',
          requiredPayload: [
            'identity',
            'confirmed scores',
            'confirmed evidence',
            'confirmed table movement',
            'conversion',
          ],
          eligibility:
            'Somente após o último jogo, com cenário confirmado e cenário refutado sustentados por evidência.',
          postGameBlockers: [
            'CENÁRIO QUE SE CONFIRMOU',
            'CENÁRIO QUE NÃO SE CONFIRMOU',
            'JOGO',
            'PLACAR CONFIRMADO',
            'DADO QUE SUSTENTA A LEITURA',
            'DADO CONTRÁRIO À HIPÓTESE',
            'MOVIMENTO NA TABELA',
            'PRÓXIMO PONTO A ACOMPANHAR',
          ],
        },
        {
          id: 'e4-b',
          letter: 'B',
          name: 'Um jogo responde',
          hypothesis:
            'Reconstruir a análise por um confronto facilita a compreensão do método.',
          subject: '[JOGO-ÂNCORA]: a pergunta antes, a resposta depois',
          preview:
            'O cenário era [CENÁRIO PRÉ-JOGO]. O placar foi [PLACAR CONFIRMADO].',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Antes de [JOGO-ÂNCORA], a pergunta era [PERGUNTA PRÉ-JOGO].',
            },
            {
              role: 'evidence',
              text: 'A leitura apontava [CENÁRIO PRÉ-JOGO], sustentada por [DADO PRÉ-JOGO]. O placar foi [PLACAR CONFIRMADO].',
            },
            {
              role: 'evidence',
              text: 'A resposta não está apenas no resultado. [FATO QUE VALIDOU A LEITURA] confirmou parte da premissa, enquanto [FATO QUE CONTRADISSE A LEITURA] mostrou seu limite.',
            },
            {
              role: 'interpretation',
              text: 'A principal consequência foi [MOVIMENTO NA TABELA OU NO CONTEXTO].',
            },
            {
              role: 'next-signal',
              text: 'Agora, o ponto a acompanhar é [PRÓXIMO JOGO OU VARIÁVEL].',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Abrir a análise de [JOGO-ÂNCORA]',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: [
            'identity',
            'confirmed anchor result',
            'pre-match thesis',
            'confirmed evidence',
            'conversion',
          ],
          eligibility:
            'Exige pergunta pré-jogo registrada, placar confirmado e evidências favorável e contrária.',
          postGameBlockers: [
            'JOGO-ÂNCORA',
            'PERGUNTA PRÉ-JOGO',
            'CENÁRIO PRÉ-JOGO',
            'DADO PRÉ-JOGO',
            'PLACAR CONFIRMADO',
            'FATO QUE VALIDOU A LEITURA',
            'FATO QUE CONTRADISSE A LEITURA',
            'MOVIMENTO NA TABELA OU NO CONTEXTO',
            'PRÓXIMO JOGO OU VARIÁVEL',
          ],
        },
        {
          id: 'e4-c',
          letter: 'C',
          name: 'Consequências na tabela',
          hypothesis:
            'Converter resultados em movimentos de classificação entrega utilidade imediata e ampla.',
          subject: 'O que a rodada {{round_number}} mudou na tabela',
          preview:
            '[MOVIMENTO NO TOPO], [MOVIMENTO NO Z4] e o cenário após o último jogo.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Os placares importam pelo que mudaram na tabela.',
            },
            {
              role: 'evidence',
              label: 'No topo',
              text: '[PLACAR CONFIRMADO] provocou [MOVIMENTO NA LIDERANÇA].',
            },
            {
              role: 'evidence',
              label: 'No Z4',
              text: '[PLACAR CONFIRMADO] fez [TIME] [MOVIMENTO NA TABELA], enquanto [OUTRO TIME] encerrou a rodada em [POSIÇÃO CONFIRMADA].',
            },
            {
              role: 'evidence',
              label: 'No bloco intermediário',
              text: '[PLACAR CONFIRMADO] aproximou ou afastou [TIME] de [OBJETIVO NA CLASSIFICAÇÃO].',
            },
            {
              role: 'interpretation',
              text: 'A conclusão é [CONSEQUÊNCIA ESPORTIVA CENTRAL].',
            },
            {
              role: 'next-signal',
              text: 'O próximo ponto a acompanhar será [PRÓXIMO EVENTO QUE PODE ALTERAR O CENÁRIO].',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver a tabela explicada',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: [
            'identity',
            'confirmed scores',
            'confirmed table snapshot',
            'conversion',
          ],
          eligibility:
            'Exige movimentos confirmados no topo, Z4 e bloco intermediário.',
          postGameBlockers: [
            'MOVIMENTO NO TOPO',
            'MOVIMENTO NO Z4',
            'PLACAR CONFIRMADO',
            'MOVIMENTO NA LIDERANÇA',
            'TIME',
            'MOVIMENTO NA TABELA',
            'OUTRO TIME',
            'POSIÇÃO CONFIRMADA',
            'OBJETIVO NA CLASSIFICAÇÃO',
            'CONSEQUÊNCIA ESPORTIVA CENTRAL',
            'PRÓXIMO EVENTO QUE PODE ALTERAR O CENÁRIO',
          ],
        },
        {
          id: 'e4-d',
          letter: 'D',
          name: 'Cenário que falhou',
          hypothesis:
            'Admitir e explicar uma hipótese refutada reduz o ceticismo e demonstra rigor.',
          subject:
            'O cenário que não se confirmou na rodada {{round_number}}',
          preview:
            '[CENÁRIO QUE NÃO SE CONFIRMOU] não resistiu ao que aconteceu em campo.',
          body: [
            { role: 'greeting', text: 'Oi, {{first_name}}.' },
            {
              role: 'thesis',
              text: 'Antes de [JOGO], a leitura considerava [CENÁRIO QUE NÃO SE CONFIRMOU].',
            },
            {
              role: 'evidence',
              text: 'O placar foi [PLACAR CONFIRMADO], mas o dado mais importante foi [DADO QUE CONTRADISSE A HIPÓTESE].',
            },
            {
              role: 'evidence',
              text: 'A premissa falhou porque [EXPLICAÇÃO VERIFICÁVEL].',
            },
            {
              role: 'interpretation',
              text: 'Isso não pede uma justificativa posterior. Pede uma correção: [COMO A LEITURA DEVE SER AJUSTADA]. A consequência foi [MOVIMENTO NA TABELA].',
            },
            {
              role: 'next-signal',
              text: 'O próximo teste dessa nova leitura será [PRÓXIMO PONTO A ACOMPANHAR].',
            },
            { role: 'signoff', text: 'Até já,\nDale\nMacro Markets' },
          ],
          cta: 'Ver o retrospecto da análise',
          destinationHref: roundDestinationHref,
          destinationIntent,
          role: 'challenger',
          requiredPayload: [
            'identity',
            'refuted pre-match thesis',
            'confirmed result',
            'contradictory evidence',
            'method correction',
            'conversion',
          ],
          eligibility:
            'Exige hipótese pré-jogo registrada, evidência contrária e correção metodológica verificável.',
          postGameBlockers: [
            'JOGO',
            'CENÁRIO QUE NÃO SE CONFIRMOU',
            'PLACAR CONFIRMADO',
            'DADO QUE CONTRADISSE A HIPÓTESE',
            'EXPLICAÇÃO VERIFICÁVEL',
            'COMO A LEITURA DEVE SER AJUSTADA',
            'MOVIMENTO NA TABELA',
            'PRÓXIMO PONTO A ACOMPANHAR',
          ],
        },
      ],
    },
  ],
} as const satisfies Readonly<{
  name: string;
  promise: string;
  primaryMetric: string;
  calendarContract: readonly string[];
  experimentRules: readonly string[];
  emails: readonly RoundEmail[];
}>;
