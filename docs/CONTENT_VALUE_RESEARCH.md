# Research: How to Make AI Blog Posts That Actually Bring Value

Based on research from SurferSEO, Animalz, Andrew Chen, Exploding Topics, and Google's Helpful Content guidelines.

---

## The Core Problem

The parity blog post Julius flagged is a textbook example of what the industry calls **"AI slop"** — content that is:

- Technically correct but says nothing new
- Completely abstract — zero specific companies, tools, data, or examples
- Written in the same monotone corporate rhythm throughout
- Stuffed with the focus keyword in every paragraph
- Structured like a Wikipedia article, not a blog someone would choose to read

**The root cause:** The prompt asks the model to "generate content" but gives it nothing original to work with — no data, no opinions, no examples, no angle. The model fills the gap with the safest, most generic text it can produce.

---

## Key Concept: Information Gain

Google has a patent (2020) and ranking signal called **"information gain"** — it measures how much NEW information a piece of content adds compared to what's already published on the topic.

**This is now critical because:**
- AI Overviews synthesize from multiple sources — content that just repeats what others say gets absorbed without attribution
- Google rewards content that adds something you can't find elsewhere
- The "comprehensive guide" approach (cover everything broadly) is dead — AI already does that

**What counts as information gain:**
1. Original data, surveys, benchmarks
2. First-hand experience and case studies
3. Expert quotes and interviews
4. Strong opinions with reasoning
5. Specific examples with names, numbers, outcomes
6. Content for a narrow audience (not "everyone")

---

## 3 Reasons AI Content Becomes Slop (SurferSEO)

### 1. Weak Inputs
If you don't give AI new perspective, it repeats training data. You need to feed it facts, data, real examples, and opinions. Even a single paragraph of original input transforms the output.

### 2. Vague Prompts
"Write an article about X" lets AI fill in all the blanks — and it always fills them with the safest, most generic choices. You need to specify:
- What angle/thesis to take
- Which points matter and which don't
- What the conclusion should be
- What NOT to include

### 3. No Human in the Loop
Raw AI output published directly = robotic content with:
- Unchecked facts and hallucinated statistics
- No narrative arc (fragments of thought, not arguments)
- The "AI voice" (clichés, overpolished tone, corporate jargon)

---

## What Makes Blog Content Actually Valuable

### 1. A Thesis / Point of View
Every good blog post argues something. Not "here's everything about topic X" but "here's what I believe about X, and here's why."

**Bad:** "Parity in SaaS is important for many reasons"
**Good:** "Most teams waste 6 months chasing feature parity they don't need — here's how to know what actually matters"

### 2. Specific, Named Examples
The parity post has ZERO named companies besides Nordtools. Good content names names:

**Bad:** "Many companies have achieved success through parity strategies"
**Good:** "When Notion launched, they were years behind Confluence on features. Instead of chasing parity, they focused on UX simplicity — and overtook them in user growth by 2022."

### 3. Real Data and Numbers
**Bad:** "Studies show that parity can improve customer retention"
**Good:** "A 2024 Gartner survey of 200 SaaS buyers found that 67% eliminated vendors during evaluation for missing exactly 3 specific features: SSO, API access, and audit logs"

### 4. Actionable Frameworks (Not Abstract Theory)
**Bad:** "Teams should evaluate their parity needs carefully"
**Good:** "Here's a 4-question test we use at Nordtools: (1) Have we lost a deal in the last 90 days because of this missing feature? (2) Do our top 10 accounts mention it? ..."

### 5. Conversational, Varied Prose
**Bad:** "Parity in SaaS is a strategic consideration. Organizations must evaluate their competitive positioning. This requires careful analysis of market dynamics."
**Good:** "Here's the thing about feature parity: it feels safe. Your competitor has it, so you should too — right? Not always. Sometimes parity is a trap."

---

## How This Changes the Prompt Architecture

### The fundamental shift

The current prompt says: "Generate content for this structure"
It should say: "Write a blog post that teaches the reader something they didn't know, using specific examples and a clear point of view"

### What the system prompt needs:

```
You are a senior content writer who specializes in {industry}. You write 
for {audience} — people who already understand the basics and want 
actionable, specific advice.

Your writing philosophy:
- Every paragraph must teach something specific. If a paragraph could 
  apply to any company in any industry, it's too generic — rewrite it.
- Name real companies, tools, and people. Use specific numbers and 
  outcomes. "Companies have found success" is never acceptable — say 
  WHO found success and HOW MUCH.
- Take a position. Don't present all sides equally — argue for what 
  you believe works based on evidence.
- Write like you're explaining to a smart colleague over coffee, not 
  presenting to a boardroom.

Structure rules:
- The introduction must hook with a surprising fact, a contrarian take,  
  or a specific problem the reader recognizes. NEVER start with "In 
  this post we'll explore..." or any variation.
- Each section should build an argument, not just describe a concept.
  Bad: "What is X" → Good: "Why X matters more than you think"
- End sections with a concrete takeaway, not a summary sentence.

Style rules:
- Mix short sentences (under 8 words) with longer ones.
- Use "you" and "your" to address the reader directly.
- Use rhetorical questions sparingly (1-2 per post).
- Start some sentences with "But", "And", or "So" for natural flow.
- Vary paragraph length — some 2 sentences, some 5.

What to avoid:
- Abstract corporate language ("leverage", "strategic positioning", 
  "stakeholder alignment")
- Filler sentences that don't add information ("It's worth noting 
  that...", "It goes without saying...")
- The pattern of: define term → explain importance → suggest action. 
  This is the most common AI writing structure. Break it.
- Keyword stuffing — use the focus keyword naturally 4-6 times total, 
  not in every paragraph.
```

### What the user prompt needs:

The current user prompt just passes title + focus keyword. It should also pass:

1. **A thesis/angle** — what's the post arguing? (Could be auto-generated in structure phase)
2. **2-3 example companies/tools** relevant to the topic (could be web-searched)
3. **A target reader description** — not "business professionals" but "SaaS product managers evaluating their next roadmap quarter"
4. **What the reader should be able to DO after reading** — the actionable outcome

### The pipeline change:

```
CURRENT:
  Title → Structure → Content (single shot)

PROPOSED:
  Title → Thesis generation (what's the angle?)
        → Example research (find 3-5 real companies/data points)
        → Structure (with thesis + examples baked in)
        → Content (with thesis, examples, audience, and action as context)
        → Self-critique ("is this specific enough? does every paragraph 
           teach something new?")
        → Refinement
```

The thesis and example research steps are the key additions — they give the content generation step the **original input** it desperately lacks.

---

## Concrete Example: The Parity Post Rewritten

### Current intro:
> "The phrase 'parity in SaaS' gets thrown around in product meetings..."

### Better intro:
> "Last quarter, a Series B SaaS company lost a $400K enterprise deal because they didn't have SAML SSO. Their product was better in every way that mattered — faster, cheaper, more intuitive. But the buyer's security checklist had SSO as a hard requirement, and that was that. This is what feature parity actually looks like in practice: not a strategic framework, but a single checkbox that kills a deal."

The difference: **specific**, **story-driven**, **creates tension**, **makes the reader think "that could be me."**

---

## Implementation Priority for Aurora

1. **Add thesis generation step** before content generation — have the smart model generate an angle/argument for the topic
2. **Add the specificity instructions** to the system prompt — "name real companies, use real numbers"
3. **Kill the intro pattern** — explicit instruction to never use "In this post..."
4. **Reduce keyword frequency** from "MOST IMPORTANT" to "use 4-6 times naturally"
5. **Add a self-critique step** that specifically checks: "Does every paragraph contain at least one specific example, number, or named company?"
6. **Long-term:** Add web search to the pipeline so the model can find real data points and examples before writing
