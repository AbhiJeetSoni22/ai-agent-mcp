export function filterTools(tools, message) {
  const msg = message.toLowerCase();

  if (msg.includes("repo") || msg.includes("github"))
    return tools.filter(t => t.name.includes("repo") || t.name.includes("issue"));

  if (msg.includes("mail") || msg.includes("email") || msg.includes("unread message"))
    return tools.filter(t => t.name.includes("email"));

  if (msg.includes("event") || msg.includes("calendar"))
    return tools.filter(t => t.name.toLowerCase().includes("event"));

  return [];
}
