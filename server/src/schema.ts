
import { z } from 'zod';

// Agent status enum
export const agentStatusSchema = z.enum(['online', 'offline', 'starting', 'stopping', 'error']);
export type AgentStatus = z.infer<typeof agentStatusSchema>;

// Agent state enum
export const agentStateSchema = z.enum(['idle', 'busy', 'maintenance']);
export type AgentState = z.infer<typeof agentStateSchema>;

// Task status enum
export const taskStatusSchema = z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

// Log level enum
export const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error', 'fatal']);
export type LogLevel = z.infer<typeof logLevelSchema>;

// Agent schema
export const agentSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  proxmox_node: z.string(),
  container_id: z.string(),
  docker_image: z.string(),
  status: agentStatusSchema,
  state: agentStateSchema,
  cpu_usage: z.number(),
  memory_usage: z.number(),
  memory_limit: z.number(),
  network_rx: z.number(),
  network_tx: z.number(),
  disk_usage: z.number(),
  uptime: z.number(),
  last_seen: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Agent = z.infer<typeof agentSchema>;

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  agent_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  command: z.string(),
  status: taskStatusSchema,
  started_at: z.coerce.date().nullable(),
  completed_at: z.coerce.date().nullable(),
  exit_code: z.number().nullable(),
  output: z.string().nullable(),
  error_message: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Agent log schema
export const agentLogSchema = z.object({
  id: z.number(),
  agent_id: z.number(),
  level: logLevelSchema,
  message: z.string(),
  metadata: z.string().nullable(),
  timestamp: z.coerce.date()
});

export type AgentLog = z.infer<typeof agentLogSchema>;

// Performance metrics schema
export const performanceMetricSchema = z.object({
  id: z.number(),
  agent_id: z.number(),
  cpu_usage: z.number(),
  memory_usage: z.number(),
  memory_limit: z.number(),
  network_rx: z.number(),
  network_tx: z.number(),
  disk_usage: z.number(),
  recorded_at: z.coerce.date()
});

export type PerformanceMetric = z.infer<typeof performanceMetricSchema>;

// Input schemas
export const createAgentInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  proxmox_node: z.string().min(1),
  container_id: z.string().min(1),
  docker_image: z.string().min(1),
  memory_limit: z.number().positive().optional().default(1073741824) // 1GB default
});

export type CreateAgentInput = z.infer<typeof createAgentInputSchema>;

export const updateAgentInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: agentStatusSchema.optional(),
  state: agentStateSchema.optional(),
  cpu_usage: z.number().min(0).max(100).optional(),
  memory_usage: z.number().nonnegative().optional(),
  memory_limit: z.number().positive().optional(),
  network_rx: z.number().nonnegative().optional(),
  network_tx: z.number().nonnegative().optional(),
  disk_usage: z.number().nonnegative().optional(),
  uptime: z.number().nonnegative().optional()
});

export type UpdateAgentInput = z.infer<typeof updateAgentInputSchema>;

export const createTaskInputSchema = z.object({
  agent_id: z.number(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  command: z.string().min(1)
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const updateTaskInputSchema = z.object({
  id: z.number(),
  status: taskStatusSchema.optional(),
  started_at: z.coerce.date().nullable().optional(),
  completed_at: z.coerce.date().nullable().optional(),
  exit_code: z.number().nullable().optional(),
  output: z.string().nullable().optional(),
  error_message: z.string().nullable().optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const createAgentLogInputSchema = z.object({
  agent_id: z.number(),
  level: logLevelSchema,
  message: z.string().min(1),
  metadata: z.string().nullable().optional()
});

export type CreateAgentLogInput = z.infer<typeof createAgentLogInputSchema>;

export const getAgentLogsInputSchema = z.object({
  agent_id: z.number(),
  level: logLevelSchema.optional(),
  limit: z.number().int().positive().max(1000).optional().default(100),
  offset: z.number().int().nonnegative().optional().default(0)
});

export type GetAgentLogsInput = z.infer<typeof getAgentLogsInputSchema>;

export const recordPerformanceMetricInputSchema = z.object({
  agent_id: z.number(),
  cpu_usage: z.number().min(0).max(100),
  memory_usage: z.number().nonnegative(),
  memory_limit: z.number().positive(),
  network_rx: z.number().nonnegative(),
  network_tx: z.number().nonnegative(),
  disk_usage: z.number().nonnegative()
});

export type RecordPerformanceMetricInput = z.infer<typeof recordPerformanceMetricInputSchema>;

export const getPerformanceMetricsInputSchema = z.object({
  agent_id: z.number(),
  hours: z.number().int().positive().max(168).optional().default(24) // Default to last 24 hours, max 1 week
});

export type GetPerformanceMetricsInput = z.infer<typeof getPerformanceMetricsInputSchema>;

// Dashboard overview schema
export const dashboardOverviewSchema = z.object({
  total_agents: z.number(),
  online_agents: z.number(),
  offline_agents: z.number(),
  busy_agents: z.number(),
  idle_agents: z.number(),
  total_tasks: z.number(),
  running_tasks: z.number(),
  completed_tasks: z.number(),
  failed_tasks: z.number(),
  avg_cpu_usage: z.number(),
  avg_memory_usage: z.number(),
  total_uptime: z.number()
});

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
