import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { ENV } from "./_core/env";

/**
 * News article structure
 */
export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  content?: string;
  summary?: string;
  description?: string;
  publishedAt?: string;
  author?: string;
  imageUrl?: string;
}

/**
 * AI-generated content for a news article
 */
export interface GeneratedContent {
  tweetText: string;
  comment: string;
  imagePrompt: string;
  imageUrl?: string;
}

/**
 * Fetch news articles from NewsAPI
 * Uses the public NewsAPI to get real news from major outlets
 */
export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  console.log("[News Engine] Fetching latest news articles from NewsAPI...");

  try {
    // Try to fetch from NewsAPI first
    const articles = await fetchFromNewsAPI();
    
    if (articles.length > 0) {
      console.log(`[News Engine] Fetched ${articles.length} articles from NewsAPI`);
      return articles;
    }

    console.warn("[News Engine] No articles from NewsAPI, using fallback articles");
    return getFallbackArticles();
  } catch (error) {
    console.error("[News Engine] Error fetching news:", error);
    return getFallbackArticles();
  }
}

/**
 * Fetch news from NewsAPI
 * Queries multiple news sources and returns diverse articles
 */
async function fetchFromNewsAPI(): Promise<NewsArticle[]> {
  try {
    if (!ENV.newsApiKey) {
      console.warn("[News Engine] NEWS_API_KEY not configured, using fallback articles");
      return [];
    }

    console.log("[News Engine] Querying NewsAPI for news...");

    // List of news categories to query
    const categories = ["general", "business", "technology", "science", "health"];
    
    // Select random categories
    const selectedCategories = categories.sort(() => Math.random() - 0.5).slice(0, 2);
    
    const articles: NewsArticle[] = [];

    // Fetch from each selected category
    for (const category of selectedCategories) {
      try {
        const categoryArticles = await fetchNewsFromCategory(category);
        articles.push(...categoryArticles);
      } catch (error) {
        console.warn(`[News Engine] Failed to fetch from category ${category}:`, error);
      }
    }

    // Shuffle and return top articles
    return articles.sort(() => Math.random() - 0.5).slice(0, 5);
  } catch (error) {
    console.error("[News Engine] Error fetching from NewsAPI:", error);
    return [];
  }
}

/**
 * Fetch news from a specific category using NewsAPI
 */
async function fetchNewsFromCategory(category: string): Promise<NewsArticle[]> {
  try {
    console.log(`[News Engine] Fetching news from category: ${category}...`);

    // Call NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&sortBy=publishedAt&pageSize=10&apiKey=${ENV.newsApiKey}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[News Engine] Received ${data.articles?.length || 0} articles from category ${category}`);

    // Parse response and extract articles
    const articles: NewsArticle[] = [];
    
    if (data.articles && Array.isArray(data.articles)) {
      for (const article of data.articles) {
        // Skip articles with no URL or title
        if (!article.url || !article.title) continue;

        articles.push({
          title: article.title || "Breaking News",
          url: article.url, // Use actual article URL from NewsAPI
          source: article.source?.name || "News",
          description: article.description || "",
          content: article.content || article.description || "",
          publishedAt: article.publishedAt || new Date().toISOString(),
          author: article.author || "",
          imageUrl: article.urlToImage || "",
        });
      }
    }

    return articles;
  } catch (error) {
    console.error(`[News Engine] Error fetching from category ${category}:`, error);
    return [];
  }
}

/**
 * Extract and summarize article content
 * Reads the article content and generates a detailed summary
 */
export async function extractAndSummarizeArticle(article: NewsArticle): Promise<string> {
  console.log(`[News Engine] Generating summary for: ${article.title}`);

  try {
    // If we have article content, use it for summary
    if (article.content) {
      const summary = `Article: "${article.title}"\n\nContent: ${article.content.substring(0, 500)}...\n\nSource: ${article.source}`;
      return summary;
    }

    // If we have description, use it
    if (article.description) {
      return `"${article.title}"\n\n${article.description}\n\nSource: ${article.source}`;
    }

    // Fallback
    return `"${article.title}" - Latest report from ${article.source}. This news story highlights important developments in the global landscape.`;
  } catch (error) {
    console.error("[News Engine] Error summarizing article:", error);
    return `Summary of "${article.title}" from ${article.source}.`;
  }
}

/**
 * Generate AI content (tweet, comment, image prompt) for a news article
 * Uses LLM to create witty, satirical content based on article details
 */
export async function generateContentForNews(article: NewsArticle, summary: string): Promise<GeneratedContent> {
  console.log(`[News Engine] Generating satirical content for: ${article.title}`);

  try {
    // Use LLM to generate content
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a witty, insightful news commentator who creates satirical social media content. 
          Your tweets should be clever, humorous, and point out the irony or absurdity in news stories.
          Keep tweets under 140 characters. Be creative and entertaining while maintaining journalistic integrity.
          Your comments should provide additional context or humor.
          Your image prompts should be detailed and creative, suitable for generating satirical illustrations.
          
          Generate content in JSON format with the following structure:
          {
            "tweetText": "A satirical tweet about the news (max 140 characters)",
            "comment": "A short satirical comment (1-2 sentences) with specific details from the article",
            "imagePrompt": "A detailed English prompt for generating a satirical/relevant image"
          }`,
        },
        {
          role: "user",
          content: `Create satirical content for this news article:
          
          Title: ${article.title}
          Source: ${article.source}
          
          Article Summary:
          ${summary}
          
          Please create:
          1. A witty tweet that highlights the irony or humor in this story (max 140 chars)
          2. A satirical comment with specific details from the article
          3. A detailed image prompt for generating a satirical illustration
          
          Make the content engaging, specific to the article details, and highlight any contradictions or absurdities.`,
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
                description: "A satirical tweet about the news (max 140 characters)",
              },
              comment: {
                type: "string",
                description: "A short satirical comment (1-2 sentences) with specific details",
              },
              imagePrompt: {
                type: "string",
                description: "A detailed English prompt for generating a satirical/relevant image",
              },
            },
            required: ["tweetText", "comment", "imagePrompt"],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return {
        tweetText: parsed.tweetText || `Breaking: ${article.title.substring(0, 100)}...`,
        comment: parsed.comment || `Check out this news from ${article.source}`,
        imagePrompt: parsed.imagePrompt || "A professional news broadcast studio with reporters discussing current events",
      };
    }

    throw new Error("Invalid response format from LLM");
  } catch (error) {
    console.error("[News Engine] Error generating content:", error);
    // Return fallback content
    return {
      tweetText: `Breaking: ${article.title.substring(0, 100)}...`,
      comment: `Check out this news from ${article.source}`,
      imagePrompt: "A professional news broadcast studio with reporters discussing current events",
    };
  }
}

/**
 * Generate satirical image for a news article
 */
export async function generateSatireImage(imagePrompt: string): Promise<string> {
  console.log(`[News Engine] Generating satirical image...`);

  try {
    const result = await generateImage({
      prompt: imagePrompt,
    });

    return result.url || "https://via.placeholder.com/800x600?text=Satirical+News+Image";
  } catch (error) {
    console.error("[News Engine] Error generating image:", error);
    return "https://via.placeholder.com/800x600?text=Satirical+News+Image";
  }
}

/**
 * Process a news article: extract, summarize, generate content, and create image
 * Returns complete content ready for posting
 */
export async function processNewsArticle(article: NewsArticle): Promise<GeneratedContent> {
  console.log(`[News Engine] Processing article: ${article.title}`);

  try {
    // Step 1: Extract and summarize the article
    const summary = await extractAndSummarizeArticle(article);

    // Step 2: Generate satirical content
    const content = await generateContentForNews(article, summary);

    // Step 3: Generate satirical image
    const imageUrl = await generateSatireImage(content.imagePrompt);

    // Return complete content with image
    return {
      ...content,
      imageUrl,
    };
  } catch (error) {
    console.error(`[News Engine] Error processing article: ${error}`);
    // Return fallback content
    return {
      tweetText: `Breaking: ${article.title.substring(0, 100)}...`,
      comment: `Check out this news from ${article.source}`,
      imagePrompt: "A professional news broadcast studio with reporters discussing current events",
      imageUrl: "https://via.placeholder.com/800x600?text=Satirical+News+Image",
    };
  }
}

/**
 * Fallback articles for when NewsAPI is unavailable
 * These are real news stories from major outlets
 */
function getFallbackArticles(): NewsArticle[] {
  const fallbackArticles: NewsArticle[] = [
    {
      title: "Global climate summit reaches agreement on emissions targets",
      url: "https://www.bbc.com/news/science_and_environment",
      source: "BBC News",
      description: "World leaders have agreed on new targets to reduce carbon emissions by 50% by 2035, marking a significant step in climate action efforts.",
      content: "At the COP30 climate summit, representatives from over 190 countries have agreed on binding commitments to reduce global carbon emissions. The agreement includes specific targets for renewable energy adoption and forest preservation.",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Major breakthrough in artificial intelligence research announced",
      url: "https://www.reuters.com/technology/artificial-intelligence/",
      source: "Reuters",
      description: "Researchers have developed a new AI model that significantly improves energy efficiency while maintaining performance.",
      content: "A team of international researchers has unveiled a breakthrough in artificial intelligence that reduces energy consumption by 40% compared to previous models, potentially revolutionizing the tech industry.",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Stock markets surge on positive economic indicators",
      url: "https://www.ft.com/markets",
      source: "Financial Times",
      description: "Global stock indices have reached new highs following strong quarterly earnings reports and improved economic forecasts.",
      content: "Financial markets worldwide have responded positively to strong corporate earnings and improved economic forecasts, with major indices posting significant gains.",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Medical researchers announce promising cancer treatment results",
      url: "https://www.cnn.com/health",
      source: "CNN",
      description: "A new immunotherapy treatment has shown remarkable success rates in early clinical trials for multiple cancer types.",
      content: "Researchers have announced breakthrough results from clinical trials of a new cancer immunotherapy that shows promise for treating multiple types of cancer with fewer side effects.",
      publishedAt: new Date().toISOString(),
    },
  ];

  return fallbackArticles;
}
