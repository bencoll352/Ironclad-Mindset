import { describe, it, expect, vi, beforeEach } from 'vitest';

// Minimal localStorage stub for the node test environment
const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
});

const { fireIroncladWebhook } = await import('../src/services/integrations');

describe('n8n webhook envelope', () => {
  beforeEach(() => store.clear());

  it('sends event_type and flat lead fields the n8n workflow routes on', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await fireIroncladWebhook(
      'B2B_LEAD_CAPTURE',
      {
        companyName: 'Test Kitchens Ltd',
        contactName: 'Sam',
        email: 'sam@example.com',
        employeeCount: 40,
        estimatedAnnualSavingsGBP: 12000,
      },
      { n8nWebhookUrl: 'https://n8n.example.com/webhook/ironclad-webhook' } as never
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.event_type).toBe('b2b_lead');
    expect(body.contact_email).toBe('sam@example.com');
    expect(body.company_name).toBe('Test Kitchens Ltd');
    expect(body.employee_count).toBe(40);
    expect(body.estimated_annual_savings_gbp).toBe(12000);
  });

  it('labels witching hour check-ins without lead fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await fireIroncladWebhook('WITCHING_HOUR_CHECKIN', { halt: 'Tired' }, {
      n8nWebhookUrl: 'https://n8n.example.com/webhook/ironclad-webhook',
    } as never);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.event_type).toBe('witching_hour_checkin');
    expect(body.contact_email).toBeUndefined();
  });
});
