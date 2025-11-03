import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";

/**
 * News article structure
 */
export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  content?: string;
  summary?: string;
}

/**
 * AI-generated content for a news article
 */
export interface GeneratedContent {
  tweetText: string; // 140 characters or less
  comment: string;
  imagePrompt: string; // English prompt for image generation
  imageUrl?: string;
}

/**
 * Fetch news articles from multiple sources using web search
 * This is a placeholder - in production, you would integrate with actual news APIs
 * or use the Manus web search functionality
 */
export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  // Placeholder implementation
  // In production, this would:
  // 1. Use Manus web search to find latest news from BBC, CNN, Reuters, etc.
  // 2. Extract article URLs and titles
  // 3. Return array of NewsArticle objects

  console.log("[News Engine] Fetching news articles...");

  // Example articles for testing
  const articles: NewsArticle[] = [
    {
      title: "Global Climate Summit Reaches Historic Agreement",
      url: "https://example.com/climate-summit",
      source: "BBC News",
    },
    {
      title: "Tech Giants Report Record Earnings Despite Market Slowdown",
      url: "https://example.com/tech-earnings",
      source: "CNN Business",
    },
  ];

  return articles;
}

/**
 * Extract and summarize article content from URL
 * Uses Manus browser functionality to fetch and parse article content
 */
export async function extractAndSummarizeArticle(article: NewsArticle): Promise<string> {
  // Placeholder implementation
  // In production, this would:
  // 1. Use Manus browser to fetch article content
  // 2. Parse HTML to extract main text
  // 3. Use LLM to summarize the content

  console.log(`[News Engine] Extracting content from: ${article.url}`);

  // For now, return a placeholder summary
  const summary = `Summary of "${article.title}" from ${article.source}. This is a placeholder summary that would normally be generated from the actual article content.`;

  return summary;
}

/**
 * Generate AI content (tweet, comment, image prompt) for a news article
 */
export async function generateContentForNews(article: NewsArticle, summary: string): Promise<GeneratedContent> {
  console.log(`[News Engine] Generating content for: ${article.title}`);

  try {
    // Use LLM to generate content
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a witty news commentator who creates satirical social media content. 
          Generate content in JSON format with the following structure:
          {
            "tweetText": "A satirical tweet about the news (max 140 characters)",
            "comment": "A short satirical comment (1-2 sentences)",
            "imagePrompt": "An English prompt for generating a satirical/relevant image (detailed and creative)"
          }`,
        },
        {
          role: "user",
          content: `Create satirical content for this news article:
          Title: ${article.title}
          Summary: ${summary}
          
          Return ONLY valid JSON, no markdown or additional text.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "satirical_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              tweetText: {
                type: "string",
                description: "Satirical tweet (max 140 characters)",
              },
              comment: {
                type: "string",
                description: "Short satirical comment",
              },
              imagePrompt: {
                type: "string",
                description: "English prompt for image generation",
              },
            },
            required: ["tweetText", "comment", "imagePrompt"],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No content generated from LLM");
    }

    const parsed = JSON.parse(content);

    // Ensure tweet text is within limit
    let tweetText = parsed.tweetText;
    if (tweetText.length > 140) {
      tweetText = tweetText.substring(0, 137) + "...";
    }

    return {
      tweetText,
      comment: parsed.comment || "",
      imagePrompt: parsed.imagePrompt || "",
    };
  } catch (error) {
    console.error("[News Engine] Failed to generate content:", error);
    throw new Error("Failed to generate AI content for news article");
  }
}

/**
 * Generate an image based on the image prompt
 */
export async function generateSatireImage(prompt: string): Promise<string> {
  console.log("[News Engine] Generating satirical image...");

  try {
    const result = await generateImage({
      prompt: prompt,
    });

    return result.url || "";
  } catch (error) {
    console.error("[News Engine] Failed to generate image:", error);
    throw new Error("Failed to generate satirical image");
  }
}

/**
 * Process a single news article: fetch content, generate AI content, generate image
 */
export async function processNewsArticle(article: NewsArticle): Promise<GeneratedContent> {
  try {
    // Step 1: Extract and summarize article content
    const summary = await extractAndSummarizeArticle(article);

    // Step 2: Generate AI content (tweet, comment, image prompt)
    const content = await generateContentForNews(article, summary);

    // Step 3: Generate satirical image
    const imageUrl = await generateSatireImage(content.imagePrompt);
    if (imageUrl) {
      content.imageUrl = imageUrl;
    }

    return content;
  } catch (error) {
    console.error("[News Engine] Failed to process article:", error);
    throw error;
  }
}

/**
 * Main function to fetch news and generate content
 * This is called by the scheduler
 */
export async function runNewsAutomation(): Promise<void> {
  try {
    console.log("[News Engine] Starting news automation cycle...");

    // Fetch latest news articles
    const articles = await fetchNewsArticles();
    console.log(`[News Engine] Found ${articles.length} articles`);

    // Process each article
    for (const article of articles) {
      try {
        const content = await processNewsArticle(article);
        console.log(`[News Engine] Generated content for: ${article.title}`);
        console.log(`  Tweet: ${content.tweetText}`);
        console.log(`  Comment: ${content.comment}`);
        console.log(`  Image URL: ${content.imageUrl}`);

        // TODO: Post to Twitter using the generated content
        // This will be implemented in the Twitter posting module
      } catch (error) {
        console.error(`[News Engine] Failed to process article "${article.title}":`, error);
        // Continue with next article instead of stopping
      }
    }

    console.log("[News Engine] News automation cycle completed");
  } catch (error) {
    console.error("[News Engine] Fatal error in news automation:", error);
    throw error;
  }
}
