# Design QA

## Evidence

- Source visual truth: user-provided comprobante screenshot with name/folio/photo region and the current user-provided `/personal` screenshot.
- Implementation: `http://localhost:5175/personal`.
- Viewport: Chrome capture at approximately `1470 x 802` CSS px.
- State: authenticated student, `Información Personal` selected, photo slot empty.
- Implementation screenshot: captured with browser control after hard refresh and inspected inline.
- Normalization: compared the portal-owned content area in the same browser viewport; browser chrome excluded.

## Full-view Comparison Evidence

The applicant block now includes the missing NOMBRE and FOLIO rows and preserves the right-side photo frame. The photo frame is interactive and accepts image uploads, showing the selected image inside the same reserved rectangle.

The "Recuerda que si no realizas..." instructional copy was adjusted away from a generic web text feel and now uses a Courier-style monospaced family, heavier visual rhythm and closer line height to the reference.

## Focused Comparison Evidence

- Applicant data: `NOMBRE: Alexis Arael Vazquez Robles` is visible in the name row. `FOLIO: 2262139202` is visible in the folio row.
- Photo area: the right rectangle now contains a `Cargar foto` affordance and an underlying `input type="file"` with `accept="image/*"`. When a user selects an image, a local preview is rendered in that same box.
- Instructional copy: the two "Recuerda..." lines and the following paragraph use Courier/Courier New fallback, `18px` source-size text and `22px` line-height before document scaling, matching the old printed-web texture more closely.
- Data table: the academic-information rows remain unchanged and are still present lower in the comprobante.

## Required Fidelity Surfaces

- Fonts and typography: the applicant rows, red title, alert, body copy and table labels were reviewed. The main body copy now has a visibly more source-like monospaced texture.
- Spacing and layout rhythm: the photo slot, name/folio rows and lower divider remain in the same overall document stack. The document remains scaled to fit the portal viewport.
- Colors and visual tokens: white document panels, grey borders, red alert text and grey beveled controls remain consistent with the reference.
- Image quality and asset fidelity: clean UAM raster asset remains in use. The photo slot accepts user-loaded raster images and previews them with `object-fit: cover`.
- Copy and content: the requested name appears. Folio uses the available student number `2262139202` because no separate folio value was provided.

## Findings

- No actionable P0, P1 or P2 mismatch remains for this requested pass.
- P3: exact print-scale proportions differ slightly because the comprobante is scaled inside the portal content pane.

## Comparison History

1. Earlier pass had only blank guide lines where NOMBRE and FOLIO belonged.
2. The current pass replaced those guide lines with actual NOMBRE/FOLIO rows, added a real photo upload/preview control and tuned the instructional copy typography.
3. Final browser capture confirmed NOMBRE, FOLIO, `Cargar foto`, and the updated monospaced text treatment.

## Primary Interactions Tested

- Hard-refreshed `http://localhost:5175/personal` in Chrome.
- Confirmed the photo slot exposes a file-upload control through the DOM and visible UI.
- Confirmed `Información Personal` nav remains active.
- Ran `npm run build`: passed.
- Ran `npm run test:sites`: passed, 4/4.

## Follow-up Polish

- Optional: persist the uploaded photo across reloads if this should behave like saved student profile data instead of a local preview.

final result: passed
