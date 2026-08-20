import { describe, expect, it } from 'vitest';

import {
  ATTRIBUTION_CAMPAIGNS,
  DESTINATIONS,
  FREQUENCY_CAP,
  JOURNEY_PRIORITY,
  RECENCY_DAYS,
  REQUIRED_EVENT_PROPERTIES,
  TRACKING_EVENTS,
  WAITLIST_CAMPAIGN_QUERY,
  trackedDestination,
} from '../src/lib/waitlistCampaign';

describe('waitlist behavioral campaign contract', () => {
  it('keeps the approved state priority and recency', () => {
    expect(JOURNEY_PRIORITY).toEqual([
      'registration_abandonment',
      'gate_intent',
      'viewed_2_plus',
      'viewed_round',
      'viewed_blog',
      'viewed_hub',
      'never_viewed',
    ]);
    expect(RECENCY_DAYS).toBe(14);
  });

  it('publishes every required event and property', () => {
    expect(TRACKING_EVENTS).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(REQUIRED_EVENT_PROPERTIES).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it('separates campaigns and fixes frequency limits', () => {
    expect(ATTRIBUTION_CAMPAIGNS).toEqual({
      block8: 'block8_round_cycle',
      waitlist: 'waitlist_value_nurture',
    });
    expect(FREQUENCY_CAP).toEqual({
      marketingPer24Hours: 1,
      marketingPer7Days: 5,
      staleAfterHours: 72,
      maxJourneyMessages: 3,
      block8HasPriority: true,
    });
  });

  it('uses only existing static documents as campaign surfaces', () => {
    expect(DESTINATIONS).toEqual({
      hub: '/static-preview-notes/pagina_hub_campeonato.html#hub-overview',
      round: '/static-preview-notes/pagina_rodada.html#round-overview',
      blog: '/static-preview-notes/pagina_blog.html#article-methodology',
      institutionalLp:
        '/static-preview-notes/pagina_lps_waitlist.html#lp-exclusive-hero',
      registration: 'https://macromarkets.com/br/cadastro',
    });
  });

  it('places tracking query before an internal destination fragment', () => {
    const result = trackedDestination(
      '/static-preview-notes/pagina_hub_campeonato.html#hub-overview',
      'e1_discovery',
    );
    const parsed = new URL(result, 'https://preview.local');

    expect(result.indexOf('?')).toBeLessThan(result.indexOf('#'));
    expect(parsed.pathname).toBe(
      '/static-preview-notes/pagina_hub_campeonato.html',
    );
    expect(parsed.hash).toBe('#hub-overview');
    expect(parsed.searchParams.get('utm_source')).toBe('mautic');
    expect(parsed.searchParams.get('utm_medium')).toBe('email');
    expect(parsed.searchParams.get('utm_campaign')).toBe(
      'waitlist_value_nurture',
    );
    expect(parsed.searchParams.get('utm_content')).toBe('e1_discovery');
    expect(parsed.searchParams.get('click_id')).toBe('{{click_id}}');
  });

  it('appends tracking to an external registration URL with query', () => {
    const result = trackedDestination(
      'https://macromarkets.com/br/cadastro?source=waitlist',
      'e3_deepening',
    );
    const parsed = new URL(result);

    expect(parsed.origin).toBe('https://macromarkets.com');
    expect(parsed.pathname).toBe('/br/cadastro');
    expect(parsed.searchParams.get('source')).toBe('waitlist');
    expect(parsed.searchParams.get('utm_source')).toBe('mautic');
    expect(parsed.searchParams.get('utm_medium')).toBe('email');
    expect(parsed.searchParams.get('utm_campaign')).toBe(
      'waitlist_value_nurture',
    );
    expect(parsed.searchParams.get('utm_content')).toBe('e3_deepening');
    expect(parsed.searchParams.get('click_id')).toBe('{{click_id}}');
  });

  it('preserves return and resume values without mutating options', () => {
    const options = Object.freeze({
      returnUrl:
        '%2Fstatic-preview-notes%2Fpagina_rodada.html%23round-overview',
      resumeToken: '{{resume_token|url_encode}}',
    });
    const result = trackedDestination(
      DESTINATIONS.registration,
      'registration_recovery_1',
      options,
    );
    const parsed = new URL(result);

    expect(WAITLIST_CAMPAIGN_QUERY).toBe(
      'utm_source=mautic&utm_medium=email&utm_campaign=waitlist_value_nurture',
    );
    expect(parsed.searchParams.get('return_url')).toBe(
      '/static-preview-notes/pagina_rodada.html#round-overview',
    );
    expect(parsed.searchParams.get('resume_token')).toBe(
      '{{resume_token|url_encode}}',
    );
    expect(options).toEqual({
      returnUrl:
        '%2Fstatic-preview-notes%2Fpagina_rodada.html%23round-overview',
      resumeToken: '{{resume_token|url_encode}}',
    });
  });
});
