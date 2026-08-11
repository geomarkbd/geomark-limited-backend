/**
 * Turns a display name into a URL-safe slug, e.g. "MD Soykot Hossain
 * Sarker" -> "md-soykot-hossain-sarker".
 */
export const slugify = (value: string): string =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

/**
 * Generates a slug that doesn't collide with any existing document.
 * `slugExists` should check uniqueness (optionally excluding the
 * document currently being updated) and return whether the candidate is
 * already taken.
 */
export const generateUniqueSlug = async (name: string, slugExists: (candidate: string) => Promise<boolean>): Promise<string> => {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};
