export async function onRequestPost({ request, env }) {
  try {
    const { public_id } = await request.json();
    
    if (!public_id) {
      return new Response(JSON.stringify({ error: "public_id missing" }), { status: 400 });
    }

    if (!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_CLOUD_NAME) {
      return new Response(JSON.stringify({ error: "Kunci API Cloudinary belum disetting di Variables Cloudflare Pages!" }), { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureString = `public_id=${public_id}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const formData = new URLSearchParams();
    formData.append("public_id", public_id);
    formData.append("timestamp", timestamp);
    formData.append("api_key", env.CLOUDINARY_API_KEY);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
