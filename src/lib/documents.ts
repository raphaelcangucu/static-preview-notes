import blogSource from '../../pagina_blog.html?raw';
import championshipHubSource from '../../pagina_hub_campeonato.html?raw';
import roundSource from '../../pagina_rodada.html?raw';
import waitlistLandingPagesSource from '../../pagina_lps_waitlist.html?raw';
import roundEmailsSource from '../../sequencia_emails.html?raw';
import waitlistEmailsSource from '../../sequencia_emails_waitlist.html?raw';
import planningSource from '../../index.html?raw';

export const BASE_PATH = '/static-preview-notes';

export const documents = [
  {
    slug: '',
    filename: 'index.html',
    label: 'Índice',
    title: 'Macro Markets Futebol — Especificação Visual de Conteúdos e Telas',
    description:
      'Planejamento visual completo de conteúdos, telas, e-mails e campanhas da Macro Markets Futebol.',
    source: planningSource,
  },
  {
    slug: 'pagina_hub_campeonato',
    filename: 'pagina_hub_campeonato.html',
    label: 'Hub',
    title: 'Hub do Campeonato — Brasileirão Série A 2026 · /br/brasileirao',
    description:
      'Hub visual do Brasileirão Série A 2026 em diferentes cenários de acesso.',
    source: championshipHubSource,
  },
  {
    slug: 'pagina_rodada',
    filename: 'pagina_rodada.html',
    label: 'Rodada 24',
    title: 'Macro Markets — Página da Rodada 24 · três cenários de acesso',
    description:
      'Página detalhada da rodada 24 nos cenários visitante, cadastrado e Premium.',
    source: roundSource,
  },
  {
    slug: 'pagina_blog',
    filename: 'pagina_blog.html',
    label: 'Blog',
    title: 'Macro Markets · Blog / seção de conteúdo — 3 cenários',
    description:
      'Índice e artigo do blog da Macro Markets nos três cenários de acesso.',
    source: blogSource,
  },
  {
    slug: 'sequencia_emails',
    filename: 'sequencia_emails.html',
    label: 'E-mails da rodada',
    title: 'Macro Markets — Sequência de e-mails da rodada 24 · três trilhas',
    description:
      'Sequências de e-mails da rodada para leads, cadastrados e assinantes Premium.',
    source: roundEmailsSource,
  },
  {
    slug: 'sequencia_emails_waitlist',
    filename: 'sequencia_emails_waitlist.html',
    label: 'Waitlist → Cadastro',
    title: 'Macro Markets — Campanha Waitlist → Cadastro · Bloco 11',
    description:
      'Campanha evergreen de e-mails para transformar a waitlist em cadastros.',
    source: waitlistEmailsSource,
  },
  {
    slug: 'pagina_lps_waitlist',
    filename: 'pagina_lps_waitlist.html',
    label: 'LPs Waitlist',
    title: 'Macro Markets — LPs da campanha Waitlist → Cadastro',
    description:
      'Landing pages da campanha evergreen de waitlist da Macro Markets.',
    source: waitlistLandingPagesSource,
  },
] as const;

export type DocumentDefinition = (typeof documents)[number];

export const publicPathFor = (document: DocumentDefinition): string => {
  return document.slug ? `${BASE_PATH}/${document.filename}` : `${BASE_PATH}/`;
};

const rewriteInternalLinks = (html: string): string => {
  return html.replace(
    /href="(?:\.\/)?(index|pagina_[^"#]+|sequencia_[^"#]+)\.html(#[^"]*)?"/g,
    (_match, documentName: string, fragment = '') => {
      const pathname =
        documentName === 'index'
          ? `${BASE_PATH}/`
          : `${BASE_PATH}/${documentName}.html`;

      return `href="${pathname}${fragment}"`;
    },
  );
};

export const extractLegacyDocument = (source: string) => {
  const styles = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1])
    .join('\n');
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];

  if (!body) {
    throw new Error('Legacy document does not contain a valid body element.');
  }

  return {
    styles,
    body: rewriteInternalLinks(body),
  };
};
