# Endpoint Parity Report (Django vs Next.js)

Generated: 2026-02-07 01:43:39

## Authentication
- Django login status: 200
- NextAuth csrf status: 200, callback status: 200, csrf token present: True

## Summary
- Total endpoints tested: **97**
- Passed (exact): **16**
- Partial (acceptable mismatch): **16**
- Failed (broken): **65**

## Top 10 blockers
- Behavior mismatch (38)
- Auth/session mismatch in NextAuth (9)
- Next service/validator internal error (6)
- Route missing/path mismatch in Next (6)
- Endpoint not implemented in Next (6)

### [A] GET /api/aurora/health
- Verdict: **broken**
- Django: `404` @ `/api/aurora/health` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <title>Page not found at /api/aurora/health</title>   <meta name="ro`
- Next: `200` @ `/api/aurora/health` — `{"status":"ok"} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [A] GET /api/aurora/health/celery
- Verdict: **broken**
- Django: `404` @ `/api/aurora/health/celery` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <title>Page not found at /api/aurora/health/celery</title>   <meta n`
- Next: `200` @ `/api/aurora/health/celery` — `{"status":"ok","celery":"not_migrated"} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [A] GET /api/auth/me
- Verdict: **exact match**
- Django: `200` @ `/api/auth/me` — `{"user":{"email":"qa@nordtools.local","username":"qa","user_type":4,"abilityRules":["admin","manage_users","access_all"],"company":{"id":1,"name":"DemoCo"}}} `
- Next: `200` @ `/api/auth/me` — `{"user":{"name":"QA User","email":"qa@nordtools.local","id":"cmlbl46m60001vbvnh0zqh9pz","userType":4,"companyId":1,"company":{"id":1,"name":"Nordtools","business_type":"Technology"`

### [A] GET /api/health
- Verdict: **exact match**
- Django: `200` @ `/api/health` — `{"status":"ok","db":true,"redis":true} `
- Next: `200` @ `/api/health` — `{"status":"ok"} `

### [A] GET /api/health/celery
- Verdict: **exact match**
- Django: `200` @ `/api/health/celery` — `{"celery_status":{"worker_online":true,"task_id":"d30274fb-b81b-471e-82d5-d3771291aecb","task_status":"SUCCESS","task_result":"pong"}} `
- Next: `200` @ `/api/health/celery` — `{"status":"ok"} `

### [B] GET /api/aurora/blog/titles/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/titles/` — `[{"id":173,"blog_post_id":173,"bulk_schedule_name":null,"linked_posts":[],"categories":[],"title_text":"Exploring Quantum Computing: The Next Frontier in Tech Innovation","slug":"e`
- Next: `200` @ `/api/aurora/blog/titles/` — `[{"id":5,"companyId":1,"title_text":"Bridging the Gap: Enhancing Parity in SaaS Product Development","slug":"bridging-the-gap-enhancing-parity-in-saas-product-development","seo_tit`

### [B] GET /api/aurora/blog/titles/categories/
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/titles/categories/` — `{"detail":"No categories found for this company."} `
- Next: `200` @ `/api/aurora/blog/titles/categories/` — `[{"id":8,"name":"ParityCat"},{"id":7,"name":"ParityCat-1770424859"},{"id":6,"name":"Future Trends"},{"id":5,"name":"Digital Marketing"},{"id":4,"name":"Technology Innovation"},{"id`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [B] POST /api/aurora/blog/titles/categories/add/
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/blog/titles/categories/add/` — `{"detail":"No new categories were added; they already exist.","existing_categories":[]} `
- Next: `400` @ `/api/aurora/blog/titles/categories/add/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"names":["Too small: expected array to have >=1 items"]}}}} `

### [B] DELETE /api/aurora/blog/titles/categories/bulk-delete/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/titles/categories/bulk-delete/` — `{"detail":"Method \"DELETE\" not allowed."} `
- Next: `400` @ `/api/aurora/blog/titles/categories/bulk-delete/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"ids":["Invalid input: expected array, received undefined"]}}}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [B] POST /api/aurora/blog/titles/categories/categorize/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/titles/categories/categorize/` — `[{"id":172,"title_text":"Unlocking the Future: How AI is Reshaping the Technology Landscape","categories":[{"id":112,"name":"Emerging Technologies and Industry Trends"},{"id":118,"`
- Next: `200` @ `/api/aurora/blog/titles/categories/categorize/` — `[{"id":2,"title_text":"Integrating AI into SEO Strategies: A Comprehensive Guide","categories":[{"id":2,"name":"Search Engine Optimization"},{"id":4,"name":"Technology Innovation"}`

### [B] DELETE /api/aurora/blog/titles/categories/delete/1/
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/titles/categories/delete/1/` — `{"detail":"Category not found or unauthorized."} `
- Next: `200` @ `/api/aurora/blog/titles/categories/delete/1/` — `{"deleted":true} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [B] POST /api/aurora/blog/titles/categories/edit/1/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/titles/categories/edit/1/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `400` @ `/api/aurora/blog/titles/categories/edit/1/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"name":["Invalid input: expected string, received undefined"]}}}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [B] POST /api/aurora/blog/titles/categories/generate/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/titles/categories/generate/` — `{"generated_categories":["Artificial Intelligence","SaaS (Software as a Service)","Technology Innovation","Quantum Computing","Remote Work Solutions","Service Automation"],"saved_c`
- Next: `200` @ `/api/aurora/blog/titles/categories/generate/` — `{"generated_categories":["Artificial Intelligence","Search Engine Optimization","Software Development","Inclusivity in Technology","Equal Opportunity","Parity in SaaS"],"saved_cate`

### [B] DELETE /api/aurora/blog/titles/delete/1/
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/titles/delete/1/` — `{"detail":"Title not found."} `
- Next: `200` @ `/api/aurora/blog/titles/delete/1/` — `{"deleted":true} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [B] POST /api/aurora/blog/titles/generate/
- Verdict: **broken**
- Django: `401` @ `/api/aurora/blog/titles/generate/` — `{"detail":"Authentication credentials were not provided."} `
- Next: `200` @ `/api/aurora/blog/titles/generate/` — `[{"id":6,"companyId":1,"title_text":"The Future of SaaS: Ensuring Parity Through Inclusive Product Design","slug":"the-future-of-saas-ensuring-parity-through-inclusive-product-desi`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [B] POST /api/aurora/blog/titles/regenerate/1/
- Verdict: **broken**
- Django: `401` @ `/api/aurora/blog/titles/regenerate/1/` — `{"detail":"Authentication credentials were not provided."} `
- Next: `0` @ `/api/aurora/blog/titles/regenerate/1/` — ` `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [B] POST /api/aurora/blog/titles/update/1/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/titles/update/1/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `200` @ `/api/aurora/blog/titles/update/1/` — `{"id":1,"companyId":1,"title_text":"Revolutionizing Marketing: How AI and SEO are Shaping the Future","slug":"revolutionizing-marketing-how-ai-and-seo-are-shaping-the-future","seo_`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] GET /api/aurora/blog/posts/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/posts/` — `{"result":3,"next":null,"previous":null,"data":[{"id":172,"elements":[{"id":671,"hyperlink":null,"element_type":"introduction","order":0,"content":{"text":"Artificial Intelligence `
- Next: `200` @ `/api/aurora/blog/posts/` — `{"result":1,"next":null,"previous":null,"data":[{"id":1,"companyId":1,"title_text":"Revolutionizing Marketing: How AI and SEO are Shaping the Future","slug":"revolutionizing-market`

### [C] GET /api/aurora/blog/posts/delete-element/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/posts/delete-element/` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `500` @ `/api/aurora/blog/posts/delete-element/` — `{"success":false,"error":{"message":"Internal server error"}} `
- Likely root cause: Next service/validator internal error
- Suggested fix file: `src/server/services/* + src/server/validators/*`

### [C] DELETE /api/aurora/blog/posts/delete/1/
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/posts/delete/1/` — `{"detail":"BlogPost not found."} `
- Next: `401` @ `/api/aurora/blog/posts/delete/1/` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [C] POST /api/aurora/blog/posts/elements/add/
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/blog/posts/elements/add/` — `{"detail":"Invalid element type. Must be one of: meta_description, excerpt, cover_image, introduction, image, paragraph, list_paragraph, quote, numbered_list_paragraph, featured_sn`
- Next: `400` @ `/api/aurora/blog/posts/elements/add/` — `{"success":false,"error":{"message":"Invalid element type. Must be one of: meta_description, excerpt, cover_image, introduction, image, paragraph, list_paragraph, quote, numbered_l`

### [C] POST /api/aurora/blog/posts/elements/enhance/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/blog/posts/elements/enhance` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `0` @ `/api/aurora/blog/posts/elements/enhance/` — ` `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] GET /api/aurora/blog/posts/elements/get/code-clusters/
- Verdict: **broken**
- Django: `401` @ `/api/aurora/blog/posts/elements/get/code-clusters/` — `{"detail":"Authentication credentials were not provided."} `
- Next: `200` @ `/api/aurora/blog/posts/elements/get/code-clusters/` — `[] `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] POST /api/aurora/blog/posts/elements/humanize/
- Verdict: **broken**
- Django: `202` @ `/api/aurora/blog/posts/elements/humanize/` — `{"task_id":"0fbb841e-5c9d-4c23-b199-9997db60501b","status":"accepted","status_endpoint":"/api/task-status/0fbb841e-5c9d-4c23-b199-9997db60501b/"} `
- Next: `0` @ `/api/aurora/blog/posts/elements/humanize/` — ` `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] POST /api/aurora/blog/posts/elements/regenerate/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/blog/posts/elements/regenerate` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `200` @ `/api/aurora/blog/posts/elements/regenerate/` — `{"status":"Blog element(s) regenerated successfully.","regenerated_elements":[{"id":1,"element_type":"introduction","content":{"text":"Welcome to a new era in marketing! In this bl`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] POST /api/aurora/blog/posts/elements/template/create/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/blog/posts/elements/template/create/` — `{"error":"An unexpected error occurred: ['Invalid element type.']"} `
- Next: `401` @ `/api/aurora/blog/posts/elements/template/create/` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [C] GET /api/aurora/blog/posts/elements/template/use/?element_id=1&template_id=1
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/posts/elements/template/use/?element_id=1&template_id=1` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `401` @ `/api/aurora/blog/posts/elements/template/use/?element_id=1&template_id=1` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [C] POST /api/aurora/blog/posts/export/
- Verdict: **acceptable shape mismatch**
- Django: `401` @ `/api/aurora/blog/posts/export/` — `{"detail":"API key is required"} `
- Next: `401` @ `/api/aurora/blog/posts/export/` — `{"success":false,"error":{"message":"Authentication required"}} `

### [C] POST /api/aurora/blog/posts/export/all
- Verdict: **acceptable shape mismatch**
- Django: `401` @ `/api/aurora/blog/posts/export/all` — `{"detail":"API key is required"} `
- Next: `401` @ `/api/aurora/blog/posts/export/all` — `{"success":false,"error":{"message":"Authentication required"}} `

### [C] POST /api/aurora/blog/posts/export/third-party/
- Verdict: **broken**
- Django: `400` @ `/api/aurora/blog/posts/export/third-party/` — `{"detail":"endpoint_url is required"} `
- Next: `200` @ `/api/aurora/blog/posts/export/third-party/` — `{"status":"Third-party export prepared","provider":"test","payload":{"provider":"test"}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] POST /api/aurora/blog/posts/export/third-party/all/
- Verdict: **broken**
- Django: `401` @ `/api/aurora/blog/posts/export/third-party/all/` — `{"detail":"Authentication credentials were not provided."} `
- Next: `200` @ `/api/aurora/blog/posts/export/third-party/all/` — `{"status":"Third-party export prepared for all blog posts","provider":"test","payload":{"provider":"test"}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] POST /api/aurora/blog/posts/generate/
- Verdict: **broken**
- Django: `0` @ `/api/aurora/blog/posts/generate/` — ` `
- Next: `404` @ `/api/aurora/blog/posts/generate/` — `{"success":false,"error":{"message":"Title not found or already generated"}} `
- Likely root cause: Route missing/path mismatch in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts or src/app/api/v1/**/route.ts`

### [C] GET /api/aurora/blog/posts/history/?post_id=1
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/posts/history/?post_id=1` — `{"detail":"Not found."} `
- Next: `200` @ `/api/aurora/blog/posts/history/?post_id=1` — `{"post_id":1,"title":"Revolutionizing Marketing: How AI and SEO are Shaping the Future","total_versions":1,"history":[{"history_id":1,"history_date":"2026-02-07T00:42:51.865Z","his`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] GET /api/aurora/blog/posts/history/revision/?post_id=1&history_id=1
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/posts/history/revision/?post_id=1&history_id=1` — `{"detail":"Not found."} `
- Next: `200` @ `/api/aurora/blog/posts/history/revision/?post_id=1&history_id=1` — `{"history_id":1,"history_date":"2026-02-07T00:42:51.865Z","history_type":"~","history_user":null,"title_text":"Revolutionizing Marketing: How AI and SEO are Shaping the Future","se`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] POST /api/aurora/blog/posts/regenerate/
- Verdict: **broken**
- Django: `400` @ `/api/aurora/blog/posts/regenerate/` — `{"detail":"post_id is required."} `
- Next: `501` @ `/api/aurora/blog/posts/regenerate/` — `{"detail":"AI generation not yet migrated"} `
- Likely root cause: Endpoint not implemented in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts`

### [C] GET /api/aurora/blog/posts/share/?post_id=1
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/posts/share/?post_id=1` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `200` @ `/api/aurora/blog/posts/share/?post_id=1` — `{"share_url":"http://localhost:3000/apps/blog/preview/1?share_token=cG9zdDoxOmNvbXBhbnk6MTpleHA6MjAyNi0wMi0yMVQwMDo0MzozMS44MTRa","expires_at":"2026-02-21T00:43:31.814Z"} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [C] POST /api/aurora/blog/posts/sync/keywords/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/blog/posts/sync/keywords` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `401` @ `/api/aurora/blog/posts/sync/keywords` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [C] POST /api/aurora/blog/posts/sync/recommended/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/posts/sync/recommended/` — `[{"id":173,"title":"Exploring Quantum Computing: The Next Frontier in Tech Innovation","recommended_posts":[172,176,174]},{"id":172,"title":"Unlocking the Future: How AI is Reshapi`
- Next: `200` @ `/api/aurora/blog/posts/sync/recommended/` — `[{"id":1,"title":"Revolutionizing Marketing: How AI and SEO are Shaping the Future","recommended_posts":[1]}] `

### [C] POST /api/aurora/blog/posts/update-element/1/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/posts/update-element/1/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `401` @ `/api/aurora/blog/posts/update-element/1/` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [C] POST /api/aurora/blog/posts/update/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/posts/update/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `401` @ `/api/aurora/blog/posts/update/` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [C] POST /api/aurora/blog/posts/upload/
- Verdict: **broken**
- Django: `400` @ `/api/aurora/blog/posts/upload/` — `{"detail":"Currently only Elementor export method is supported"} `
- Next: `401` @ `/api/aurora/blog/posts/upload/` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [C] POST /api/aurora/blog/posts/upload/all
- Verdict: **broken**
- Django: `400` @ `/api/aurora/blog/posts/upload/all` — `{"detail":"Currently only Elementor export method is supported"} `
- Next: `401` @ `/api/aurora/blog/posts/upload/all` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [D] GET /api/aurora/analytics/blog/elements
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/analytics/blog/elements` — `{"total_posts":3,"element_counts":{"introduction":3,"image":6,"paragraph":9,"list_paragraph":3,"pros_and_cons":3,"faq":3,"conclusion":3,"featured_snippet_block":1},"total_elements_`
- Next: `200` @ `/api/aurora/analytics/blog/elements` — `[{"elementType":"INTRODUCTION","count":1},{"elementType":"CONCLUSION","count":1},{"elementType":"FAQ","count":1},{"elementType":"IMAGE","count":2},{"elementType":"PARAGRAPH","count`

### [E] POST /api/aurora/blog/schedule/bulk/
- Verdict: **broken**
- Django: `400` @ `/api/aurora/blog/schedule/bulk/` — `{"detail":"Bulk Schedule ID is required"} `
- Next: `201` @ `/api/aurora/blog/schedule/bulk/` — `{"id":3,"name":"Bulk","start_date":null,"interval_days":null,"created_at":"2026-02-07T00:43:33.854Z","companyId":1} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [E] POST /api/aurora/blog/schedule/bulk/assign/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/blog/schedule/bulk/assign` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `400` @ `/api/aurora/blog/schedule/bulk/assign/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"titleIds":["Invalid input: expected array, received undefined"],"bulkScheduleI`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [E] POST /api/aurora/blog/schedule/bulk/create/
- Verdict: **acceptable shape mismatch**
- Django: `200` @ `/api/aurora/blog/schedule/bulk/create/` — `{"id":14,"name":"Bulk","start_date":null,"interval_days":null,"created_at":"2026-02-07T00:43:33.638958Z","company":1} `
- Next: `201` @ `/api/aurora/blog/schedule/bulk/create/` — `{"id":1,"name":"Bulk","start_date":null,"interval_days":null,"created_at":"2026-02-07T00:43:33.742Z","companyId":1} `

### [E] POST /api/aurora/blog/schedule/bulk/remove/
- Verdict: **broken**
- Django: `403` @ `/api/aurora/blog/schedule/bulk/remove/` — `{"detail":"Some titles not found or access denied"} `
- Next: `400` @ `/api/aurora/blog/schedule/bulk/remove/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"titleIds":["Invalid input: expected array, received undefined"]}}}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [E] POST /api/aurora/blog/schedule/bulk/update/1/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/schedule/bulk/update/1/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `400` @ `/api/aurora/blog/schedule/bulk/update/1/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":["At least one field is required"],"fieldErrors":{}}}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [E] POST /api/aurora/blog/schedule/interval/
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/blog/schedule/interval/` — `{"detail":"Invalid date format"} `
- Next: `400` @ `/api/aurora/blog/schedule/interval/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"titleIds":["Invalid input: expected array, received undefined"],"startDate":["`

### [E] POST /api/aurora/blog/schedule/post/1/
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/blog/schedule/post/1/` — `{"detail":"Scheduled date is required"} `
- Next: `400` @ `/api/aurora/blog/schedule/post/1/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"date":["Invalid ISO datetime"]}}}} `

### [E] POST /api/aurora/blog/schedule/reschedule/1/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/schedule/reschedule/1/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `400` @ `/api/aurora/blog/schedule/reschedule/1/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"date":["Invalid ISO datetime"]}}}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [F] POST /api/aurora/blog/cta/add-cta/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/blog/cta/add-cta` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `404` @ `/api/aurora/blog/cta/add-cta/` — `{"success":false,"error":{"message":"CTA not found"}} `
- Likely root cause: Route missing/path mismatch in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts or src/app/api/v1/**/route.ts`

### [F] POST /api/aurora/blog/cta/campaign/create/
- Verdict: **exact match**
- Django: `201` @ `/api/aurora/blog/cta/campaign/create/` — `{"id":11,"name":"Campaign","company":1,"created_at":"2026-02-07T00:43:32.831971Z","updated_at":"2026-02-07T00:43:32.831978Z","ctas":[]} `
- Next: `201` @ `/api/aurora/blog/cta/campaign/create/` — `{"id":2,"name":"Campaign","companyId":1,"created_at":"2026-02-07T00:43:33.070Z","updated_at":"2026-02-07T00:43:33.070Z","ctas":[]} `

### [F] DELETE /api/aurora/blog/cta/campaign/delete/1/
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/cta/campaign/delete/1/` — `{"detail":"Not found."} `
- Next: `200` @ `/api/aurora/blog/cta/campaign/delete/1/` — `{"deleted":true} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [F] POST /api/aurora/blog/cta/campaign/edit/1/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/cta/campaign/edit/1/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `200` @ `/api/aurora/blog/cta/campaign/edit/1/` — `{"id":1,"name":"Campaign2","companyId":1,"created_at":"2026-02-07T00:43:31.335Z","updated_at":"2026-02-07T00:43:32.976Z","ctas":[]} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [F] POST /api/aurora/blog/cta/create/
- Verdict: **broken**
- Django: `415` @ `/api/aurora/blog/cta/create/` — `{"detail":"Unsupported media type \"application/json\" in request."} `
- Next: `400` @ `/api/aurora/blog/cta/create/` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"campaignId":["Invalid input: expected number, received undefined"],"image":["I`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [F] DELETE /api/aurora/blog/cta/delete/1/
- Verdict: **acceptable shape mismatch**
- Django: `404` @ `/api/aurora/blog/cta/delete/1/` — `{"detail":"CTA not found."} `
- Next: `404` @ `/api/aurora/blog/cta/delete/1/` — `{"success":false,"error":{"message":"CTA not found"}} `

### [F] POST /api/aurora/blog/cta/edit/1/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/cta/edit/1/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `404` @ `/api/aurora/blog/cta/edit/1/` — `{"success":false,"error":{"message":"CTA not found"}} `
- Likely root cause: Route missing/path mismatch in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts or src/app/api/v1/**/route.ts`

### [F] GET /api/aurora/blog/cta/list/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/cta/list/` — `[{"id":9,"name":"Summer Sale","company":1,"created_at":"2026-02-07T00:42:58.402654Z","updated_at":"2026-02-07T00:42:58.402676Z","ctas":[]},{"id":10,"name":"Parity Campaign","compan`
- Next: `200` @ `/api/aurora/blog/cta/list/` — `[] `

### [G] POST /api/aurora/blog/images/generate/
- Verdict: **broken**
- Django: `0` @ `/api/aurora/blog/images/generate/` — ` `
- Next: `200` @ `/api/aurora/blog/images/generate/` — `{"status":"Updated images for blog post: Revolutionizing Marketing: How AI and SEO are Shaping the Future","next_post_id":1,"image_generations_done":0,"image_generations_left":1,"t`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [G] POST /api/aurora/blog/images/regenerate/
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/blog/images/regenerate/` — `{"detail":"post_id is required."} `
- Next: `400` @ `/api/aurora/blog/images/regenerate/` — `{"success":false,"error":{"message":"post_id is required."}} `

### [G] POST /api/aurora/blog/images/save/edit
- Verdict: **broken**
- Django: `400` @ `/api/aurora/blog/images/save/edit` — `{"error": "No PNG version found"} `
- Next: `501` @ `/api/aurora/blog/images/save/edit` — `{"detail":"Not implemented yet"} `
- Likely root cause: Endpoint not implemented in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts`

### [G] GET /api/aurora/blog/images/stock_photos/search?query=test&page=1&per_page=2
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/images/stock_photos/search?query=test&page=1&per_page=2` — `{"page": 1, "per_page": 2, "total_results": 8000, "images": [{"id": 7845335, "width": 6308, "height": 4205, "url": "https://www.pexels.com/photo/two-people-having-a-meeting-in-the-`
- Next: `200` @ `/api/aurora/blog/images/stock_photos/search?query=test&page=1&per_page=2` — `{"page":1,"per_page":2,"total_results":8000,"images":[{"id":7845335,"width":6308,"height":4205,"url":"https://www.pexels.com/photo/two-people-having-a-meeting-in-the-office-7845335`

### [G] POST /api/aurora/blog/images/stock_photos/use
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/blog/images/stock_photos/use` — `{"detail":"post_id and image_url are required."} `
- Next: `400` @ `/api/aurora/blog/images/stock_photos/use` — `{"success":false,"error":{"message":"post_id and image_url are required."}} `

### [G] POST /api/aurora/blog/images/upload
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/blog/images/upload` — `{"detail":"post_id and image are required."} `
- Next: `400` @ `/api/aurora/blog/images/upload` — `{"success":false,"error":{"message":"multipart/form-data expected"}} `

### [H] GET /api/aurora/analytics/dictionary/general
- Verdict: **broken**
- Django: `404` @ `/api/aurora/analytics/dictionary/general` — `{"error":"No dictionary found for this company"} `
- Next: `200` @ `/api/aurora/analytics/dictionary/general` — `{"dictionaryCount":0,"wordCount":0,"definitionCount":0,"definitionCoverage":0} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [H] GET /api/aurora/dictionary/dictionaries/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/dictionary/dictionaries/` — `{"dictionaries":[]} `
- Next: `200` @ `/api/aurora/dictionary/dictionaries/` — `[] `

### [H] GET /api/aurora/dictionary/dictionary/1/
- Verdict: **acceptable shape mismatch**
- Django: `404` @ `/api/aurora/dictionary/dictionary/1/` — `{"detail":"Dictionary not found"} `
- Next: `404` @ `/api/aurora/dictionary/dictionary/1/` — `{"success":false,"error":{"message":"Dictionary not found"}} `

### [H] GET /api/aurora/dictionary/dictionary/1/word/1/
- Verdict: **acceptable shape mismatch**
- Django: `404` @ `/api/aurora/dictionary/dictionary/1/word/1/` — `{"detail":"Dictionary not found"} `
- Next: `404` @ `/api/aurora/dictionary/dictionary/1/word/1/` — `{"success":false,"error":{"message":"Dictionary not found"}} `

### [H] POST /api/aurora/dictionary/dictionary/export/
- Verdict: **broken**
- Django: `401` @ `/api/aurora/dictionary/dictionary/export/` — `{"detail":"API key is required"} `
- Next: `400` @ `/api/aurora/dictionary/dictionary/export/` — `{"success":false,"error":{"message":"dictionary_id is required"}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [H] POST /api/aurora/dictionary/dictionary/export/all
- Verdict: **acceptable shape mismatch**
- Django: `401` @ `/api/aurora/dictionary/dictionary/export/all` — `{"detail":"API key is required"} `
- Next: `401` @ `/api/aurora/dictionary/dictionary/export/all` — `{"success":false,"error":{"message":"Authentication required"}} `

### [H] POST /api/aurora/dictionary/dictionary/export/third-party/
- Verdict: **broken**
- Django: `400` @ `/api/aurora/dictionary/dictionary/export/third-party/` — `{"detail":"endpoint_url is required"} `
- Next: `501` @ `/api/aurora/dictionary/dictionary/export/third-party/` — `{"detail":"Not implemented yet"} `
- Likely root cause: Endpoint not implemented in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts`

### [H] POST /api/aurora/dictionary/dictionary/export/third-party/all/
- Verdict: **broken**
- Django: `400` @ `/api/aurora/dictionary/dictionary/export/third-party/all/` — `{"detail":"endpoint_url is required"} `
- Next: `501` @ `/api/aurora/dictionary/dictionary/export/third-party/all/` — `{"detail":"Not implemented yet (third-party export for all dictionaries)"} `
- Likely root cause: Endpoint not implemented in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts`

### [H] POST /api/aurora/dictionary/dictionary/upload/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/dictionary/dictionary/upload` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `200` @ `/api/aurora/dictionary/dictionary/upload/` — `{"status":"Dictionary upload prepared","payload":{"dictionary_id":1,"word":"x"}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [H] POST /api/aurora/dictionary/dictionary/upload/all
- Verdict: **broken**
- Django: `404` @ `/api/aurora/dictionary/dictionary/upload/all` — `{"detail":"Dictionary not found"} `
- Next: `200` @ `/api/aurora/dictionary/dictionary/upload/all` — `{"status":"Dictionary upload prepared for all dictionaries","dictionaries":[]} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [H] GET /api/aurora/dictionary/dictionary/words/delete
- Verdict: **broken**
- Django: `405` @ `/api/aurora/dictionary/dictionary/words/delete` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `400` @ `/api/aurora/dictionary/dictionary/words/delete` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"dictionaryId":["Invalid input: expected number, received undefined"],"ids":["I`
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [H] POST /api/aurora/dictionary/generation/definition/generate/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/dictionary/generation/definition/generate` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `401` @ `/api/aurora/dictionary/generation/definition/generate/` — `{"success":false,"error":{"message":"Authentication required"}} `
- Likely root cause: Auth/session mismatch in NextAuth
- Suggested fix file: `src/lib/auth.ts or src/app/api/auth/[...nextauth]/route.ts`

### [H] GET /api/aurora/dictionary/generation/definition/new/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/dictionary/generation/definition/new/` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `500` @ `/api/aurora/dictionary/generation/definition/new/` — `{"success":false,"error":{"message":"Internal server error"}} `
- Likely root cause: Next service/validator internal error
- Suggested fix file: `src/server/services/* + src/server/validators/*`

### [H] GET /api/aurora/dictionary/generation/keyword/new/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/dictionary/generation/keyword/new/` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `500` @ `/api/aurora/dictionary/generation/keyword/new/` — `{"success":false,"error":{"message":"Internal server error"}} `
- Likely root cause: Next service/validator internal error
- Suggested fix file: `src/server/services/* + src/server/validators/*`

### [H] GET /api/aurora/dictionary/generation/keywords/end/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/dictionary/generation/keywords/end/` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `500` @ `/api/aurora/dictionary/generation/keywords/end/` — `{"success":false,"error":{"message":"Internal server error"}} `
- Likely root cause: Next service/validator internal error
- Suggested fix file: `src/server/services/* + src/server/validators/*`

### [H] POST /api/aurora/dictionary/generation/keywords/review/
- Verdict: **broken**
- Django: `500` @ `/api/aurora/dictionary/generation/keywords/review` — `<!DOCTYPE html> <html lang="en"> <head>   <meta http-equiv="content-type" content="text/html; charset=utf-8">   <meta name="robots" content="NONE,NOARCHIVE">   <title>RuntimeError `
- Next: `400` @ `/api/aurora/dictionary/generation/keywords/review/` — `{"success":false,"error":{"message":"session_id, letter and accepted are required"}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [H] POST /api/aurora/dictionary/generation/keywords/start/
- Verdict: **acceptable shape mismatch**
- Django: `400` @ `/api/aurora/dictionary/generation/keywords/start/` — `{"detail":"Missing required fields"} `
- Next: `400` @ `/api/aurora/dictionary/generation/keywords/start/` — `{"success":false,"error":{"message":"Missing required fields"}} `

### [H] POST /api/aurora/dictionary/modify/1
- Verdict: **broken**
- Django: `405` @ `/api/aurora/dictionary/modify/1` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `404` @ `/api/aurora/dictionary/modify/1` — `{"success":false,"error":{"message":"Dictionary not found"}} `
- Likely root cause: Route missing/path mismatch in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts or src/app/api/v1/**/route.ts`

### [H] POST /api/aurora/dictionary/modify/word/1
- Verdict: **broken**
- Django: `405` @ `/api/aurora/dictionary/modify/word/1` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `400` @ `/api/aurora/dictionary/modify/word/1` — `{"success":false,"error":{"message":"Invalid request data","details":{"formErrors":[],"fieldErrors":{"dictionaryId":["Invalid input: expected number, received undefined"]}}}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [I] GET /api/aurora/blog/quillo/analyze/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/quillo/analyze/` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `500` @ `/api/aurora/blog/quillo/analyze/` — `{"success":false,"error":{"message":"Internal server error"}} `
- Likely root cause: Next service/validator internal error
- Suggested fix file: `src/server/services/* + src/server/validators/*`

### [I] GET /api/aurora/blog/quillo/analyze/chat
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/quillo/analyze/chat` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `500` @ `/api/aurora/blog/quillo/analyze/chat` — `{"success":false,"error":{"message":"Internal server error"}} `
- Likely root cause: Next service/validator internal error
- Suggested fix file: `src/server/services/* + src/server/validators/*`

### [I] POST /api/aurora/blog/quillo/post/autopilot-status/test-task/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/blog/quillo/post/autopilot-status/test-task/` — `{"detail":"Method \"POST\" not allowed."} `
- Next: `501` @ `/api/aurora/blog/quillo/post/autopilot-status/test-task/` — `{"task_id":"test-task","status":"not_available","detail":"Task queue not migrated"} `
- Likely root cause: Endpoint not implemented in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts`

### [I] POST /api/aurora/blog/quillo/post/autopilot/
- Verdict: **broken**
- Django: `400` @ `/api/aurora/blog/quillo/post/autopilot/` — `{"detail":"'blog_post_id' is required in the request body."} `
- Next: `501` @ `/api/aurora/blog/quillo/post/autopilot/` — `{"detail":"Task queue not migrated"} `
- Likely root cause: Endpoint not implemented in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts`

### [I] POST /api/aurora/blog/quillo/post/facebook
- Verdict: **broken**
- Django: `404` @ `/api/aurora/blog/quillo/post/facebook` — `{"error":"Blog post not found"} `
- Next: `0` @ `/api/aurora/blog/quillo/post/facebook` — ` `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [I] GET /api/aurora/company/quillo/
- Verdict: **broken**
- Django: `0` @ `/api/aurora/company/quillo/` — ` `
- Next: `404` @ `/api/aurora/company/quillo/` — `{"success":false,"error":{"message":"No analytics log found for this company"}} `
- Likely root cause: Route missing/path mismatch in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts or src/app/api/v1/**/route.ts`

### [I] GET /api/aurora/company/quillo/analyze/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/company/quillo/analyze/` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `404` @ `/api/aurora/company/quillo/analyze/` — `{"success":false,"error":{"message":"No analytics log found for this company"}} `
- Likely root cause: Route missing/path mismatch in Next
- Suggested fix file: `src/app/api/aurora/[...slug]/route.ts or src/app/api/v1/**/route.ts`

### [J] GET /api/aurora/analytics/blog/general
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/analytics/blog/general` — `{"total_blog_posts":{"value":3,"value_description":"The total number of blog posts created for your company.","computation_method":"Count of all blog posts associated with the comp`
- Next: `200` @ `/api/aurora/analytics/blog/general` — `{"totalPosts":1,"publishedPosts":0,"reviewedPosts":0,"statuses":[{"status":"GENERATED","count":1}],"categories":[{"id":3,"name":"Marketing Strategies","count":1},{"id":5,"name":"Di`

### [J] GET /api/aurora/analytics/blog/meta
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/analytics/blog/meta` — `{"avg_meta_description_length":174.0,"avg_seo_title_length":53.33,"focus_keyword_density_meta":0.19,"focus_keyword_density_seo_title":0.62,"oversized_seo_titles":[{"post_id":174,"t`
- Next: `200` @ `/api/aurora/analytics/blog/meta` — `{"totalPosts":1,"withMetaDescription":1,"withSeoTitle":1,"missingMetaDescription":0,"missingSeoTitle":0} `

### [J] GET /api/aurora/analytics/blog/readability
- Verdict: **broken**
- Django: `400` @ `/api/aurora/analytics/blog/readability` — `{"detail":"blog_post_id query parameter is required."} `
- Next: `200` @ `/api/aurora/analytics/blog/readability` — `{"average":null,"posts":[]} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [K] GET /api/aurora/ecommerce/blog/populate-product-recommendations/?blog_post_id=1
- Verdict: **acceptable shape mismatch**
- Django: `404` @ `/api/aurora/ecommerce/blog/populate-product-recommendations/?blog_post_id=1` — `{"error":"Blog Post not found"} `
- Next: `404` @ `/api/aurora/ecommerce/blog/populate-product-recommendations/?blog_post_id=1` — `{"success":false,"error":{"message":"No product recommendations found for this blog post"}} `

### [K] GET /api/aurora/ecommerce/products/import/
- Verdict: **broken**
- Django: `405` @ `/api/aurora/ecommerce/products/import/` — `{"detail":"Method \"GET\" not allowed."} `
- Next: `400` @ `/api/aurora/ecommerce/products/import/` — `{"success":false,"error":{"message":"products is required"}} `
- Likely root cause: Behavior mismatch
- Suggested fix file: `matching handler/service in Next`

### [L] GET /api/aurora/blog/focus-keywords/
- Verdict: **exact match**
- Django: `200` @ `/api/aurora/blog/focus-keywords/` — `["AI in SaaS","AI in technology","quantum computing","SaaS solutions","SaaS transformation"] `
- Next: `200` @ `/api/aurora/blog/focus-keywords/` — `["AI and SEO"] `
