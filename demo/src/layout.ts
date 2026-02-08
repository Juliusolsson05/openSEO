/**
 * Computed element positions derived from the deterministic layout.
 * Both camera poses and cursor waypoints reference these.
 *
 * All values are in composition space (1920×1080).
 */

/* ── Shared layout constants ── */
const BROWSER_TITLE_BAR = 40;
const SIDEBAR_W = 240;
const TOPBAR_H = 48;
const CONTENT_PAD = 32;

/* ── Login page layout ──
 * BrowserFrame pad=0 → full 1920×1080.
 * Left branding panel: 480px.
 * Right panel: 1440px, flex-centered, padding 32.
 */
const LOGIN_RIGHT_LEFT = 480;
const LOGIN_RIGHT_W = 1920 - LOGIN_RIGHT_LEFT;      // 1440
const LOGIN_RIGHT_PAD = 32;
const LOGIN_FORM_W = 380;
const LOGIN_FORM_CX = LOGIN_RIGHT_LEFT + LOGIN_RIGHT_W / 2;  // 1200

// Vertical centering: right panel inner height = 1040 - 64 = 976px
// Form content total height ≈ 392px (measured from component tree)
const LOGIN_INNER_H = 1080 - BROWSER_TITLE_BAR - LOGIN_RIGHT_PAD * 2; // 1008
const LOGIN_FORM_H = 392;
const LOGIN_FORM_TOP = BROWSER_TITLE_BAR + LOGIN_RIGHT_PAD + (LOGIN_INNER_H - LOGIN_FORM_H) / 2; // ≈ 380

// Cumulative offsets from form top:
//   h2 "Sign in"        : 29px
//   gap                  : 6px
//   p "to continue..."   : 20px
//   gap                  : 24px
//   Demo box             : 75px
//   gap                  : 24px
//   Email label          : 20px
//   Email input (36px)   : center at +18
const EMAIL_Y = LOGIN_FORM_TOP + 29 + 6 + 20 + 24 + 75 + 24 + 20 + 18;  // ≈ 596
//   gap: 18 (rest of input) + 16 + password label 20 + input center 18
const PASSWORD_Y = EMAIL_Y + 18 + 16 + 20 + 18;  // ≈ 668
//   gap: 18 + 16 + button center 18
const BUTTON_Y = PASSWORD_Y + 18 + 16 + 18;  // ≈ 720

export const LOGIN_TARGETS = {
  /** Center of page (full view) */
  center: { x: 1920 / 2, y: 1080 / 2 },
  /** Email input field center */
  email: { x: LOGIN_FORM_CX, y: EMAIL_Y },
  /** Password input field center */
  password: { x: LOGIN_FORM_CX, y: PASSWORD_Y },
  /** Sign In button center */
  signIn: { x: LOGIN_FORM_CX, y: BUTTON_Y },
} as const;


/* ── Titles page layout ──
 * BrowserFrame pad=0 → full 1920×1080.
 * Sidebar 240px + Topbar 48px + Content padding 32px.
 * Content origin: (272, 120).
 */
const CONTENT_X = SIDEBAR_W + CONTENT_PAD;                  // 272
const CONTENT_Y = BROWSER_TITLE_BAR + TOPBAR_H + CONTENT_PAD; // 120
const CONTENT_W = 1920 - SIDEBAR_W - CONTENT_PAD * 2;       // 1616

// Stats cards row: 3-col grid, gap 16, card padding 16, height ~79px
const STATS_H = 79;
const STATS_BOTTOM = CONTENT_Y + STATS_H;                   // 199

// Filter bar: 24px gap below stats, height 32
const FILTER_Y = STATS_BOTTOM + 24;                          // 223
const FILTER_CY = FILTER_Y + 16;                             // 239

// "New Titles" button: right-aligned in filter bar
// Button width ~110px, right edge at CONTENT_X + CONTENT_W = 1888
const NEW_TITLES_BTN_X = CONTENT_X + CONTENT_W - 55;        // 1833
const NEW_TITLES_BTN_Y = FILTER_CY;                          // 239

// Generate form card: 24px gap below filter bar
const FORM_TOP = FILTER_Y + 32 + 24;                         // 279
const FORM_CARD_PAD = 16;

// Inside form card: flex row, alignItems: flex-end
// Label (17px) + margin (4px) + input (36px) = 57px row height
const INPUT_CY = FORM_TOP + FORM_CARD_PAD + 17 + 4 + 18;    // 334

// Topic input: flex:1
// Card inner width = CONTENT_W - 32 (card padding) = 1584
// Gaps: 3 × 12 = 36, Count: 96, GenBtn: ~140, Close: 36
// Topic width: 1584 - 36 - 96 - 140 - 36 = 1276
const TOPIC_LEFT = CONTENT_X + FORM_CARD_PAD;                // 288
const TOPIC_W = 1276;
const TOPIC_CX = TOPIC_LEFT + TOPIC_W / 2;                   // 926
const TOPIC_LEFT_QUARTER_X = TOPIC_LEFT + TOPIC_W / 4;       // 607

// Generate button center
const GEN_BTN_X = TOPIC_LEFT + TOPIC_W + 12 + 96 + 12 + 70; // 1754
const GEN_BTN_Y = INPUT_CY;                                   // 334

// Table: starts after form card (form bottom ≈ 279 + 89 = 368) + 24px gap
const TABLE_TOP = FORM_TOP + FORM_CARD_PAD * 2 + 57 + 24;   // 412
const TABLE_HEADER_H = 38;
const TABLE_ROW_H = 42;

// Center of visible table area (header + ~5 rows)
const TABLE_CX = CONTENT_X + CONTENT_W / 2;                  // 1080
const TABLE_CY = TABLE_TOP + TABLE_HEADER_H + TABLE_ROW_H * 2.5; // ≈ 555

export const TITLES_TARGETS = {
  /** Center of full composition */
  center: { x: 1920 / 2, y: 1080 / 2 },
  /** "New Titles" button center */
  newTitlesBtn: { x: NEW_TITLES_BTN_X, y: NEW_TITLES_BTN_Y },
  /** Topic input center */
  topicInput: { x: TOPIC_CX, y: INPUT_CY },
  /** Topic input left quarter (for left-biased framing) */
  topicInputLeft: { x: TOPIC_LEFT_QUARTER_X, y: INPUT_CY },
  /** "Generate Titles" button center */
  generateBtn: { x: GEN_BTN_X, y: GEN_BTN_Y },
  /** Center of table results area */
  tableCenter: { x: TABLE_CX, y: TABLE_CY },
} as const;
