/**
 * Minimal HTML entity escape for user-supplied strings that get
 * interpolated into an HTML email body.
 *
 * The threat model: `/api/messages` accepts a `name`, `email`, `phone`
 * and `message` from the public contact form, then injects them raw
 * into a Resend email body. If a webmail client renders that email as
 * HTML, a payload like `<img src=x onerror="...">` executes in the
 * admin's webmail context.
 *
 * We escape the five characters that can break out of a text node or
 * an attribute:
 *   `&` `<` `>` `"` `'`
 *
 * (`/` is intentionally NOT escaped — it only matters inside
 * `<script>` tag bodies, and we never put user data there.)
 *
 * This is deliberately a small, dependency-free function. The output
 * is safe to drop into either text content or a quoted attribute.
 */
const REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
];

export function escapeHtml(value: string): string {
  let out = value;
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
