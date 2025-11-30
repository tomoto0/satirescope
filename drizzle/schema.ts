import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const twitterConfigs = mysqlTable("twitter_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  xApiKey: text("x_api_key").notNull(), // Encrypted
  xApiKeySecret: text("x_api_key_secret").notNull(), // Encrypted
  xAccessToken: text("x_access_token").notNull(), // Encrypted
  xAccessTokenSecret: text("x_access_token_secret").notNull(), // Encrypted
  isActive: int("is_active").default(1).notNull(), // 1 = true, 0 = false
  scheduleIntervalMinutes: int("schedule_interval_minutes").default(60).notNull(), // Posting interval in minutes
  scheduleStartHour: int("schedule_start_hour").default(0).notNull(), // Start hour (0-23)
  scheduleEndHour: int("schedule_end_hour").default(23).notNull(), // End hour (0-23)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TwitterConfig = typeof twitterConfigs.$inferSelect;
export type InsertTwitterConfig = typeof twitterConfigs.$inferInsert;

export const postedTweets = mysqlTable("posted_tweets", {
  id: int("id").autoincrement().primaryKey(),
  configId: int("config_id").notNull().references(() => twitterConfigs.id, { onDelete: "cascade" }),
  tweetText: text("tweet_text").notNull(),
  imageUrl: text("image_url"),
  sourceNewsUrl: text("source_news_url"),
  postedAt: timestamp("posted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PostedTweet = typeof postedTweets.$inferSelect;
export type InsertPostedTweet = typeof postedTweets.$inferInsert;