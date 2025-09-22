import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/lib/toast";
import { IpcClient } from "@/ipc/ipc_client";
import { useAtomValue } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";

interface StripeIntegrationProps {
  onComplete?: () => void;
}

export const StripeIntegration: React.FC<StripeIntegrationProps> = ({ onComplete }) => {
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const appId = useAtomValue(selectedAppIdAtom);

  const handleSetupStripe = async () => {
    if (!appId) {
      showError("No app selected");
      return;
    }

    if (!stripePublishableKey || !stripeSecretKey) {
      showError("Please provide both Stripe keys");
      return;
    }

    if (!stripePublishableKey.startsWith("pk_")) {
      showError("Publishable key should start with 'pk_'");
      return;
    }

    if (!stripeSecretKey.startsWith("sk_")) {
      showError("Secret key should start with 'sk_'");
      return;
    }

    setIsLoading(true);
    try {
      const ipcClient = IpcClient.getInstance();
      
      // Add Stripe environment variables
      await ipcClient.setAppEnvVar(appId, "STRIPE_PUBLISHABLE_KEY", stripePublishableKey);
      await ipcClient.setAppEnvVar(appId, "STRIPE_SECRET_KEY", stripeSecretKey);
      
      // Add Stripe dependencies
      await ipcClient.addDependency(appId, "stripe", "latest");
      await ipcClient.addDependency(appId, "@stripe/stripe-js", "latest");
      
      showSuccess("Stripe integration added successfully!");
      onComplete?.();
    } catch (error) {
      console.error("Failed to setup Stripe:", error);
      showError("Failed to setup Stripe integration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💳</span>
          Stripe Integration
        </CardTitle>
        <CardDescription>
          Add Stripe payment processing to your application. Get your API keys from{" "}
          <a 
            href="https://dashboard.stripe.com/apikeys" 
            className="text-blue-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              IpcClient.getInstance().openExternalUrl("https://dashboard.stripe.com/apikeys");
            }}
          >
            Stripe Dashboard
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="publishable-key">Publishable Key</Label>
          <Input
            id="publishable-key"
            type="text"
            placeholder="pk_test_..."
            value={stripePublishableKey}
            onChange={(e) => setStripePublishableKey(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="secret-key">Secret Key</Label>
          <Input
            id="secret-key"
            type="password"
            placeholder="sk_test_..."
            value={stripeSecretKey}
            onChange={(e) => setStripeSecretKey(e.target.value)}
          />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Install Stripe npm packages</p>
          <p>✅ Add environment variables</p>
          <p>✅ Ready for checkout, payments & webhooks</p>
        </div>

        <Button 
          onClick={handleSetupStripe}
          disabled={isLoading || !stripePublishableKey || !stripeSecretKey}
          className="w-full"
        >
          {isLoading ? "Setting up..." : "Add Stripe to Project"}
        </Button>
      </CardContent>
    </Card>
  );
};