const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337"
).replace(/\/$/, "");

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const res = await fetch(`${STRAPI_URL}/api/daily-question/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer: payload?.answer
      }),
      cache: "no-store"
    });

    const data = await res.json().catch(() => ({}));

    return Response.json(data, {
      status: res.status
    });
  } catch {
    return Response.json(
      {
        error: "Vote request failed"
      },
      {
        status: 500
      }
    );
  }
}
