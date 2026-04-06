export const BLOCK_SCHEMAS = {
  "meta_description": {
    "description": "This is automatically generated for each post",
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Short summary of the blog post for SEO purposes."
      }
    },
    "required": [
      "text"
    ]
  },
  "excerpt": {
    "description": "This is automatically generated for each post",
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Brief excerpt or summary of the blog post to capture readers' attention."
      }
    },
    "required": [
      "text"
    ]
  },
  "cover_image": {
    "description": "This is automatically generated for each post",
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL of the cover image"
      },
      "description": {
        "type": "string",
        "description": "Description of the cover image"
      }
    },
    "required": [
      "url",
      "description"
    ]
  },
  "introduction": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Provides an engaging start to the blog post, outlining what readers can expect."
      }
    },
    "required": [
      "text"
    ]
  },
  "image": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL of the image"
      },
      "description": {
        "type": "string",
        "description": "Description of the image"
      }
    },
    "required": [
      "url",
      "description"
    ]
  },
  "paragraph": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Title of the paragraph"
      },
      "text": {
        "type": "string",
        "description": "Basic text block for general content and information. Min 165 words. Should NEVER contain any list, that is what the list components are for, just plain text. ALWAYS use <br> for line breaks to make it readable. So should ALWAYS contain minimum two <br> tags. Also use <strong> and <em> tags."
      }
    },
    "required": [
      "title",
      "text"
    ]
  },
  "list_paragraph": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Title for the list."
      },
      "text_before_list": {
        "type": "string",
        "description": "Introductory text before the list."
      },
      "list_items": {
        "type": "array",
        "minItems": 4,
        "items": {
          "type": "string"
        },
        "description": "List items. Should NEVER contain any products, there is another component for that. So a example is if we have a title of a post that is 'Top 5 Funniest Quoutes for T-shirts.' we should NEVER put those items in this list."
      },
      "text_after_list": {
        "type": "string",
        "description": "Concluding text after the list."
      }
    },
    "required": [
      "text_before_list",
      "list_items",
      "text_after_list"
    ]
  },
  "quote": {
    "type": "object",
    "properties": {
      "quote": {
        "type": "string",
        "description": "The quote text. Make sure that the quote is a REAL quote and not something that you just made up."
      },
      "person": {
        "type": "string",
        "description": "Person who said the quote"
      },
      "description": {
        "type": "string",
        "description": "Short description of the person"
      }
    },
    "required": [
      "quote",
      "person",
      "description"
    ]
  },
  "numbered_list_paragraph": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Title for the list."
      },
      "text_before_list": {
        "type": "string",
        "description": "Introductory text before the numbered list."
      },
      "list_items": {
        "type": "array",
        "minItems": 4,
        "items": {
          "type": "string"
        },
        "description": "Numbered list items. Should NEVER contain any products, there is another component for that.So a example is if we have a title of a post that is 'Top 5 Funniest Quoutes for T-shirts.' we should NEVER put those items in this list."
      },
      "text_after_list": {
        "type": "string",
        "description": "Concluding text after the numbered list."
      }
    },
    "required": [
      "text_before_list",
      "list_items",
      "text_after_list"
    ]
  },
  "featured_snippet_block": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Title for the featured snippet block"
      },
      "text": {
        "type": "string",
        "description": "Text providing key insights or tips within the featured snippet block."
      }
    },
    "required": [
      "title",
      "text"
    ]
  },
  "faq": {
    "type": "array",
    "description": "Common questions related to the post and their answer",
    "minItems": 4,
    "items": {
      "type": "object",
      "properties": {
        "question": {
          "type": "string",
          "description": "What is the FAQ question?"
        },
        "answer": {
          "type": "string",
          "description": "The answer to the FAQ question."
        }
      },
      "required": [
        "question",
        "answer"
      ]
    }
  },
  "conclusion": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Summarizes the key points and wraps up the blog post effectively."
      }
    },
    "required": [
      "text"
    ]
  },
  "list_featured_snippet_block": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Title for the list featured snippet block"
      },
      "list": {
        "type": "array",
        "minItems": 4,
        "items": {
          "type": "string"
        },
        "description": "List of highlighted items in the featured snippet block"
      }
    },
    "required": [
      "title",
      "list"
    ]
  },
  "versus": {
    "description": "Use this to COMPARE two subjects, COMPARE!!!",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The main title for the versus comparison"
      },
      "competitors": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "minItems": 2,
        "maxItems": 2,
        "description": "Names of the two items being compared"
      },
      "criteria": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Name of the comparison criterion"
            },
            "winner": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1,
              "description": "Index of the winning competitor (0 or 1)"
            },
            "details": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "minItems": 2,
              "maxItems": 2,
              "description": "Details for each competitor for this criterion"
            }
          },
          "required": [
            "name",
            "winner",
            "details"
          ]
        },
        "minItems": 2,
        "description": "List of criteria for comparison"
      }
    },
    "required": [
      "title",
      "competitors",
      "criteria"
    ]
  },
  "table": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the table"
      },
      "text_before": {
        "type": "string",
        "description": "Optional text to display before the table"
      },
      "headers": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "minItems": 2,
        "maxItems": 5,
        "description": "The column headers for the table"
      },
      "rows": {
        "type": "array",
        "items": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 2,
          "maxItems": 5
        },
        "minItems": 1,
        "maxItems": 7,
        "description": "The rows of data in the table"
      },
      "text_after": {
        "type": "string",
        "description": "Optional text to display after the table"
      }
    },
    "required": [
      "title",
      "headers",
      "rows"
    ]
  },
  "pros_and_cons": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The main title for the pros and cons section"
      },
      "text_before": {
        "type": "string",
        "description": "Optional text to display before the pros and cons lists"
      },
      "pros": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "minItems": 1,
        "maxItems": 10,
        "description": "List of pros or advantages"
      },
      "cons": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "minItems": 1,
        "maxItems": 10,
        "description": "List of cons or disadvantages"
      },
      "text_after": {
        "type": "string",
        "description": "Optional text to display after the pros and cons lists"
      }
    },
    "required": [
      "title",
      "pros",
      "cons"
    ]
  },
  "product_recommendations": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the list e.g 'Best Products For [Insert activity]'"
      },
      "introduction": {
        "type": "string",
        "description": "Introduction to the list and the theme of the list."
      },
      "count": {
        "type": "integer",
        "description": "Number of products to recommend. (This block will be populated with products later) This number should ALWAYS reflect the title if the title, for example. If the title is '8 best products to wear in the office' this number should be 8. If the title does not include a number it can be between 5-10."
      },
      "niche": {
        "type": "string",
        "description": "Broad niche for filtering choose between one of the following: 'Funny', 'Humor', 'Summer', 'Winter', 'Teacher', 'School', 'Patriot'. Should ONLY be one of the atlernatives above."
      },
      "age": {
        "type": "string",
        "description": "Audience age group. MUST be one of: 'Baby', 'Toddler', 'Kids', 'Adult'. This is a demographic descriptor, NOT a freshness filter."
      },
      "recency_days": {
        "type": "integer",
        "description": "Optional. If set, only consider products whose created_at is within the last N days. Leave unset to include all products regardless of age."
      }
    },
    "required": [
      "title",
      "introduction",
      "count",
      "niche",
      "age"
    ]
  },
  "affiliate_recommendations": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the list e.g. 'Best Services for [Insert Purpose]'"
      },
      "introduction": {
        "type": "string",
        "description": "Introduction to the list and the theme of the list."
      },
      "count": {
        "type": "integer",
        "description": "Number of services to recommend. (This block will be populated with services later) This number should ALWAYS reflect the title. For example, if the title is '8 Best VPN Services for 2024', this number should be 8. If the title does not include a number, it can be between 5-10."
      },
      "filter": {
        "type": "string",
        "description": "Broad filter for selecting the type of services. Choose between one of the following: 'Best', 'Cheap', 'Premium', 'Top-Rated', 'Reliable'. Should ONLY be one of the alternatives above."
      }
    },
    "required": [
      "title",
      "introduction",
      "count",
      "filter"
    ]
  },
  "checklist": {
    "type": "object",
    "description": "Schema for a checklist component that provides actionable items for the reader.",
    "properties": {
      "title": {
        "type": "string",
        "description": "Title of the checklist, summarizing the purpose of the actions."
      },
      "introduction": {
        "type": "string",
        "description": "Introduction to the checklist, providing context on why these actions are important."
      },
      "items": {
        "type": "array",
        "description": "List of actionable items for the reader.",
        "items": {
          "type": "object",
          "properties": {
            "action": {
              "type": "string",
              "description": "The specific action item that the reader should take."
            },
            "details": {
              "type": "string",
              "description": "Additional details or tips about the action item."
            }
          },
          "required": [
            "action"
          ]
        },
        "minItems": 1
      },
      "conclusion": {
        "type": "string",
        "description": "Optional concluding statement or call to action after the checklist."
      }
    },
    "required": [
      "title",
      "items"
    ]
  },
  "timeline": {
    "type": "object",
    "description": "Schema for displaying a chronological sequence of events",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the timeline section"
      },
      "text_before": {
        "type": "string",
        "description": "Optional introductory text before the timeline"
      },
      "events": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "date": {
              "type": "string",
              "description": "The date or time period of the event"
            },
            "title": {
              "type": "string",
              "description": "Title of the event"
            },
            "description": {
              "type": "string",
              "description": "Detailed description of what happened during this event"
            }
          },
          "required": [
            "date",
            "title",
            "description"
          ]
        },
        "minItems": 3,
        "maxItems": 10,
        "description": "Array of chronological events to display"
      },
      "text_after": {
        "type": "string",
        "description": "Optional concluding text after the timeline"
      }
    },
    "required": [
      "events"
    ]
  },
  "bar_chart": {
    "type": "object",
    "description": "Displays a simple animated bar chart with fixed styling",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the chart"
      },
      "text_before": {
        "type": "string",
        "description": "Optional text to display before the chart"
      },
      "text_after": {
        "type": "string",
        "description": "Optional text to display after the chart"
      },
      "bars": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "label": {
              "type": "string",
              "description": "Label for the bar (shown below it)"
            },
            "value": {
              "type": "number",
              "minimum": 0,
              "maximum": 100,
              "description": "Value for the bar height (0-100)"
            }
          },
          "required": [
            "label",
            "value"
          ]
        },
        "minItems": 2,
        "maxItems": 8,
        "description": "The bars to display in the chart"
      }
    },
    "required": [
      "title",
      "bars"
    ]
  },
  "case_study": {
    "type": "object",
    "description": "Schema for a case study component that showcases real-world examples of success.",
    "properties": {
      "title": {
        "type": "string",
        "description": "The main title of the case study, highlighting the key achievement."
      },
      "clientName": {
        "type": "string",
        "description": "Name of the company or client featured in the case study."
      },
      "industry": {
        "type": "string",
        "description": "The industry or sector the client operates in."
      },
      "companyWebsite": {
        "type": "string",
        "description": "The official website URL of the featured company."
      },
      "headerColor": {
        "type": "string",
        "description": "Hex color code for the header background (e.g., '#FF7A59' for orange)."
      },
      "challenge": {
        "type": "string",
        "description": "A brief description of the problem or challenge the client faced."
      },
      "solution": {
        "type": "string",
        "description": "A concise explanation of the solution implemented to address the challenge."
      },
      "results": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "List of key results or achievements from implementing the solution."
      },
      "testimonial": {
        "type": "object",
        "properties": {
          "quote": {
            "type": "string",
            "description": "A direct quote from the client about the impact of the solution."
          },
          "author": {
            "type": "string",
            "description": "Name and title of the person providing the testimonial."
          }
        },
        "required": [
          "quote",
          "author"
        ],
        "additionalProperties": false
      }
    },
    "required": [
      "title",
      "clientName",
      "industry",
      "companyWebsite",
      "headerColor",
      "challenge",
      "solution",
      "results",
      "testimonial"
    ],
    "additionalProperties": false
  },
  "statistic": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title or context of the statistic"
      },
      "percentage": {
        "type": "integer",
        "minimum": 0,
        "maximum": 100,
        "description": "The statistical percentage value (0-100)"
      },
      "description": {
        "type": "string",
        "description": "Additional details or interpretation of the statistic"
      }
    },
    "required": [
      "title",
      "percentage",
      "description"
    ]
  },
  "code_cluster": {
    "type": "object",
    "description": "Schema for a code cluster block that represents a code tutorial or guide",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the code guide or tutorial"
      },
      "description": {
        "type": "string",
        "description": "A detailed description of what the code tutorial will cover, including its purpose, key concepts, and expected outcomes"
      }
    },
    "required": [
      "title",
      "description"
    ]
  },
  "tool_recommendation": {
    "type": "object",
    "description": "Schema for recommending a tool or software product",
    "properties": {
      "title": {
        "type": "string",
        "description": "The name or title of the recommended tool"
      },
      "companyUrl": {
        "type": "string",
        "description": "The URL of the company's website or the tool's landing page"
      },
      "pricing": {
        "type": "string",
        "description": "Brief description of the pricing model (e.g., 'Free', '$10/month', 'Starting at $99/year')"
      },
      "productDescription": {
        "type": "string",
        "description": "A detailed description of the tool, including its key features, benefits, and use cases"
      },
      "headerColor": {
        "type": "string",
        "description": "Hex color code for the header background (e.g., '#FF7A59' for orange)"
      },
      "features": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "minItems": 1,
        "description": "An array of key features or benefits of the tool"
      }
    },
    "required": [
      "title",
      "companyUrl",
      "pricing",
      "productDescription",
      "headerColor",
      "features"
    ]
  }
} as const;

export type BlockSchemaKey = keyof typeof BLOCK_SCHEMAS;
