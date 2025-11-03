import * as cron from "node-cron";
import { getActiveTwitterConfigs, getTwitterConfigById } from "./db";
import { runNewsAutomation, processNewsArticle, fetchNewsArticles } from "./newsEngine";
import { postTweetWithImage } from "./twitterPoster";

/**
 * Global scheduler instance
 */
let schedulerTask: ReturnType<typeof cron.schedule> | null = null;

/**
 * Start the automated posting scheduler
 * Runs every hour at the top of the hour
 */
export function startScheduler(): void {
  if (schedulerTask) {
    console.log("[Scheduler] Scheduler already running");
    return;
  }

  // Schedule to run every hour at minute 0
  // Cron format: second minute hour day month dayOfWeek
  schedulerTask = cron.schedule("0 0 * * * *", async () => {
    console.log("[Scheduler] Running automated posting cycle...");
    await runAutomatedPostingCycle();
  });

  console.log("[Scheduler] Scheduler started - runs every hour");
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log("[Scheduler] Scheduler stopped");
  }
}

/**
 * Check if scheduler is running
 */
export function isSchedulerRunning(): boolean {
  return schedulerTask !== null;
}

/**
 * Main automation cycle
 * 1. Fetch active Twitter configs
 * 2. Fetch latest news articles
 * 3. Generate content for each article
 * 4. Post to Twitter
 */
async function runAutomatedPostingCycle(): Promise<void> {
  try {
    console.log("[Scheduler] Starting automated posting cycle...");

    // Step 1: Get all active Twitter configurations
    const activeConfigs = await getActiveTwitterConfigs();
    console.log(`[Scheduler] Found ${activeConfigs.length} active Twitter configurations`);

    if (activeConfigs.length === 0) {
      console.log("[Scheduler] No active configurations, skipping cycle");
      return;
    }

    // Step 2: Fetch latest news articles
    const articles = await fetchNewsArticles();
    console.log(`[Scheduler] Fetched ${articles.length} news articles`);

    if (articles.length === 0) {
      console.log("[Scheduler] No articles found, skipping cycle");
      return;
    }

    // Step 3: Process each article and post to all active configs
    for (const article of articles) {
      try {
        console.log(`[Scheduler] Processing article: ${article.title}`);

        // Generate content for the article
        const content = await processNewsArticle(article);

        // Post to all active Twitter accounts
        for (const config of activeConfigs) {
          try {
            console.log(`[Scheduler] Posting to config ${config.id}...`);

            // Post tweet with image if available
            if (content.imageUrl) {
              await postTweetWithImage(config, content.tweetText, content.imageUrl, article.url);
            } else {
              // Fallback to text-only tweet
              console.log("[Scheduler] No image available, posting text-only tweet");
              // TODO: Import and use postTweet function
              // await postTweet(config, content.tweetText, article.url);
            }

            console.log(`[Scheduler] Successfully posted to config ${config.id}`);
          } catch (error) {
            console.error(`[Scheduler] Failed to post to config ${config.id}:`, error);
            // Continue with next config instead of stopping
          }
        }
      } catch (error) {
        console.error(`[Scheduler] Failed to process article "${article.title}":`, error);
        // Continue with next article instead of stopping
      }
    }

    console.log("[Scheduler] Automated posting cycle completed");
  } catch (error) {
    console.error("[Scheduler] Fatal error in automated posting cycle:", error);
  }
}

/**
 * Manually trigger the automation cycle (for testing)
 */
export async function triggerManualCycle(): Promise<void> {
  console.log("[Scheduler] Manual cycle triggered");
  await runAutomatedPostingCycle();
}
