export const normalizeToken = (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") return null;

  let token = rawToken.trim().replace(/^"+|"+$/g, "");
  token = token.replace(/^Bearer\s+/i, "").trim();

  return token || null;
};

export const isJwtFormatValid = (token) => {
  const normalized = normalizeToken(token);
  if (!normalized) return false;

  const parts = normalized.split(".");
  if (parts.length !== 3) return false;

  try {
    const payloadPart = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = decodeURIComponent(
      atob(payloadPart)
        .split("")
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );
    JSON.parse(payloadJson);
    return true;
  } catch {
    return false;
  }
};
