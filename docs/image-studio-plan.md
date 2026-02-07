# Image Studio — UX/UI Plan

## Problem
The current image element has **~10 buttons** crammed onto the image overlay: Standard Quality, High Quality, Custom Prompt, Title Prompt, Upload, Stock, Magic Prompt toggle, Eye toggle, plus the BaseElement actions (edit, regenerate, enhance, humanize, delete). It's overwhelming and confusing.

## Solution: Image Studio
Replace the cluttered button overlay with a clean, focused **Image Studio** modal that opens when you click on any image (cover or element). All image operations happen inside this single, well-organized interface.

---

## Architecture

### Entry Points
1. **Cover image** — click on cover → opens Image Studio for cover (image_number=1)
2. **Image elements** — click on inline image → opens Image Studio for that element
3. **"Generate All" button** — batch generate in the blog admin menu (unchanged)

### Providers
| Provider | Model | Notes |
|----------|-------|-------|
| **Ideogram** (default) | V_1_TURBO / V_2_TURBO / V_2 | Fast, good for blog imagery. Needs valid API key. |
| **GPT Image** | `gpt-image-1` | OpenAI's native image gen. High quality, great text rendering. |
| **Stock Photos** | Pexels API | Free stock photography |
| **Upload** | — | User's own file |

---

## UI Layout

### Image Element (inline, simplified)
```
┌─────────────────────────────────────┐
│                                     │
│          [Blog Image]               │
│                                     │
│   Click to open Image Studio  ✏️    │
│                                     │
└─────────────────────────────────────┘
```
- Clean image display with subtle hover overlay
- Single click opens Image Studio
- No buttons cluttering the image
- Hover shows small pencil icon + "Edit in Studio"
- BaseElement still wraps it (edit/delete/regenerate from sidebar)

### Image Studio Modal
Full-width modal (max-w-5xl), split into two panels:

```
┌──────────────────────────────────────────────────────┐
│  Image Studio                                     ✕  │
├────────────────────────┬─────────────────────────────┤
│                        │                             │
│                        │  Source:  [Ideogram ▾]      │
│                        │                             │
│   [Current Image       │  Prompt:                    │
│    Preview]            │  ┌─────────────────────┐    │
│                        │  │ A professional...   │    │
│   800 × 400            │  └─────────────────────┘    │
│                        │                             │
│                        │  ☑ Magic Prompt (Ideogram)  │
│                        │                             │
│                        │  Quality: [● Low ○ Med ○ Hi]│
│                        │                             │
│                        │  Size: [16:10 ▾]            │
│                        │                             │
│                        │  [🎨 Generate Image]        │
│                        │                             │
│                        ├─────────────────────────────┤
│                        │  Quick Actions              │
│                        │  [📁 Upload] [📷 Stock]     │
│                        │  [📝 Use Post Title]        │
│                        │  [📝 Use Description]       │
│                        │                             │
├────────────────────────┴─────────────────────────────┤
│  History: [v1] [v2] [v3 ●]            [Apply] [Close]│
└──────────────────────────────────────────────────────┘
```

---

## Detailed Specifications

### Left Panel — Preview
- Shows current image (or placeholder if none)
- Displays resolution info
- When generating: shows skeleton/shimmer animation
- After generation: shows new image with fade-in
- Optional: side-by-side before/after toggle

### Right Panel — Controls

#### Source Selector (dropdown)
- **Ideogram** (default) — shows quality + magic prompt options
- **GPT Image** — shows quality (low/medium/high), size options
- **Stock Photos** — switches right panel to Pexels search grid
- **Upload** — opens file picker immediately

#### Provider-specific options

**Ideogram:**
- Prompt textarea (pre-filled with image description)
- Quality: V1 Turbo (fast) / V2 Turbo (balanced) / V2 (best)
- Magic Prompt toggle
- Aspect ratio: 16:10 (default), 1:1, 16:9, 4:3

**GPT Image (gpt-image-1):**
- Prompt textarea
- Quality: low / medium / high
- Size: 1024×1024 / 1536×1024 / 1024×1536 / auto
- Output format: png / webp / jpeg
- Background: auto / transparent / opaque

**Stock Photos:**
- Search input
- Grid of results (Pexels)
- Click to select → preview appears on left
- Pagination

**Upload:**
- Drag & drop zone or file picker
- Preview before applying

#### Quick Actions
- **Use Post Title** — fills prompt with blog post title
- **Use Description** — fills prompt with current image description
- One-click shortcuts that populate the prompt field

### Bottom Bar
- **History** — thumbnails of previous versions (stored in session)
- **Apply** — saves the selected/generated image to the blog post
- **Close** — closes without saving

---

## Component Structure

```
src/components/blog/
├── ImageStudio/
│   ├── ImageStudio.tsx          # Main modal wrapper
│   ├── ImagePreviewPanel.tsx    # Left panel - image preview
│   ├── ImageControlPanel.tsx    # Right panel - controls
│   ├── providers/
│   │   ├── IdeogramProvider.tsx   # Ideogram-specific controls
│   │   ├── GptImageProvider.tsx   # GPT Image controls
│   │   ├── StockPhotoProvider.tsx # Pexels search (reuse existing)
│   │   └── UploadProvider.tsx     # File upload
│   ├── ImageHistory.tsx         # Bottom history strip
│   └── types.ts                 # Shared types
```

---

## API Changes

### New: GPT Image endpoint
The existing `/api/aurora/blog/images/regenerate/` endpoint gets a new `provider` field:

```typescript
// Request body
{
  post_id: number
  image_number: number
  provider: 'ideogram' | 'gpt-image' | 'stock' | 'upload'  // NEW
  version?: number          // Ideogram quality (1/2/3)
  magic_prompt?: boolean    // Ideogram only
  force_prompt?: string     // Custom prompt override
  gpt_quality?: 'low' | 'medium' | 'high'  // GPT Image only
  gpt_size?: string         // GPT Image only
}
```

### Backend generate-image.ts changes
- Add `generateGptImage()` function using `gpt-image-1` model
- Existing `generateImage()` becomes `generateIdeogramImage()`
- Router picks provider based on request body

---

## Migration Path
1. Build `<ImageStudio>` component
2. Replace `<ImageElement>` inline buttons with click-to-open
3. Add cover image click-to-open on blog post page
4. Add GPT Image provider to backend
5. Keep all existing API endpoints working (backward compat)

---

## Design Tokens
- Modal: `max-w-5xl`, `max-h-[85vh]`
- Left panel: `w-[55%]` with image centered
- Right panel: `w-[45%]` scrollable
- Generate button: primary blue, full width
- Provider tabs: pill-style selector at top of right panel
- History thumbnails: 48×48 rounded, ring on active
