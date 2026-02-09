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
    title: 'Aurora / OpenSEO API',
    version: '1.0.0',
    description: `
**Aurora** is an AI-powered SEO content platform for generating, managing, and publishing blog posts, dictionaries, and brand content.

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
    contact: { name: 'NordTools', url: 'https://nordtools.se' },
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
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          language: { type: 'string' },
          word_count: { type: 'integer' },
        },
      },
      Word: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          word: { type: 'string' },
          definition: { type: 'string', nullable: true },
          synonyms: { type: 'array', items: { type: 'string' } },
          usage_example: { type: 'string', nullable: true },
        },
      },
      BulkSchedule: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          schedule_type: { type: 'string' },
          start_date: { type: 'string', format: 'date-time' },
          end_date: { type: 'string', format: 'date-time', nullable: true },
          interval_days: { type: 'integer', nullable: true },
          titles_count: { type: 'integer' },
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
          status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
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
          name: { type: 'string' },
          type: { type: 'string' },
          content: { type: 'string' },
          button_text: { type: 'string', nullable: true },
          button_url: { type: 'string', nullable: true },
        },
      },
      CTACampaign: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
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
          '200': jsonResponse({ type: 'object', properties: { token: { type: 'string' }, user: { type: 'object' } } }, 'Login successful'),
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
          '200': jsonResponse({ type: 'object', properties: { user: { type: 'object' }, companyId: { type: 'integer', nullable: true } } }),
          '401': ref401,
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh session token',
        security: [],
        operationId: 'refreshToken',
        responses: {
          '200': jsonResponse({ type: 'object', properties: { token: { type: 'string' } } }),
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and invalidate session',
        security: [],
        operationId: 'logout',
        responses: {
          '200': jsonResponse({ type: 'object', properties: { success: { type: 'boolean' } } }),
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

    /* ======================== BLOG POSTS ======================== */
    '/aurora/blog/posts': {
      get: {
        tags: ['Blog Posts'],
        summary: 'List blog posts',
        operationId: 'listBlogPosts',
        parameters: [pageParam, pageSizeParam, searchParam],
        responses: {
          '200': jsonResponse({
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/BlogPost' } },
              total: { type: 'integer' },
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
        responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) },
      },
    },
    '/aurora/blog/posts/share': {
      post: {
        tags: ['Blog Posts'],
        summary: 'Generate a shareable link for a post',
        operationId: 'shareBlogPost',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' } } } } } },
        responses: { '200': jsonResponse({ type: 'object', properties: { url: { type: 'string' } } }) },
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
        parameters: [{ name: 'revision_id', in: 'query', required: true, schema: { type: 'integer' } }],
        responses: { '200': jsonResponse({ type: 'object' }) },
      },
    },
    '/aurora/blog/posts/sync/keywords': {
      post: {
        tags: ['Blog Posts'],
        summary: 'Sync focus keywords for a post',
        operationId: 'syncKeywords',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['post_id'], properties: { post_id: { type: 'integer' } } } } } },
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
      post: { tags: ['Blog Elements'], summary: 'Enhance element with AI', operationId: 'enhanceElement', responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) } },
    },
    '/aurora/blog/posts/elements/enhance-readability': {
      post: { tags: ['Blog Elements'], summary: 'Enhance element readability', operationId: 'enhanceReadability', responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) } },
    },
    '/aurora/blog/posts/elements/humanize': {
      post: { tags: ['Blog Elements'], summary: 'Humanize AI-generated element', operationId: 'humanizeElement', responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) } },
    },
    '/aurora/blog/posts/elements/regenerate': {
      post: { tags: ['Blog Elements'], summary: 'Regenerate element with AI', operationId: 'regenerateElement', responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) } },
    },
    '/aurora/blog/posts/elements/add': {
      post: { tags: ['Blog Elements'], summary: 'Add element to a post', operationId: 'addElement', responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) } },
    },
    '/aurora/blog/posts/elements/add-cta': {
      post: { tags: ['Blog Elements'], summary: 'Add CTA element to a post', operationId: 'addCtaElement', responses: { '200': jsonResponse({ $ref: '#/components/schemas/ContentElement' }) } },
    },
    '/aurora/blog/posts/elements/template/create': {
      post: { tags: ['Blog Elements'], summary: 'Create element template', operationId: 'createTemplate', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/posts/elements/template/use': {
      post: { tags: ['Blog Elements'], summary: 'Apply element template to post', operationId: 'useTemplate', responses: { '200': jsonResponse({ type: 'object' }) } },
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
    '/aurora/blog/focus-keywords': {
      get: { tags: ['Blog Posts'], summary: 'List all focus keywords', operationId: 'listFocusKeywords', responses: { '200': jsonResponse({ type: 'array', items: { type: 'string' } }) } },
    },

    /* ======================== BLOG CTA ======================== */
    '/aurora/blog/cta/list': {
      get: { tags: ['Blog CTA'], summary: 'List CTAs', operationId: 'listCtas', responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/CTA' } }) } },
    },
    '/aurora/blog/cta/create': {
      post: { tags: ['Blog CTA'], summary: 'Create a CTA', operationId: 'createCta', responses: { '200': jsonResponse({ $ref: '#/components/schemas/CTA' }) } },
    },
    '/aurora/blog/cta/edit/{id}': {
      put: { tags: ['Blog CTA'], summary: 'Update a CTA', operationId: 'updateCta', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/CTA' }) } },
    },
    '/aurora/blog/cta/delete/{id}': {
      delete: { tags: ['Blog CTA'], summary: 'Delete a CTA', operationId: 'deleteCta', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },
    '/aurora/blog/cta/add-cta': {
      post: { tags: ['Blog CTA'], summary: 'Add CTA to post', operationId: 'addCtaToPost', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/cta/campaign/create': {
      post: { tags: ['Blog CTA'], summary: 'Create CTA campaign', operationId: 'createCtaCampaign', responses: { '200': jsonResponse({ $ref: '#/components/schemas/CTACampaign' }) } },
    },
    '/aurora/blog/cta/campaign/edit/{id}': {
      put: { tags: ['Blog CTA'], summary: 'Update CTA campaign', operationId: 'updateCtaCampaign', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/CTACampaign' }) } },
    },
    '/aurora/blog/cta/campaign/delete/{id}': {
      delete: { tags: ['Blog CTA'], summary: 'Delete CTA campaign', operationId: 'deleteCtaCampaign', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },

    /* ======================== BLOG SCHEDULE ======================== */
    '/aurora/blog/schedule/bulk': {
      get: { tags: ['Blog Schedule'], summary: 'List bulk schedules', operationId: 'listBulkSchedules', responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/BulkSchedule' } }) } },
      post: { tags: ['Blog Schedule'], summary: 'Create bulk schedule', operationId: 'createBulkScheduleDefault', responses: { '200': jsonResponse({ $ref: '#/components/schemas/BulkSchedule' }) } },
    },
    '/aurora/blog/schedule/bulk/create': {
      post: { tags: ['Blog Schedule'], summary: 'Create a bulk schedule', operationId: 'createBulkSchedule', responses: { '200': jsonResponse({ $ref: '#/components/schemas/BulkSchedule' }) } },
    },
    '/aurora/blog/schedule/bulk/assign': {
      post: { tags: ['Blog Schedule'], summary: 'Assign titles to a schedule', operationId: 'assignToSchedule', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/schedule/bulk/remove': {
      post: { tags: ['Blog Schedule'], summary: 'Remove titles from schedule', operationId: 'removeFromSchedule', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/schedule/bulk/update/{id}': {
      put: { tags: ['Blog Schedule'], summary: 'Update a bulk schedule', operationId: 'updateBulkSchedule', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/BulkSchedule' }) } },
    },
    '/aurora/blog/schedule/interval': {
      post: { tags: ['Blog Schedule'], summary: 'Set scheduling interval', operationId: 'setScheduleInterval', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/schedule/post/{id}': {
      post: { tags: ['Blog Schedule'], summary: 'Schedule a specific post', operationId: 'schedulePost', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/schedule/reschedule/{id}': {
      put: { tags: ['Blog Schedule'], summary: 'Reschedule a post', operationId: 'reschedulePost', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object' }) } },
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
      post: { tags: ['Quillo'], summary: 'Analyze blog post with Quillo AI', operationId: 'quilloAnalyze', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/quillo/analyze/chat': {
      post: { tags: ['Quillo'], summary: 'Chat with Quillo AI about a post', operationId: 'quilloChat', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/blog/quillo/post/autopilot': {
      post: { tags: ['Quillo'], summary: 'Start autopilot post generation', operationId: 'quilloAutopilot', responses: { '200': jsonResponse({ type: 'object', properties: { taskId: { type: 'string' } } }) } },
    },
    '/aurora/blog/quillo/post/autopilot-status/{taskId}': {
      get: { tags: ['Quillo'], summary: 'Check autopilot task status', operationId: 'quilloAutopilotStatus', parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ type: 'object', properties: { status: { type: 'string' }, progress: { type: 'number' } } }) } },
    },
    '/aurora/blog/quillo/post/facebook': {
      post: { tags: ['Quillo'], summary: 'Generate Facebook post from blog', operationId: 'quilloFacebook', responses: { '200': jsonResponse({ type: 'object', properties: { content: { type: 'string' } } }) } },
    },
    '/aurora/company/quillo': {
      get: { tags: ['Quillo'], summary: 'Get company Quillo profile', operationId: 'getCompanyQuillo', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/company/quillo/analyze': {
      post: { tags: ['Quillo'], summary: 'Analyze company website', operationId: 'analyzeCompanyWebsite', responses: { '200': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== DICTIONARY ======================== */
    '/aurora/dictionary/dictionaries': {
      get: { tags: ['Dictionary'], summary: 'List dictionaries', operationId: 'listDictionaries', responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/Dictionary' } }) } },
    },
    '/aurora/dictionary/dictionary/{dictionaryId}': {
      get: { tags: ['Dictionary'], summary: 'Get dictionary with words', operationId: 'getDictionary', parameters: [{ name: 'dictionaryId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Dictionary' }) } },
    },
    '/aurora/dictionary/dictionary/{dictionaryId}/word/{wordId}': {
      get: { tags: ['Dictionary'], summary: 'Get a single word', operationId: 'getWord', parameters: [{ name: 'dictionaryId', in: 'path', required: true, schema: { type: 'integer' } }, { name: 'wordId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Word' }) } },
    },
    '/aurora/dictionary/modify/{id}': {
      put: { tags: ['Dictionary'], summary: 'Update a dictionary', operationId: 'updateDictionary', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Dictionary' }) } },
      delete: { tags: ['Dictionary'], summary: 'Delete a dictionary', operationId: 'deleteDictionary', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },
    '/aurora/dictionary/modify/word/{id}': {
      put: { tags: ['Dictionary'], summary: 'Update a word', operationId: 'updateWord', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/Word' }) } },
      delete: { tags: ['Dictionary'], summary: 'Delete a word', operationId: 'deleteWord', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': jsonResponse({ type: 'object', properties: { deleted: { type: 'boolean' } } }) } },
    },
    '/aurora/dictionary/dictionary/words/delete': {
      post: { tags: ['Dictionary'], summary: 'Bulk delete words', operationId: 'bulkDeleteWords', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/dictionary/export': {
      post: { tags: ['Dictionary'], summary: 'Export dictionary', operationId: 'exportDictionary', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/dictionary/export/all': {
      post: { tags: ['Dictionary'], summary: 'Export all dictionaries', operationId: 'exportAllDictionaries', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/dictionary/upload': {
      post: { tags: ['Dictionary'], summary: 'Upload/publish a dictionary', operationId: 'uploadDictionary', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/dictionary/upload/all': {
      post: { tags: ['Dictionary'], summary: 'Upload/publish all dictionaries', operationId: 'uploadAllDictionaries', responses: { '200': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== DICTIONARY GENERATION ======================== */
    '/aurora/dictionary/generation/keywords/start': {
      post: { tags: ['Dictionary Generation'], summary: 'Start keyword generation session', operationId: 'startKeywordGeneration', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/generation/keywords/review': {
      post: { tags: ['Dictionary Generation'], summary: 'Review generated keywords', operationId: 'reviewKeywords', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/generation/keywords/end': {
      post: { tags: ['Dictionary Generation'], summary: 'End keyword generation session', operationId: 'endKeywordGeneration', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/generation/keyword/new': {
      post: { tags: ['Dictionary Generation'], summary: 'Generate new keywords', operationId: 'generateKeywords', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/generation/definition/generate': {
      post: { tags: ['Dictionary Generation'], summary: 'Generate definitions for words', operationId: 'generateDefinitions', responses: { '200': jsonResponse({ type: 'object' }) } },
    },
    '/aurora/dictionary/generation/definition/new': {
      post: { tags: ['Dictionary Generation'], summary: 'Generate new definition', operationId: 'generateNewDefinition', responses: { '200': jsonResponse({ type: 'object' }) } },
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

    /* ======================== V1 — COMPANY ======================== */
    '/v1/company/profile': {
      get: { tags: ['Company'], summary: 'Get company profile', operationId: 'getCompanyProfile', responses: { '200': jsonResponse({ $ref: '#/components/schemas/CompanyProfile' }) } },
      patch: { tags: ['Company'], summary: 'Update company profile', operationId: 'updateCompanyProfile', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['profile'], properties: { profile: { type: 'object' } } } } } }, responses: { '200': jsonResponse(successEnvelope({ $ref: '#/components/schemas/CompanyProfile' })) } },
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
      get: { tags: ['Publishing'], summary: 'List publishing API keys', operationId: 'listApiKeys', responses: { '200': jsonResponse(successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/PublishingApiKey' } })) } },
      post: { tags: ['Publishing'], summary: 'Create publishing API key', operationId: 'createApiKey', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } } } }, responses: { '201': jsonResponse(successEnvelope({ type: 'object', properties: { key: { type: 'string', description: 'Full API key (only shown once)' }, id: { type: 'integer' }, name: { type: 'string' }, prefix: { type: 'string' } } })) } },
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
      get: { tags: ['Publishing'], summary: 'Get sync job status', operationId: 'getSyncJob', parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': jsonResponse({ $ref: '#/components/schemas/SyncJob' }) } },
    },
    '/v1/publishing/inbound/post/upsert': {
      post: { tags: ['Publishing'], summary: 'Inbound: upsert blog post', operationId: 'inboundUpsertPost', security: [{ apiKeyAuth: [] }], responses: { '200': jsonResponse(successEnvelope({ type: 'object' })) } },
    },
    '/v1/publishing/inbound/post/delete': {
      post: { tags: ['Publishing'], summary: 'Inbound: delete blog post', operationId: 'inboundDeletePost', security: [{ apiKeyAuth: [] }], responses: { '200': jsonResponse(successEnvelope({ type: 'object' })) } },
    },
    '/v1/publishing/inbound/dictionary/upsert': {
      post: { tags: ['Publishing'], summary: 'Inbound: upsert dictionary', operationId: 'inboundUpsertDictionary', security: [{ apiKeyAuth: [] }], responses: { '200': jsonResponse(successEnvelope({ type: 'object' })) } },
    },
    '/v1/publishing/inbound/dictionary/delete': {
      post: { tags: ['Publishing'], summary: 'Inbound: delete dictionary', operationId: 'inboundDeleteDictionary', security: [{ apiKeyAuth: [] }], responses: { '200': jsonResponse(successEnvelope({ type: 'object' })) } },
    },
    '/v1/publishing/inbound/dictionary/term/upsert': {
      post: { tags: ['Publishing'], summary: 'Inbound: upsert dictionary term', operationId: 'inboundUpsertTerm', security: [{ apiKeyAuth: [] }], responses: { '200': jsonResponse(successEnvelope({ type: 'object' })) } },
    },
    '/v1/publishing/inbound/dictionary/term/delete': {
      post: { tags: ['Publishing'], summary: 'Inbound: delete dictionary term', operationId: 'inboundDeleteTerm', security: [{ apiKeyAuth: [] }], responses: { '200': jsonResponse(successEnvelope({ type: 'object' })) } },
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
      get: { tags: ['Admin'], summary: 'List all companies (admin only)', operationId: 'adminListCompanies', responses: { '200': jsonResponse({ type: 'array', items: { type: 'object' } }) } },
    },
    '/admin/users': {
      get: { tags: ['Admin'], summary: 'List all users (admin only)', operationId: 'adminListUsers', responses: { '200': jsonResponse({ type: 'array', items: { type: 'object' } }) } },
      post: { tags: ['Admin'], summary: 'Create user (admin only)', operationId: 'adminCreateUser', responses: { '201': jsonResponse({ type: 'object' }) } },
    },

    /* ======================== EXAMPLE SITE ======================== */
    '/example/posts': {
      get: { tags: ['Example Site'], summary: 'List published posts (public demo)', operationId: 'exampleListPosts', security: [], responses: { '200': jsonResponse({ type: 'array', items: { $ref: '#/components/schemas/BlogPost' } }) } },
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
  },
}
