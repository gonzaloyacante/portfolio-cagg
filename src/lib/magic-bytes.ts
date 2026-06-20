/**
 * Magic-byte / signature verification for declared MIME types.
 *
 * The Content-Type header is attacker-controlled — anyone can PUT a
 * payload with `Content-Type: image/png` and a body that is actually
 * JavaScript, PHP, or anything else. This module gives the upload
 * route a second, body-level check before bytes ever leave the
 * server.
 *
 * For binary image formats (PNG, JPEG, GIF, WEBP) we compare the
 * first bytes of the buffer against the format's published signature.
 *
 * For SVG (text-based, no fixed magic number) we instead scan the
 * decoded text for dangerous embedded constructs that turn an image
 * into a script-execution vector in the browser:
 *   - `<script>` elements
 *   - `<foreignObject>` (can embed HTML and host script execution)
 *
 * Returns `true` only if the bytes are consistent with the declared
 * MIME. `false` means: reject the upload.
 *
 * NOTE: this is defense-in-depth. Cloudinary stores and serves the
 * files on its own domain (not the portfolio origin), so the
 * practical XSS risk is low today. The check exists so that
 * misconfiguration of Cloudinary delivery flags (e.g. switching to
 * `image_fetch` or moving the bucket behind the portfolio origin)
 * does not silently become a critical.
 */
export function isBufferConsistentWithMime(buffer: Uint8Array, mime: string): boolean {
  if (buffer.length === 0) return false;

  switch (mime) {
    case 'image/png': {
      // 89 50 4E 47 0D 0A 1A 0A — PNG signature
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }
    case 'image/jpeg': {
      // FF D8 FF — JPEG SOI marker + first byte of next marker
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    case 'image/gif': {
      // 47 49 46 38 (37|39 61) — "GIF8" + version
      return (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38 &&
        (buffer[4] === 0x37 || buffer[4] === 0x39) &&
        buffer[5] === 0x61
      );
    }
    case 'image/webp': {
      // RIFF....WEBP — 12-byte signature
      if (buffer.length < 12) return false;
      return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );
    }
    case 'image/svg+xml': {
      return svgBodyIsSafe(buffer);
    }
    default:
      // Unknown MIME — should be impossible because ALLOWED_TYPES
      // gates the route. Fail closed.
      return false;
  }
}

/**
 * SVG is text-based and has no magic number. We do a content scan
 * for known XSS vectors. The decode is non-fatal: if the file is
 * not valid UTF-8 we still get *some* text to scan, and we err on
 * the side of rejection (caller treats `false` as "reject").
 *
 * Stripped before scanning:
 *   - XML comments   (`<!-- ... -->`)  — can hide payloads
 *   - CDATA blocks   (`<![CDATA[ ... ]]>`) — can hide payloads
 *
 * Rejected if the body contains, after stripping:
 *   - `<script`      (any case, optional whitespace before tag name)
 *   - `<foreignObject`  (HTML/JS embedding vector)
 *   - `javascript:`  (URL scheme, case-insensitive)
 *   - `data:text/html`  (inline HTML data URI)
 */
function svgBodyIsSafe(buffer: Uint8Array): boolean {
  const text = new TextDecoder('utf-8', { fatal: false })
    .decode(buffer)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');

  if (/<script\b/i.test(text)) return false;
  if (/<foreignObject\b/i.test(text)) return false;
  if (/javascript:/i.test(text)) return false;
  if (/data\s*:\s*text\/html/i.test(text)) return false;

  return true;
}
