# Project state

## Landing page — 2026-10-03

The landing page has been refactored for mobile guests:
- Compact branded introduction with date/venue and direct RSVP/practical-information links.
- RSVP immediately after the hero; RSVP and information appear side by side on desktop.
- Venue address, directions, outdoor ceremony, and parking remain visible.
- Programme, venue description, transport/weather advice, and FAQs use native expandable sections.
- Countdown simplified to days; continuous particle/WebGL backgrounds removed from the landing page.
- Invitation routing, Firebase confirmed guest count, RSVP deadline, and contact emails retained. Gallery remains unavailable.

## Verification

TypeScript passed. Next.js production compilation, type validation, and static export passed for all 11 generated pages in a clean verification copy. The clean copy was necessary because the original `.next/trace` file was locked by another process, and overlapping preview/build activity caused incomplete manifests. No permanent build configuration changes were made.

Browser checks covered 320px and 390px mobile widths and a 1440px desktop viewport, with no horizontal overflow. Verified anchor jumps, click/keyboard disclosure controls, empty invitation-code validation, URL encoding/whitespace trimming with a dummy code, and live confirmed guest count. No RSVP records were submitted or changed.

Reviewed screenshots are in `docs/screenshots/landing_mobile_refactored.jpg` and `docs/screenshots/landing_desktop_refactored.jpg`.

The programme is still tentative and the gallery is still in development, matching the original site. Build tooling reports outdated Browserslist/Baseline data; dependencies were left unchanged.

## Follow-up: real invitation journeys

Tested all three invitation categories supplied by the owner from the landing form in a 390px mobile preview. The reserved-accommodation invitation shows the reserved-room message and weekend event fields without accommodation suggestions. The weekend invitation without accommodation shows the same event fields and a working link to nine nearby accommodation suggestions. The ceremony/drinks invitation shows its specific badge, no weekend event checkboxes, and no accommodation link. Lowercase code entry is accepted by the confirmation page.

Verified that accepting a weekend invitation without selecting an event disables confirmation, selecting an event enables it, and declining hides event fields. Existing guest answers load correctly. These checks changed local form state only: the final submission button was never used and no Firebase records were changed. Final persistence remains untested on the live database.

Existing development-only issue observed: accommodation images request the hardcoded `/wedding/hebergements/` prefix and return 404 in development, where the configured base path is empty. The production base path is `/wedding`, so this check does not establish a production image failure. No accommodation code was changed during these RSVP checks.


## Desktop/tablet layout follow-up

The hero now fills the viewport from 768px; phones retain the shorter introduction. Invitation and practical-information panels have matching styling and equal heights from 768px. The form action now says it opens the invitation, and the programme explains invitation-specific attendance.

The personalized RSVP form now groups response/email fields and event cards into two columns from 768px, uses smaller headings/icons and tighter gaps, and fits guest cards to the available width. Invitation text and form widths are aligned. Empty badge spacing was removed. Email is consistently marked optional, and comments have an associated label.

Browser checks passed at desktop 1440×900, landscape tablet 1024×768, portrait tablets 820×1180 and 768×1024, and phones 390×844 and 320×740. Hero heights matched viewport heights on desktop/tablet, both landing panels had equal heights including with the programme expanded, and no horizontal overflow was detected. Weekend and ceremony-only RSVP layouts were checked at tablet/desktop sizes, with the expected event fields and enabled ceremony-only confirmation. No RSVP was saved.

Updated visual evidence: `docs/screenshots/landing_desktop_adjusted.jpg`, `landing_tablet_adjusted.jpg`, and `landing_mobile_adjusted.jpg`.

TypeScript and a clean-copy production static export passed after these adjustments (all 11 pages).

## Phone hero and venue illustration follow-up

The hero now fills the screen on phones too. It uses small-viewport units with a fallback and keeps its scroll link in normal layout flow. In short landscape viewports it grows to fit its content instead of clipping or overlapping controls. `domaine.svg` now retains its original proportions and is shown entirely without cropping.

Browser checks passed at 390×844, 375×667, 320×568, 844×390 (landscape phone), 820×1180, and 1440×900. The hero matched portrait viewport heights; the landscape layout grew safely. No horizontal overflow or overlap between the buttons and scroll link was detected. The displayed venue illustration ratio matched the SVG ratio within subpixel rounding. Screenshot: `docs/screenshots/landing_mobile_fullscreen.jpg`.

## Original aurora restored
The hero uses its original WebGL Aurora settings and diagonal background gradient again. The full-screen responsive layout, navigation, and uncropped venue illustration remain in place.

## Hero identity proportions restored
The monogram and names have their original responsive dimensions again: logo at 50% width up to 240px and signature up to 672px. TypeScript validation passed.

## Honeymoon page refresh

The /noces page introduces a month-long Japan roadtrip, with provisional descriptions and highlights for the existing five destination ideas. Fixed day ranges are removed while the itinerary is being adjusted. The home button is integrated into the hero. Compact inline illustrations replace missing photos; optional image paths can be added in tripSteps. The airplane follows scrolling, with reduced-motion support.

Browser checks at 320px, 390px, 820px, and 1440px found no horizontal overflow. Verified itinerary anchor navigation, alternating tablet/desktop layout, and airplane progression on scrolling. TypeScript passed. Visual evidence: docs/screenshots/noces_mobile_refactored.jpg and noces_desktop_refactored.jpg.

Clean-copy production compilation and static export passed for all 11 generated pages.

The landing page now includes a compact, fully clickable Japan honeymoon card between the invitation/practical panels and FAQs, linking to /noces/ with Next Link so the production base path is respected.

## Contact privacy
The confirmation error/help panel now uses an email contact button matching the landing page. The couple’s personal phone numbers were removed from the source; accommodation providers’ public contact details are unchanged.
