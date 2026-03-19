/**
 * Formats raw illustration/icon names for display.
 *
 * ill_error_state_light  →  "Error State Light"
 * ic_home_dark           →  "Home Dark"
 *
 * When isDarkView is true, the _light suffix is replaced with _dark and vice versa.
 */
export function formatIllustrationName(rawName: string, isDarkView: boolean): string {
  // Strip ill_ or ic_ prefix
  let name = rawName.replace(/^(ill_|ic_)/i, "");

  // Remove existing light / dark suffix
  name = name.replace(/_(light|dark)$/i, "");

  // Re-append the correct suffix for the current view
  name = name + (isDarkView ? "_dark" : "_light");

  // Underscores → spaces, Title Case each word
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
