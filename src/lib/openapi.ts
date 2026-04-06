/**
 * OpenAPI 3.1 specification for Aurora / OpenSEO.
 *
 * This is the single source of truth for API documentation.
 * The spec is served at /api/docs/openapi.json and rendered by Scalar.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * OpenAPI types are intentionally `any`-typed — the openapi-types package
 * is too strict for practical spec authoring (no nullable, $ref issues).
 * The spec is validated at runtime by Scalar; TS safety is not useful here.
 */
type Schema = any
type Param = any
type Response = any

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Session token from /api/auth/login',
}

const apiKeyAuth = {
  type: 'apiKey',
  in: 'header',
  name: 'x-api-key',
  description: 'Publishing API key (for inbound webhook endpoints)',
}

const successEnvelope = (dataSchema: Schema): Schema => ({
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: dataSchema,
    meta: { $ref: '#/components/schemas/ApiMeta' },
  },
})

const errorEnvelope: Schema = {
  type: 'object',
  required: ['success', 'error'],
  properties: {
    success: { type: 'boolean', enum: [false] },
    detail: { type: 'string' },
    message: { type: 'string' },
    error: {
      type: 'object',
      required: ['status', 'detail'],
      properties: {
        status: { type: 'integer' },
        detail: { type: 'string' },
        code: { type: 'string' },
        type: { type: 'string' },
        title: { type: 'string' },
        requestId: { type: 'string' },
        details: {},
      },
    },
  },
}

const paginationSchema: Schema = {
  type: 'object',
  properties: {
    total: { type: 'integer' },
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    totalPages: { type: 'integer' },
    hasNextPage: { type: 'boolean' },
    hasPreviousPage: { type: 'boolean' },
  },
}

/* ------------------------------------------------------------------ */
/*  Shared parameter definitions                                       */
/* ------------------------------------------------------------------ */

const pageParam: Param = {
  name: 'page',
  in: 'query',
  schema: { type: 'integer', default: 1, minimum: 1 },
  description: 'Page number (1-indexed)',
}

const pageSizeParam: Param = {
  name: 'pageSize',
  in: 'query',
  schema: { type: 'integer', default: 50, minimum: 1, maximum: 200 },
  description: 'Items per page',
}

const searchParam: Param = {
  name: 'search',
  in: 'query',
  schema: { type: 'string' },
  description: 'Full-text search query',
}

/* ------------------------------------------------------------------ */
/*  Response helpers                                                   */
/* ------------------------------------------------------------------ */

function jsonResponse(schema: Schema, description = 'Successful response'): Response {
  return {
    description,
    content: { 'application/json': { schema } },
  }
}

const ref401: Response = { description: 'Unauthorized — missing or expired token' }
const ref403: Response = { description: 'Forbidden — insufficient permissions' }
const ref404: Response = { description: 'Not found' }
const ref422: Response = { description: 'Validation error', content: { 'application/json': { schema: errorEnvelope } } }
const ref500: Response = { description: 'Internal server error', content: { 'application/json': { schema: errorEnvelope } } }

/* ------------------------------------------------------------------ */
/*  THE SPEC                                                           */
/* ------------------------------------------------------------------ */

export const spec: Record<string, unknown> = {
  openapi: '3.1.0',
  info: {
    title: 'OpenSEO API',
    version: '1.0.0',
    description: `
**OpenSEO** is an AI-powered SEO content platform for generating, managing, and publishing blog posts, dictionaries, and brand content.

## Authentication
Most endpoints require a Bearer token obtained via \`POST /api/auth/login\`.
Publishing inbound webhooks use API key authentication (\`x-api-key\` header).

## Response Format
**v1 endpoints** return a standard envelope:
\`\`\`json
{ "success": true, "data": { ... }, "meta": { "timestamp": "..." } }
\`\`\`

**Legacy aurora endpoints** return raw JSON (migration in progress).

## Common Headers
| Header | Description |
|--------|-------------|
| \`x-request-id\` | Unique request identifier (returned on every response) |
| \`deprecation\` | Present on legacy \`/api/aurora/*\` routes |
`,
    contact: { name: 'OpenSEO', url: 'https://openseo.ai' },
  },

  servers: [
    { url: '/api', description: 'Current environment' },
  ],

  tags: [
    { name: 'Auth', description: 'Authentication & session management' },
    { name: 'Blog Titles', description: 'Title CRUD, generation, and categories' },
    { name: 'Blog Posts', description: 'Post CRUD, generation, elements, and export' },
    { name: 'Blog Elements', description: 'Content element manipulation' },
    { name: 'Blog Images', description: 'Image generation, search, and upload' },
    { name: 'Blog CTA', description: 'Call-to-action management' },
    { name: 'Blog Schedule', description: 'Bulk schedules and scheduling' },
    { name: 'Blog Analytics', description: 'Blog post analytics and metrics' },
    { name: 'Dictionary', description: 'Dictionary and word management' },
    { name: 'Dictionary Generation', description: 'AI keyword and definition generation' },
    { name: 'Dictionary Analytics', description: 'Dictionary analytics' },
    { name: 'Quillo', description: 'AI analysis, chat, and autopilot' },
    { name: 'Company', description: 'Company profile and settings' },
    { name: 'Publishing', description: 'API keys, sync jobs, and inbound webhooks' },
    { name: 'Settings', description: 'Application settings' },
    { name: 'Search', description: 'Global search' },
    { name: 'Admin', description: 'Platform administration (admin-only)' },
    { name: 'Health', description: 'Health checks' },
    { name: 'E-commerce', description: 'Product import and recommendations' },
    { name: 'Example Site', description: 'Public example/demo site endpoints' },
  ],

  security: [{ bearerAuth: [] }],

  components: {
    securitySchemes: { bearerAuth, apiKeyAuth },
    schemas: {
      ApiMeta: {
        type: 'object',
        properties: {
          requestId: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: errorEnvelope,
      Title: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title_text: { type: 'string' },
          seo_title: { type: 'string', nullable: true },
          slug: { type: 'string', nullable: true },
          focus_keyword: { type: 'string', nullable: true },
          status: { type: 'integer', description: '1=TO_BE_GENERATED, 2=GENERATED, 3=APPROVED, 4=REJECTED, 5=PUBLISHED' },
          postId: { type: 'integer', nullable: true },
          post_linking: { type: 'array', items: { type: 'integer' }, description: 'IDs of linked titles' },
          dateCreated: { type: 'string', format: 'date-time' },
          generatedDate: { type: 'string', format: 'date-time', nullable: true },
          scheduledDate: { type: 'string', format: 'date-time', nullable: true },
          categories: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
          company: { type: 'integer' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
        },
      },
      BlogPost: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          seo_title: { type: 'string', nullable: true },
          slug: { type: 'string' },
          meta_description: { type: 'string', nullable: true },
          focus_keyword: { type: 'string', nullable: true },
          keywords: { type: 'array', items: { type: 'string' } },
          status: { type: 'string' },
          image_url: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ContentElement: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          element_type: { type: 'string', description: 'e.g. heading, paragraph, list, image, faq, code, table, quote, cta, custom_html, pros_cons, statistics, timeline' },
          order_index: { type: 'integer' },
          heading: { type: 'string', nullable: true },
          content: { type: 'string', nullable: true },
          metadata: { type: 'object', nullable: true },
        },
      },
      Dictionary: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          subject: { type: 'string' },
          language: { type: 'string' },
          num_words: { type: 'integer' },
          total_words: { type: 'integer', description: 'num_words × 26' },
          in_progress: { type: 'boolean' },
          current_letter: { type: 'string' },
          status: { type: 'string' },
        },
      },
      Word: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          letter: { type: 'string' },
          keyword: { type: 'string' },
          description: { type: 'string', nullable: true },
          priority: { type: 'integer', description: '1=HIGH, 2=LOW' },
          focus_keyword: { type: 'string', nullable: true },
          definition: { type: 'object', nullable: true },
        },
      },
      BulkSchedule: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          start_date: { type: 'string', format: 'date-time', nullable: true },
          interval_days: { type: 'integer', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          companyId: { type: 'integer', nullable: true },
        },
      },
      PublishingApiKey: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          prefix: { type: 'string', description: 'First 8 chars of the key' },
          created_at: { type: 'string', format: 'date-time' },
          last_used_at: { type: 'string', format: 'date-time', nullable: true },
          revoked: { type: 'boolean' },
        },
      },
      SyncJob: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['accepted', 'running', 'completed', 'failed'] },
          progress: { type: 'number' },
          result: { type: 'object', nullable: true },
          error: { type: 'string', nullable: true },
        },
      },
      CompanyProfile: {
        type: 'object',
        properties: {
          website_url: { type: 'string', nullable: true },
          name: { type: 'string', nullable: true },
          business_type: { type: 'string', nullable: true },
          language: { type: 'string', nullable: true },
          keywords: { type: 'array', items: { type: 'string' } },
          profile: { type: 'object', nullable: true, description: 'Structured company profile (industry, tone, target audience, etc.)' },
        },
      },
      SettingsDomain: {
        type: 'object',
        properties: {
          domain: { type: 'string' },
          values: { type: 'object' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          type: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          read: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CTA: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          campaignId: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string', description: 'Image URL' },
          link: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CTACampaign: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          companyId: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          ctas: { type: 'array', items: { $ref: '#/components/schemas/CTA' } },
        },
      },
    },
    parameters: {
      page: pageParam,
      pageSize: pageSizeParam,
      search: searchParam,
    },
    responses: {
      '401': ref401,
      '403': ref403,
      '404': ref404,
      '422': ref422,
      '500': ref500,
    },
  },

  paths: {
    /* ======================== HEALTH ======================== */
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        security: [],
        operationId: 'healthCheck',
        responses: {
          '200': jsonResponse({ type: 'object', properties: { status: { type: 'string', enum: ['ok'] } } }),
        },
      },
    },

    /* ======================== AUTH ======================== */
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        description: 'Returns user info and sets session cookies (`authjs.session-token`, `access`). No token is returned in the response body.',
        security: [],
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': jsonResponse({
            type: 'object',
            required: ['user'],
            properties: {
              user: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  username: { type: 'string' },
                  user_type: { type: 'integer', description: '1=DEMO, 2=CLIENT, 3=AGENCY, 4=ADMINISTRATOR' },
                  abilityRules: { type: 'array', items: { type: 'string' } },
                  company: { type: 'object', nullable: true, properties: { id: { type: 'integer' }, name: { type: 'string' }, language: { type: 'string' } } },
                },
              },
            },
          }, 'Login successful — session cookie set'),
          '400': jsonResponse({ type: 'object', properties: { detail: { type: 'string' } } }, 'Missing email or password'),
          '401': ref401,
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        security: [],
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': jsonResponse({ type: 'object', properties: { user: { type: 'object' } } }),
          '422': ref422,
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user session',
        operationId: 'getMe',
        responses: {
          '200': jsonResponse({
            type: 'object',
            required: ['user'],
            properties: {
              user: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  username: { type: 'string' },
                  user_type: { type: 'integer' },
                  abilityRules: { type: 'array', items: { type: 'string' } },
                  company: { type: 'object', nullable: true, properties: { id: { type: 'integer' }, name: { type: 'string' } } },
                },
              },
            },
          }),
          '401': ref401,
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh session token',
        description: 'Validates the current session cookie is still valid. Returns `{ ok: true }` on success.',
        security: [],
        operationId: 'refreshToken',
        responses: {
          '200': jsonResponse({ type: 'object', properties: { ok: { type: 'boolean', enum: [true] } } }),
          '401': ref401,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and invalidate session',
        description: 'Clears all session cookies.',
        security: [],
        operationId: 'logout',
        responses: {
          '200': jsonResponse({ type: 'object', properties: { ok: { type: 'boolean', enum: [true] } } }),
        },
      },
    },
    '/auth/csrf': {
      get: {
        tags: ['Auth'],
        summary: 'Get CSRF token',
        security: [],
        operationId: 'getCsrf',
        responses: {
          '200': jsonResponse({ type: 'object', properties: { csrfToken: { type: 'string' } } }),
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset email',
        security: [],
        operationId: 'forgotPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': jsonResponse({ type: 'object', properties: { ok: { type: 'boolean' }, status: { type: 'string' } } }, 'Reset email sent if account exists'),
        },
      },
    },

    /* ======================== BLOG TITLES ======================== */
    '/aurora/blog/titles': {
      get: {
        tags: ['Blog Titles'],
        summary: 'List titles',
        operationId: 'listTitles',
        parameters: [
          pageParam,
          pageSizeParam,
          searchParam,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TO_BE_GENERATED', 'GENERATED', 'APPROVED', 'REJECTED', 'PUBLISHED'] } },
          { name: 'category_ids', in: 'query', schema: { type: 'string' }, description: 'Comma-separated category IDs' },
        ],
        responses: {
          '200': jsonResponse({
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/Title' } },
              total: { type: 'integer' },
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
            },
          }),
        },
      },
    },
    '/aurora/blog/titles/create': {
      post: {
        tags: ['Blog Titles'],
        summary: 'Create a title manually',
        operationId: 'createTitle',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['title_text'], properties: { title_text: { type: 'string' }, focus_keyword: { type: 'string' }, seo_title: { type: 'string' } } },
            },
          },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/Title' }) },
      },
    },
    '/aurora/blog/titles/generate': {
      post: {
        tags: ['Blog Titles'],
        summary: 'Generate titles with AI',
        operationId: 'generateTitles',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  topic: { type: 'string' },
                  count: { type: 'integer', default: 5, minimum: 1, maximum: 20 },
                  focus_keywords: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/Title' } }) },
      },
    },
    '/aurora/blog/titles/update/{id}': {
      put: {
        tags: ['Blog Titles'],
        summary: 'Update a title',
        operationId: 'updateTitle',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { title_text: { type: 'string' }, seo_title: { type: 'string' }, focus_keyword: { type: 'string' }, status: { type: 'string' } } } } },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/Title' }) },
      },
    },
    '/aurora/blog/titles/delete/{id}': {
      delete: {
        tags: ['Blog Titles'],
        summary: 'Delete a title',
        operationId: 'deleteTitle',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) },
      },
    },
    '/aurora/blog/titles/regenerate/{id}': {
      post: {
        tags: ['Blog Titles'],
        summary: 'Regenerate a title with AI',
        operationId: 'regenerateTitle',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/Title' }) },
      },
    },

    /* ======================== TITLE CATEGORIES ======================== */
    '/aurora/blog/titles/categories': {
      get: {
        tags: ['Blog Titles'],
        summary: 'List title categories',
        operationId: 'listTitleCategories',
        responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/Category' } }) },
      },
    },
    '/aurora/blog/titles/categories/add': {
      post: {
        tags: ['Blog Titles'],
        summary: 'Create a title category',
        operationId: 'createTitleCategory',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } } } },
        },
        responses: { '201': jsonResponse({ $ref: '#/components/schemas/Category' }) },
      },
    },
    '/aurora/blog/titles/categories/edit/{id}': {
      put: {
        tags: ['Blog Titles'],
        summary: 'Update a title category',
        operationId: 'updateTitleCategory',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } } } },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/Category' }) },
      },
    },
    '/aurora/blog/titles/categories/delete/{id}': {
      delete: {
        tags: ['Blog Titles'],
        summary: 'Delete a title category',
        operationId: 'deleteTitleCategory',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) },
      },
    },
    '/aurora/blog/titles/categories/generate': {
      post: {
        tags: ['Blog Titles'],
        summary: 'Auto-generate categories with AI',
        operationId: 'generateTitleCategories',
        responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/Category' } }) },
      },
    },
    '/aurora/blog/titles/categories/categorize': {
      post: {
        tags: ['Blog Titles'],
        summary: 'Auto-categorize titles into categories',
        operationId: 'categorizeTitles',
        responses: { '200': jsonResponse({ type: 'object', properties: { categorized: { type: 'integer' } } }) },
      },
    },
    '/aurora/blog/titles/categories/{id}': {
      put: {
        tags: ['Blog Titles'],
        summary: 'Update a title category by ID',
        operationId: 'updateTitleCategoryById',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } } } },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/Category' }) },
      },
      delete: {
        tags: ['Blog Titles'],
        summary: 'Delete a title category by ID',
        operationId: 'deleteTitleCategoryById',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) },
      },
    },
    '/aurora/blog/titles/categories/bulk-delete': {
      post: {
        tags: ['Blog Titles'],
        summary: 'Bulk delete title categories',
        operationId: 'bulkDeleteTitleCategories',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['ids'], properties: { ids: { type: 'array', items: { type: 'integer' } } } } } },
        },
        responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'integer' } } }) },
      },
    },

    /* ======================== BLOG POSTS ======================== */
    '/aurora/blog/posts': {
      get: {
        tags: ['Blog Posts'],
        summary: 'List blog posts',
        description: 'When `post_id` query param is provided, returns that single post. Otherwise returns paginated list with Django-style next/previous URLs.',
        operationId: 'listBlogPosts',
        parameters: [
          pageParam,
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }, description: 'Items per page (alias for pageSize)' },
          searchParam,
          { name: 'post_id', in: 'query', schema: { type: 'integer' }, description: 'If provided, returns a single post by ID' },
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by publish status (or "all")' },
          { name: 'category_ids', in: 'query', schema: { type: 'string' }, description: 'Comma-separated category IDs' },
        ],
        responses: {
          '200': jsonResponse({
            type: 'object',
            properties: {
              result: { type: 'integer', description: 'Total matching posts' },
              next: { type: 'string', nullable: true, description: 'URL for next page' },
              previous: { type: 'string', nullable: true, description: 'URL for previous page' },
              data: { type: 'array', items: { $ref: '#/components/schemas/BlogPost' } },
            },
          }),
        },
      },
    },
    '/aurora/blog/posts/generate': {
      post: {
        tags: ['Blog Posts'],
        summary: 'Generate a blog post from a title',
        operationId: 'generateBlogPost',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['title_id'], properties: { title_id: { type: 'integer' }, model: { type: 'string' } } },
            },
          },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/BlogPost' }) },
      },
    },
    '/aurora/blog/posts/regenerate': {
      post: {
        tags: ['Blog Posts'],
        summary: 'Regenerate an entire blog post',
        operationId: 'regenerateBlogPost',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' } } } } },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/BlogPost' }) },
      },
    },
    '/aurora/blog/posts/{postId}/elements': {
      get: {
        tags: ['Blog Elements'],
        summary: 'Get elements for a blog post',
        operationId: 'getBlogPostElements',
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/ContentElement' } }) },
      },
      post: {
        tags: ['Blog Elements'],
        summary: 'Add an element to a blog post',
        operationId: 'addBlogPostElement',
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['element_type'], properties: { element_type: { type: 'string' }, content: { type: 'string' }, heading: { type: 'string' }, order_index: { type: 'integer' } } } } },
        },
        responses: { '201': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) },
      },
    },
    '/aurora/blog/posts/update/{id}': {
      put: {
        tags: ['Blog Posts'],
        summary: 'Update a blog post',
        operationId: 'updateBlogPost',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, seo_title: { type: 'string' }, meta_description: { type: 'string' }, focus_keyword: { type: 'string' }, keywords: { type: 'array', items: { type: 'string' } } } } } },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/BlogPost' }) },
      },
    },
    '/aurora/blog/posts/update': {
      put: {
        tags: ['Blog Posts'],
        summary: 'Update a blog post (ID in body)',
        operationId: 'updateBlogPostByBody',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer' }, title: { type: 'string' }, seo_title: { type: 'string' }, meta_description: { type: 'string' }, focus_keyword: { type: 'string' }, keywords: { type: 'array', items: { type: 'string' } } } } } },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/BlogPost' }) },
      },
    },
    '/aurora/blog/posts/update_meta': {
      patch: {
        tags: ['Blog Posts'],
        summary: 'Update blog post metadata',
        operationId: 'updateBlogPostMeta',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' }, seo_title: { type: 'string' }, meta_description: { type: 'string' }, focus_keyword: { type: 'string' }, slug: { type: 'string' } } } } },
        },
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/posts/delete/{id}': {
      delete: {
        tags: ['Blog Posts'],
        summary: 'Delete a blog post',
        operationId: 'deleteBlogPost',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, deleted_post_id: { type: 'integer' } } }) },
      },
    },
    '/aurora/blog/posts/share': {
      post: {
        tags: ['Blog Posts'],
        summary: 'Generate a shareable link for a post',
        operationId: 'shareBlogPost',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/share': {
      get: {
        tags: ['Blog Posts'],
        summary: 'Get share link status for a post',
        operationId: 'getShareStatus',
        parameters: [{ name: 'post_id', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': jsonResponse({ type: 'object', properties: { share_enabled: { type: 'boolean' }, share_token: { type: 'string', nullable: true }, share_url: { type: 'string', nullable: true }, share_expires_at: { type: 'string', format: 'date-time', nullable: true } } }),
        },
      },
      post: {
        tags: ['Blog Posts'],
        summary: 'Create/enable a shareable link for a post',
        operationId: 'createShareLink',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { share_token: { type: 'string' }, share_url: { type: 'string' } } }) },
      },
      delete: {
        tags: ['Blog Posts'],
        summary: 'Disable share link for a post',
        operationId: 'disableShareLink',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { success: { type: 'boolean' } } }) },
      },
    },
    '/aurora/blog/posts/history': {
      get: {
        tags: ['Blog Posts'],
        summary: 'Get post revision history',
        operationId: 'getBlogPostHistory',
        parameters: [{ name: 'post_id', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'array', items: { type: 'object' } }) },
      },
    },
    '/aurora/blog/posts/history/revision': {
      get: {
        tags: ['Blog Posts'],
        summary: 'Get a specific revision',
        operationId: 'getBlogPostRevision',
        parameters: [
          { name: 'post_id', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'history_id', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/posts/sync/keywords': {
      post: {
        tags: ['Blog Posts'],
        summary: 'Sync focus keywords for a post',
        operationId: 'syncKeywords',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['dictionary_id'], properties: { dictionary_id: { type: 'integer' }, post_id: { type: 'integer', description: 'Optional — sync a single post; omit to sync all' } } } } } },
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/posts/sync/recommended': {
      post: {
        tags: ['Blog Posts'],
        summary: 'Sync recommended/related posts',
        operationId: 'syncRecommended',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/posts/export': {
      post: { tags: ['Blog Posts'], summary: 'Export a single post', operationId: 'exportBlogPost', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/posts/export/all': {
      post: { tags: ['Blog Posts'], summary: 'Export all posts', operationId: 'exportAllBlogPosts', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/posts/export/third-party': {
      post: { tags: ['Blog Posts'], summary: 'Export post to third-party platform', operationId: 'exportBlogPostThirdParty', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/posts/export/third-party/all': {
      post: { tags: ['Blog Posts'], summary: 'Export all posts to third-party platform', operationId: 'exportAllBlogPostsThirdParty', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/posts/upload': {
      post: { tags: ['Blog Posts'], summary: 'Upload/publish a single post', operationId: 'uploadBlogPost', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/posts/upload/all': {
      post: { tags: ['Blog Posts'], summary: 'Upload/publish all posts', operationId: 'uploadAllBlogPosts', responses: { '200': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== BLOG ELEMENTS ======================== */
    '/aurora/blog/elements/{elementId}': {
      put: {
        tags: ['Blog Elements'],
        summary: 'Update a content element',
        operationId: 'updateElement',
        parameters: [{ name: 'elementId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { content: { type: 'string' }, heading: { type: 'string' }, metadata: { type: 'object' } } } } } },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) },
      },
      delete: {
        tags: ['Blog Elements'],
        summary: 'Delete a content element',
        operationId: 'deleteElement',
        parameters: [{ name: 'elementId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) },
      },
    },
    '/aurora/blog/posts/elements/enhance': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Enhance element with AI',
        operationId: 'enhanceElement',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'blog_element_id'], properties: { blog_post_id: { type: 'integer' }, blog_element_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, enhanced_element: { type: 'string', description: 'The enhanced HTML content' } } }) },
      },
    },
    '/aurora/blog/posts/elements/enhance-readability': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Enhance element readability',
        operationId: 'enhanceReadability',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'blog_element_id'], properties: { blog_post_id: { type: 'integer' }, blog_element_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, enhanced_element: { type: 'string' } } }) },
      },
    },
    '/aurora/blog/posts/elements/humanize': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Humanize AI-generated element',
        operationId: 'humanizeElement',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'blog_element_id'], properties: { blog_post_id: { type: 'integer' }, blog_element_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { id: { type: 'integer' }, element_type: { type: 'string' }, order: { type: 'integer' }, content: { type: 'string' }, created_at: { type: 'string', format: 'date-time' } } }) },
      },
    },
    '/aurora/blog/posts/elements/regenerate': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Regenerate element with AI',
        operationId: 'regenerateElement',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'blog_element_id'], properties: { blog_post_id: { type: 'integer' }, blog_element_id: { type: 'integer' }, regeneration_note: { type: 'string' }, new_element_type: { type: 'string' }, new_element_count: { type: 'integer', default: 1 } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, regenerated_elements: { type: 'array', items: { $ref: '#/components/schemas/ContentElement' } } } }) },
      },
    },
    '/aurora/blog/posts/elements/add': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Add a generated element to a post',
        operationId: 'addElement',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'element_id', 'element_type'], properties: { blog_post_id: { type: 'integer' }, element_id: { type: 'integer', description: 'Reference element ID (for ordering)' }, element_type: { type: 'string' }, generation_note: { type: 'string' } } } } } },
        responses: { '201': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) },
      },
    },
    '/aurora/blog/posts/elements/add-cta': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Add CTA element to a post',
        operationId: 'addCtaElement',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'element_id', 'cta_id'], properties: { blog_post_id: { type: 'integer' }, element_id: { type: 'integer' }, cta_id: { type: 'integer' } } } } } },
        responses: { '201': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) },
      },
    },
    '/aurora/blog/posts/elements/template/create': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Create element template',
        operationId: 'createTemplate',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'element_type', 'structure'], properties: { name: { type: 'string' }, element_type: { type: 'string' }, structure: { type: 'object' } } } } } },
        responses: { '201': jsonResponse({ type: 'object', properties: { message: { type: 'string' }, template: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, element_type: { type: 'string' }, structure: { type: 'object' } } } } }) },
      },
    },
    '/aurora/blog/posts/elements/template/use': {
      post: {
        tags: ['Blog Elements'],
        summary: 'Apply element template to post',
        operationId: 'useTemplate',
        parameters: [
          { name: 'element_id', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'template_id', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': jsonResponse({ type: 'object', properties: { detail: { type: 'string' }, updated_element: { type: 'object', properties: { id: { type: 'integer' }, element_type: { type: 'string' }, content: { type: 'string' }, hyperlink: { type: 'string', nullable: true } } } } }) },
      },
    },
    '/aurora/blog/posts/elements/get/code-clusters': {
      get: { tags: ['Blog Elements'], summary: 'Get code cluster suggestions', operationId: 'getCodeClusters', responses: { '200': jsonResponse({ type: 'array', items: { type: 'object' } }) } },
    },
    '/aurora/blog/posts/update-element/{id}': {
      put: { tags: ['Blog Elements'], summary: 'Update element by ID', operationId: 'updateElementById', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) } },
    },
    '/aurora/blog/posts/delete-element': {
      delete: { tags: ['Blog Elements'], summary: 'Delete element from post', operationId: 'deleteElementFromPost', responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },

    /* ======================== BLOG IMAGES ======================== */
    '/aurora/blog/images/generate': {
      post: { tags: ['Blog Images'], summary: 'Generate image with AI', operationId: 'generateImage', responses: { '200': jsonResponse({ type: 'object', properties: { url: { type: 'string' } } }) } },
    },
    '/aurora/blog/images/regenerate': {
      post: { tags: ['Blog Images'], summary: 'Regenerate post image', operationId: 'regenerateImage', responses: { '200': jsonResponse({ type: 'object', properties: { url: { type: 'string' } } }) } },
    },
    '/aurora/blog/images/upload': {
      post: { tags: ['Blog Images'], summary: 'Upload custom image', operationId: 'uploadImage', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { '200': jsonResponse({ type: 'object', properties: { url: { type: 'string' } } }) } },
    },
    '/aurora/blog/images/save/edit': {
      post: { tags: ['Blog Images'], summary: 'Save edited image', operationId: 'saveEditedImage', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/images/stock_photos/search': {
      get: { tags: ['Blog Images'], summary: 'Search stock photos (Pexels)', operationId: 'searchStockPhotos', parameters: [{ name: 'query', in: 'query', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ type: 'array', items: { type: 'object' } }) } },
    },
    '/aurora/blog/images/stock_photos/use': {
      post: { tags: ['Blog Images'], summary: 'Use stock photo for post', operationId: 'useStockPhoto', responses: { '200': jsonResponse({ type: 'object', properties: { url: { type: 'string' } } }) } },
    },
    '/aurora/blog/images/apply': {
      post: {
        tags: ['Blog Images'],
        summary: 'Apply an image to a blog post',
        operationId: 'applyImage',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['image_url', 'image_number'],
                properties: {
                  post_id: { type: 'integer', description: 'Post ID (or use blog_post_id)' },
                  blog_post_id: { type: 'integer', description: 'Post ID (alias for post_id)' },
                  image_number: { type: 'integer', minimum: 0 },
                  image_url: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/linkedin/convert': {
      get: {
        tags: ['Blog Posts'],
        summary: 'Convert blog post to LinkedIn format',
        operationId: 'linkedinConvert',
        parameters: [{ name: 'blog_post_id', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'object', properties: { json: { type: 'object' }, html: { type: 'string' } } }) },
      },
    },
    '/aurora/blog/focus-keywords': {
      get: { tags: ['Blog Posts'], summary: 'List all focus keywords', operationId: 'listFocusKeywords', responses: { '200': jsonResponse({ type: 'array', items: { type: 'string' } }) } },
    },

    /* ======================== BLOG CTA ======================== */
    '/aurora/blog/cta/list': {
      get: {
        tags: ['Blog CTA'],
        summary: 'List CTA campaigns with nested CTAs',
        description: 'Returns campaigns (not individual CTAs). Each campaign includes its CTAs array.',
        operationId: 'listCtas',
        responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/CTACampaign' } }) },
      },
    },
    '/aurora/blog/cta/create': {
      post: {
        tags: ['Blog CTA'],
        summary: 'Create a CTA',
        description: 'Accepts JSON or multipart/form-data (for image upload).',
        operationId: 'createCta',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['campaignId', 'title', 'description', 'link'], properties: { campaignId: { type: 'integer' }, title: { type: 'string' }, description: { type: 'string' }, link: { type: 'string' }, image: { type: 'string', description: 'Image URL (if not uploading)' }, generateImage: { type: 'boolean', description: 'Auto-generate image with AI' } } },
            },
            'multipart/form-data': {
              schema: { type: 'object', properties: { campaign_id: { type: 'integer' }, title: { type: 'string' }, description: { type: 'string' }, link: { type: 'string' }, image: { type: 'string', format: 'binary' }, generate_image: { type: 'string' } } },
            },
          },
        },
        responses: { '201': jsonResponse({ $ref: '#/components/schemas/CTA' }) },
      },
    },
    '/aurora/blog/cta/edit/{id}': {
      put: {
        tags: ['Blog CTA'],
        summary: 'Update a CTA',
        operationId: 'updateCta',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, link: { type: 'string' }, campaignId: { type: 'integer' }, image: { type: 'string' }, generateImage: { type: 'boolean' } } },
            },
          },
        },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/CTA' }) },
      },
    },
    '/aurora/blog/cta/delete/{id}': {
      delete: { tags: ['Blog CTA'], summary: 'Delete a CTA', operationId: 'deleteCta', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },
    '/aurora/blog/cta/add-cta': {
      post: {
        tags: ['Blog CTA'],
        summary: 'Add CTA to post as an element',
        operationId: 'addCtaToPost',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'element_id', 'cta_id'], properties: { blog_post_id: { type: 'integer' }, element_id: { type: 'integer', description: 'Reference element (CTA inserted after it)' }, cta_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) },
      },
    },
    '/aurora/blog/cta/campaign/create': {
      post: {
        tags: ['Blog CTA'],
        summary: 'Create CTA campaign',
        operationId: 'createCtaCampaign',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } } } },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/CTACampaign' }) },
      },
    },
    '/aurora/blog/cta/campaign/edit/{id}': {
      put: {
        tags: ['Blog CTA'],
        summary: 'Update CTA campaign',
        operationId: 'updateCtaCampaign',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/CTACampaign' }) },
      },
    },
    '/aurora/blog/cta/campaign/delete/{id}': {
      delete: { tags: ['Blog CTA'], summary: 'Delete CTA campaign', operationId: 'deleteCtaCampaign', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },

    /* ======================== BLOG SCHEDULE ======================== */
    '/aurora/blog/schedule/bulk': {
      get: {
        tags: ['Blog Schedule'],
        summary: 'List bulk schedules',
        operationId: 'listBulkSchedules',
        responses: {
          '200': jsonResponse({
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                start_date: { type: 'string', format: 'date-time', nullable: true },
                interval_days: { type: 'integer', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                companyId: { type: 'integer', nullable: true },
                _count: { type: 'object', properties: { titles: { type: 'integer' }, blog_posts: { type: 'integer' } } },
              },
            },
          }),
        },
      },
      post: {
        tags: ['Blog Schedule'],
        summary: 'Create bulk schedule',
        operationId: 'createBulkScheduleDefault',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, intervalDays: { type: 'integer' } } } } } },
        responses: { '201': jsonResponse({ $ref: '#/components/schemas/BulkSchedule' }) },
      },
    },
    '/aurora/blog/schedule/bulk/create': {
      post: {
        tags: ['Blog Schedule'],
        summary: 'Create a bulk schedule',
        operationId: 'createBulkSchedule',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, intervalDays: { type: 'integer' } } } } } },
        responses: { '201': jsonResponse({ $ref: '#/components/schemas/BulkSchedule' }) },
      },
    },
    '/aurora/blog/schedule/bulk/assign': {
      post: {
        tags: ['Blog Schedule'],
        summary: 'Assign titles to a schedule',
        operationId: 'assignToSchedule',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['titleIds', 'bulkScheduleId'], properties: { titleIds: { type: 'array', items: { type: 'integer' } }, bulkScheduleId: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { count: { type: 'integer', description: 'Number of titles updated' } } }) },
      },
    },
    '/aurora/blog/schedule/bulk/remove': {
      post: {
        tags: ['Blog Schedule'],
        summary: 'Remove titles from schedule',
        operationId: 'removeFromSchedule',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['titleIds'], properties: { titleIds: { type: 'array', items: { type: 'integer' } } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { count: { type: 'integer' } } }) },
      },
    },
    '/aurora/blog/schedule/bulk/update/{id}': {
      put: {
        tags: ['Blog Schedule'],
        summary: 'Update a bulk schedule',
        operationId: 'updateBulkSchedule',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, startDate: { type: 'string', format: 'date-time', nullable: true }, intervalDays: { type: 'integer', nullable: true } } } } } },
        responses: { '200': jsonResponse({ $ref: '#/components/schemas/BulkSchedule' }) },
      },
    },
    '/aurora/blog/schedule/interval': {
      post: {
        tags: ['Blog Schedule'],
        summary: 'Schedule titles by interval',
        operationId: 'scheduleByInterval',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['titleIds', 'startDate', 'intervalDays'], properties: { titleIds: { type: 'array', items: { type: 'integer' } }, startDate: { type: 'string', format: 'date-time' }, intervalDays: { type: 'integer', minimum: 1 } } } } } },
        responses: { '200': jsonResponse({ type: 'array', items: { type: 'object', description: 'Updated title objects' } }) },
      },
    },
    '/aurora/blog/schedule/post/{id}': {
      post: {
        tags: ['Blog Schedule'],
        summary: 'Schedule a specific post',
        operationId: 'schedulePost',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['date'], properties: { date: { type: 'string', format: 'date-time' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', description: 'Updated blog post with scheduled_date' }) },
      },
    },
    '/aurora/blog/schedule/reschedule/{id}': {
      put: {
        tags: ['Blog Schedule'],
        summary: 'Reschedule a post',
        operationId: 'reschedulePost',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['date'], properties: { date: { type: 'string', format: 'date-time' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', description: 'Updated blog post with new scheduled_date' }) },
      },
    },

    /* ======================== BLOG ANALYTICS ======================== */
    '/aurora/analytics/blog/general': {
      get: { tags: ['Blog Analytics'], summary: 'Blog general analytics', operationId: 'getBlogGeneralAnalytics', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/analytics/blog/elements': {
      get: { tags: ['Blog Analytics'], summary: 'Blog element breakdown', operationId: 'getBlogElementAnalytics', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/analytics/blog/meta': {
      get: { tags: ['Blog Analytics'], summary: 'Blog meta information analytics', operationId: 'getBlogMetaAnalytics', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/analytics/blog/readability': {
      get: { tags: ['Blog Analytics'], summary: 'Blog readability scores', operationId: 'getBlogReadabilityAnalytics', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/analytics/dictionary/general': {
      get: { tags: ['Dictionary Analytics'], summary: 'Dictionary analytics', operationId: 'getDictionaryAnalytics', responses: { '200': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== QUILLO ======================== */
    '/aurora/blog/quillo/analyze': {
      post: {
        tags: ['Quillo'],
        summary: 'Analyze blog post with Quillo AI',
        operationId: 'quilloAnalyze',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id'], properties: { blog_post_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/quillo/analyze/chat': {
      post: {
        tags: ['Quillo'],
        summary: 'Chat with Quillo AI about a post',
        operationId: 'quilloChat',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id', 'question'], properties: { blog_post_id: { type: 'integer' }, question: { type: 'string' } } } } } },
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/quillo/post/autopilot': {
      post: {
        tags: ['Quillo'],
        summary: 'Start autopilot post improvement',
        operationId: 'quilloAutopilot',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id'], properties: { blog_post_id: { type: 'integer' } } } } } },
        responses: { '202': jsonResponse({ type: 'object', properties: { task_id: { type: 'string' }, status: { type: 'string' } } }, 'Autopilot task started') },
      },
    },
    '/aurora/blog/quillo/post/autopilot-status/{taskId}': {
      get: {
        tags: ['Quillo'],
        summary: 'Check autopilot task status',
        operationId: 'quilloAutopilotStatus',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': jsonResponse({ type: 'object', properties: { task_id: { type: 'string' }, status: { type: 'string' }, logs: { type: 'array', items: { type: 'string' } }, error: { type: 'string', nullable: true } } }),
          '404': jsonResponse({ type: 'object', properties: { task_id: { type: 'string' }, status: { type: 'string', enum: ['not_available'] }, detail: { type: 'string' }, logs: { type: 'array', items: { type: 'string' } } } }, 'Task not found or expired'),
        },
      },
    },
    '/aurora/blog/quillo/post/facebook': {
      post: {
        tags: ['Quillo'],
        summary: 'Generate Facebook post from blog',
        operationId: 'quilloFacebook',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['blog_post_id'], properties: { blog_post_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { content: { type: 'string' } } }) },
      },
    },
    '/aurora/company/quillo': {
      get: { tags: ['Quillo'], summary: 'Get company Quillo profile', operationId: 'getCompanyQuillo', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/company/quillo/analyze': {
      post: { tags: ['Quillo'], summary: 'Analyze company website', operationId: 'analyzeCompanyWebsite', responses: { '200': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== DICTIONARY ======================== */
    '/aurora/dictionary/dictionaries': {
      get: {
        tags: ['Dictionary'],
        summary: 'List dictionaries',
        operationId: 'listDictionaries',
        parameters: [
          pageParam,
          { name: 'itemsPerPage', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Alias for pageSize' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
        ],
        responses: {
          '200': jsonResponse({
            type: 'object',
            properties: {
              dictionaries: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    subject: { type: 'string' },
                    language: { type: 'string' },
                    num_words: { type: 'integer' },
                    total_words: { type: 'integer', description: 'num_words × 26' },
                    in_progress: { type: 'boolean' },
                    current_letter: { type: 'string' },
                    status: { type: 'string' },
                  },
                },
              },
              total: { type: 'integer' },
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
            },
          }),
        },
      },
    },
    '/aurora/dictionary/dictionary/{dictionaryId}': {
      get: {
        tags: ['Dictionary'],
        summary: 'Get dictionary with words',
        operationId: 'getDictionary',
        parameters: [{ name: 'dictionaryId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': jsonResponse({
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
              subject: { type: 'string' },
              language: { type: 'string' },
              num_words: { type: 'integer' },
              current_letter: { type: 'string' },
              status: { type: 'string' },
              company: { type: 'string', nullable: true },
              words: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    letter: { type: 'string' },
                    keyword: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    priority: { type: 'integer', description: '1=HIGH, 2=LOW' },
                    has_definition: { type: 'boolean' },
                  },
                },
              },
            },
          }),
        },
      },
    },
    '/aurora/dictionary/dictionary/{dictionaryId}/word/{wordId}': {
      get: { tags: ['Dictionary'], summary: 'Get a single word', operationId: 'getWord', parameters: [{ name: 'dictionaryId', in: 'path', required: true, schema: { type: 'integer' } }, { name: 'wordId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Word' }) } },
    },
    '/aurora/dictionary/modify/{id}': {
      put: {
        tags: ['Dictionary'],
        summary: 'Update a dictionary',
        operationId: 'updateDictionary',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, subject: { type: 'string' }, language: { type: 'string' }, num_words: { type: 'integer' } } } } } },
        responses: {
          '200': jsonResponse({
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
              subject: { type: 'string' },
              language: { type: 'string' },
              num_words: { type: 'integer' },
              current_letter: { type: 'string' },
              status: { type: 'string' },
              company: { type: 'string', nullable: true },
            },
          }),
        },
      },
      delete: {
        tags: ['Dictionary'],
        summary: 'Delete a dictionary',
        operationId: 'deleteDictionary',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '204': { description: 'Dictionary deleted (no content)' } },
      },
    },
    '/aurora/dictionary/modify/word/{id}': {
      put: { tags: ['Dictionary'], summary: 'Update a word', operationId: 'updateWord', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Word' }) } },
      delete: { tags: ['Dictionary'], summary: 'Delete a word', operationId: 'deleteWord', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },
    '/aurora/dictionary/dictionary/words/delete': {
      post: {
        tags: ['Dictionary'],
        summary: 'Bulk delete words',
        operationId: 'bulkDeleteWords',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['dictionaryId', 'ids'], properties: { dictionaryId: { type: 'integer' }, ids: { type: 'array', items: { type: 'integer' } } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { detail: { type: 'string' }, new_word_count: { type: 'integer' } } }) },
      },
    },
    '/aurora/dictionary/dictionary/export': {
      post: {
        tags: ['Dictionary'],
        summary: 'Export a single word from a dictionary',
        operationId: 'exportDictionaryWord',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['dictionary_id', 'word'], properties: { dictionary_id: { type: 'integer' }, word: { type: 'string' } } } } } },
        responses: {
          '200': jsonResponse({ type: 'object', properties: { dictionary_info: { type: 'object' }, word_data: { type: 'object' } } }),
          '404': jsonResponse({ type: 'object', properties: { detail: { type: 'string' } } }, 'Word not found or no definition'),
        },
      },
    },
    '/aurora/dictionary/dictionary/export/all': {
      post: {
        tags: ['Dictionary'],
        summary: 'Export all words from a dictionary',
        operationId: 'exportAllDictionaryWords',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['dictionary_id'], properties: { dictionary_id: { type: 'integer' } } } } } },
        responses: {
          '200': jsonResponse({ type: 'object', properties: { dictionary_info: { type: 'object' }, words: { type: 'array', items: { type: 'object' } }, stats: { type: 'object', properties: { total_words: { type: 'integer' }, words_with_definitions: { type: 'integer' }, words_with_complete_data: { type: 'integer' } } } } }),
        },
      },
    },
    '/aurora/dictionary/dictionary/export/third-party': {
      post: { tags: ['Dictionary'], summary: 'Export dictionary to third-party platform', operationId: 'exportDictionaryThirdParty', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['dictionary_id'], properties: { dictionary_id: { type: 'integer' } } } } } }, responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } }) } },
    },
    '/aurora/dictionary/dictionary/export/third-party/all': {
      post: { tags: ['Dictionary'], summary: 'Export all dictionaries to third-party platform', operationId: 'exportAllDictionariesThirdParty', responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } }) } },
    },
    '/aurora/dictionary/dictionary/upload': {
      post: {
        tags: ['Dictionary'],
        summary: 'Publish a dictionary to configured endpoint',
        operationId: 'uploadDictionary',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['dictionary_id'], properties: { dictionary_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, delivery: { type: 'object', properties: { remote_id: { type: 'string', nullable: true }, endpoint_status: { type: 'integer' } } } } }) },
      },
    },
    '/aurora/dictionary/dictionary/upload/all': {
      post: {
        tags: ['Dictionary'],
        summary: 'Publish all dictionaries to configured endpoint',
        operationId: 'uploadAllDictionaries',
        responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, synced: { type: 'array', items: { type: 'object' } }, errors: { type: 'array', items: { type: 'object' } }, total: { type: 'integer' } } }) },
      },
    },

    /* ======================== DICTIONARY GENERATION ======================== */
    '/aurora/dictionary/generation/keywords/start': {
      post: {
        tags: ['Dictionary Generation'],
        summary: 'Start keyword generation session',
        operationId: 'startKeywordGeneration',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'subject', 'language', 'num_words'], properties: { title: { type: 'string' }, subject: { type: 'string' }, language: { type: 'string' }, num_words: { type: 'integer' } } } } } },
        responses: { '201': jsonResponse({ type: 'object', properties: { session_id: { type: 'integer' }, letter: { type: 'string' }, keywords: { type: 'object', description: 'Map of generated keywords for the letter' } } }) },
      },
    },
    '/aurora/dictionary/generation/keywords/review': {
      post: {
        tags: ['Dictionary Generation'],
        summary: 'Review generated keywords — accept/reject a letter and advance',
        operationId: 'reviewKeywords',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['session_id', 'letter', 'accepted'], properties: { session_id: { type: 'integer' }, letter: { type: 'string' }, accepted: { type: 'boolean' }, removals: { type: 'array', items: { type: 'integer' }, description: '1-indexed positions to remove' } } } } } },
        responses: {
          '200': jsonResponse({ type: 'object', properties: { letter: { type: 'string' }, keywords: { type: 'object' }, message: { type: 'string', description: 'Present when all letters are done' } } }),
        },
      },
    },
    '/aurora/dictionary/generation/keywords/end': {
      post: {
        tags: ['Dictionary Generation'],
        summary: 'Complete keyword generation session',
        operationId: 'endKeywordGeneration',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['session_id'], properties: { session_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', description: 'Updated dictionary object with status' }) },
      },
    },
    '/aurora/dictionary/generation/keyword/new': {
      post: {
        tags: ['Dictionary Generation'],
        summary: 'Add a new keyword manually',
        operationId: 'generateNewKeyword',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['session_id', 'word'], properties: { session_id: { type: 'integer' }, word: { type: 'string' }, priority: { type: 'integer', description: '1=HIGH, 2=LOW' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { word: { type: 'string' }, description: { type: 'string' } } }) },
      },
    },
    '/aurora/dictionary/generation/definition/generate': {
      post: {
        tags: ['Dictionary Generation'],
        summary: 'Generate definitions for words in a dictionary',
        operationId: 'generateDefinitions',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['session_id'], properties: { session_id: { type: 'integer' }, word: { type: 'string', description: 'Specific word to generate for (optional)' }, include_priority_two: { type: 'boolean', default: false }, batch_size: { type: 'integer', default: 1, maximum: 20 } } } } } },
        responses: {
          '200': jsonResponse({ type: 'object', properties: { generated_definitions: { type: 'array', items: { type: 'object', properties: { word: { type: 'string' }, definition: { type: 'object' } } } }, next_word: { type: 'string', nullable: true }, remaining_definitions_count: { type: 'integer' }, total_words_count: { type: 'integer' }, generated_definitions_count: { type: 'integer' } } }),
        },
      },
    },
    '/aurora/dictionary/generation/definition/new': {
      post: {
        tags: ['Dictionary Generation'],
        summary: 'Generate definition for a priority-two word',
        operationId: 'generateNewDefinition',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['session_id'], properties: { session_id: { type: 'integer' }, word: { type: 'string', description: 'Optional specific word to target' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', description: 'Same shape as generateDefinitions response' }) },
      },
    },

    /* ======================== BLOG CATEGORIES ======================== */
    '/aurora/blog/categories': {
      get: { tags: ['Blog Posts'], summary: 'List blog post categories', operationId: 'listBlogCategories', responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/Category' } }) } },
      post: { tags: ['Blog Posts'], summary: 'Create blog post category', operationId: 'createBlogCategory', responses: { '201': jsonResponse({ $ref: '#/components/schemas/Category' }) } },
    },
    '/aurora/blog/categories/{id}': {
      put: { tags: ['Blog Posts'], summary: 'Update blog post category', operationId: 'updateBlogCategory', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Category' }) } },
      delete: { tags: ['Blog Posts'], summary: 'Delete blog post category', operationId: 'deleteBlogCategory', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },
    '/aurora/blog/categories/bulk-delete': {
      post: { tags: ['Blog Posts'], summary: 'Bulk delete blog post categories', operationId: 'bulkDeleteBlogCategories', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['ids'], properties: { ids: { type: 'array', items: { type: 'integer' } } } } } } }, responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'integer' } } }) } },
    },
    '/aurora/blog/categories/categorize': {
      post: { tags: ['Blog Posts'], summary: 'Auto-categorize blog posts into categories', operationId: 'categorizeBlogPosts', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/categories/generate': {
      post: { tags: ['Blog Posts'], summary: 'Auto-generate blog post categories with AI', operationId: 'generateBlogCategories', responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/Category' } }) } },
    },

    /* ======================== V1 — COMPANY ======================== */
    '/v1/company/profile': {
      get: {
        tags: ['Company'],
        summary: 'Get company profile',
        operationId: 'getCompanyProfile',
        responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { website_url: { type: 'string', nullable: true }, name: { type: 'string', nullable: true }, business_type: { type: 'string', nullable: true }, language: { type: 'string', nullable: true }, keywords: { type: 'array', items: { type: 'string' } }, profile: { type: 'object', nullable: true, description: 'Structured company profile' } } })) },
      },
      patch: {
        tags: ['Company'],
        summary: 'Update company profile',
        operationId: 'updateCompanyProfile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['profile'],
                properties: {
                  profile: {
                    type: 'object',
                    required: ['business_description', 'industry', 'target_audience', 'tone_of_voice', 'products_services', 'key_terminology', 'content_topics', 'differentiators', 'detected_language'],
                    properties: {
                      business_description: { type: 'string' },
                      industry: { type: 'string' },
                      target_audience: { type: 'string' },
                      tone_of_voice: { type: 'array', items: { type: 'string' } },
                      products_services: { type: 'array', items: { type: 'string' } },
                      key_terminology: { type: 'array', items: { type: 'string' } },
                      content_topics: { type: 'array', items: { type: 'string' } },
                      differentiators: { type: 'array', items: { type: 'string' } },
                      detected_language: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/CompanyProfile' })) },
      },
    },
    '/v1/company/analyze': {
      post: { tags: ['Company'], summary: 'Analyze company website with AI', operationId: 'analyzeCompany', responses: { '200': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== V1 — SETTINGS ======================== */
    '/v1/settings': {
      get: { tags: ['Settings'], summary: 'List all settings domains', operationId: 'listSettings', responses: { '200': jsonResponse(successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/SettingsDomain' } })) } },
    },
    '/v1/settings/schema': {
      get: { tags: ['Settings'], summary: 'Get settings schema (JSON Schema)', operationId: 'getSettingsSchema', responses: { '200': jsonResponse(successEnvelope({ type: 'object' })) } },
    },
    '/v1/settings/{domain}': {
      get: { tags: ['Settings'], summary: 'Get settings for a domain', operationId: 'getSettingsDomain', parameters: [{ name: 'domain', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/SettingsDomain' })) } },
      patch: { tags: ['Settings'], summary: 'Update settings for a domain', operationId: 'patchSettingsDomain', parameters: [{ name: 'domain', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/SettingsDomain' })) } },
    },

    '/v1/settings/integrations': {
      get: { tags: ['Settings'], summary: 'List integration settings (admin only)', operationId: 'listIntegrations', security: [{ bearerAuth: ['admin'] }], responses: { '200': jsonResponse(successEnvelope({ type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, label: { type: 'string' }, configured: { type: 'boolean' }, masked_value: { type: 'string', nullable: true } } } })) } },
      post: { tags: ['Settings'], summary: 'Upsert an integration key (admin only)', operationId: 'upsertIntegration', security: [{ bearerAuth: ['admin'] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['key', 'value'], properties: { key: { type: 'string' }, value: { type: 'string' } } } } } }, responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { key: { type: 'string' }, label: { type: 'string' }, configured: { type: 'boolean' } } })) } },
    },
    '/v1/settings/integrations/{key}': {
      delete: { tags: ['Settings'], summary: 'Delete an integration key (admin only)', operationId: 'deleteIntegration', security: [{ bearerAuth: ['admin'] }], parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { deleted: { type: 'boolean' }, key: { type: 'string' } } })) } },
    },
    '/v1/settings/integrations/test': {
      post: { tags: ['Settings'], summary: 'Test an integration key (admin only)', operationId: 'testIntegration', security: [{ bearerAuth: ['admin'] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['key'], properties: { key: { type: 'string' }, value: { type: 'string', description: 'If omitted, tests the currently saved value' } } } } } }, responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { ok: { type: 'boolean' }, error: { type: 'string', nullable: true } } })) } },
    },

    /* ======================== V1 — SEARCH ======================== */
    '/v1/search/global': {
      get: { tags: ['Search'], summary: 'Global search across titles, posts, dictionaries, words', operationId: 'globalSearch', parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 8, minimum: 1, maximum: 20 } }], responses: { '200': jsonResponse(successEnvelope({ type: 'array', items: { type: 'object', properties: { type: { type: 'string' }, id: { type: 'integer' }, title: { type: 'string' }, subtitle: { type: 'string' } } } })) } },
    },

    /* ======================== V1 — NOTIFICATIONS ======================== */
    '/v1/notifications': {
      get: { tags: ['Company'], summary: 'List notifications', operationId: 'listNotifications', responses: { '200': jsonResponse(successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/Notification' } })) } },
    },

    /* ======================== V1 — PUBLISHING ======================== */
    '/v1/publishing/api-keys': {
      get: { tags: ['Publishing'], summary: 'List publishing API keys', operationId: 'listApiKeys', responses: { '200': jsonResponse(successEnvelope({ type: 'array', items: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, key_prefix: { type: 'string' }, is_active: { type: 'boolean' }, created_at: { type: 'string', format: 'date-time' }, last_used_at: { type: 'string', format: 'date-time', nullable: true }, revoked_at: { type: 'string', format: 'date-time', nullable: true } } } })) } },
      post: { tags: ['Publishing'], summary: 'Create publishing API key', operationId: 'createApiKey', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', minLength: 3, maxLength: 120 } } } } } }, responses: { '201': jsonResponse(successEnvelope({ type: 'object', properties: { key: { type: 'string', description: 'Full API key (only shown once)' }, id: { type: 'integer' }, name: { type: 'string' }, key_prefix: { type: 'string' }, created_at: { type: 'string', format: 'date-time' }, warning: { type: 'string' } } })) } },
    },
    '/v1/publishing/api-keys/{id}/revoke': {
      post: { tags: ['Publishing'], summary: 'Revoke a publishing API key', operationId: 'revokeApiKey', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { revoked: { type: 'boolean' } } })) } },
    },
    '/v1/publishing/sync/posts/one': {
      post: { tags: ['Publishing'], summary: 'Sync a single post to publishing target', operationId: 'syncOnePost', responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/SyncJob' })) } },
    },
    '/v1/publishing/sync/posts/all': {
      post: { tags: ['Publishing'], summary: 'Sync all posts to publishing target', operationId: 'syncAllPosts', responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/SyncJob' })) } },
    },
    '/v1/publishing/sync/dictionaries/one': {
      post: { tags: ['Publishing'], summary: 'Sync a single dictionary', operationId: 'syncOneDictionary', responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/SyncJob' })) } },
    },
    '/v1/publishing/sync/dictionaries/all': {
      post: { tags: ['Publishing'], summary: 'Sync all dictionaries', operationId: 'syncAllDictionaries', responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/SyncJob' })) } },
    },
    '/v1/publishing/jobs/{jobId}': {
      get: { tags: ['Publishing'], summary: 'Get sync job status', operationId: 'getSyncJob', parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ type: 'object', properties: { job_id: { type: 'string' }, status: { type: 'string', enum: ['accepted', 'running', 'completed', 'failed'] }, logs: { type: 'array', items: { type: 'string' } }, error: { type: 'string', nullable: true } } }), '404': jsonResponse({ type: 'object', properties: { job_id: { type: 'string' }, status: { type: 'string', enum: ['not_available'] }, detail: { type: 'string' } } }, 'Job not found or expired') } },
    },
    '/v1/publishing/inbound/post/upsert': {
      post: {
        tags: ['Publishing'],
        summary: 'Inbound: upsert blog post',
        operationId: 'inboundUpsertPost',
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['event_id'],
                properties: {
                  contract_version: { type: 'string' },
                  event: { type: 'string' },
                  event_id: { type: 'string' },
                  payload: {
                    type: 'object',
                    properties: {
                      post: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          remote_id: { type: 'string' },
                          slug: { type: 'string' },
                          title_text: { type: 'string' },
                          seo_title: { type: 'string' },
                          focus_keyword: { type: 'string' },
                          excerpt: { type: 'string' },
                          meta_description: { type: 'string' },
                          cover_image: { type: 'object', properties: { url: { type: 'string' }, description: { type: 'string' } } },
                          categories: { type: 'array', items: { type: 'string' } },
                          status: { type: 'string', enum: ['TO_BE_GENERATED', 'APPROVED', 'REJECTED', 'GENERATED', 'PUBLISHED'] },
                        },
                      },
                      elements: { type: 'array', items: { type: 'object', properties: { id: { type: 'integer' }, order: { type: 'integer' }, element_type: { type: 'string' }, content: {} } } },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': jsonResponse(successEnvelope({ type: 'object', properties: { status: { type: 'string' }, post_id: { type: 'integer' }, event_id: { type: 'string' } } })),
          '401': ref401,
          '422': ref422,
        },
      },
    },
    '/v1/publishing/inbound/post/delete': {
      post: {
        tags: ['Publishing'],
        summary: 'Inbound: delete blog post',
        operationId: 'inboundDeletePost',
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['event_id'],
                properties: {
                  event: { type: 'string' },
                  event_id: { type: 'string' },
                  payload: {
                    type: 'object',
                    properties: {
                      post: { type: 'object', properties: { id: { type: 'integer' }, remote_id: { type: 'string' }, slug: { type: 'string' } } },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': jsonResponse(successEnvelope({ type: 'object', properties: { status: { type: 'string' }, deleted_post_id: { type: 'integer' }, event_id: { type: 'string' } } })),
          '401': ref401,
          '422': ref422,
        },
      },
    },
    '/v1/publishing/inbound/dictionary/upsert': {
      post: {
        tags: ['Publishing'],
        summary: 'Inbound: upsert dictionary',
        operationId: 'inboundUpsertDictionary',
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['event_id'],
                properties: {
                  event: { type: 'string' },
                  event_id: { type: 'string' },
                  payload: {
                    type: 'object',
                    properties: {
                      dictionary: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          title: { type: 'string' },
                          subject: { type: 'string' },
                          language: { type: 'string' },
                          num_words: { type: 'integer' },
                          current_letter: { type: 'string' },
                          status: { type: 'string', enum: ['IN_PROGRESS', 'KEYWORD_GENERATION', 'DEFINITION_GENERATION', 'COMPLETED'] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': jsonResponse(successEnvelope({ type: 'object', properties: { status: { type: 'string' }, dictionary_id: { type: 'integer' }, event_id: { type: 'string' } } })),
          '401': ref401,
          '422': ref422,
        },
      },
    },
    '/v1/publishing/inbound/dictionary/delete': {
      post: { tags: ['Publishing'], summary: 'Inbound: delete dictionary', operationId: 'inboundDeleteDictionary', security: [{ apiKeyAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['event_id'], properties: { event: { type: 'string' }, event_id: { type: 'string' }, payload: { type: 'object', properties: { dictionary: { type: 'object', properties: { id: { type: 'integer' }, title: { type: 'string' } } } } } } } } } }, responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { status: { type: 'string' }, dictionary_id: { type: 'integer' }, event_id: { type: 'string' } } })), '401': ref401, '422': ref422 } },
    },
    '/v1/publishing/inbound/dictionary/term/upsert': {
      post: {
        tags: ['Publishing'],
        summary: 'Inbound: upsert dictionary term',
        operationId: 'inboundUpsertTerm',
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['event_id'],
                properties: {
                  event: { type: 'string' },
                  event_id: { type: 'string' },
                  payload: {
                    type: 'object',
                    properties: {
                      dictionary: { type: 'object', properties: { id: { type: 'integer' }, title: { type: 'string' } } },
                      term: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          keyword: { type: 'string' },
                          letter: { type: 'string' },
                          description: { type: 'string' },
                          priority: { type: 'string', enum: ['HIGH', 'LOW'] },
                          focus_keyword: { type: 'string' },
                          definition: {
                            type: 'object',
                            properties: {
                              title: { type: 'string' },
                              featured_google_snippet: { type: 'string' },
                              meta_description: { type: 'string' },
                              seo_title: { type: 'string' },
                              synonyms: { type: 'array', items: { type: 'string' } },
                              antonyms: { type: 'array', items: { type: 'string' } },
                              usage_examples: { type: 'array', items: { type: 'string' } },
                              related_keywords: { type: 'array', items: { type: 'string' } },
                              faqs: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } } } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': jsonResponse(successEnvelope({ type: 'object', properties: { status: { type: 'string' }, dictionary_id: { type: 'integer' }, word_id: { type: 'integer' }, event_id: { type: 'string' } } })),
          '401': ref401,
          '422': ref422,
        },
      },
    },
    '/v1/publishing/inbound/dictionary/term/delete': {
      post: { tags: ['Publishing'], summary: 'Inbound: delete dictionary term', operationId: 'inboundDeleteTerm', security: [{ apiKeyAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['event_id'], properties: { event: { type: 'string' }, event_id: { type: 'string' }, payload: { type: 'object', properties: { dictionary: { type: 'object', properties: { id: { type: 'integer' }, title: { type: 'string' } } }, term: { type: 'object', properties: { id: { type: 'integer' }, keyword: { type: 'string' } } } } } } } } } }, responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { status: { type: 'string' }, dictionary_id: { type: 'integer' }, word_id: { type: 'integer' }, event_id: { type: 'string' } } })), '401': ref401, '422': ref422 } },
    },

    /* ======================== E-COMMERCE ======================== */
    '/aurora/ecommerce/products/import': {
      post: { tags: ['E-commerce'], summary: 'Import products from CSV/API', operationId: 'importProducts', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/ecommerce/blog/populate-product-recommendations': {
      get: { tags: ['E-commerce'], summary: 'Populate product recommendations in blog posts', operationId: 'populateProductRecommendations', responses: { '200': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== ADMIN ======================== */
    '/admin/companies': {
      get: { tags: ['Admin'], summary: 'List all companies (admin only)', operationId: 'adminListCompanies', security: [{ bearerAuth: ['admin'] }], responses: { '200': jsonResponse({ type: 'array', items: { type: 'object' } }) } },
    },
    '/admin/users': {
      get: { tags: ['Admin'], summary: 'List all users (admin only)', operationId: 'adminListUsers', security: [{ bearerAuth: ['admin'] }], responses: { '200': jsonResponse({ type: 'array', items: { type: 'object' } }) } },
      post: { tags: ['Admin'], summary: 'Create user (admin only)', operationId: 'adminCreateUser', security: [{ bearerAuth: ['admin'] }], responses: { '201': jsonResponse({ type: 'object' }) } },
    },
    '/admin/jobs': {
      get: {
        tags: ['Admin'],
        summary: 'List background jobs (admin only)',
        operationId: 'adminListJobs',
        security: [{ bearerAuth: ['admin'] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED'] } },
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Job type filter (e.g. "quillo.autopilot")' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, minimum: 1, maximum: 200 } },
        ],
        responses: { '200': jsonResponse({ type: 'object', properties: { jobs: { type: 'array', items: { type: 'object' } }, meta: { type: 'object', properties: { count: { type: 'integer' }, oldest_pending_age_seconds: { type: 'integer', nullable: true } } } } }) },
      },
    },
    '/admin/jobs/{jobId}': {
      get: { tags: ['Admin'], summary: 'Get a single background job (admin only)', operationId: 'adminGetJob', security: [{ bearerAuth: ['admin'] }], parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ type: 'object' }), '404': ref404 } },
    },
    '/admin/jobs/{jobId}/retry': {
      post: { tags: ['Admin'], summary: 'Retry a failed/canceled job (admin only)', operationId: 'adminRetryJob', security: [{ bearerAuth: ['admin'] }], parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ type: 'object' }), '404': ref404 } },
    },
    '/admin/jobs/{jobId}/cancel': {
      post: { tags: ['Admin'], summary: 'Cancel a pending/running job (admin only)', operationId: 'adminCancelJob', security: [{ bearerAuth: ['admin'] }], parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ type: 'object' }), '404': ref404 } },
    },

    /* ======================== EXAMPLE SITE ======================== */
    '/example/posts': {
      get: {
        tags: ['Example Site'],
        summary: 'List published posts (public demo)',
        operationId: 'exampleListPosts',
        security: [],
        parameters: [
          { name: 'full', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Include all posts (not just published)' },
          { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Max posts to return (0 = all)' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': jsonResponse({ type: 'object', properties: { posts: { type: 'array', items: { type: 'object' } }, total: { type: 'integer' }, offset: { type: 'integer' }, limit: { type: 'integer', nullable: true } } }) },
      },
    },
    '/example/posts/{slug}': {
      get: { tags: ['Example Site'], summary: 'Get post by slug (public demo)', operationId: 'exampleGetPost', security: [], parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/BlogPost' }), '404': ref404 } },
    },
    '/example/dictionary': {
      get: { tags: ['Example Site'], summary: 'List dictionary words (public demo)', operationId: 'exampleListDictionary', security: [], responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/Word' } }) } },
    },
    '/example/dictionary/{wordId}': {
      get: { tags: ['Example Site'], summary: 'Get word by ID (public demo)', operationId: 'exampleGetWord', security: [], parameters: [{ name: 'wordId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Word' }), '404': ref404 } },
    },
    '/example/inbound': {
      post: {
        tags: ['Example Site'],
        summary: 'Inbound webhook for the example/demo site',
        description: 'Receives content push events from Aurora. Auth: Bearer token validated against EXAMPLE_INBOUND_KEY env var.',
        operationId: 'exampleInbound',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['event'], properties: { event: { type: 'string', description: 'Event type (post.upsert, post.delete, dictionary.upsert, dictionary.delete, etc.)' }, payload: { type: 'object' } } } } } },
        responses: {
          '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, delivery_id: { type: 'string' } } }),
          '401': ref401,
        },
      },
    },

    /* ======================== PUBLISHING INBOUND (LEGACY) ======================== */
    '/publishing/inbound': {
      post: {
        tags: ['Publishing'],
        summary: 'Legacy inbound webhook for public content',
        description: 'Receives content push events. Auth: Bearer token validated against PUBLIC_CONTENT_INBOUND_KEY env var.',
        operationId: 'publishingInbound',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['event'], properties: { event: { type: 'string' }, payload: { type: 'object' } } } } } },
        responses: {
          '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, delivery_id: { type: 'string' } } }),
          '401': ref401,
        },
      },
    },

    /* ======================== SETUP ======================== */
    '/setup/status': {
      get: {
        tags: ['Settings'],
        summary: 'Check if initial setup is complete',
        security: [],
        operationId: 'getSetupStatus',
        responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { complete: { type: 'boolean' }, hasUser: { type: 'boolean' }, hasCompany: { type: 'boolean' }, hasAiKey: { type: 'boolean' } } })) },
      },
    },
    '/setup': {
      post: {
        tags: ['Settings'],
        summary: 'Complete initial setup (creates admin user and company)',
        security: [],
        operationId: 'completeSetup',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'companyName'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  companyName: { type: 'string' },
                  websiteUrl: { type: 'string' },
                  integrations: { type: 'object', additionalProperties: { type: 'string' }, description: 'Key-value map of integration keys (e.g. OPENAI_API_KEY)' },
                },
              },
            },
          },
        },
        responses: {
          '201': jsonResponse(successEnvelope({ type: 'object', properties: { userId: { type: 'string' }, email: { type: 'string' }, companyId: { type: 'integer' } } })),
          '403': ref403,
          '422': ref422,
        },
      },
    },
    '/setup/test': {
      post: {
        tags: ['Settings'],
        summary: 'Test an integration key during setup',
        security: [],
        operationId: 'testSetupIntegration',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['key', 'value'], properties: { key: { type: 'string' }, value: { type: 'string' } } } } } },
        responses: { '200': jsonResponse(successEnvelope({ type: 'object', properties: { ok: { type: 'boolean' }, error: { type: 'string', nullable: true } } })) },
      },
    },
  },
}
