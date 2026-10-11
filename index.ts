export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    console.log("Cron trigger berjalan...");
  },
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    return new Response("Worker aktif!");
  },
};
