# Decisions

## 2026-10-03: Compact mobile landing page

Guests primarily browse on phones. Replace the full-height hero and expanded information cards with a shorter introduction, immediate RSVP/practical-information links, an early invitation form, and a compact venue card.

Keep the monogram, animated signature, blue/green palette, and venue illustration. Use a static gradient instead of continuous canvas decoration, and a single days-until countdown instead of four ticking counters. Honour reduced-motion preferences for the signature.

Put the weekend programme, venue description, travel/weather advice, and FAQ answers in native disclosures. Preserve the tentative programme and RSVP deadline without introducing new ceremony times. Show the unavailable gallery as a notice rather than a prominent disabled action.

Retain the confirmed guest count. Hide it when loading or unavailable so a failed request does not imply zero confirmed guests. Keep the invitation-code route and Firebase RSVP behaviour unchanged.

## Desktop/tablet refinement requested by the owner

Use a full-viewport hero from 768px so its introduction occupies a complete screen rather than exposing a cropped next section. Keep the compact phone hero. Add a scroll link at the bottom of the desktop/tablet introduction.

Place invitation and practical information in matching panels with CSS grid stretch, including when a disclosure opens. Add desktop instructions explaining that responses are entered per guest, while keeping these extra instructions out of the compact phone landing page. Label the code form action as opening the invitation, since it does not itself save an RSVP. Clarify that weekend participation depends on the invitation.

Make the personalized RSVP form more compact with smaller headings/icons, tighter spacing, a two-column response/information layout, and two-column event cards on tablet/desktop. Guest-card columns use auto-fit so small groups do not leave an empty column. Align the invitation message with the form and remove empty badge spacing. Email remains optional, consistent with its label. Firebase submission logic is unchanged.

## Full-screen phone hero and uncropped venue illustration

Following the owner's clarification, the hero now fills at least one viewport on phones as well as tablets/desktops. Use `100svh` with a `100vh` fallback. Place the content and scroll link in normal grid flow, so short landscape screens can scroll naturally without overlaps. Earlier compact-phone decisions are superseded.

Render `domaine.svg` with its intrinsic width/height ratio, automatic height, and `object-contain`; remove square dimensions and `object-cover`. Keep the illustration responsive within the venue card.

## Restore the original hero aurora
At the user’s request, restore the original Aurora animation and background gradient. Preserve blend 0.4, amplitude 0.7, speed 0.2, and the original color palettes with their 1000px breakpoint. This supersedes the earlier static-background decision; the responsive hero layout stays in place.

## Restore the hero identity proportions
Restore the original monogram sizing (50% width, capped at 240px) and signature width (full width, capped at 672px). Preserve the full-screen hero and practical navigation; short screens can grow naturally to avoid clipping.

## Honeymoon journal refresh

Present a month-long Japan roadtrip rather than the previous three-week/fixed-day itinerary. Retain existing destination ideas but mark every stop as tentative while the couple adjusts the route. Replace broken images and remote placeholders with local illustrated cards, retain the airplane animation, and move home navigation into the hero. Gift information remains an urne at the wedding with no payment action.
