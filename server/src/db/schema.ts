
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const agentStatusEnum = pgEnum('agent_status', ['online', 'offline', 'starting', 'stopping', 'error']);
export const agentStateEnum = pgEnum('agent_state', ['idle', 'busy', 'maintenance']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'running', 'completed', 'failed', 'cancelled']);
export const logLevelEnum = pgEnum('log_level', ['debug', 'info', 'warn', 'error', 'fatal']);

// Agents table
export const agentsTable = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  proxmox_node: text('proxmox_node').notNull(),
  container_id: text('container_id').notNull(),
  docker_image: text('docker_image').notNull(),
  status: agentStatusEnum('status').notNull().default('offline'),
  state: agentStateEnum('state').notNull().default('idle'),
  cpu_usage: numeric('cpu_usage', { precision: 5, scale: 2 }).notNull().default('0'),
  memory_usage: integer('memory_usage').notNull().default(0),
  memory_limit: integer('memory_limit').notNull().default(1073741824), // 1GB
  network_rx: integer('network_rx').notNull().default(0),
  network_tx: integer('network_tx').notNull().default(0),
  disk_usage: integer('disk_usage').notNull().default(0),
  uptime: integer('uptime').notNull().default(0),
  last_seen: timestamp('last_seen').notNull().defaultNow(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// Tasks table
export const tasksTable = pgTable('tasks', {
  id: serial('id').primaryKey(),
  agent_id: integer('agent_id').notNull().references(() => agentsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  command: text('command').notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  exit_code: integer('exit_code'),
  output: text('output'),
  error_message: text('error_message'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// Agent logs table
export const agentLogsTable = pgTable('agent_logs', {
  id: serial('id').primaryKey(),
  agent_id: integer('agent_id').notNull().references(() => agentsTable.id, { onDelete: 'cascade' }),
  level: logLevelEnum('level').notNull(),
  message: text('message').notNull(),
  metadata: text('metadata'),
  timestamp: timestamp('timestamp').notNull().defaultNow()
});

// Performance metrics table
export const performanceMetricsTable = pgTable('performance_metrics', {
  id: serial('id').primaryKey(),
  agent_id: integer('agent_id').notNull().references(() => agentsTable.id, { onDelete: 'cascade' }),
  cpu_usage: numeric('cpu_usage', { precision: 5, scale: 2 }).notNull(),
  memory_usage: integer('memory_usage').notNull(),
  memory_limit: integer('memory_limit').notNull(),
  network_rx: integer('network_rx').notNull(),
  network_tx: integer('network_tx').notNull(),
  disk_usage: integer('disk_usage').notNull(),
  recorded_at: timestamp('recorded_at').notNull().defaultNow()
});

// Relations
export const agentsRelations = relations(agentsTable, ({ many }) => ({
  tasks: many(tasksTable),
  logs: many(agentLogsTable),
  performanceMetrics: many(performanceMetricsTable)
}));

export const tasksRelations = relations(tasksTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [tasksTable.agent_id],
    references: [agentsTable.id]
  })
}));

export const agentLogsRelations = relations(agentLogsTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [agentLogsTable.agent_id],
    references: [agentsTable.id]
  })
}));

export const performanceMetricsRelations = relations(performanceMetricsTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [performanceMetricsTable.agent_id],
    references: [agentsTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  agents: agentsTable,
  tasks: tasksTable,
  agentLogs: agentLogsTable,
  performanceMetrics: performanceMetricsTable
};
