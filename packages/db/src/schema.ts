import { pgTable, text, boolean, integer, timestamp, jsonb, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Enums
export const positionEnum = pgEnum("position", ["bottom-right", "bottom-left", "top-right", "top-left"]);
export const themeEnum = pgEnum("theme", ["light", "dark"]);
export const eventTypeEnum = pgEnum("event_type", ["signup", "purchase", "pageview", "custom"]);
export const tierEnum = pgEnum("tier", ["free", "pro", "business"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "trialing"]);

// Users
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Workspaces
export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  siteId: uuid("site_id").notNull().unique(),
  apiKey: text("api_key").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  position: positionEnum("position").notNull().default("bottom-right"),
  theme: themeEnum("theme").notNull().default("light"),
  displayTimeMs: integer("display_time_ms").notNull().default(5000),
  delayBetweenMs: integer("delay_between_ms").notNull().default(8000),
  maxPerSession: integer("max_per_session").notNull().default(3),
  eventTypes: text("event_types").array().notNull().default(["signup", "purchase"]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: eventTypeEnum("type").notNull(),
  personName: text("person_name"),
  personLocation: text("person_location"),
  metaJson: jsonb("meta_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Widget Impressions
export const widgetImpressions = pgTable("widget_impressions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  tier: tierEnum("tier").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  workspaces: many(workspaces),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  campaigns: many(campaigns),
  events: many(events),
  widgetImpressions: many(widgetImpressions),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [campaigns.workspaceId], references: [workspaces.id] }),
  widgetImpressions: many(widgetImpressions),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  workspace: one(workspaces, { fields: [events.workspaceId], references: [workspaces.id] }),
}));

export const widgetImpressionsRelations = relations(widgetImpressions, ({ one }) => ({
  workspace: one(workspaces, { fields: [widgetImpressions.workspaceId], references: [workspaces.id] }),
  campaign: one(campaigns, { fields: [widgetImpressions.campaignId], references: [campaigns.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));
