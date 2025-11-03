import { TwitterApi } from "twitter-api-v2";
import { createPostedTweet } from "./db";
import { decryptReversible } from "./crypto";
import type { TwitterConfig } from "../drizzle/schema";

/**
 * Initialize Twitter API client with credentials
 */
function initializeTwitterClient(config: TwitterConfig): TwitterApi {
  const appKey = decryptReversible(config.xApiKey);
  const appSecret = decryptReversible(config.xApiKeySecret);
  const accessToken = decryptReversible(config.xAccessToken);
  const accessSecret = decryptReversible(config.xAccessTokenSecret);

  const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });

  return client;
}

/**
 * Post a tweet with an image
 */
export async function postTweetWithImage(
  config: TwitterConfig,
  tweetText: string,
  imageUrl: string,
  sourceNewsUrl?: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  try {
    console.log("[Twitter Poster] Posting tweet...");

    // Initialize Twitter client
    const client = initializeTwitterClient(config);
    const rwClient = client.readWrite;

    // Fetch image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    // Upload media to Twitter
    console.log("[Twitter Poster] Uploading image to Twitter...");
    const mediaData = await rwClient.v1.uploadMedia(imageData, {
      mimeType: "image/jpeg",
    });

    // Build tweet text with source link
    let fullTweetText = tweetText;
    if (sourceNewsUrl) {
      fullTweetText += `\n\nSource: ${sourceNewsUrl}`;
    }

    // Get media ID from response
    const mediaId = typeof mediaData === "string" ? mediaData : (mediaData as any).media_id_string;

    // Post tweet with media
    console.log("[Twitter Poster] Posting tweet with media...");
    const tweet = await rwClient.v2.tweet({
      text: fullTweetText,
      media: {
        media_ids: [mediaId],
      },
    });

    console.log(`[Twitter Poster] Tweet posted successfully: ${(tweet.data as any).id}`);

    // Log the posted tweet to database
    await createPostedTweet({
      configId: config.id,
      tweetText: fullTweetText,
      imageUrl: imageUrl,
      sourceNewsUrl: sourceNewsUrl,
    });

    return {
      success: true,
      tweetId: (tweet.data as any).id,
    };
  } catch (error) {
    console.error("[Twitter Poster] Failed to post tweet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post a simple text tweet (without image)
 */
export async function postTweet(
  config: TwitterConfig,
  tweetText: string,
  sourceNewsUrl?: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  try {
    console.log("[Twitter Poster] Posting text tweet...");

    // Initialize Twitter client
    const client = initializeTwitterClient(config);
    const rwClient = client.readWrite;

    // Build tweet text with source link
    let fullTweetText = tweetText;
    if (sourceNewsUrl) {
      fullTweetText += `\n\nSource: ${sourceNewsUrl}`;
    }

    // Post tweet
    const tweet = await rwClient.v2.tweet({
      text: fullTweetText,
    });

    console.log(`[Twitter Poster] Tweet posted successfully: ${(tweet.data as any).id}`);

    // Log the posted tweet to database
    await createPostedTweet({
      configId: config.id,
      tweetText: fullTweetText,
      sourceNewsUrl: sourceNewsUrl,
    });

    return {
      success: true,
      tweetId: (tweet.data as any).id,
    };
  } catch (error) {
    console.error("[Twitter Poster] Failed to post tweet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate Twitter API credentials
 */
export async function validateTwitterCredentials(
  config: TwitterConfig
): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log("[Twitter Poster] Validating Twitter credentials...");

    const client = initializeTwitterClient(config);
    const rwClient = client.readWrite;

    // Try to get authenticated user info
    const user = await rwClient.v2.me();

    console.log(`[Twitter Poster] Credentials valid for user: ${(user.data as any).username}`);

    return {
      valid: true,
    };
  } catch (error) {
    console.error("[Twitter Poster] Credentials validation failed:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
