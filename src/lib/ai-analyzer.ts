import { db } from './db';
import { changes, snapshots, monitoredUrls, competitors } from './schema';
import { eq } from 'drizzle-orm';
import { generateDiff } from './crawler';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface AnalysisResult {
  summary: string;
  analysis: string;
  changeType: 'pricing' | 'features' | 'messaging' | 'design' | 'content' | 'other';
  significance: 'minor' | 'notable' | 'major';
}

/**
 * Analyze a change using AI
 */
export async function analyzeChange(changeId: string): Promise<AnalysisResult | null> {
  // Get change with related data
  const change = await db.query.changes.findFirst({
    where: eq(changes.id, changeId)
  });

  if (!change) return null;

  // Get snapshots
  const [beforeSnapshot, afterSnapshot] = await Promise.all([
    change.snapshotBeforeId 
      ? db.query.snapshots.findFirst({ where: eq(snapshots.id, change.snapshotBeforeId) })
      : null,
    db.query.snapshots.findFirst({ where: eq(snapshots.id, change.snapshotAfterId) })
  ]);

  if (!afterSnapshot) return null;

  // Get URL info for context
  const monitoredUrl = await db.query.monitoredUrls.findFirst({
    where: eq(monitoredUrls.id, change.urlId)
  });

  if (!monitoredUrl) return null;

  // Get competitor info
  const competitor = await db.query.competitors.findFirst({
    where: eq(competitors.id, monitoredUrl.competitorId)
  });

  // Generate diff
  const diff = beforeSnapshot 
    ? generateDiff(beforeSnapshot.content || '', afterSnapshot.content || '')
    : 'Initial capture (no previous version)';

  // Prepare prompt
  const prompt = `You are analyzing changes to a competitor's website. Analyze the following change and provide insights.

COMPETITOR: ${competitor?.name || 'Unknown'}
PAGE TYPE: ${monitoredUrl.urlType}
URL: ${monitoredUrl.url}

CHANGES DETECTED:
${diff}

${beforeSnapshot ? `CONTENT BEFORE (excerpt):
${(beforeSnapshot.content || '').substring(0, 2000)}` : ''}

CONTENT AFTER (excerpt):
${(afterSnapshot.content || '').substring(0, 2000)}

Please analyze this change and respond in the following JSON format:
{
  "summary": "A brief 1-2 sentence summary of what changed",
  "analysis": "A detailed analysis (2-3 sentences) of what this change means for competitors and any recommended actions",
  "changeType": "one of: pricing, features, messaging, design, content, other",
  "significance": "one of: minor (cosmetic/small changes), notable (worth knowing), major (significant strategic change)"
}

Respond ONLY with the JSON object, no other text.`;

  try {
    const result = await callGemini(prompt);
    
    // Update the change record with AI analysis
    await db
      .update(changes)
      .set({
        aiSummary: result.summary,
        aiAnalysis: result.analysis,
        changeType: result.changeType,
        significance: result.significance,
        diffContent: diff,
      })
      .where(eq(changes.id, changeId));

    return result;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}

/**
 * Call Gemini API
 */
async function callGemini(prompt: string): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    // Return default analysis if no API key
    return {
      summary: 'Change detected on monitored page',
      analysis: 'Content on the monitored page has been updated. Review the diff for details.',
      changeType: 'content',
      significance: 'minor',
    };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Parse JSON from response
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
  }

  // Return default if parsing fails
  return {
    summary: 'Change detected on monitored page',
    analysis: text.substring(0, 500) || 'Content has been updated.',
    changeType: 'content',
    significance: 'minor',
  };
}

/**
 * Analyze all unanalyzed changes
 */
export async function analyzeAllPendingChanges(): Promise<number> {
  // Find changes without AI analysis
  const pendingChanges = await db.query.changes.findMany({
    where: eq(changes.aiSummary, null as any) // Changes without summary
  });

  let analyzed = 0;

  for (const change of pendingChanges) {
    try {
      const result = await analyzeChange(change.id);
      if (result) analyzed++;
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to analyze change ${change.id}:`, error);
    }
  }

  return analyzed;
}

/**
 * Generate weekly digest for a user
 */
export async function generateWeeklyDigest(userId: string): Promise<string> {
  // Get user's competitors
  const userCompetitors = await db.query.competitors.findMany({
    where: eq(competitors.userId, userId)
  });

  if (userCompetitors.length === 0) {
    return 'No competitors tracked yet. Add competitors to start receiving insights.';
  }

  // Get recent changes (last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // This would need a proper join query in production
  // For now, return a placeholder
  
  return `
# Weekly Competitor Intelligence Digest

**Period:** ${oneWeekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}

**Competitors Tracked:** ${userCompetitors.length}

## Summary

Your competitors have been monitored this week. Check the timeline for detailed changes.

---
*Powered by Rival - Your AI Competitor Intelligence*
  `.trim();
}
