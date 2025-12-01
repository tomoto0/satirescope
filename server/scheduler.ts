import * as cron from "node-cron";
import { getActiveTwitterConfigs, getTwitterConfigById } from "./db";
import { processNewsArticle, fetchNewsArticles } from "./newsEngine";
import { postTweetWithImage } from "./twitterPoster";
import { decryptReversible } from "./crypto";

/**
 * Global scheduler instances - one per config
 */
const configSchedulers: Map<number, ReturnType<typeof cron.schedule>> = new Map();

/**
 * Start the automated posting scheduler
 * Creates individual schedulers for each active config based on their custom schedule settings
 */
export async function startScheduler(): Promise<void> {
  console.log("[Scheduler] Starting scheduler system...");
  
  try {
    const activeConfigs = await getActiveTwitterConfigs();
    console.log(`[Scheduler] Found ${activeConfigs.length} active configurations`);
    
    for (const config of activeConfigs) {
      await createConfigScheduler(config);
    }
    
    console.log("[Scheduler] Scheduler system started");
  } catch (error) {
    console.error("[Scheduler] Failed to start scheduler:", error);
  }
}

/**
 * Create a scheduler for a specific config based on its custom schedule settings
 */
async function createConfigScheduler(config: any): Promise<void> {
  try {
    // Stop existing scheduler if any
    if (configSchedulers.has(config.id)) {
      const existingScheduler = configSchedulers.get(config.id);
      if (existingScheduler) {
        existingScheduler.stop();
      }
    }

    const intervalMinutes = config.scheduleIntervalMinutes || 60;
    const startHour = config.scheduleStartHour || 0;
    const endHour = config.scheduleEndHour || 23;

    // Generate Cron expression based on interval
    let cronExpression: string;
    
    if (intervalMinutes === 60) {
      // Every hour at minute 0
      cronExpression = `0 0 ${startHour}-${endHour} * * *`;
    } else if (intervalMinutes === 30) {
      // Every 30 minutes
      cronExpression = `0 0,30 ${startHour}-${endHour} * * *`;
    } else if (intervalMinutes === 15) {
      // Every 15 minutes
      cronExpression = `0 0,15,30,45 ${startHour}-${endHour} * * *`;
    } else if (intervalMinutes < 60) {
      // For other intervals less than 60 minutes, use step values
      const step = Math.max(1, Math.floor(60 / intervalMinutes));
      cronExpression = `0 */${step} ${startHour}-${endHour} * * *`;
    } else {
      // For intervals greater than 60 minutes, use hourly step
      const hourStep = Math.max(1, Math.floor(intervalMinutes / 60));
      cronExpression = `0 0 */${hourStep} * * *`;
    }

    console.log(`[Scheduler] Creating scheduler for config ${config.id}: interval=${intervalMinutes}min, hours=${startHour}-${endHour}, cron="${cronExpression}"`);

    // Create new scheduler
    const scheduler = cron.schedule(cronExpression, async () => {
      console.log(`[Scheduler] Running automated posting cycle for config ${config.id}...`);
      await runAutomatedPostingCycleForConfig(config);
    });

    configSchedulers.set(config.id, scheduler);
    console.log(`[Scheduler] Scheduler created for config ${config.id}`);
  } catch (error) {
    console.error(`[Scheduler] Failed to create scheduler for config ${config.id}:`, error);
  }
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  console.log("[Scheduler] Stopping all schedulers...");
  
  configSchedulers.forEach((scheduler, configId) => {
    if (scheduler) {
      scheduler.stop();
      console.log(`[Scheduler] Stopped scheduler for config ${configId}`);
    }
  });
  
  configSchedulers.clear();
  console.log("[Scheduler] All schedulers stopped");
}

/**
 * Check if scheduler is running
 */
export function isSchedulerRunning(): boolean {
  return configSchedulers.size > 0;
}

/**
 * Stop scheduler for a specific config
 */
export function stopConfigScheduler(configId: number): void {
  try {
    console.log(`[Scheduler] Stopping scheduler for config ${configId}...`);
    
    const scheduler = configSchedulers.get(configId);
    if (scheduler) {
      scheduler.stop();
      configSchedulers.delete(configId);
      console.log(`[Scheduler] Scheduler stopped for config ${configId}`);
    } else {
      console.log(`[Scheduler] No scheduler found for config ${configId}`);
    }
  } catch (error) {
    console.error(`[Scheduler] Failed to stop scheduler for config ${configId}:`, error);
  }
}

/**
 * Update scheduler for a specific config (called when schedule settings change)
 */
export async function updateConfigScheduler(configId: number): Promise<void> {
  try {
    console.log(`[Scheduler] Updating scheduler for config ${configId}...`);
    
    const config = await getTwitterConfigById(configId);
    if (!config) {
      console.error(`[Scheduler] Config ${configId} not found`);
      return;
    }

    // If config is inactive, stop the scheduler
    if (!config.isActive) {
      stopConfigScheduler(configId);
      return;
    }

    // Otherwise, create or update the scheduler
    await createConfigScheduler(config);
    console.log(`[Scheduler] Scheduler updated for config ${configId}`);
  } catch (error) {
    console.error(`[Scheduler] Failed to update scheduler for config ${configId}:`, error);
  }
}

/**
 * Automated posting cycle for a specific config
 */
async function runAutomatedPostingCycleForConfig(config: any): Promise<void> {
  try {
    console.log(`[Scheduler] Starting automated posting cycle for config ${config.id}...`);

    // Check if config is still active
    if (!config.isActive) {
      console.log(`[Scheduler] Config ${config.id} is not active, skipping`);
      return;
    }

    // Fetch latest news articles
    const articles = await fetchNewsArticles();
    console.log(`[Scheduler] Fetched ${articles.length} news articles for config ${config.id}`);

    if (articles.length === 0) {
      console.log(`[Scheduler] No articles found for config ${config.id}, skipping`);
      return;
    }

    // Use the first article
    const article = articles[0];

    try {
      console.log(`[Scheduler] Processing article for config ${config.id}: ${article.title}`);

      // Generate content for the article
      const content = await processNewsArticle(article);

      // Post tweet with image if available
      if (content.imageUrl) {
        console.log(`[Scheduler] Posting to config ${config.id}...`);
        await postTweetWithImage(config, content.tweetText, content.imageUrl, article.url);
        console.log(`[Scheduler] Successfully posted to config ${config.id}`);
      } else {
        console.log(`[Scheduler] No image available for config ${config.id}, skipping post`);
      }
    } catch (error) {
      console.error(`[Scheduler] Failed to process article for config ${config.id}:`, error);
    }

    console.log(`[Scheduler] Automated posting cycle completed for config ${config.id}`);
  } catch (error) {
    console.error(`[Scheduler] Fatal error in automated posting cycle for config ${config.id}:`, error);
  }
}

/**
 * Manually trigger the automation cycle (for testing)
 */
export async function triggerManualCycle(): Promise<void> {
  console.log("[Scheduler] Manual cycle triggered");
  
  try {
    const activeConfigs = await getActiveTwitterConfigs();
    
    for (const config of activeConfigs) {
      await runAutomatedPostingCycleForConfig(config);
    }
  } catch (error) {
    console.error("[Scheduler] Failed to trigger manual cycle:", error);
  }
}
