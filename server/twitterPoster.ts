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
    console.log("[Twitter Poster] Posting tweet with image...");
    console.log(`[Twitter Poster] Image URL: ${imageUrl}`);
    console.log(`[Twitter Poster] Tweet text: ${tweetText}`);

    // Initialize Twitter client
    const client = initializeTwitterClient(config);
    const rwClient = client.readWrite;

    // Fetch image from URL
    console.log("[Twitter Poster] Fetching image from URL...");
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText} (${imageResponse.status})`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);
    console.log(`[Twitter Poster] Image fetched, size: ${imageData.length} bytes`);

    // Upload media to Twitter using v1.1 API
    console.log("[Twitter Poster] Uploading image to Twitter...");
    let mediaId: string;
    
    try {
      const mediaResponse = await rwClient.v1.uploadMedia(imageData, {
        mimeType: "image/jpeg",
      });
      
      // Extract media ID from response
      if (typeof mediaResponse === "string") {
        mediaId = mediaResponse;
      } else if (mediaResponse && typeof mediaResponse === "object") {
        mediaId = (mediaResponse as any).media_id_string || (mediaResponse as any).media_id;
      } else {
        throw new Error(`Invalid media response: ${JSON.stringify(mediaResponse)}`);
      }
      
      console.log(`[Twitter Poster] Media uploaded successfully, ID: ${mediaId}`);
    } catch (uploadError) {
      console.error("[Twitter Poster] Media upload error:", uploadError);
      throw new Error(`Failed to upload media: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
    }

    // Build tweet text with source link
    let fullTweetText = tweetText;
    if (sourceNewsUrl) {
      fullTweetText += `\n\nSource: ${sourceNewsUrl}`;
    }

    // Post tweet with media using v2 API
    console.log("[Twitter Poster] Posting tweet with media...");
    try {
      const tweet = await rwClient.v2.tweet({
        text: fullTweetText,
        media: {
          media_ids: [mediaId],
        },
      });

      const tweetId = (tweet.data as any).id;
      console.log(`[Twitter Poster] Tweet posted successfully: ${tweetId}`);

      // Log the posted tweet to database
      await createPostedTweet({
        configId: config.id,
        tweetText: fullTweetText,
        imageUrl: imageUrl,
        sourceNewsUrl: sourceNewsUrl,
      });

      return {
        success: true,
        tweetId: tweetId,
      };
    } catch (tweetError) {
      console.error("[Twitter Poster] Tweet posting error:", tweetError);
      throw new Error(`Failed to post tweet: ${tweetError instanceof Error ? tweetError.message : String(tweetError)}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Twitter Poster] Failed to post tweet:", errorMessage);
    return {
      success: false,
      error: errorMessage,
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

    const tweetId = (tweet.data as any).id;
    console.log(`[Twitter Poster] Tweet posted successfully: ${tweetId}`);

    // Log the posted tweet to database
    await createPostedTweet({
      configId: config.id,
      tweetText: fullTweetText,
      sourceNewsUrl: sourceNewsUrl,
    });

    return {
      success: true,
      tweetId: tweetId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Twitter Poster] Failed to post tweet:", errorMessage);
    return {
      success: false,
      error: errorMessage,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Twitter Poster] Credentials validation failed:", errorMessage);
    return {
      valid: false,
      error: errorMessage,
    };
  }
}
