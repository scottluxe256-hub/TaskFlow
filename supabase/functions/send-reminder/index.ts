import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (_req) => {
  try {
    // 1. Cek ketersediaan Secrets OneSignal
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "ONESIGNAL_APP_ID atau ONESIGNAL_REST_API_KEY belum disetel di Supabase Secrets!",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Ambil tugas yang belum selesai dan sudah masuk/melewati tenggat waktu
    const now = new Date().toISOString();
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, user_id, due_date")
      .or("reminder_sent.is.null,reminder_sent.eq.false")
      .eq("is_completed", false)
      .lte("due_date", now);

    if (tasksError) throw tasksError;

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "Tidak ada task yang perlu diingatkan saat ini" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Format header Authorization OneSignal (mendukung token os_v2_ maupun legacy)
    const cleanKey = ONESIGNAL_REST_API_KEY.trim();
    const authHeader = cleanKey.startsWith("Key ") || cleanKey.startsWith("Basic ")
      ? cleanKey
      : cleanKey.startsWith("os_v2_")
      ? `Key ${cleanKey}`
      : `Basic ${cleanKey}`;

    const results = [];

    // 4. Kirim notifikasi per tugas ke User ID Supabase terkait
    for (const task of tasks) {
      const pushResponse = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_aliases: {
            external_id: [task.user_id],
          },
          target_channel: "push",
          headings: { en: "⏰ Reminder TaskFlow!" },
          contents: { en: `Tugas "${task.title}" mendekati tenggat waktu!` },
        }),
      });

      const pushResult = await pushResponse.json();

      // Tandai task sudah diproses agar tidak dikirim ulang
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
