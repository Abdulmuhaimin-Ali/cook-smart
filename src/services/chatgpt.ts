// Types for ChatGPT API
export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatCompletionMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class ChatGPTService {
  private apiKey: string = localStorage.getItem("chatgptApiKey") || "";
  private apiEndpoint: string = "https://api.openai.com/v1/chat/completions";

  // Save API key to localStorage
  public saveApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem("chatgptApiKey", key);
  }

  // Check if API key is configured
  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get the API key
  public getApiKey(): string {
    return this.apiKey;
  }

  // Send a request to the ChatGPT API
  public async createChatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error("ChatGPT API key not configured");
    }

    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || "Failed to get response from ChatGPT API"
      );
    }

    return response.json();
  }
}

// Export a singleton instance
export const chatGPTService = new ChatGPTService();

// demo
// demo
