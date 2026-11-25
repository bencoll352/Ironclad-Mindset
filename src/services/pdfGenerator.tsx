/**
 * Branded Client-Side PDF Generator using @react-pdf/renderer
 * White background with Ironclad Claret (#7A263A) & Sky Blue (#0284C7) typography.
 */
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import React from 'react';
import {
  CBTWorksheetEntry,
  Playbook,
  ShoppingIngredient,
} from '../types/ironclad';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    color: '#121518',
    fontSize: 10,
    lineHeight: 1.5,
  },
  headerBar: {
    borderBottomWidth: 2,
    borderBottomColor: '#7A263A',
    paddingBottom: 10,
    marginBottom: 16,
  },
  brandTag: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#7A263A',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#121518',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#475569',
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#7A263A',
    marginTop: 10,
    marginBottom: 4,
  },
  accentHeading: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0284C7',
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10,
    color: '#1E293B',
    marginBottom: 5,
  },
  bullet: {
    fontSize: 10,
    color: '#1E293B',
    marginLeft: 8,
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    fontSize: 8,
    color: '#475569',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

async function triggerPdfDownload(doc: React.ReactElement, filename: string) {
  const blob = await pdf(doc as never).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPlaybookPdf(playbook: Playbook): Promise<void> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brandTag}>
            Ironclad Mindset · Playbook {playbook.number} ({playbook.category})
          </Text>
          <Text style={styles.title}>{playbook.title}</Text>
          <Text style={styles.subtitle}>{playbook.subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.accentHeading}>Summary &amp; Key Takeaways</Text>
          <Text style={styles.paragraph}>{playbook.summary}</Text>
          {playbook.keyTakeaways.map((kt, idx) => (
            <Text key={idx} style={styles.bullet}>
              • {kt}
            </Text>
          ))}
        </View>

        {playbook.sections.map((sec, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <Text style={styles.sectionHeading}>{sec.heading}</Text>
            {sec.body.map((p, pIdx) => (
              <Text key={pIdx} style={styles.paragraph}>
                {p}
              </Text>
            ))}
            {sec.actionPoints?.map((ap, aIdx) => (
              <Text key={aIdx} style={styles.bullet}>
                → {ap}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>Ironclad Mindset — Forged in Struggle. Built for Strength.</Text>
          <Text>Medical safety: Never stop heavy daily use suddenly without NHS 111 / GP advice.</Text>
        </View>
      </Page>
    </Document>
  );

  await triggerPdfDownload(doc, `ironclad-playbook-${playbook.number}.pdf`);
}

export async function downloadCbtEntryPdf(
  entry: CBTWorksheetEntry
): Promise<void> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brandTag}>
            Ironclad Mindset · Playbook 4 HALT &amp; CBT Trigger Worksheet
          </Text>
          <Text style={styles.title}>Personal Trigger &amp; Reframe Record</Text>
          <Text style={styles.subtitle}>
            Logged: {entry.createdAt} · Craving Rating: {entry.cravingRating}/10 · HALT:{' '}
            {entry.haltStates.join(', ') || 'None selected'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>1. Trigger Situation</Text>
          <Text style={styles.paragraph}>{entry.triggerSituation}</Text>

          <Text style={styles.sectionHeading}>2. Automatic Urge Thought</Text>
          <Text style={styles.paragraph}>“{entry.automaticThought}”</Text>

          <Text style={styles.sectionHeading}>3. Thinking Trap</Text>
          <Text style={styles.paragraph}>{entry.cognitiveDistortion}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.accentHeading}>4. Ironclad Balanced Reframe</Text>
          <Text style={styles.paragraph}>{entry.ironcladReframe}</Text>

          <Text style={styles.sectionHeading}>5. Practical Action Taken</Text>
          <Text style={styles.paragraph}>{entry.actionTaken}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Ironclad Mindset — Kept strictly private on your device</Text>
          <Text>UK Crisis: Samaritans 116 123 · NHS 111</Text>
        </View>
      </Page>
    </Document>
  );

  await triggerPdfDownload(doc, `ironclad-cbt-reframe-${entry.id}.pdf`);
}

export async function downloadShoppingListPdf(
  items: ShoppingIngredient[],
  totalGBP: number
): Promise<void> {
  const aisles: ShoppingIngredient['aisle'][] = [
    'Protein',
    'Produce',
    'Tins & Dry',
    'Drinks',
  ];

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brandTag}>Ironclad Mindset · Fuel the Mind</Text>
          <Text style={styles.title}>£40 Weekly Mood-Food Shopping List</Text>
          <Text style={styles.subtitle}>
            Aldi / Tesco Budget Estimate: £{totalGBP.toFixed(2)} ({items.length} items)
          </Text>
        </View>

        {aisles.map((aisle) => {
          const aisleItems = items.filter((i) => i.aisle === aisle);
          if (aisleItems.length === 0) return null;
          return (
            <View key={aisle} style={styles.card}>
              <Text style={styles.sectionHeading}>{aisle}</Text>
              {aisleItems.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text>
                    {item.checked ? '[x]' : '[ ]'} {item.name} ({item.quantity})
                  </Text>
                  <Text>£{item.estimatedPriceGBP.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>Ironclad Mindset — Chef-Built Brain Fuel on £40/Week</Text>
          <Text>Eat protein within 15 minutes of finishing shift</Text>
        </View>
      </Page>
    </Document>
  );

  await triggerPdfDownload(doc, 'ironclad-40-pound-shopping-list.pdf');
}

export interface B2bProposalPdfInput {
  companyName: string;
  contactName: string;
  sector: string;
  employeeCount: number;
  dailyBurnoutCostGBP: number;
  packageInterest: string;
  programInvestmentGBP: number;
  estimatedAnnualSavingsGBP: number;
  estimatedDaysRecovered: number;
  reducedSickDaysGBP: number;
  recoveredProductivityGBP: number;
  staffRetentionGBP: number;
  roiMultiplier: string;
}

export async function downloadB2bProposalPdf(
  input: B2bProposalPdfInput
): Promise<void> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brandTag}>
            Ironclad Mindset · UK Corporate &amp; Workplace Resilience Proposal
          </Text>
          <Text style={styles.title}>
            Workplace Resilience Charter for {input.companyName}
          </Text>
          <Text style={styles.subtitle}>
            Prepared for {input.contactName} · Sector: {input.sector} · Team Size:{' '}
            {input.employeeCount} staff
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.accentHeading}>Executive ROI Summary</Text>
          <View style={styles.row}>
            <Text>Recommended Programme</Text>
            <Text>{input.packageInterest}</Text>
          </View>
          <View style={styles.row}>
            <Text>Annual Programme Investment</Text>
            <Text>£{input.programInvestmentGBP.toLocaleString('en-GB')}</Text>
          </View>
          <View style={styles.row}>
            <Text>Estimated Annual Workplace Savings</Text>
            <Text>£{input.estimatedAnnualSavingsGBP.toLocaleString('en-GB')}</Text>
          </View>
          <View style={styles.row}>
            <Text>Projected Return on Investment</Text>
            <Text>{input.roiMultiplier}x ROI ({input.estimatedDaysRecovered} days recovered)</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>
            Annual Savings Breakdown (Alcohol, Burnout, Smoking &amp; Gambling Stress)
          </Text>
          <View style={styles.row}>
            <Text>1. Reduced Absenteeism &amp; Sick Days</Text>
            <Text>£{input.reducedSickDaysGBP.toLocaleString('en-GB')}</Text>
          </View>
          <View style={styles.row}>
            <Text>2. Recovered Shift Productivity &amp; Presenteeism</Text>
            <Text>£{input.recoveredProductivityGBP.toLocaleString('en-GB')}</Text>
          </View>
          <View style={styles.row}>
            <Text>3. Staff Retention &amp; Reduced Turnover</Text>
            <Text>£{input.staffRetentionGBP.toLocaleString('en-GB')}</Text>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionHeading}>What Your Team Receives</Text>
          <Text style={styles.bullet}>
            • Playbook 5 Sober-Inclusive Workplace Charter &amp; DocuSeal leadership sign-off
          </Text>
          <Text style={styles.bullet}>
            • 24/7 private on-device access to Pippa UK voice coach, Craving Reset &amp; Move the Iron
          </Text>
          <Text style={styles.bullet}>
            • Zero surveillance guarantee: employee check-ins and private notes never leave their device
          </Text>
          <Text style={styles.bullet}>
            • Direct signposting to UK crisis lines, Hospitality Action, Lighthouse Club, GamCare &amp; NHS 111
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Ironclad Mindset — Built for UK Shift Teams, Trades &amp; SMEs</Text>
          <Text>Confidential Commercial Proposal</Text>
        </View>
      </Page>
    </Document>
  );

  const safeSlug = input.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  await triggerPdfDownload(doc, `ironclad-workplace-proposal-${safeSlug || 'uk'}.pdf`);
}
