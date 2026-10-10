import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")!;
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fungsi cerdas untuk mengubah teks durasi ("1 Jam", "1 Hari", dll) menjadi angka MENIT
function parseDurationToMinutes(durationStr: string | null | undefined): number {
  if (!durationStr) return 15; // default 15 menit jika kosong

  const parts = durationStr.trim().split(/\s+/);
  const value = parseInt(parts[0], 10);
  const unit = parts[1]?.toLowerCase();

  if (isNaN(value)) return 15;

  if (unit?.includes("hari")) {
    return value * 24 * 60; // Contoh: 1 Hari = 1440 menit
  } else if (unit?.includes("jam")) {
    return value * 60;      // Contoh: 1 Jam = 60 menit
  } else if (unit?.includes("menit")) {
    return value;           // Contoh: 15 Menit = 15 menit
  }

  return value;
}

Deno.serve(async (req) => {
  try {
    const now = new Date();

    // 1. Ambil tugas yang belum beres, belum dikirimi notif,
    // dan HANYA milik user yang reminder_enabled-nya bernilai true di tabel profiles
    const { data: tasks, error: fetchError } = await supabase
      .from("tasks")
      .select(`
        *,
        profiles!inner (
          reminder_enabled,
          reminder_duration
        )
      `)
      .eq("is_completed", false)
      .eq("reminder_sent", false)
      .eq("profiles.reminder_enabled", true)
      .not("due_date", "is", null);

    if (fetchError) throw fetchError;

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "Tidak ada tugas yang perlu diingatkan saat ini." }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    const sentTaskIds: string[] = [];

    // 2. Evaluasi waktu tenggat setiap tugas
    for (const task of tasks) {
      const dueDate = new Date(task.due_date);

      // Ambil teks durasi dari profil pengguna (misal: "1 Jam", "1 Hari", dll)
      const durationStr = task.profiles?.reminder_duration || "15 Menit";
      const reminderMinutes = parseDurationToMinutes(durationStr);

      // Hitung kapan waktu notifikasi harus muncul (due_date - reminderMinutes)
      const triggerTime = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);

      // Jika waktu sekarang sudah masuk/melewati waktu trigger
      if (now >= triggerTime) {
        const body = {
          app_id: ONESIGNAL_APP_ID,
          headings: { en: "⏰ Reminder TaskFlow!" },
          contents: { en: `Tugas ${task.title} mendekati tenggat waktu!` }, // Tanpa tanda kutip
          chrome_web_icon: "https://zrnvfduislvwdhkmqbpl.supabase.co/storage/v1/object/public/public-assets/logo.png", // Logo aplikasimu
          include_aliases: {
            external_id: [task.user_id],
          },
          target_channel: "push",
        };

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify(body),
        });

        const resData = await response.json();

        if (response.ok && !resData.errors) {
          sentTaskIds.push(task.id);
        } else {
          console.error(`Gagal mengirim notif untuk tugas ID ${task.id}:`, resData);
        }
      }
    }

    // 3. Update status agar tidak dikirim berulang kali
    if (sentTaskIds.length > 0) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ reminder_sent: true })
        .in("id", sentTaskIds);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        notified_tasks_count: sentTaskIds.length,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
