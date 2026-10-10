import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")!;
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Cari tugas yang deadline-nya sudah lewat/pas dan belum dikirimi notif
    const now = new Date().toISOString();
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, user_id, due_date")
      .eq("reminder_sent", false)
      .eq("is_completed", false) // 👈 Gunakan is_completed
      .lte("due_date", now);

    if (tasksError) throw tasksError;

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: "Tidak ada task yang perlu diingatkan" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = [];

    // Tembak notifikasi per tugas
    for (const task of tasks) {
      const pushResponse = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_aliases: {
            external_id: [task.user_id], // Nembak langsung ke ID akun Supabase
          },
          target_channel: "push",
          headings: { en: "⏰ Reminder TaskFlow!" },
          contents: { en: `Tugas "${task.title}" mendekati tenggat waktu!` },
        }),
      });

      const pushResult = await pushResponse.json();

      // Tandai sukses biar gak dispam
      await supabase
        .from("tasks")
        .update({ reminder_sent: true })
        .eq("id", task.id);

      results.push({ task_id: task.id, onesignal: pushResult });
    }

    return new Response(JSON.stringify({ success: true, delivered: results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
