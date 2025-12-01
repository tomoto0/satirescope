import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getTwitterConfigsByUserId,
  getTwitterConfigById,
  createTwitterConfig,
  updateTwitterConfig,
  deleteTwitterConfig,
  getPostedTweetsByConfigId,
} from "../db";
import { encryptReversible, decryptReversible } from "../crypto";
import { TRPCError } from "@trpc/server";
import { updateConfigScheduler } from "../scheduler";

/**
 * Twitter configuration router
 * Handles CRUD operations for Twitter API credentials
 */
export const twitterRouter = router({
  /**
   * Get all Twitter configs for the current user
   */
  getConfigs: protectedProcedure.query(async ({ ctx }) => {
    try {
      const configs = await getTwitterConfigsByUserId(ctx.user.id);
      // Don't return encrypted values to frontend
      return configs.map((config) => ({
        id: config.id,
        isActive: config.isActive === 1,
        scheduleIntervalMinutes: config.scheduleIntervalMinutes || 60,
        scheduleStartHour: config.scheduleStartHour || 0,
        scheduleEndHour: config.scheduleEndHour || 23,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }));
    } catch (error) {
      console.error("[Twitter Router] Failed to get configs:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch Twitter configurations",
      });
    }
  }),

  /**
   * Create a new Twitter config
   */
  createConfig: protectedProcedure
    .input(
      z.object({
        xApiKey: z.string().min(1, "API Key is required"),
        xApiKeySecret: z.string().min(1, "API Key Secret is required"),
        xAccessToken: z.string().min(1, "Access Token is required"),
        xAccessTokenSecret: z.string().min(1, "Access Token Secret is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Encrypt sensitive data
        const encryptedConfig = {
          userId: ctx.user.id,
          xApiKey: encryptReversible(input.xApiKey),
          xApiKeySecret: encryptReversible(input.xApiKeySecret),
          xAccessToken: encryptReversible(input.xAccessToken),
          xAccessTokenSecret: encryptReversible(input.xAccessTokenSecret),
          isActive: 1,
        };

        await createTwitterConfig(encryptedConfig);

        return {
          success: true,
          message: "Twitter configuration created successfully",
        };
      } catch (error) {
        console.error("[Twitter Router] Failed to create config:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Twitter configuration",
        });
      }
    }),

  /**
   * Update a Twitter config
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        configId: z.number(),
        xApiKey: z.string().optional(),
        xApiKeySecret: z.string().optional(),
        xAccessToken: z.string().optional(),
        xAccessTokenSecret: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const config = await getTwitterConfigById(input.configId);
        if (!config || config.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to update this configuration",
          });
        }

        // Prepare update object
        const updateData: Record<string, unknown> = {};
        if (input.xApiKey) updateData.xApiKey = encryptReversible(input.xApiKey);
        if (input.xApiKeySecret) updateData.xApiKeySecret = encryptReversible(input.xApiKeySecret);
        if (input.xAccessToken) updateData.xAccessToken = encryptReversible(input.xAccessToken);
        if (input.xAccessTokenSecret)
          updateData.xAccessTokenSecret = encryptReversible(input.xAccessTokenSecret);

        await updateTwitterConfig(input.configId, updateData as any);

        return {
          success: true,
          message: "Twitter configuration updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Twitter Router] Failed to update config:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update Twitter configuration",
        });
      }
    }),

  /**
   * Delete a Twitter config
   */
  deleteConfig: protectedProcedure
    .input(z.object({ configId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const config = await getTwitterConfigById(input.configId);
        if (!config || config.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to delete this configuration",
          });
        }

        await deleteTwitterConfig(input.configId);

        return {
          success: true,
          message: "Twitter configuration deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Twitter Router] Failed to delete config:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete Twitter configuration",
        });
      }
    }),

  /**
   * Toggle active status of a Twitter config
   */
  toggleActive: protectedProcedure
    .input(z.object({ configId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const config = await getTwitterConfigById(input.configId);
        if (!config || config.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to modify this configuration",
          });
        }

        const newStatus = config.isActive === 1 ? 0 : 1;
        await updateTwitterConfig(input.configId, { isActive: newStatus });

        // Update scheduler based on new status
        console.log(`[Twitter Router] Toggling scheduler for config ${input.configId} to ${newStatus === 1 ? "active" : "inactive"}`);
        await updateConfigScheduler(input.configId);

        return {
          success: true,
          isActive: newStatus === 1,
          message: `Twitter configuration ${newStatus === 1 ? "activated" : "deactivated"}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Twitter Router] Failed to toggle active status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle Twitter configuration status",
        });
      }
    }),

  /**
   * Get posted tweets for a config
   */
  getPostedTweets: protectedProcedure
    .input(z.object({ configId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const config = await getTwitterConfigById(input.configId);
        if (!config || config.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view this configuration's tweets",
          });
        }

        const tweets = await getPostedTweetsByConfigId(input.configId, input.limit);
        return tweets;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Twitter Router] Failed to get posted tweets:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch posted tweets",
        });
      }
    }),

  /**
   * Get decrypted credentials for a config (internal use only)
   * This should only be called by backend services, never exposed to frontend
   */
  getDecryptedCredentials: protectedProcedure
    .input(z.object({ configId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const config = await getTwitterConfigById(input.configId);
        if (!config || config.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to access this configuration",
          });
        }

        // Decrypt credentials
        return {
          xApiKey: decryptReversible(config.xApiKey),
          xApiKeySecret: decryptReversible(config.xApiKeySecret),
          xAccessToken: decryptReversible(config.xAccessToken),
          xAccessTokenSecret: decryptReversible(config.xAccessTokenSecret),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Twitter Router] Failed to get decrypted credentials:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve credentials",
        });
      }
    }),

  /**
   * Update posting schedule for a config
   */
  updateSchedule: protectedProcedure
    .input(
      z.object({
        configId: z.number(),
        scheduleIntervalMinutes: z.number().min(15).max(1440),
        scheduleStartHour: z.number().min(0).max(23),
        scheduleEndHour: z.number().min(0).max(23),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const config = await getTwitterConfigById(input.configId);
        if (!config || config.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to modify this configuration",
          });
        }

        // Validate schedule
        if (input.scheduleStartHour > input.scheduleEndHour) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start hour must be less than or equal to end hour",
          });
        }

        // Update schedule
        const updateData: Record<string, unknown> = {
          scheduleIntervalMinutes: input.scheduleIntervalMinutes,
          scheduleStartHour: input.scheduleStartHour,
          scheduleEndHour: input.scheduleEndHour,
        };
        await updateTwitterConfig(input.configId, updateData as any);

        // Note: Scheduler will pick up the new schedule on next run
        // For immediate effect, the scheduler would need to be restarted

        return {
          success: true,
          message: "Posting schedule updated successfully. Changes will take effect on the next scheduled run.",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Twitter Router] Failed to update schedule:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update posting schedule",
        });
      }
    }),

  /**
   * Manually trigger a post for a specific config
   */
  manualPost: protectedProcedure
    .input(z.object({ configId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const config = await getTwitterConfigById(input.configId);
        if (!config || config.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to post with this configuration",
          });
        }

        if (!config.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This configuration is not active. Please activate it first.",
          });
        }

        // Import posting modules
        const { fetchNewsArticles, processNewsArticle } = await import("../newsEngine");
        const { postTweetWithImage } = await import("../twitterPoster");

        // Get decrypted credentials
        const credentials = {
          xApiKey: decryptReversible(config.xApiKey),
          xApiKeySecret: decryptReversible(config.xApiKeySecret),
          xAccessToken: decryptReversible(config.xAccessToken),
          xAccessTokenSecret: decryptReversible(config.xAccessTokenSecret),
        };

        // Fetch news
        const articles = await fetchNewsArticles();
        if (articles.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No news articles found to post",
          });
        }

        // Use the first article
        const article = articles[0];

        // Generate satirical content
        const content = await processNewsArticle(article);

        // Post to Twitter
        if (!content.imageUrl) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate image for post",
          });
        }

        const result = await postTweetWithImage(
          config,
          content.tweetText,
          content.imageUrl,
          article.url
        );

        return {
          success: true,
          message: "Post published successfully!",
          tweetId: result.tweetId || "unknown",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Twitter Router] Failed to post manually:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to publish post",
        });
      }
    }),
});
