export const JOURNEY_PRIORITY = [
  'registration_abandonment',
  'gate_intent',
  'viewed_2_plus',
  'viewed_round',
  'viewed_blog',
  'viewed_hub',
  'never_viewed',
] as const;

export type JourneyState = (typeof JOURNEY_PRIORITY)[number];

export const EMAIL_VARIANTS = [
  'discovery',
  'deepening',
  'gate_recovery',
  'registration_recovery',
] as const;

export type EmailVariant = (typeof EMAIL_VARIANTS)[number];

export const TRACKING_EVENTS = [
  'content_viewed',
  'content_engaged',
  'access_teaser_viewed',
  'access_teaser_clicked',
  'registration_cta_clicked',
  'registration_started',
  'registration_completed',
  'registration_abandoned',
  'lp_exclusive_viewed',
  'email_queued',
  'email_sent',
  'email_delivered',
  'email_opened',
  'email_clicked',
  'email_bounced',
  'email_unsubscribed',
  'email_preferences_updated',
  'journey_exited',
] as const;

export const REQUIRED_EVENT_PROPERTIES = [
  'event_id',
  'contact_id',
  'anonymous_id',
  'session_id',
  'surface',
  'content_id',
  'gate_id',
  'access_state',
  'source_campaign',
  'source_email',
  'email_variant',
  'journey_state',
  'league',
  'referrer',
  'return_url',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'click_id',
  'timestamp',
] as const;

export const DESTINATIONS = {
  hub: '/static-preview-notes/pagina_hub_campeonato.html#hub-overview',
  round: '/static-preview-notes/pagina_rodada.html#round-overview',
  blog: '/static-preview-notes/pagina_blog.html#article-methodology',
  institutionalLp:
    '/static-preview-notes/pagina_lps_waitlist.html#lp-exclusive-hero',
  registration: 'https://macromarkets.com/br/cadastro',
} as const;

export const ATTRIBUTION_CAMPAIGNS = {
  block8: 'block8_round_cycle',
  waitlist: 'waitlist_value_nurture',
} as const;

export const WAITLIST_CAMPAIGN_QUERY =
  `utm_source=mautic&utm_medium=email&utm_campaign=${ATTRIBUTION_CAMPAIGNS.waitlist}` as const;

export type TrackedDestinationOptions = Readonly<{
  returnUrl?: string;
  resumeToken?: string;
}>;

export const trackedDestination = (
  destination: string,
  utmContent: string,
  options: TrackedDestinationOptions = {},
): string => {
  const [pathname, fragment] = destination.split('#');
  const separator = pathname.includes('?') ? '&' : '?';
  const queryParameters = [
    WAITLIST_CAMPAIGN_QUERY,
    `utm_content=${utmContent}`,
    'click_id={{click_id}}',
  ];

  if (options.returnUrl) {
    queryParameters.push(`return_url=${options.returnUrl}`);
  }

  if (options.resumeToken) {
    queryParameters.push(`resume_token=${options.resumeToken}`);
  }

  const fragmentSuffix = fragment ? `#${fragment}` : '';

  return `${pathname}${separator}${queryParameters.join('&')}${fragmentSuffix}`;
};

export const RECENCY_DAYS = 14;

export const FREQUENCY_CAP = {
  marketingPer24Hours: 1,
  marketingPer7Days: 5,
  staleAfterHours: 72,
  maxJourneyMessages: 3,
  block8HasPriority: true,
} as const;
