# Architecture

The site uses Next.js 14 App Router, React, TypeScript, and Tailwind CSS. Production is a static export for GitHub Pages with the `/wedding` base path. Firebase provides invitation and RSVP data.

## Landing page

`app/page.tsx` composes `Hero`, `InfoSection`, and `Footer`.

- `Hero`: a full-viewport introduction at every screen size, wedding date/venue, a days-only countdown using the French summer-time offset, and anchor links to RSVP/practical details.
- `InfoSection`: invitation-code form, confirmed guest count, venue/directions, native information disclosures, FAQs, and email contact. RSVP routes to `/confirmation/?code=...` using a trimmed, URL-encoded code.
- `Footer`: compact wedding sign-off.

The layout stacks RSVP before practical details on phones and places them in matching, equal-height panels from 768px. Native disclosures can grow both panels together. The personalized RSVP form uses a two-column field/event layout from 768px and guest cards that fill the available width; phones retain a single-column form. Landing-specific styles are scoped under `.landing-page`. Native `details`/`summary` handles disclosure interaction and keyboard access. The landing hero mounts the original WebGL Aurora with its responsive color stops, blend 0.4, amplitude 0.7, and speed 0.2 over the original diagonal gradient. The particle component remains unmounted.

## Honeymoon page

The /noces route is a responsive travel journal with home navigation in its hero. Editable tripSteps data contains tentative cities, draft descriptions, highlights, and optional local image paths. Inline SVG placeholders avoid external image fallbacks. Framer Motion retains the scroll-driven airplane and reveals; reduced-motion preferences disable movement. The timeline stacks on phones and alternates two columns from 768px.
