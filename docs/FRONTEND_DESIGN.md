# Frontend Design Skill
> Read this before writing ANY UI code, components, or styling.

---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian
- **Constraints**: Technical requirements (framework, performance, accessibility)
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## NV Journal Specific Context

- **Aesthetic**: Dark/light minimal — black, white, tight typography, mono fonts
- **Existing fonts**: Bebas Neue (display), JetBrains Mono (data/numbers), Inter (UI)
- **Color tokens**: Always use C.xx theme variables — never hardcode colors
- **Motion**: Subtle only — fadeUp, tabIn animations already defined in CSS
- **Density**: Data-dense but clean — traders read fast, no decorative clutter
- **Dark mode first**: Most users will be in dark mode during trading hours

## Frontend Aesthetics Guidelines

- **Typography**: Use established font stack (Bebas Neue / JetBrains Mono / Inter). Never introduce new fonts without instruction.
- **Color & Theme**: Use CSS variables via ThemeCtx (C.bg, C.text, C.accent, C.green, C.red, C.yellow, C.border etc.) — never hardcode hex values
- **Motion**: CSS-only, subtle. Existing keyframes: fadeUp, tabIn. Add sparingly.
- **Spatial Composition**: Tight, structured grid. Cards with consistent padding. No asymmetry or diagonal layouts — this is a trading tool, not a portfolio site.
- **Backgrounds**: Solid colors only — no gradients, textures, or noise overlays in the main app.

## What to NEVER Do in NV Journal UI

- Introduce new fonts
- Hardcode colors — always use C.xx tokens
- Add decorative backgrounds, gradients, or textures
- Define UI primitives inside the main component body — causes remount/scroll jump
- Use alert() — always use ToastBar
- Build elaborate animations — subtle only
- Make layout decisions that conflict with data density requirements

## General Frontend Rules (all projects)

- Never use generic AI aesthetics: Inter/Roboto/Arial, purple gradients, cookie-cutter patterns
- Every design should have a clear point of view
- Match implementation complexity to aesthetic vision
- Minimalist designs need precision in spacing, typography, subtle details
- Production-grade means it works perfectly, not just looks good
