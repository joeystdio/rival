import { pgTable, text, timestamp, integer, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  plan: text('plan').default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const competitors = pgTable('competitors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  website: text('website'),
  logoUrl: text('logo_url'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const monitoredUrls = pgTable('monitored_urls', {
  id: uuid('id').defaultRandom().primaryKey(),
  competitorId: uuid('competitor_id').references(() => competitors.id).notNull(),
  url: text('url').notNull(),
  urlType: text('url_type').notNull(), // pricing, features, blog, homepage
  lastChecked: timestamp('last_checked'),
  lastContentHash: text('last_content_hash'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const snapshots = pgTable('snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  urlId: uuid('url_id').references(() => monitoredUrls.id).notNull(),
  contentHash: text('content_hash').notNull(),
  content: text('content'),
  screenshotUrl: text('screenshot_url'),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
});

export const changes = pgTable('changes', {
  id: uuid('id').defaultRandom().primaryKey(),
  urlId: uuid('url_id').references(() => monitoredUrls.id).notNull(),
  snapshotBeforeId: uuid('snapshot_before_id').references(() => snapshots.id),
  snapshotAfterId: uuid('snapshot_after_id').references(() => snapshots.id).notNull(),
  changeType: text('change_type'), // pricing, features, messaging, design
  significance: text('significance').default('minor'), // minor, notable, major
  aiSummary: text('ai_summary'),
  aiAnalysis: text('ai_analysis'),
  diffContent: text('diff_content'),
  notified: boolean('notified').default(false),
  detectedAt: timestamp('detected_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
export type MonitoredUrl = typeof monitoredUrls.$inferSelect;
export type Snapshot = typeof snapshots.$inferSelect;
export type Change = typeof changes.$inferSelect;
