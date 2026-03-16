# gstack

- **Available skills**: `/plan-ceo-review`, `/plan-eng-review`, `/review`, `/ship`, `/browse`, `/qa`, `/qa-only`, `/setup-browser-cookies`, `/retro`
- If gstack skills aren't working, run `cd .claude/skills/gstack && ./setup` to build the binary and register skills.

**CRITICAL RULES:**
- Use the `/browse` skill from gstack for **ALL** web browsing and visual QA.
- **NEVER** use `mcp__claude-in-chrome__*` tools or other default browser tools. Always use `/browse`.
