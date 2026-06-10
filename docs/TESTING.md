# Testing

Karektar uses a small two-layer test suite:

- Vitest covers pure TypeScript behavior such as canvas geometry, reducer history,
  and draft serialization.
- Playwright covers the editor as a real browser experience, including pointer
  events, screenshots, downloads, and canvas pixel inspection.

## Commands

```sh
npm run test
npm run test:e2e
npm run test:e2e:ui
npm run test:all
```

`npm run test:e2e` starts the Vite dev server automatically. Playwright writes
failure artifacts to `test-results/` and the HTML report to `playwright-report/`;
both are ignored by git.

## Agent Notes

Use `tests/e2e/helpers/canvas.ts` when writing editor tests. It contains helpers
for locating the editor canvas, converting grid cells to pointer coordinates,
drawing cells, dragging shapes, and sampling rendered canvas pixels.

Prefer semantic selectors or `data-testid` over CSS module class names. The
current stable test IDs cover the editor canvas, model canvas, active glyph,
toolbar controls, glyph gallery, account status, and primary editor buttons.

The first pass intentionally avoids committed screenshot baselines. Screenshots,
traces, and videos are debugging artifacts for feature development and agent
inspection, not visual approval fixtures.
