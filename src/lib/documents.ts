export const BASE_PATH = '/static-preview-notes';

export const documents = [
  {
    slug: '',
    filename: 'index.html',
    label: 'Índice',
    title: 'Macro Markets Futebol — Especificação Visual de Conteúdos e Telas',
    description:
      'Planejamento visual completo de conteúdos, telas, e-mails e campanhas da Macro Markets Futebol.',
  },
  {
    slug: 'pagina_hub_campeonato',
    filename: 'pagina_hub_campeonato.html',
    label: 'Hub',
    title: 'Hub do Campeonato — Brasileirão Série A 2026 · /br/brasileirao',
    description:
      'Hub visual do Brasileirão Série A 2026 em diferentes cenários de acesso.',
  },
  {
    slug: 'pagina_rodada',
    filename: 'pagina_rodada.html',
    label: 'Rodada 24',
    title: 'Macro Markets — Página da Rodada 24 · três cenários de acesso',
    description:
      'Página detalhada da rodada 24 nos cenários visitante, cadastrado e Premium.',
  },
  {
    slug: 'pagina_blog',
    filename: 'pagina_blog.html',
    label: 'Blog',
    title: 'Macro Markets · Blog / seção de conteúdo — 3 cenários',
    description:
      'Índice e artigo do blog da Macro Markets nos três cenários de acesso.',
  },
  {
    slug: 'sequencia_emails',
    filename: 'sequencia_emails.html',
    label: 'E-mails da rodada',
    title: 'Macro Markets — Sequência de e-mails da rodada 24 · três trilhas',
    description:
      'Sequências de e-mails da rodada para leads, cadastrados e assinantes Premium.',
  },
  {
    slug: 'sequencia_emails_waitlist',
    filename: 'sequencia_emails_waitlist.html',
    label: 'Waitlist → Cadastro',
    title: 'Macro Markets — Campanha Waitlist → Cadastro · Bloco 11',
    description:
      'Campanha evergreen de e-mails para transformar a waitlist em cadastros.',
  },
  {
    slug: 'pagina_lps_waitlist',
    filename: 'pagina_lps_waitlist.html',
    label: 'LPs Waitlist',
    title: 'Macro Markets — LPs da campanha Waitlist → Cadastro',
    description:
      'Landing pages da campanha evergreen de waitlist da Macro Markets.',
  },
] as const;

export type DocumentDefinition = (typeof documents)[number];

export const publicPathFor = (document: DocumentDefinition): string => {
  return document.slug ? `${BASE_PATH}/${document.filename}` : `${BASE_PATH}/`;
};

export const documentBySlug = (slug: string): DocumentDefinition => {
  const document = documents.find((candidate) => candidate.slug === slug);

  if (!document) {
    throw new Error(`Unknown document slug: ${slug}`);
  }

  return document;
};
