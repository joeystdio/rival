import { db } from './db';
import { monitoredUrls, snapshots, changes, competitors } from './schema';
import { eq, and, isNull, lt } from 'drizzle-orm';
import crypto from 'crypto';

interface CrawlResult {
  url: string;
  content: string;
  contentHash: string;
  statusCode: number;
  error?: string;
}

/**
 * Crawl a URL and extract text content
 */
export async function crawlUrl(url: string): Promise<CrawlResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    const html = await response.text();
    
    // Extract text content (simple version - strips HTML tags)
    const textContent = extractTextContent(html);
    const contentHash = crypto.createHash('md5').update(textContent).digest('hex');

    return {
      url,
      content: textContent,
      contentHash,
      statusCode: response.status,
    };
  } catch (error: any) {
    return {
      url,
      content: '',
      contentHash: '',
      statusCode: 0,
      error: error.message,
    };
  }
}

/**
 * Extract readable text content from HTML
 */
function extractTextContent(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Process a single monitored URL - crawl and detect changes
 */
export async function processMonitoredUrl(urlId: string): Promise<boolean> {
  const monitoredUrl = await db.query.monitoredUrls.findFirst({
    where: eq(monitoredUrls.id, urlId)
  });

  if (!monitoredUrl || !monitoredUrl.isActive) {
    return false;
  }

  // Crawl the URL
  const result = await crawlUrl(monitoredUrl.url);

  if (result.error) {
    console.error(`Crawl failed for ${monitoredUrl.url}: ${result.error}`);
    return false;
  }

  // Create snapshot
  const [snapshot] = await db.insert(snapshots).values({
    urlId,
    contentHash: result.contentHash,
    content: result.content.substring(0, 100000), // Limit content size
    statusCode: result.statusCode,
  }).returning();

  // Check if content changed (explicit boolean to satisfy TypeScript)
  const hasChanged: boolean = monitoredUrl.lastContentHash !== null && 
                              monitoredUrl.lastContentHash !== result.contentHash;

  if (hasChanged) {
    // Find previous snapshot
    const previousSnapshot = await db.query.snapshots.findFirst({
      where: and(
        eq(snapshots.urlId, urlId),
        eq(snapshots.contentHash, monitoredUrl.lastContentHash!)
      )
    });

    // Create change record
    await db.insert(changes).values({
      urlId,
      snapshotBeforeId: previousSnapshot?.id,
      snapshotAfterId: snapshot.id,
      significance: 'minor', // Will be updated by AI analysis
    });

    console.log(`Change detected for ${monitoredUrl.url}`);
  }

  // Update monitored URL with latest check info
  await db
    .update(monitoredUrls)
    .set({
      lastChecked: new Date(),
      lastContentHash: result.contentHash,
    })
    .where(eq(monitoredUrls.id, urlId));

  return hasChanged;
}

/**
 * Get all URLs that need to be crawled
 * Returns URLs that haven't been checked in the last 24 hours
 */
export async function getUrlsToCrawl(): Promise<string[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const urlsToCrawl = await db.query.monitoredUrls.findMany({
    where: and(
      eq(monitoredUrls.isActive, true),
      // Either never checked or checked more than 24h ago
      // Note: We check for null OR old date
    )
  });

  // Filter in JS since drizzle OR with null can be tricky
  return urlsToCrawl
    .filter(url => !url.lastChecked || url.lastChecked < oneDayAgo)
    .map(url => url.id);
}

/**
 * Run the daily crawl job
 */
export async function runDailyCrawl(): Promise<{ processed: number; changes: number }> {
  const urlIds = await getUrlsToCrawl();
  let changesDetected = 0;

  console.log(`Starting daily crawl for ${urlIds.length} URLs`);

  for (const urlId of urlIds) {
    try {
      const hasChanged = await processMonitoredUrl(urlId);
      if (hasChanged) changesDetected++;
      
      // Rate limit: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error processing URL ${urlId}:`, error);
    }
  }

  console.log(`Daily crawl complete. Processed: ${urlIds.length}, Changes: ${changesDetected}`);

  return {
    processed: urlIds.length,
    changes: changesDetected,
  };
}

/**
 * Generate a simple diff between two text contents
 */
export function generateDiff(oldContent: string, newContent: string): string {
  const oldLines = oldContent.split(/[.!?]+/).filter(s => s.trim());
  const newLines = newContent.split(/[.!?]+/).filter(s => s.trim());
  
  const oldSet = new Set(oldLines.map(l => l.trim().toLowerCase()));
  const newSet = new Set(newLines.map(l => l.trim().toLowerCase()));
  
  const added: string[] = [];
  const removed: string[] = [];
  
  for (const line of newLines) {
    if (!oldSet.has(line.trim().toLowerCase()) && line.trim().length > 20) {
      added.push(line.trim());
    }
  }
  
  for (const line of oldLines) {
    if (!newSet.has(line.trim().toLowerCase()) && line.trim().length > 20) {
      removed.push(line.trim());
    }
  }
  
  let diff = '';
  if (added.length > 0) {
    diff += '**Added:**\n' + added.slice(0, 10).map(l => `+ ${l}`).join('\n') + '\n\n';
  }
  if (removed.length > 0) {
    diff += '**Removed:**\n' + removed.slice(0, 10).map(l => `- ${l}`).join('\n');
  }
  
  return diff || 'Minor changes detected (formatting or structure)';
}
