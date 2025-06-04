
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import {
  createAgentInputSchema,
  updateAgentInputSchema,
  createTaskInputSchema,
  updateTaskInputSchema,
  getAgentLogsInputSchema,
  createAgentLogInputSchema,
  recordPerformanceMetricInputSchema,
  getPerformanceMetricsInputSchema
} from './schema';
import { createAgent } from './handlers/create_agent';
import { getAgents } from './handlers/get_agents';
import { getAgentById } from './handlers/get_agent_by_id';
import { updateAgent } from './handlers/update_agent';
import { deleteAgent } from './handlers/delete_agent';
import { createTask } from './handlers/create_task';
import { getTasks } from './handlers/get_tasks';
import { getTasksByAgent } from './handlers/get_tasks_by_agent';
import { updateTask } from './handlers/update_task';
import { getAgentLogs } from './handlers/get_agent_logs';
import { createAgentLog } from './handlers/create_agent_log';
import { recordPerformanceMetric } from './handlers/record_performance_metric';
import { getPerformanceMetrics } from './handlers/get_performance_metrics';
import { getDashboardOverview } from './handlers/get_dashboard_overview';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Agent management
  createAgent: publicProcedure
    .input(createAgentInputSchema)
    .mutation(({ input }) => createAgent(input)),
  
  getAgents: publicProcedure
    .query(() => getAgents()),
  
  getAgentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getAgentById(input.id)),
  
  updateAgent: publicProcedure
    .input(updateAgentInputSchema)
    .mutation(({ input }) => updateAgent(input)),
  
  deleteAgent: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteAgent(input.id)),
  
  // Task management
  createTask: publicProcedure
    .input(createTaskInputSchema)
    .mutation(({ input }) => createTask(input)),
  
  getTasks: publicProcedure
    .query(() => getTasks()),
  
  getTasksByAgent: publicProcedure
    .input(z.object({ agentId: z.number() }))
    .query(({ input }) => getTasksByAgent(input.agentId)),
  
  updateTask: publicProcedure
    .input(updateTaskInputSchema)
    .mutation(({ input }) => updateTask(input)),
  
  // Logging
  getAgentLogs: publicProcedure
    .input(getAgentLogsInputSchema)
    .query(({ input }) => getAgentLogs(input)),
  
  createAgentLog: publicProcedure
    .input(createAgentLogInputSchema)
    .mutation(({ input }) => createAgentLog(input)),
  
  // Performance monitoring
  recordPerformanceMetric: publicProcedure
    .input(recordPerformanceMetricInputSchema)
    .mutation(({ input }) => recordPerformanceMetric(input)),
  
  getPerformanceMetrics: publicProcedure
    .input(getPerformanceMetricsInputSchema)
    .query(({ input }) => getPerformanceMetrics(input)),
  
  // Dashboard
  getDashboardOverview: publicProcedure
    .query(() => getDashboardOverview()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
