import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper bikin Access Token Google FCM (OAuth 2.0)
async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Format PEM RSA key
  const pem = privateKey.replace(/\\n/g, "\n");
  const cleanKey = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(cleanKey), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encodeBase64Url = (str: string) => btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedClaim = encodeBase64Url(JSON.stringify(claim));
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedClaim}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, data);
  const jwt = `${encodedHeader}.${encodedClaim}.${encodeBase64Url(String.fromCharCode(...new Uint8Array(signature)))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const json = await res.json();
  return json.access_token;
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const fcmEmail = Deno.env.get("FCM_CLIENT_EMAIL") ?? "";
    const fcmKey = Deno.env.get("FCM_PRIVATE_KEY") ?? "";
    const fcmProjectId = Deno.env.get("FCM_PROJECT_ID") ?? "";

    // 1. Tarik task yang belum selesai, belum dikirimi notif, dan punya due_date
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, due_date, user_id")
      .eq("is_completed", false)
      .eq("reminder_sent", false)
      .not("due_date", "is", null);

    if (tasksError) throw tasksError;
    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: "Tidak ada task yang perlu diingatkan" }), { status: 200 });
    }

    const accessToken = await getAccessToken(fcmEmail, fcmKey);
    const now = new Date().getTime();

    for (const task of tasks) {
      // 2. Cek preferensi reminder user
      const { data: profile } = await supabase
        .from("profiles")
        .select("reminder_enabled, reminder_duration")
        .eq("id", task.user_id)
        .single();

      if (!profile || !profile.reminder_enabled) continue;

      // Parsing reminder_duration (misal: "15 Menit", "1 Jam", "1 Hari")
      const durationStr = profile.reminder_duration || "15 Menit";
      let offsetMs = 15 * 60 * 1000;
      const [valStr, unit] = durationStr.split(" ");
      const val = parseInt(valStr, 10) || 15;

      if (unit === "Menit") offsetMs = val * 60 * 1000;
      else if (unit === "Jam") offsetMs = val * 60 * 60 * 1000;
      else if (unit === "Hari") offsetMs = val * 24 * 60 * 60 * 1000;

      const dueTime = new Date(task.due_date).getTime();
      const triggerTime = dueTime - offsetMs;

      // Cek apakah waktu sekarang sudah masuk jadwal pengingat
      if (now >= triggerTime && now <= dueTime + (60 * 60 * 1000)) {
        // 3. Ambil semua token FCM user ini
        const { data: tokens } = await supabase
          .from("user_fcm_tokens")
          .select("fcm_token")
          .eq("user_id", task.user_id);

        if (tokens && tokens.length > 0) {
          for (const item of tokens) {
            await fetch(`https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: {
                  token: item.fcm_token,
                  notification: {
                    title: "⏰ Reminder TaskFlow!",
                    body: `Tugas "${task.title}" mendekati tenggat waktu!`,
                  },
                },
              }),
            });
          }
        }

        // 4. Tandai task sudah dikirim pengingatnya
        await supabase.from("tasks").update({ reminder_sent: true }).eq("id", task.id);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

