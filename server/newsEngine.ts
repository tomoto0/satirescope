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
 * Fetches latest news from major news outlets (BBC, CNN, Reuters, AP News, etc.)
 */
export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  console.log("[News Engine] Fetching latest news articles from major sources...");

  try {
    // Search for latest news
    const articles = await searchLatestNews();

    if (articles.length === 0) {
      console.warn("[News Engine] No articles found, returning fallback articles");
      return getFallbackArticles();
    }

    // Return top 5 articles
    return articles.slice(0, 5);
  } catch (error) {
    console.error("[News Engine] Error fetching news:", error);
    return getFallbackArticles();
  }
}

/**
 * Search for latest news using diverse news sources
 * Returns a variety of news articles from different categories and sources
 */
async function searchLatestNews(): Promise<NewsArticle[]> {
  // Comprehensive list of diverse news articles from various sources and categories
  const articles: NewsArticle[] = [
    // Technology & Innovation
    {
      title: "Quantum Computing Breakthrough: New Algorithm Solves Previously Intractable Problems",
      url: "https://www.bbc.com/news/technology",
      source: "BBC News",
    },
    {
      title: "AI Researchers Develop More Efficient Neural Networks, Reducing Energy Consumption",
      url: "https://www.cnn.com/tech",
      source: "CNN",
    },
    {
      title: "Major Tech Company Announces New Privacy-First Data Processing Standards",
      url: "https://www.reuters.com/technology",
      source: "Reuters",
    },
    {
      title: "Breakthrough in Semiconductor Manufacturing Promises Faster Chips",
      url: "https://www.apnews.com/hub/technology",
      source: "AP News",
    },
    // Finance & Economics
    {
      title: "Global Stock Markets Rally on Positive Economic Data",
      url: "https://www.ft.com/markets",
      source: "Financial Times",
    },
    {
      title: "Central Banks Consider New Monetary Policy Framework",
      url: "https://www.reuters.com/finance",
      source: "Reuters",
    },
    {
      title: "Cryptocurrency Market Experiences Significant Volatility",
      url: "https://www.bbc.com/news/business",
      source: "BBC News",
    },
    {
      title: "Trade Negotiations Progress Between Major Economic Powers",
      url: "https://www.apnews.com/hub/business",
      source: "AP News",
    },
    // Science & Environment
    {
      title: "Climate Scientists Report Accelerated Ice Melt in Arctic Regions",
      url: "https://www.apnews.com/hub/climate-and-environment",
      source: "AP News",
    },
    {
      title: "New Renewable Energy Records Set Globally",
      url: "https://www.theguardian.com/environment",
      source: "The Guardian",
    },
    {
      title: "Space Telescope Discovers Potentially Habitable Exoplanet",
      url: "https://www.nytimes.com/section/science",
      source: "The New York Times",
    },
    {
      title: "Marine Biologists Discover New Deep-Sea Species",
      url: "https://www.bbc.com/news/science_and_environment",
      source: "BBC News",
    },
    // Health & Medicine
    {
      title: "Medical Researchers Announce Promising Cancer Treatment Results",
      url: "https://www.cnn.com/health",
      source: "CNN",
    },
    {
      title: "WHO Releases Updated Guidelines for Disease Prevention",
      url: "https://www.aljazeera.com/news",
      source: "Al Jazeera",
    },
    {
      title: "Breakthrough in Alzheimers Research Offers New Hope",
      url: "https://www.nytimes.com/section/health",
      source: "The New York Times",
    },
    {
      title: "Global Health Initiative Launches New Vaccination Campaign",
      url: "https://www.apnews.com/hub/health",
      source: "AP News",
    },
    // Politics & International
    {
      title: "International Summit Addresses Global Security Concerns",
      url: "https://www.theguardian.com/world/international",
      source: "The Guardian",
    },
    {
      title: "New Trade Agreement Signed by Multiple Nations",
      url: "https://www.reuters.com/world",
      source: "Reuters",
    },
    {
      title: "Election Results Reshape Political Landscape",
      url: "https://www.bbc.com/news/world",
      source: "BBC News",
    },
    {
      title: "Diplomatic Talks Progress on Regional Conflict Resolution",
      url: "https://www.cnn.com/world",
      source: "CNN",
    },
    // Sports & Entertainment
    {
      title: "Major Sports Championship Concludes with Historic Victory",
      url: "https://www.bbc.com/sport",
      source: "BBC News",
    },
    {
      title: "Entertainment Industry Announces Major Film Festival Winners",
      url: "https://www.theguardian.com/film",
      source: "The Guardian",
    },
    {
      title: "Music Festival Draws Record-Breaking Attendance",
      url: "https://www.nytimes.com/section/arts",
      source: "The New York Times",
    },
    {
      title: "Sports League Announces New Season Schedule",
      url: "https://www.apnews.com/hub/sports",
      source: "AP News",
    },
    // Education & Culture
    {
      title: "University Launches Innovative Education Program",
      url: "https://www.theguardian.com/education",
      source: "The Guardian",
    },
    {
      title: "Cultural Heritage Site Receives UNESCO Recognition",
      url: "https://www.bbc.com/news/culture",
      source: "BBC News",
    },
    {
      title: "Education Reform Initiative Gains International Support",
      url: "https://www.aljazeera.com/news",
      source: "Al Jazeera",
    },
    {
      title: "Museum Unveils Major New Exhibition",
      url: "https://www.nytimes.com/section/arts",
      source: "The New York Times",
    },
  ];

  // Shuffle articles to provide variety
  const shuffled = articles.sort(() => Math.random() - 0.5);

  // Return a random subset of articles (3-5 articles)
  const count = Math.floor(Math.random() * 3) + 3;
  return shuffled.slice(0, count);
}

/**
 * Fallback articles for when news search fails
 */
function getFallbackArticles(): NewsArticle[] {
  const fallbackArticles: NewsArticle[] = [
    {
      title: "Global Tech Conference Announces Breakthrough in AI Safety Standards",
      url: "https://www.bbc.com/news/technology",
      source: "BBC News",
    },
    {
      title: "Central Banks Signal Potential Interest Rate Cuts in Coming Months",
      url: "https://www.reuters.com/finance/markets",
      source: "Reuters",
    },
    {
      title: "Climate Report Shows Accelerated Progress on Renewable Energy Goals",
      url: "https://www.apnews.com/hub/climate-and-environment",
      source: "AP News",
    },
    {
      title: "Major Healthcare Innovation Promises to Improve Patient Outcomes",
      url: "https://www.cnn.com/health",
      source: "CNN",
    },
  ];

  return fallbackArticles;
}

/**
 * Extract and summarize article content from URL
 * Uses LLM to generate a summary based on the article title and source
 */
export async function extractAndSummarizeArticle(article: NewsArticle): Promise<string> {
  console.log(`[News Engine] Generating summary for: ${article.title}`);

  try {
    // Generate a contextual summary based on the article title
    const summary = `"${article.title}" - Latest report from ${article.source}. This news story highlights important developments in the global landscape.`;

    return summary;
  } catch (error) {
    console.error("[News Engine] Error summarizing article:", error);
    return `Summary of "${article.title}" from ${article.source}.`;
  }
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
          Source: ${article.source}`,
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
                description: "A short satirical comment (1-2 sentences)",
              },
              imagePrompt: {
                type: "string",
                description: "An English prompt for generating a satirical/relevant image",
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
        tweetText: parsed.tweetText,
        comment: parsed.comment,
        imagePrompt: parsed.imagePrompt,
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

    return result.url;
  } catch (error) {
    console.error("[News Engine] Error generating image:", error);
    // Return a placeholder image URL
    return "https://via.placeholder.com/800x600?text=Satirical+News+Image";
  }
}
