export default async function handler(req, res) {
  try {
    const { keyword, serp, contents } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ error: "Missing or invalid body field: keyword" });
    }

    if (!Array.isArray(serp) || !Array.isArray(contents)) {
      return res.status(400).json({ error: "serp and contents must be arrays" });
    }

    const prompt = `
You are an SEO expert. Analyze the following data for Leonid's Jewelry (fine jewelry, lab-grown diamonds).

Keyword: ${keyword}

SERP Results:
${JSON.stringify(serp, null, 2)}

Competitor Content Summaries:
${JSON.stringify(contents, null, 2)}

Requirements:
- ALL OUTPUT MUST BE IN ENGLISH
- You must output TWO parts:

---
## PART 1: COMPLETE SEO BRIEF (JSON)

Output a valid JSON object with this exact structure (no markdown code fences, pure JSON):

{
  "wordCount": "1000-1500",
  "contentStrategy": "Primary content strategy recommendation",
  "structure": "Recommended article structure flow",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "openingPattern": "direct-answer or question-led",
  "authorCredentials": "Gemologist / Jewelry Specialist with Leonids experience",
  "differentiation": "How to differentiate from competitors",
  "requiredTopics": ["Must-cover topic 1", "Must-cover topic 2"],
  "h1Title": "Recommended H1 title",
  "searchIntent": "Keyword type: definition/comparison/parameter",
  "decisionPoints": "What decision does the user need to make",
  "comparisonTargets": "What should be compared (if applicable)"
}

---
## PART 2: ANALYSIS SUMMARY (Human Readable)

1. Search Intent: [Type]

2. SERP Type Distribution: [Blog/Product/Category percentages]

3. Content Length Range: [min-max words]

4. Top 5 Structure Summary: [Common H2 patterns from competitors]

5. Competitor Coverage Points: [What topics competitors focus on]

6. Missing Points / Gaps: [Opportunities not covered by competitors]

7. Differentiation Suggestions: [How to stand out]

8. Brand Voice:
{
  "persona": "A one-sentence perception description",
  "opening_pattern": "direct-answer or question-led",
  "author_credentials": "Gemologist or Jewelry Specialist, must mention Leonids experience",
  "tradeoff_required": true
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        detail: data?.error || data
      });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({
        error: "OpenAI response missing content",
        detail: data
      });
    }

    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected error in analyze handler",
      detail: error.message
    });
  }
}