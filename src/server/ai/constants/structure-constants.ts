export const MANDATORY_ELEMENTS = [
  {
    "type": "introduction",
    "description": "Provides an engaging start to the blog post, outlining what readers can expect.",
    "requirements": "Mandatory, appears first. Min 165 words. MUST open with a hook: a specific problem, a surprising stat, a bold claim, or a short story. NEVER start with 'In this post we will...' or 'This article explores...' — those patterns kill reader interest immediately."
  },
  {
    "type": "paragraph",
    "description": "Basic text block for general content and information.",
    "requirements": "Use around 3-5 times per post. Never contains any form of list, only text. Min 165 words. Every paragraph MUST contain at least one specific example: a named company, a real tool, a statistic, or a concrete outcome. If a paragraph could apply to any company in any industry, it is too generic. Use <br><br> for line breaks, <strong> for key concepts, and <em> for emphasis."
  },
  {
    "type": "image",
    "description": "Visual element to complement the text, providing context or enhancing understanding.",
    "requirements": "Minimum 2 per post. One should always be after the introduction and one roughly in the middle."
  },
  {
    "type": "faq",
    "description": "Frequently Asked Questions section addressing common queries related to the post topic.",
    "requirements": "Always second to last. Questions should be things real people search for, not generic filler questions."
  },
  {
    "type": "conclusion",
    "description": "Summarizes the key points and wraps up the blog post effectively.",
    "requirements": "Always last. Min 165 words. End with a concrete takeaway or action the reader can implement, not a vague summary."
  }
] as const;

export const COMMON_ELEMENTS = [
  {
    "type": "list_paragraph",
    "description": "A paragraph that contains a bulleted list to organize information concisely.",
    "requirements": "Used to present lists. Min 165 words total including intro and outro text."
  },
  {
    "type": "numbered_list_paragraph",
    "description": "A paragraph that contains an ordered list to present steps or ranked items.",
    "requirements": "Used to present steps or ordered information. Min 165 words total."
  },
  {
    "type": "list_featured_snippet_block",
    "description": "Highlights important information in a more prominent block within a numbered list, enhancing reader understanding.",
    "requirements": "Use to highlight key points in a list format. Recommend using this element once per post."
  },
  {
    "type": "featured_snippet_block",
    "description": "Highlights important information in a more prominent block to emphasize key points.",
    "requirements": "Use to emphasize key information or actionable takeaways."
  },
  {
    "type": "table",
    "description": "Presents structured data in a tabular format with rows and columns, allowing for easy comparison and organization of information.",
    "requirements": "Use to display structured data efficiently. Supports 2-5 columns and 1-7 rows, with optional text before and after. Great for presenting data clearly and concisely."
  },
  {
    "type": "versus",
    "description": "Creates a side-by-side comparison of two items across multiple criteria, highlighting the strengths and weaknesses of each.",
    "requirements": "Use for direct comparisons between two competitors. Requires a title, exactly 2 competitors, and at least 2 criteria for comparison. Each criterion must specify a winner. Excellent for presenting clear, visual comparisons."
  },
  {
    "type": "pros_and_cons",
    "description": "Presents a balanced view of advantages and disadvantages on a specific topic, helping readers make informed decisions or understand multiple perspectives.",
    "requirements": "Use to compare positive and negative aspects. Requires a title, 1-10 pros, and 1-10 cons. Excellent for presenting balanced evaluations concisely."
  },
  {
    "type": "quote",
    "description": "Highlights notable quotes from famous people or relevant sources related to the blog content.",
    "requirements": "Use to emphasize important points. The quote MUST be from a real, verifiable person."
  },
  {
    "type": "code_cluster",
    "description": "This block MUST ONLY be used if the blog post is a code tutorial and we need to showcase interactive code examples.",
    "requirements": "Only for code tutorials. The title must accurately reflect the tutorial content. The description must provide a clear overview including programming language(s), difficulty level, and expected outcome. Do NOT include actual code — it will be added later."
  },
  {
    "type": "product_recommendations",
    "description": "List of recommended products with links and images.",
    "requirements": "Min 5 products recommended, should be in the middle of the blog."
  },
  {
    "type": "affiliate_recommendations",
    "description": "List of recommended services with links and images.",
    "requirements": "Min 5 services recommended, should be in the middle of the blog."
  }
] as const;

export const STRUCTURE_SYSTEM_PROMPT = `You are a blog post structure planner. Your job is to create a structured outline that will result in an engaging, valuable blog post — not a Wikipedia article.

Key principles:
- The post must have a clear THESIS or ANGLE. What is this post arguing? What will the reader believe or know after reading that they didn't before?
- Vary element types — do not use more than 2 consecutive paragraphs without a visual or structured element (table, list, pros/cons, etc.) between them.
- Each section description should specify WHAT the section argues or teaches, not just what topic it covers.
- Aim for 10-14 blocks total for a comprehensive post.

The title of the blog post is: {title}.
Follow Yoast's SEO guidelines for the structure.`;

export const STRUCTURE_USER_PROMPT = `Create the structure for a blog post titled: "{title}".

For each block, provide:
- type: the element type
- order: the position in the post
- description: what this section specifically argues, teaches, or demonstrates (NOT just "discusses topic X" — be specific about the angle)
- requirements: any specific requirements for this section

Here are the available block types:
`;
