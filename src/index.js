export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message;

        if (!message || typeof message !== "string") {
          return Response.json(
            { error: "Please enter a message." },
            { status: 400 }
          );
        }

        if (!env.AI) {
          return Response.json(
            { error: "AI binding is not configured yet." },
            { status: 503 }
          );
        }

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content: "You are Timon AI, a helpful assistant for coding, debugging, databases, project planning, and app deployment. Explain things clearly and safely."
              },
              {
                role: "user",
                content: message.slice(0, 8000)
              }
            ]
          }
        );

        return Response.json({ reply: result.response || "I couldn't generate a reply." });
      } catch (error) {
        return Response.json(
          { error: "The AI request failed. Please try again." },
          { status: 500 }
        );
      }
    }

    return new Response("Timon AI backend is running.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
};
