import { pgTable, text, timestamp, integer, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

// Users with roles
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('user').notNull(), // super_admin, admin, user
  plan: text('plan').default('free'), // free, starter, pro, business
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'), // active, canceled, past_due
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// Organizations/Clients (for multi-tenant)
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  plan: text('plan').default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  maxCompetitors: integer('max_competitors').default(2),
  maxUrlsPerCompetitor: integer('max_urls_per_competitor').default(2),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Organization members
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').default('member'), // owner, admin, member
  invitedBy: uuid('invited_by').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Competitors
export const competitors = pgTable('competitors', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  website: text('website'),
  logoUrl: text('logo_url'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Monitored URLs
export const monitoredUrls = pgTable('monitored_urls', {
  id: uuid('id').defaultRandom().primaryKey(),
  competitorId: uuid('competitor_id').references(() => competitors.id).notNull(),
  url: text('url').notNull(),
  urlType: text('url_type').notNull(), // pricing, features, blog, homepage
  lastChecked: timestamp('last_checked'),
  lastContentHash: text('last_content_hash'),
  isActive: boolean('is_active').default(true),
  checkFrequency: text('check_frequency').default('daily'), // hourly, daily, weekly
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Snapshots (crawl results)
export const snapshots = pgTable('snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  urlId: uuid('url_id').references(() => monitoredUrls.id).notNull(),
  contentHash: text('content_hash').notNull(),
  content: text('content'),
  screenshotUrl: text('screenshot_url'),
  statusCode: integer('status_code'),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
});

// Changes (detected differences)
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
  readAt: timestamp('read_at'),
  detectedAt: timestamp('detected_at').defaultNow().notNull(),
});

// Audit log for admin
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(), // user.created, subscription.changed, etc.
  targetType: text('target_type'), // user, organization, competitor
  targetId: uuid('target_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
export type MonitoredUrl = typeof monitoredUrls.$inferSelect;
export type Snapshot = typeof snapshots.$inferSelect;
export type Change = typeof changes.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;

// Role helpers
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  USER: 'user',
} as const;

export const PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  BUSINESS: 'business',
} as const;

export const PLAN_LIMITS = {
  free: { competitors: 2, urlsPerCompetitor: 2, historyDays: 7 },
  starter: { competitors: 5, urlsPerCompetitor: 5, historyDays: 90 },
  pro: { competitors: 15, urlsPerCompetitor: 10, historyDays: 365 },
  business: { competitors: -1, urlsPerCompetitor: -1, historyDays: -1 }, // unlimited
} as const;
