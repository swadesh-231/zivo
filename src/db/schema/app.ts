import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const messageRole = pgEnum("message_role", ["USER", "ASSISTANT"]);
export const messageType = pgEnum("message_type", ["RESULT", "ERROR"]);

export const MessageRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
} as const;

export const MessageType = {
  RESULT: "RESULT",
  ERROR: "ERROR",
} as const;

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const project = pgTable(
  "project",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("project_user_id_idx").on(table.userId)],
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    role: messageRole("role").notNull(),
    type: messageType("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("message_project_id_idx").on(table.projectId)],
);

export const fragment = pgTable(
  "fragment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    sandboxUrl: text("sandbox_url").notNull(),
    title: text("title").notNull(),
    files: jsonb("files").$type<Record<string, string>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("fragment_message_id_idx").on(table.messageId)],
);

export type Project = typeof project.$inferSelect;
export type Message = typeof message.$inferSelect;
export type Fragment = typeof fragment.$inferSelect;
