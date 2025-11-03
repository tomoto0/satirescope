import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Zap, Settings, TrendingUp, Sparkles } from "lucide-react";

/**
 * SatireScope Home Page
 * Landing page for the AI satirical news caster application
 */
export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">SatireScope</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Link href="/settings">
                  <Button variant="ghost" className="text-white hover:bg-slate-700">
                    Settings
                  </Button>
                </Link>
                <Link href="/tweets">
                  <Button variant="ghost" className="text-white hover:bg-slate-700">
                    Posted Tweets
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild className="bg-amber-500 hover:bg-amber-600">
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Automated Satirical News
            <span className="block text-amber-400">Posting to X</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            SatireScope automatically fetches the latest news, generates witty satirical commentary, creates AI-generated images, and posts them to your X (Twitter) account—every hour.
          </p>

          {!isAuthenticated ? (
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/settings">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                  Configure Twitter
                </Button>
              </Link>
              <Link href="/tweets">
                <Button size="lg" variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400/10">
                  View Posted Tweets
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {/* Feature 1 */}
          <Card className="bg-slate-800 border-slate-700 hover:border-amber-400 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-amber-400" />
                <CardTitle className="text-white">Automated Posting</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Posts run automatically every hour without manual intervention
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Set it and forget it. Our scheduler handles everything from news fetching to posting.
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-slate-800 border-slate-700 hover:border-amber-400 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <CardTitle className="text-white">AI-Generated Content</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                LLM creates witty commentary and satirical images
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Each post includes a clever tweet, insightful comment, and custom-generated satirical image.
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-slate-800 border-slate-700 hover:border-amber-400 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-amber-400" />
                <CardTitle className="text-white">Track Your Posts</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                View history of all posted tweets and their engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Monitor your satirical news feed with a complete posting history and source links.
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20 bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h4 className="text-white font-semibold mb-2">Fetch News</h4>
              <p className="text-slate-400 text-sm">
                Automatically retrieves latest news from major sources
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h4 className="text-white font-semibold mb-2">Generate Content</h4>
              <p className="text-slate-400 text-sm">
                AI creates witty tweets and satirical commentary
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h4 className="text-white font-semibold mb-2">Create Images</h4>
              <p className="text-slate-400 text-sm">
                Generates custom satirical images for each post
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h4 className="text-white font-semibold mb-2">Post to X</h4>
              <p className="text-slate-400 text-sm">
                Automatically posts to your Twitter account
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {isAuthenticated && (
          <div className="mt-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
            <p className="text-amber-100 mb-6">
              Configure your Twitter API credentials and let SatireScope handle the rest.
            </p>
            <Link href="/settings">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                <Settings className="w-5 h-5 mr-2" />
                Configure Now
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-400">
          <p>
            SatireScope © 2024 - Powered by Manus AI
          </p>
        </div>
      </footer>
    </div>
  );
}
