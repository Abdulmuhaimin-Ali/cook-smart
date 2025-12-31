import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  saveSupabaseCredentials,
  isSupabaseConfigured,
} from "@/services/supabase";
import { chatGPTService } from "@/services/chatgpt";
import { toast } from "@/components/ui/use-toast";

const ApiKeySettings = () => {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [chatGptKey, setChatGptKey] = useState("");
  // demo
  // Check for existing configuration
  useEffect(() => {
    const existingSupabaseUrl = localStorage.getItem("supabaseUrl") || "";
    const existingSupabaseKey = localStorage.getItem("supabaseKey") || "";
    const existingChatGptKey = chatGPTService.getApiKey();

    setSupabaseUrl(existingSupabaseUrl);
    setSupabaseKey(existingSupabaseKey);
    setChatGptKey(existingChatGptKey);
  }, []);

  const handleSaveSupabase = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Missing Information",
        description: "Please provide both Supabase URL and API key",
        variant: "destructive",
      });
      return;
    }

    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    toast({
      title: "Supabase Configured",
      description: "Your Supabase credentials have been saved",
    });
  };

  const handleSaveChatGpt = () => {
    if (!chatGptKey) {
      toast({
        title: "Missing Information",
        description: "Please provide your ChatGPT API key",
        variant: "destructive",
      });
      return;
    }

    chatGPTService.saveApiKey(chatGptKey);
    toast({
      title: "ChatGPT API Configured",
      description: "Your ChatGPT API key has been saved",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Configuration</CardTitle>
          <CardDescription>
            Enter your Supabase project URL and API key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabase-url">Supabase URL</Label>
            <Input
              id="supabase-url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabase-key">Supabase API Key</Label>
            <Input
              id="supabase-key"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="your-supabase-api-key"
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Use your Supabase anon/public key for client-side access
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSupabase}>
            {isSupabaseConfigured()
              ? "Update Supabase Settings"
              : "Save Supabase Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ChatGPT API Configuration</CardTitle>
          <CardDescription>
            Enter your OpenAI API key for ChatGPT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chatgpt-key">OpenAI API Key</Label>
            <Input
              id="chatgpt-key"
              value={chatGptKey}
              onChange={(e) => setChatGptKey(e.target.value)}
              placeholder="sk-..."
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Your key is stored locally in your browser, not on our servers
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChatGpt}>
            {chatGPTService.isConfigured()
              ? "Update ChatGPT API Key"
              : "Save ChatGPT API Key"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeySettings;
