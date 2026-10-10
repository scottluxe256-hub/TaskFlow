import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    const now = new Date().toISOString();

    // 1. Cari tugas yang: belum selesai, tenggat waktunya sudah lewat, dan belum dipotong EXP-nya
    const { data: tasks, error: fetchError } = await supabase
      .from("tasks")
      .select("id, user_id")
      .eq("is_completed", false)
      .eq("xp_deducted", false)
      .not("due_date", "is", null)
      .lt("due_date", now); // due_date < waktu sekarang

    if (fetchError) throw fetchError;

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: "Aman, tidak ada tugas telat baru." }), { status: 200 });
    }

    const taskIds: string[] = [];
    const userPenaltyCount: Record<string, number> = {};

    // 2. Kumpulkan ID tugas dan hitung berapa banyak tugas telat per user
    for (const task of tasks) {
      taskIds.push(task.id);
      userPenaltyCount[task.user_id] = (userPenaltyCount[task.user_id] || 0) + 1;
    }

    // 3. Kurangi EXP di tabel profiles (misal -5 XP per tugas telat)
    for (const [userId, count] of Object.entries(userPenaltyCount)) {
      const penalty = count * 5;
      
      const { data: profile } = await supabase.from("profiles").select("total_xp").eq("id", userId).single();
      const currentXp = profile?.total_xp || 0;
      
      // Hitung sisa EXP, pastikan tidak sampai minus (minimal 0)
      const newXp = Math.max(0, currentXp - penalty);

      await supabase.from("profiles").update({ total_xp: newXp }).eq("id", userId);
    }

    // 4. Tandai tugas-tugas tersebut agar EXP tidak dipotong lagi di eksekusi berikutnya
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ xp_deducted: true })
      .in("id", taskIds);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, deducted_tasks: taskIds.length }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
