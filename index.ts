export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ONESIGNAL_APP_ID: string;
  ONESIGNAL_REST_API_KEY: string;
}

export default {
  // Fungsi utama yang dipanggil oleh Cron Trigger setiap 1 menit
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(processReminders(env));
  },

  // Fungsi tambahan untuk mempermudah pengetesan via URL browser (opsional)
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    await processReminders(env);
    return new Response("Pengecekan reminder berhasil dijalankan!");
  },
};

async function processReminders(env: Env) {
  // 1. Ambil waktu sekarang dalam format ISO (UTC)
  const now = new Date().toISOString();

  // 2. Query ke Supabase via REST API (tanpa perlu install library supabase-js)
  // Mencari tugas yang belum selesai, belum dikirim notif, dan waktunya <= sekarang
  const supabaseUrl = `${env.SUPABASE_URL}/rest/v1/tasks?select=id,title,user_id&is_completed=eq.false&due_date=lte.${now}&or=(reminder_sent.is.false,reminder_sent.is.null)`;

  const tasksResponse = await fetch(supabaseUrl, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  const tasks = await tasksResponse.json() as any[];

  if (!tasks || tasks.length === 0) {
    console.log("Tidak ada tugas baru yang perlu dinotifikasi.");
    return;
  }

  console.log(`Mempersiapkan notifikasi untuk ${tasks.length} tugas...`);
  const updatedTaskIds: string[] = [];

  // 3. Kirim Notifikasi OneSignal untuk masing-masing tugas
  for (const task of tasks) {
        const payload = {
      app_id: env.ONESIGNAL_APP_ID,
      include_aliases: {
        external_id: [task.user_id] // Mencocokkan dengan ID user saat login
      },
      target_channel: "push",
      headings: { en: "Waktunya Fokus! ⏳" },
      contents: { 
        en: `Tugas "${task.title}" mendekati tenggat waktu, segera selesaikan!` 
      },
    };

    const osResponse = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (osResponse.ok) {
      updatedTaskIds.push(task.id);
    } else {
      console.error(`Gagal mengirim ke ${task.user_id}:`, await osResponse.text());
    }
  }

  // 4. Update status reminder_sent menjadi true di Supabase agar tidak ada spam/double notif
  if (updatedTaskIds.length > 0) {
    const updateUrl = `${env.SUPABASE_URL}/rest/v1/tasks?id=in.(${updatedTaskIds.join(',')})`;
    await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ reminder_sent: true })
    });
    console.log(`Berhasil menandai ${updatedTaskIds.length} tugas selesai dikirim.`);
  }
}
