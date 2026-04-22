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

  // Validation légère: un JWT peut être base64url sans padding, donc
  // on évite tout décodage strict ici pour ne pas rejeter des tokens valides.
  const jwtPartRegex = /^[A-Za-z0-9\-_]+$/;
  return parts.every((part) => part.length > 0 && jwtPartRegex.test(part));
};
