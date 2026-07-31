import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { CheckIn, SavedWord, UserProfile } from '@/context/AppDataContext';

const MOOD_LABELS = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['', '#E07A7A', '#D4956A', '#8AA8B8', '#5EB8A0', '#3A9EA5'];
const SYMPTOM_KEYS = ['chest_tightness', 'fatigue', 'shortness_of_breath', 'dizziness'];
const SYMPTOM_LABELS: Record<string, string> = {
  chest_tightness: 'Chest Tightness',
  fatigue: 'Fatigue',
  shortness_of_breath: 'Shortness of Breath',
  dizziness: 'Dizziness',
};

function getAdherenceColor(pct: number): string {
  if (pct >= 80) return '#3A9EA5';
  if (pct >= 50) return '#D4956A';
  return '#E07A7A';
}

interface SummaryStats {
  totalCheckIns: number;
  adherence: number;
  avgMood: number;
  symptomCounts: Record<string, number>;
  filtered: CheckIn[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateHTML(
  stats: SummaryStats,
  savedWords: SavedWord[],
  profile: UserProfile,
  range: number,
): string {
  const now = new Date();
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - range);

  const patientName = profile.name || 'Patient';
  const doctorName = profile.doctorName ? `Dr. ${profile.doctorName}` : '';
  const condition = profile.condition || '';
  const medications = profile.medications.filter(Boolean);

  const avgMoodRounded = Math.round(stats.avgMood);
  const moodLabel = stats.avgMood > 0 ? MOOD_LABELS[avgMoodRounded] : 'N/A';
  const moodColor = stats.avgMood > 0 ? MOOD_COLORS[avgMoodRounded] : '#8AA8B8';
  const adherenceColor = getAdherenceColor(stats.adherence);

  // Symptom rows
  const symptomRows = SYMPTOM_KEYS.map((key) => {
    const count = stats.symptomCounts[key] ?? 0;
    const pct = stats.totalCheckIns > 0 ? Math.round((count / stats.totalCheckIns) * 100) : 0;
    const barColor = pct > 60 ? '#D4956A' : '#3A9EA5';
    return `
      <tr>
        <td style="padding: 10px 0; color: #374151; font-size: 14px;">${SYMPTOM_LABELS[key]}</td>
        <td style="padding: 10px 0;">
          <div style="background: #F3F4F6; border-radius: 4px; height: 10px; overflow: hidden;">
            <div style="background: ${barColor}; width: ${pct}%; height: 100%; border-radius: 4px;"></div>
          </div>
        </td>
        <td style="padding: 10px 0; text-align: right; color: #6B7280; font-size: 13px; width: 60px;">
          ${count} / ${stats.totalCheckIns} (${pct}%)
        </td>
      </tr>`;
  }).join('');

  // Saved words section — cap at 20 most recent
  const SAVED_WORDS_LIMIT = 20;
  const sortedSavedWords = [...savedWords].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
  const displayedWords = sortedSavedWords.slice(0, SAVED_WORDS_LIMIT);
  const hiddenWordCount = sortedSavedWords.length - displayedWords.length;

  const savedWordsHTML = savedWords.length > 0
    ? displayedWords.map((w) => `
      <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 14px; margin-bottom: 10px; background: #F9FAFB;">
        <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">${w.term}</div>
        <div style="color: #6B7280; font-size: 13px; margin-bottom: 6px;">${w.explanation}</div>
        ${w.whyItMatters ? `<div style="color: #6B7280; font-size: 13px; margin-bottom: 6px;"><em>Why it matters:</em> ${w.whyItMatters}</div>` : ''}
        ${w.personalNote ? `<div style="background: #EEF2FF; border-radius: 6px; padding: 8px 10px; color: #3730A3; font-size: 13px; margin-top: 6px;"><strong>My note:</strong> ${w.personalNote}</div>` : ''}
        <div style="color: #9CA3AF; font-size: 11px; margin-top: 8px;">Saved ${formatDate(w.savedAt)}</div>
      </div>`).join('')
      + (hiddenWordCount > 0
        ? `<p style="color: #9CA3AF; font-size: 13px; margin-top: 6px;">… and ${hiddenWordCount} more saved word${hiddenWordCount === 1 ? '' : 's'} not shown. Open HeartWell to view all.</p>`
        : '')
    : '<p style="color: #9CA3AF; font-size: 14px;">No saved words yet.</p>';

  // Recent notes from check-ins
  const checkInsWithNotes = stats.filtered
    .filter((c) => c.note)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const notesHTML = checkInsWithNotes.length > 0
    ? checkInsWithNotes.map((c) => `
      <div style="border-left: 3px solid #3A9EA5; padding: 8px 12px; margin-bottom: 10px; background: #F0FAFA; border-radius: 0 8px 8px 0;">
        <div style="color: #9CA3AF; font-size: 11px; margin-bottom: 4px;">${formatDate(c.date)} · ${MOOD_LABELS[c.mood]} mood</div>
        <div style="color: #374151; font-size: 13px;">${c.note}</div>
      </div>`).join('')
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; color: #111827; background: #fff; padding: 40px 48px; }
    table { width: 100%; border-collapse: collapse; }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="border-bottom: 2px solid #3A9EA5; padding-bottom: 20px; margin-bottom: 28px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="font-size: 22px; font-weight: 700; color: #3A9EA5; letter-spacing: -0.5px;">HeartWell</div>
        <div style="font-size: 28px; font-weight: 700; color: #111827; margin-top: 6px;">Health Summary</div>
        <div style="color: #6B7280; font-size: 14px; margin-top: 4px;">
          ${rangeStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 16px; font-weight: 600; color: #111827;">${patientName}</div>
        ${condition ? `<div style="color: #6B7280; font-size: 13px; margin-top: 2px;">${condition}</div>` : ''}
        ${doctorName ? `<div style="color: #6B7280; font-size: 13px; margin-top: 2px;">For: ${doctorName}</div>` : ''}
        <div style="color: #9CA3AF; font-size: 12px; margin-top: 4px;">Generated ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
    </div>
  </div>

  ${medications.length > 0 ? `
  <!-- Medications -->
  <div style="margin-bottom: 28px;">
    <div style="font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">Current Medications</div>
    <div style="color: #374151; font-size: 14px;">${medications.join(', ')}</div>
  </div>` : ''}

  <!-- Overview cards -->
  <div style="display: flex; gap: 16px; margin-bottom: 28px;">
    <div style="flex: 1; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; text-align: center;">
      <div style="font-size: 36px; font-weight: 700; color: #111827;">${stats.totalCheckIns}</div>
      <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Check-ins</div>
    </div>
    <div style="flex: 1; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; text-align: center;">
      <div style="font-size: 36px; font-weight: 700; color: ${moodColor};">${moodLabel}</div>
      <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Avg. Mood</div>
    </div>
    <div style="flex: 1; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; text-align: center;">
      <div style="font-size: 36px; font-weight: 700; color: ${adherenceColor};">${stats.adherence}%</div>
      <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Adherence</div>
    </div>
  </div>

  <!-- Medication Adherence -->
  <div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid;">
    <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 14px;">💊 Medication Adherence</div>
    <div style="font-size: 42px; font-weight: 700; color: ${adherenceColor}; margin-bottom: 10px;">${stats.adherence}%</div>
    <div style="background: #F3F4F6; border-radius: 5px; height: 12px; overflow: hidden; margin-bottom: 8px;">
      <div style="background: ${adherenceColor}; width: ${stats.adherence}%; height: 100%; border-radius: 5px;"></div>
    </div>
    <div style="color: #6B7280; font-size: 13px;">
      Took medication on ${stats.filtered.filter((c) => c.tookMedication).length} of ${stats.totalCheckIns} logged days
    </div>
  </div>

  <!-- Symptom Frequency -->
  <div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid;">
    <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 14px;">📊 Symptom Frequency</div>
    <table>
      ${symptomRows}
    </table>
    <div style="color: #9CA3AF; font-size: 12px; margin-top: 10px;">% of check-ins where symptom was reported</div>
  </div>

  ${checkInsWithNotes.length > 0 ? `
  <!-- Recent Notes -->
  <div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-before: auto; page-break-inside: avoid;">
    <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 14px;">📝 Recent Journal Notes</div>
    ${notesHTML}
  </div>` : ''}

  <!-- Saved Words -->
  <div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-before: always;">
    <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 14px;">📚 Saved Words & Terms</div>
    ${savedWordsHTML}
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; margin-top: 8px; color: #9CA3AF; font-size: 12px; text-align: center;">
    This report was generated by HeartWell and is intended to support, not replace, professional medical advice.
  </div>

</body>
</html>`;
}

export async function exportHealthSummaryPDF(
  stats: SummaryStats,
  savedWords: SavedWord[],
  profile: UserProfile,
  range: number,
): Promise<void> {
  const html = generateHTML(stats, savedWords, profile, range);

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Health Summary',
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Print.printAsync({ html });
  }
}
