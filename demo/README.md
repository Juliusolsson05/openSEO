# Aurora Demo Video

Cinematic product showcase built with [Remotion](https://remotion.dev).

## Setup

```bash
cd demo
npm install
```

## Development

Preview in Remotion Studio:

```bash
npm run studio
```

## Render

```bash
npm run render
```

Output: `out/aurora-demo.mp4`

## Structure

- `src/Video.tsx` — Main composition (sequence of scenes)
- `src/scenes/` — One component per scene
- `src/components/` — Reusable: CameraMove, TextOverlay, BrowserFrame
- `src/ui/` — Mock UI components (sidebar, cards, inputs, elements)
- `src/data/` — Editable JSON data for each scene

## Adding a Scene

1. Create `src/scenes/MyScene.tsx`
2. Add duration to `DURATIONS` in `src/constants.ts`
3. Add `scene()` call in `src/Video.tsx`
