export async function classifyIntent(message) {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
Classify the user request into exactly one of these:
- gmail
- calendar
- github
- web_search
- none

Only return one word.
        `,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return res.choices[0].message.content.trim().toLowerCase();
}
