export async function selectRelevantTools(message, tools) {
  const toolList = tools.map((t) => ({
    name: t.name,
    description: t.description,
  }));

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are a tool selector.

From the given list of tools, return ONLY the names of tools that are relevant to the user's query.

Rules:
- Return JSON array of tool names
- Do NOT include explanations
- If no tool is relevant, return []
        `,
      },
      {
        role: "user",
        content: `
User Query:
${message}

Available Tools:
${JSON.stringify(toolList, null, 2)}
        `,
      },
    ],
  });

  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return [];
  }
}