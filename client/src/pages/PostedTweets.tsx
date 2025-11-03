import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Image as ImageIcon, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Posted Tweets Page
 * Displays history of posted tweets with images and source links
 */
export default function PostedTweets() {
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");

  // Get user's Twitter configs
  const { data: configs, isLoading: configsLoading } = trpc.twitter.getConfigs.useQuery();

  // Get posted tweets for selected config
  const { data: tweets, isLoading: tweetsLoading } = trpc.twitter.getPostedTweets.useQuery(
    { configId: parseInt(selectedConfigId), limit: 50 },
    { enabled: !!selectedConfigId }
  );

  const isLoading = configsLoading || tweetsLoading;

  if (configsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasConfigs = configs && configs.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Posted Tweets</h1>
          <p className="text-slate-600">View history of tweets posted to your X accounts</p>
        </div>

        {/* Configuration Selector */}
        {hasConfigs && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Configuration</CardTitle>
              <CardDescription>Choose which Twitter configuration's tweets to view</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a configuration" />
                </SelectTrigger>
                <SelectContent>
                  {configs.map((config) => (
                    <SelectItem key={config.id} value={config.id.toString()}>
                      Configuration #{config.id} {config.isActive ? "(Active)" : "(Inactive)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* No Configurations */}
        {!hasConfigs && (
          <Alert className="border-yellow-200 bg-yellow-50 mb-6">
            <AlertDescription className="text-yellow-800">
              No Twitter configurations found. Please register your credentials in the Twitter Settings page first.
            </AlertDescription>
          </Alert>
        )}

        {/* Tweets List */}
        {selectedConfigId && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : tweets && tweets.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {tweets.length} Tweet{tweets.length !== 1 ? "s" : ""} Posted
                </h2>
                {tweets.map((tweet) => (
                  <Card key={tweet.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              {new Date(tweet.postedAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-900 text-base leading-relaxed whitespace-pre-wrap">
                            {tweet.tweetText}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Tweet Image */}
                      {tweet.imageUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Image</span>
                          </div>
                          <div className="relative bg-slate-100 rounded-lg overflow-hidden">
                            <img
                              src={tweet.imageUrl}
                              alt="Tweet image"
                              className="w-full h-auto max-h-96 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-image.png";
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Source Link */}
                      {tweet.sourceNewsUrl && (
                        <div className="pt-2 border-t border-slate-200">
                          <a
                            href={tweet.sourceNewsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Source Article
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tweets Posted Yet</h3>
                  <p className="text-slate-600">
                    Tweets will appear here once the automated posting system posts them.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedConfigId && hasConfigs && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Configuration</h3>
              <p className="text-slate-600">
                Choose a Twitter configuration above to view its posted tweets.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
