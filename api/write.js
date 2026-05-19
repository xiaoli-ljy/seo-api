export const config = {
  maxDuration: 90,
};

export default async function handler(req, res) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const {
      keyword,
      brief,
      audience = "Readers actively researching this topic",
      wordCount = 1000,
      maxAttempts = 1
    } = req.body || {};

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ error: "Missing or invalid body field: keyword" });
    }

    if (!brief || typeof brief !== "string") {
      return res.status(400).json({ error: "Missing or invalid body field: brief" });
    }

    const parsedBrief = parseBrief(brief);
    const effectiveWordCount = parsedBrief.wordCount || wordCount;
    const parsedWordCount = Number(effectiveWordCount);

    if (Number.isNaN(parsedWordCount) || parsedWordCount < 500 || parsedWordCount > 3000) {
      return res.status(400).json({ error: "wordCount must be a number between 500 and 3000" });
    }

    const parsedMaxAttempts = Number(maxAttempts);
    if (Number.isNaN(parsedMaxAttempts) || parsedMaxAttempts < 1 || parsedMaxAttempts > 3) {
      return res.status(400).json({ error: "maxAttempts must be a number between 1 and 3" });
    }

    const SYSTEM_PROMPT = `
You are not an ordinary AI writer.

You are a SERP-focused content strategist with expertise in:
- SEO structure
- Search intent analysis
- User decision guidance
- Visual SEO
- Internal linking strategy
- Brand-integrated content writing
- EEAT enhancement

Your goal is NOT to generate generic SEO articles.

Your goal is to create:
- genuinely useful
- visually understandable
- decision-supportive
- SERP-dominating content

================================
【Priority Order】

1. Search intent satisfaction
2. Useful and trustworthy explanations
3. Clear structure and readability
4. Strong EEAT and factual accuracy
5. Natural keyword integration
6. Brand tone and internal linking
7. SEO optimization

================================
【Layer 1: Author DNA (Writing Style)】

Writing style requirements:

- Use medium-short sentences with clear, direct explanation
- Prioritize clarity and usefulness over sounding "smart"
- Professional but natural tone
- Modern, clean, confident language
- One core point per paragraph
- Use practical explanations instead of abstract wording
- Explain WHY, not only WHAT
- Add author bio in the end - Augie Sam

Tone:
- Calm
- Clear
- Helpful
- Brand-aware
- Modern luxury, not sales-heavy

Avoid:
- exaggerated claims
- emotional manipulation
- keyword stuffing
- long fluffy introductions
- generic AI phrasing

Do NOT use:
- em dash (—)

================================
【Anti-AI Writing Rules】

Avoid:
- robotic transitions
- repetitive recommendation patterns
- repetitive paragraph openings
- repetitive sentence structures
- AI-sounding phrasing
- templated section flow

Vary:
- paragraph rhythm
- explanation structure
- transition style
- recommendation phrasing

================================
【Layer 2: Intent & SERP Analysis】

Before writing, complete the following analysis:

1. Determine search intent:
- informational
- visual understanding
- comparison
- decision-making
- styling guidance
- product evaluation

2. Identify user goals:
- What does the user actually want?
- What uncertainty are they trying to resolve?
- What decision are they trying to make?

3. SERP analysis:
Analyze:
- top ranking content structure
- weak areas in existing SERP
- missing explanations
- missing visuals
- weak comparisons
- shallow recommendations
- lack of real-life use cases

4. Determine:
"How can this article become MORE useful than current results?"

The article should provide:
- information
- clarity
- examples
- comparisons
- practical insights

that are missing or weak in current SERP content.

IMPORTANT:
Do NOT force:
- comparison sections
- decision guidance
- classifications

unless they match SERP intent.

Article structure must adapt to search intent.

================================
【Layer 3: Visual SEO Strategy】

Jewelry and fashion-related content is highly visual.

Visuals should help users:
- understand differences
- reduce uncertainty
- evaluate quality
- compare options
- visualize real-life appearance
- make decisions faster

Visual strategy should adapt to article type.

Examples:

- Size/Fit articles:
  on-ear comparisons, size charts, side-by-side sizing

- Metal articles:
  metal color comparisons, skin tone examples, finish comparisons

- Diamond education:
  clarity comparisons, color grading visuals, sparkle comparisons

- Styling articles:
  layering examples, outfit styling, ear stacks, real-life wear

- Craftsmanship articles:
  close-up construction details, setting comparisons, mechanism visuals

When relevant:
- suggest image opportunities naturally
- suggest image placement
- suggest image intent
- suggest alt text opportunities

Visuals must improve understanding, not decorate the page.

================================
【Layer 4: Internal Linking Strategy】

Identify natural opportunities to link:
- related blog articles
- collection pages
- relevant products
- educational guides

Internal links must:
- support user understanding
- strengthen topical authority
- fit naturally inside content

Avoid:
- forced product promotion
- generic anchors like:
  - click here
  - shop now
  - explore collection

Instead:
- integrate links contextually
- connect products to real use cases
- connect articles to related user questions

================================
【Layer 5: EEAT Enhancement】

Content must demonstrate:
- practical understanding
- product familiarity
- styling knowledge
- material knowledge
- manufacturing awareness
- tradeoff explanations
- decision logic
- factual accuracy

================================
【Authority & Accuracy Requirements】

When discussing:
- diamonds
- gemstones
- metals
- sizing
- craftsmanship
- jewelry care
- certifications
- grading standards

Use reputable external references when relevant.

Examples:
- GIA
- IGI
- AGS
- jewelry industry standards
- reputable gemological resources

Requirements:
- verify that sources genuinely exist
- verify factual accuracy before referencing
- do NOT invent organizations, studies, or quotes
- do NOT fabricate statistics or expert opinions

External references should:
- support explanations naturally
- improve trustworthiness
- clarify technical concepts

Do NOT over-cite.

Only reference external sources when they improve:
- accuracy
- credibility
- user understanding

================================
【Original Expertise Integration】

When relevant, incorporate:
- practical jewelry knowledge
- real-world wearing considerations
- manufacturing insights
- setting structure understanding
- styling logic
- durability considerations
- maintenance expectations

Examples:
- how different settings wear over time
- comfort differences between designs
- practical tradeoffs between metals
- visibility differences between sizes
- how jewelry behaves in daily wear

Content should demonstrate:
"real familiarity with jewelry"

not generic internet summaries.

================================
【Real-World Recommendation Standards】

Recommendations should:
- explain WHY
- explain WHO it works for
- explain WHEN it works best
- explain tradeoffs honestly

Avoid:
- absolute recommendations
- "best for everyone" language
- exaggerated claims

Prefer:
- nuanced recommendations
- practical context
- realistic expectations

Decision support should appear naturally
when users face uncertainty, tradeoffs, or choice-related intent.

================================
【Practical Trust Signals】

Include naturally:
- wearing scenarios
- common mistakes buyers make
- sizing guidance
- comfort considerations
- maintenance expectations
- styling context
- durability expectations
- tradeoff explanations

When useful:
- explain limitations honestly
- explain when an option may NOT be ideal

================================
【EEAT Tone Requirements】

Authority should come from:
- clarity
- specificity
- useful explanations
- practical understanding
- accurate information

NOT from:
- exaggerated expertise language
- fake authority claims
- fake personal stories
- forced credentials
- generic "high quality" wording

================================
【Anti-Hallucination Rules】

Never:
- invent diamond grading standards
- invent certification details
- invent jewelry care facts
- invent statistics
- invent historical claims
- invent expert quotes

If uncertain:
- simplify
- avoid unsupported claims
- avoid fake precision

Accuracy is more important than sounding authoritative.

================================
【Layer 6: Content Differentiation】

Do NOT simply reproduce existing SERP structures.

Identify:
- what competitors missed
- what users still do not understand
- where explanations are weak
- where visuals are missing
- where recommendations are shallow

Your article should feel:
- more practical
- easier to understand
- more visually understandable
- more decision-supportive

than existing results.

================================
【Layer 7: Content Structure Requirements】

【Step 1: Intent Analysis】

Output:
- search intent
- user goals
- decision bottlenecks

---

【Step 2: SERP Gap Analysis】

Output:
- weaknesses in current SERP
- opportunities to improve content
- missing visual opportunities
- missing comparison opportunities

---

【Step 3: Content Outline】

Generate structured outline:

<h1>
Intro
<h2>
<h2>
<h2>
FAQ

Requirements:
- every <h2> must answer a user question
- structure must match SERP intent
- sections should flow naturally

---

【Step 4: Body Writing】

Each major section should include:
- clear explanation
- practical context
- real-world use case
- realistic expectations

Include:
- comparisons when useful
- styling examples when relevant
- decision support when necessary

Content should:
- answer the core question early
- prioritize clarity over fluff
- expand where users may still feel uncertain
- flow naturally between sections

Avoid:
- bloated introductions
- repetitive filler
- shallow explanations
- repeating the same idea multiple times

================================
【Step 5: FAQ Strategy】

FAQs should:
- target unresolved user questions
- capture long-tail search intent
- answer questions clearly and directly

================================
【Step 6: Final Selection Guidance】

Only include when appropriate.

Summarize:
- which option fits which type of user
- practical recommendations
- key tradeoffs

Do NOT force this section if search intent does not require decision-making.

================================
【Core Principle】

You are helping users:
- understand
- visualize
- compare
- evaluate
- decide

depending on search intent.

================================
【Output Requirements】

- Output article content ONLY
- No AI introductions or explanations
- HTML format (Word-compatible)
- Use <h1>-<h4> for headings, <strong> for bold, <ul>/<li> for lists, <p> for paragraphs
- Use <hr> to separate major sections (visually breaks up the article)
- Add subtle color to headings: <h2 style="color:#1a3a5c;"> for variety, not every heading needs color
- All content must be in English
- Content must feel human-written, natural, useful, and brand-aware

================================
【Content Depth Requirements】

- Main article body must contain at least 1400-1600 words
- FAQ section is NOT included in word count
- Always verify approximate word count before finishing output

Avoid:
- thin content
- shallow explanations
- rushed sections
- repetitive filler
- overly generic advice
- excessive fluff written only to increase word count

================================
【Writing Quality Requirements】

- Prioritize explanation over surface-level statements
- Explain practical differences clearly
- Use real-life examples and use cases naturally
- Expand on ideas when users may still feel uncertain

Paragraphs should:
- contain meaningful explanation
- avoid being excessively short
- vary naturally in length
- flow logically into the next section

Do NOT rely heavily on:
- bullet-only sections
- list-heavy formatting
- repetitive mini paragraphs
- isolated one-line statements

Lists should:
- support explanation
- improve readability
- not replace real content depth

================================
【Final Quality Check】

Before finalizing:
- verify content depth
- verify article completeness
- verify keyword integration feels natural
- verify internal links fit contextually
- verify recommendations feel realistic
- verify explanations are specific and useful
- verify wording does not sound repetitive or AI-generated
`;

    const USER_PROMPT = `
Write a comprehensive SEO article about "${keyword}" for ${audience}.

## NON-NEGOTIABLE INSTRUCTIONS (MUST FOLLOW STRICTLY):

### 1. Content Strategy (Mandatory):
${parsedBrief.contentStrategy ? `- ${parsedBrief.contentStrategy}` : ""}

### 2. Keyword Type:
${parsedBrief.searchIntent ? `- ${parsedBrief.searchIntent}` : "- Determine the keyword type (definition/comparison/parameter)"}

### 3. Decision Points to Address:
${parsedBrief.decisionPoints ? parsedBrief.decisionPoints : "- Identify what decision the user needs to make"}

### 4. Comparison Targets (if applicable):
${parsedBrief.comparisonTargets ? parsedBrief.comparisonTargets : "- Include comparison if relevant to keyword type"}

### 5. Structure Requirements (Mandatory):
${parsedBrief.structure ? `- ${parsedBrief.structure}` : "- Follow logical flow with H2 sections, ADD EXTRA H2/H3 SUBSECTIONS TO MEET WORD COUNT REQUIREMENT"}

### 6. Key Topics to Cover (Must include - ELABORATE ON EACH TOPIC TO REACH WORD COUNT):
${parsedBrief.keyTopics ? parsedBrief.keyTopics.map(t => `- ${t}`).join("\n") : "- All relevant aspects of " + keyword}

### 7. Word Count (CRITICAL - MUST MEET OR EXCEED):
- Target: ${parsedWordCount} words
- ABSOLUTE MINIMUM: ${Math.floor(parsedWordCount * 0.8)} words (DO NOT GO BELOW THIS!)
- Maximum: ${Math.ceil(parsedWordCount * 1.2)} words
- IF IN DOUBT, WRITE MORE, NOT LESS!

### 8. Primary Keyword:
- Main keyword: "${keyword}"
- Include semantically related terms naturally
- Avoid keyword stuffing

### 9. Opening Pattern:
${parsedBrief.openingPattern || "Use direct-answer approach - start with the core answer"}

### 10. Author Credentials:
${parsedBrief.authorCredentials || "Gemologist / Jewelry Specialist with Leonids experience"}

### 11. Competitive Edge (Must address):
${parsedBrief.differentiation ? `- ${parsedBrief.differentiation}` : "- Focus on unique value proposition"}

---

## SEO Brief Reference (Full Context):
${brief}

---

## Output Requirements:
- ENGLISH ONLY
- HTML format (no Markdown, no code fences)
- Use <h1>-<h4> for headings, <strong> for bold, <ul>/<li> for lists, <p> for paragraphs
- Use <hr> between major sections for visual separation
- Add color to some headings for variety: <h2 style="color:#1a3a5c;"> or <h3 style="color:#2c5f2d;">
- Output ONLY the article content
- Include decision guidance throughout
- End with "If you want... → choose..." selection guide
`;

    async function fetchWithTimeout(url, options, timeoutMs) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    async function callOpenAI(messages) {
      const maxTokens = Math.floor(parsedWordCount * 8); // Increased from 5 to 8
      const baseTimeout = Math.max(60000, parsedWordCount * 70); // Increased timeout
      const timeoutMs = Math.min(85000, Math.floor(baseTimeout / parsedMaxAttempts));

      const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      }, timeoutMs);

      return response;
    }

    let lastContent = "";
    let lastIssues = [];
    let bestContent = "";
    let bestWordCount = 0;

    for (let attempt = 1; attempt <= parsedMaxAttempts; attempt++) {
      const messages = [{ role: "system", content: SYSTEM_PROMPT }];

      if (attempt === 1) {
        messages.push({ role: "user", content: USER_PROMPT });
      } else {
        let retryPrompt = USER_PROMPT;
        const wordCountIssue = lastIssues.find(issue => issue.toLowerCase().includes("word count"));
        if (wordCountIssue) {
          retryPrompt += `\n\n## CRITICAL ISSUE TO FIX:
${wordCountIssue}

You must add significantly more content to reach the word count. Add extra sections, expand existing explanations, and write more detailed content.`;
        }
        if (lastIssues.length > 0) {
          retryPrompt += `\n\n## OTHER PREVIOUS FAILURES TO FIX:
${lastIssues.filter(i => !i.toLowerCase().includes("word count")).map((issue, i) => `${i + 1}. ${issue}`).join("\n")}`;
        }
        retryPrompt += `\n\nYou must fix ALL issues above, but WORD COUNT IS THE TOP PRIORITY. Write MORE content, not less.`;
        messages.push({ role: "user", content: retryPrompt });
      }

      const response = await callOpenAI(messages);

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429 && attempt < parsedMaxAttempts) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        return res.status(response.status).json({
          error: "OpenAI request failed",
          detail: data?.error || data
        });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        return res.status(502).json({
          error: "OpenAI response missing content",
          detail: data
        });
      }

      lastContent = content;
      const currentWordCount = countWords(content);

      // Keep track of the best (longest) content
      if (currentWordCount > bestWordCount) {
        bestContent = content;
        bestWordCount = currentWordCount;
      }

      const validation = validateArticle(content, parsedWordCount, parsedBrief.requiredTopics, parsedBrief.h1Title);

      if (validation.ok) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(content);
      }

      lastIssues = validation.issues;

      if (attempt < parsedMaxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Return the best (longest) content we got
    const finalContent = bestContent || lastContent;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(finalContent);

  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "Request timed out",
        detail: "API request exceeded timeout limit"
      });
    }
    return res.status(500).json({
      error: "Unexpected error in write handler",
      detail: error.message
    });
  }
}

function parseBrief(brief) {
  const result = {};

  try {
    let parsed = null;
    let jsonString = brief;

    const jsonMatch = brief.match(/\{[\s\S]*?"[\w]+"[\s\S]*?\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    try {
      parsed = JSON.parse(jsonString);
    } catch {
      const braceMatch = brief.match(/\{[\s\S]*\}$/);
      if (braceMatch) {
        try {
          parsed = JSON.parse(braceMatch[0]);
        } catch {
          return parseTextBrief(brief);
        }
      } else {
        return parseTextBrief(brief);
      }
    }

    if (parsed.wordCount || parsed["内容长度区间"]) {
      const wordCountStr = parsed.wordCount || parsed["内容长度区间"];
      const match = wordCountStr.match(/(\d+)-(\d+)/);
      if (match) {
        result.wordCount = Math.round((parseInt(match[1]) + parseInt(match[2])) / 2);
      } else {
        result.wordCount = parseInt(wordCountStr) || null;
      }
    }

    if (parsed.contentStrategy || parsed["内容策略"]) {
      result.contentStrategy = parsed.contentStrategy || parsed["内容策略"];
    }

    if (parsed.structure || parsed["结构"]) {
      result.structure = parsed.structure || parsed["结构"];
    }

    if (parsed.keyTopics || parsed["核心要点"] || parsed["覆盖点"]) {
      const topics = parsed.keyTopics || parsed["核心要点"] || parsed["覆盖点"];
      result.keyTopics = Array.isArray(topics) ? topics : topics.split(/[，,、\n]/).filter(t => t.trim());
    }

    if (parsed.openingPattern || parsed["opening_pattern"]) {
      result.openingPattern = parsed.openingPattern || parsed["opening_pattern"];
    }

    if (parsed.authorCredentials || parsed["author_credentials"]) {
      result.authorCredentials = parsed.authorCredentials || parsed["author_credentials"];
    }

    if (parsed.differentiation || parsed["差异化建议"]) {
      result.differentiation = parsed.differentiation || parsed["差异化建议"];
    }

    if (parsed.requiredTopics) {
      result.requiredTopics = parsed.requiredTopics;
    }

    if (parsed.h1Title || parsed["h1标题"] || parsed["标题"]) {
      result.h1Title = parsed.h1Title || parsed["h1标题"] || parsed["标题"];
    }

    if (parsed.searchIntent || parsed["搜索意图"]) {
      result.searchIntent = parsed.searchIntent || parsed["搜索意图"];
    }

    if (parsed.decisionPoints || parsed["决策卡点"]) {
      result.decisionPoints = parsed.decisionPoints || parsed["决策卡点"];
    }

    if (parsed.comparisonTargets || parsed["对比对象"]) {
      result.comparisonTargets = parsed.comparisonTargets || parsed["对比对象"];
    }

    return result;

  } catch {
    return parseTextBrief(brief);
  }
}

function parseTextBrief(brief) {
  const result = {};

  const wordCountMatch = brief.match(/(\d+)-(\d+)/);
  if (wordCountMatch) {
    result.wordCount = Math.round((parseInt(wordCountMatch[1]) + parseInt(wordCountMatch[2])) / 2);
  }

  const topicMatches = brief.match(/keyTopics|Title|主题|Topic|要点/g);
  if (topicMatches) {
    result.keyTopics = [];
  }

  return result;
}

function validateArticle(content, targetWordCount, requiredTopics = [], expectedH1 = "") {
  const issues = [];
  const wordCount = countWords(content);
  const minWords = Math.floor(targetWordCount * 0.8);
  const maxWords = Math.ceil(targetWordCount * 1.3);

  if (wordCount < minWords || wordCount > maxWords) {
    issues.push(`Word count ${wordCount} outside required range ${minWords}-${maxWords}`);
  }

  const requiredSections = [
    { name: "H1 title", pattern: /<h1[^>]*>/i },
    { name: "FAQ section", pattern: /<h2[^>]*>\s*FAQ\s*<\/h2>/i },
    { name: "Choice guide", pattern: /If you (want|need|budget)/i }
  ];

  for (const section of requiredSections) {
    if (!section.pattern.test(content)) {
      issues.push(`Missing required section: ${section.name}`);
    }
  }

  if (expectedH1) {
    const h1Match = content.match(/<h1[^>]*>(.+?)<\/h1>/i);
    if (h1Match) {
      const actualH1 = h1Match[1].trim();
      if (actualH1.toLowerCase() !== expectedH1.toLowerCase()) {
        issues.push(`H1 title mismatch: expected "${expectedH1}", got "${actualH1}"`);
      }
    }
  }

  if (!isMostlyEnglish(content)) {
    issues.push("Output is not predominantly English");
  }

  for (const topic of requiredTopics) {
    if (!content.toLowerCase().includes(topic.toLowerCase())) {
      issues.push(`Missing required topic coverage: ${topic}`);
    }
  }

  if (!content.includes("Leonid") && !content.includes("Leonids")) {
    issues.push("Missing Leonid's Jewelry brand mention");
  }

  return { ok: issues.length === 0, issues };
}

function countWords(text) {
  const matches = text.match(/[A-Za-z0-9'-]+/g);
  return matches ? matches.length : 0;
}

function isMostlyEnglish(text) {
  const latinTokens = text.match(/[A-Za-z]+/g)?.length || 0;
  const cjkTokens = text.match(/[\u3400-\u9FFF]/g)?.length || 0;
  return latinTokens > 0 && cjkTokens <= latinTokens * 0.2;
}
