export const MANDATORY_ELEMENTS = [
  {
    "type": "introduction",
    "description": "Provides an engaging start to the blog post, outlining what readers can expect.",
    "requirements": "Mandatory, appears first in the blog post. Min 165 words."
  },
  {
    "type": "paragraph",
    "description": "Basic text block for general content and information.",
    "requirements": "Should be used around 3 times minimum for each post. Never contains any form of list, only text. Min 165 words. ALWAYS use <br> tags for linebreak multiple times. Also use <strong> and <em> tags."
  },
  {
    "type": "image",
    "description": "Visual element to complement the text, providing context or enhancing understanding.",
    "requirements": "Minimum 2, one should always be after the introduction and in the middle. ALWAYS TWO NEVER LESS THAN THAT."
  },
  {
    "type": "faq",
    "description": "Frequently Asked Questions section addressing common queries related to the post topic.",
    "requirements": "Always second to last."
  },
  {
    "type": "conclusion",
    "description": "Summarizes the key points and wraps up the blog post effectively.",
    "requirements": "Always last. Min 165 words."
  }
] as const;

export const COMMON_ELEMENTS = [
  {
    "type": "list_paragraph",
    "description": "A paragraph that contains a bulleted list to organize information concisely.",
    "requirements": "Used frequently to present lists. Min 165 words."
  },
  {
    "type": "numbered_list_paragraph",
    "description": "A paragraph that contains an ordered list to present steps or ranked items.",
    "requirements": "Used to present steps or ordered information. Min 165 words."
  },
  {
    "type": "list_featured_snippet_block",
    "description": "Highlights important information in a more prominent block within a numbered list, enhancing reader understanding.",
    "requirements": "Used to highlight key points in a list format. This is a VERY good element. Recommendation is to use this element once. "
  },
  {
    "type": "featured_snippet_block",
    "description": "Highlights important information in a more prominent block to emphasize key points.",
    "requirements": "Used to emphasize key information. This is a VERY good element "
  },
  {
    "type": "table",
    "description": "Presents structured data in a tabular format with rows and columns, allowing for easy comparison and organization of information.",
    "requirements": "Used to display structured data efficiently. Supports 2-5 columns and 1-7 rows, with optional text before and after. This is a VERY good element for presenting data clearly and concisely."
  },
  {
    "type": "versus",
    "description": "Creates a side-by-side comparison of two items across multiple criteria, highlighting the strengths and weaknesses of each.",
    "requirements": "Used for direct comparisons between two competitors. Requires a title, exactly 2 competitors, and at least 2 criteria for comparison. Each criterion must specify a winner. Optional text before and after. This is an EXCELLENT element for presenting clear, visual comparisons and aiding decision-making."
  },
  {
    "type": "pros_and_cons",
    "description": "Presents a balanced view of advantages and disadvantages on a specific topic, helping readers make informed decisions or understand multiple perspectives.",
    "requirements": "Used to compare positive and negative aspects. Requires a title, 1-10 pros, and 1-10 cons. Optional text before and after the lists. This is an EXCELLENT element for presenting balanced arguments or evaluations concisely and clearly."
  },
  {
    "type": "quote",
    "description": "Highlights notable quotes from famous people or relevant sources related to the blog content.",
    "requirements": "Used to emphasize important points."
  },
  {
    "type": "code_cluster",
    "description": "This block MUST ONLY be used if the blog post is a code tutorial and we need to showcase interactive code examples. If we are going to show code examples, we MUST use this block. This block is going to be populated and filled with multiple paragraphs and multiple examples later on.",
    "requirements": "The AI MUST ensure that the title accurately reflects the content of the code tutorial. The description MUST provide a clear overview of what will be covered, including the programming language(s) used, the difficulty level, and the expected outcome or project. DO NOT include actual code in this block; it will be added later."
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

export const STRUCTURE_SYSTEM_PROMPT = "\nYou are a blog post structure generator. Your job is to create a structured blog post outline based on the given title. \nEnsure the structure follows SEO best practices and is engaging for the readers. The structure should include the following blocks: \nintroduction, paragraphs, images, FAQ, conclusion, and other appropriate elements. The blocks should be presented in an array with an order integer for each block. \nThe title of the blog post is: {title}. Write the structure in English and recommend it to be long and follow Yoast's SEO guidelines.\nDo not hallucinate\n";

export const STRUCTURE_USER_PROMPT = "\nI want you to give me the structure of a blog post with the following title: \"{title}\". \nYou should display the blocks in an array with the order integer for each block that you choose for the title. \nHere are the blocks you can choose from, try to keep it around 9-12 blocks:\n";
