import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

/**
 * Twitter Settings Page
 * Allows users to register, update, and manage their Twitter API credentials
 */
export default function TwitterSettings() {
  const [showForm, setShowForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    xApiKey: "",
    xApiKeySecret: "",
    xAccessToken: "",
    xAccessTokenSecret: "",
  });

  // Queries
  const { data: configs, isLoading, refetch } = trpc.twitter.getConfigs.useQuery();

  // Mutations
  const createConfigMutation = trpc.twitter.createConfig.useMutation({
    onSuccess: () => {
      toast.success("Twitter configuration created successfully!");
      setFormData({
        xApiKey: "",
        xApiKeySecret: "",
        xAccessToken: "",
        xAccessTokenSecret: "",
      });
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create configuration: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.twitter.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to toggle status: ${error.message}`);
    },
  });

  const deleteConfigMutation = trpc.twitter.deleteConfig.useMutation({
    onSuccess: () => {
      toast.success("Configuration deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete configuration: ${error.message}`);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createConfigMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = (configId: number) => {
    toggleActiveMutation.mutate({ configId });
  };

  const handleDelete = (configId: number) => {
    if (confirm("Are you sure you want to delete this configuration?")) {
      deleteConfigMutation.mutate({ configId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasConfig = configs && configs.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Twitter Settings</h1>
          <p className="text-slate-600">Manage your X (Twitter) API credentials for automated posting</p>
        </div>

        {/* Configuration Form */}
        {!hasConfig || showForm ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Register Twitter API Credentials</CardTitle>
              <CardDescription>
                Enter your X API credentials to enable automated posting. Your credentials are encrypted and stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="xApiKey">API Key</Label>
                  <Input
                    id="xApiKey"
                    name="xApiKey"
                    type={showPasswords ? "text" : "password"}
                    placeholder="Your API Key"
                    value={formData.xApiKey}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="xApiKeySecret">API Key Secret</Label>
                  <Input
                    id="xApiKeySecret"
                    name="xApiKeySecret"
                    type={showPasswords ? "text" : "password"}
                    placeholder="Your API Key Secret"
                    value={formData.xApiKeySecret}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="xAccessToken">Access Token</Label>
                  <Input
                    id="xAccessToken"
                    name="xAccessToken"
                    type={showPasswords ? "text" : "password"}
                    placeholder="Your Access Token"
                    value={formData.xAccessToken}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="xAccessTokenSecret">Access Token Secret</Label>
                  <Input
                    id="xAccessTokenSecret"
                    name="xAccessTokenSecret"
                    type={showPasswords ? "text" : "password"}
                    placeholder="Your Access Token Secret"
                    value={formData.xAccessTokenSecret}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Show/Hide Password Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900"
                  >
                    {showPasswords ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide credentials</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Show credentials</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || createConfigMutation.isPending}
                    className="flex-1"
                  >
                    {isSubmitting || createConfigMutation.isPending ? "Saving..." : "Save Credentials"}
                  </Button>
                  {hasConfig && (
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>

              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your credentials are encrypted using bcrypt and stored securely. We never store them in plain text.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : null}

        {/* Existing Configurations */}
        {hasConfig && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Active Configurations</h2>

            {configs.map((config) => (
              <Card key={config.id} className="border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <CardTitle className="text-lg">Configuration #{config.id}</CardTitle>
                        <CardDescription>
                          Created: {new Date(config.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`toggle-${config.id}`} className="text-sm font-medium">
                          {config.isActive ? "Active" : "Inactive"}
                        </Label>
                        <Switch
                          id={`toggle-${config.id}`}
                          checked={config.isActive}
                          onCheckedChange={() => handleToggleActive(config.id)}
                          disabled={toggleActiveMutation.isPending}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                      disabled={deleteConfigMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowForm(true)}
                    >
                      Update Credentials
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Another Configuration Button */}
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="w-full"
            >
              Add Another Configuration
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!hasConfig && !showForm && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Configuration Found</h3>
              <p className="text-slate-600 mb-6">
                Register your X API credentials to start automated posting.
              </p>
              <Button onClick={() => setShowForm(true)}>Register Credentials</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
