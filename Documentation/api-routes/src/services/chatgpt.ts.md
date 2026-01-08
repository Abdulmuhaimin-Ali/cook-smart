```markdown
## Purpose & Overview

This file, `src/services/chatgpt.ts`, defines a service (`ChatGPTService`) for interacting with the OpenAI ChatGPT API. It provides an abstraction layer, simplifying the process of sending prompts and receiving responses from the ChatGPT model.  The service handles API key management (saving and retrieving from `localStorage`), request formatting, and error handling. It exports a singleton instance of the service for easy access throughout the application.

## Key Functions/Components

*   **`ChatCompletionMessage` Interface:** Defines the structure for a message in the chat completion request. Includes the `role` (system, user, or assistant) and the `content` of the message.
*   **`ChatCompletionOptions` Interface:** Defines the structure for the options passed to the `createChatCompletion` method, including the model, messages, temperature, and max_tokens.
*   **`ChatCompletionResponse` Interface:** Defines the structure of the response received from the ChatGPT API, containing information about the generated text, token usage, and more.
*   **`ChatGPTService` Class:**
    *   `apiKey: string`: Stores the API key retrieved from `localStorage`.
    *   `apiEndpoint: string`:  The URL of the OpenAI Chat Completions API endpoint.
    *   `saveApiKey(key: string): void`: Saves the provided API key to both the `apiKey` property and `localStorage`.
    *   `isConfigured(): boolean`: Checks if an API key is currently configured (i.e., not an empty string).
    *   `getApiKey(): string`: Returns the currently configured API key.
    *   `createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse>`: Sends a request to the ChatGPT API with the provided options. Handles API key validation, request formatting, error handling, and response parsing.
*   **`chatGPTService` (Singleton Instance):** A single instance of the `ChatGPTService` class, exported for use throughout the application.

## Business Logic (if applicable)

The business logic is focused on managing the interaction with the external ChatGPT API. Key aspects include:

*   **API Key Management:** The service securely stores the API key (albeit in `localStorage`, which is client-side and should be used with caution) and provides methods for checking its existence and retrieving it.
*   **Request Construction:** The `createChatCompletion` method constructs the request body according to the OpenAI API specifications, using the provided `ChatCompletionOptions`.  It sets default values for `temperature` and `max_tokens` if they are not explicitly provided.
*   **Error Handling:** The `createChatCompletion` method handles potential errors from the API, parsing the JSON response and throwing an error with a more informative message.
*   **Singleton Pattern:** Ensures that only one instance of the `ChatGPTService` is created, promoting code consistency and simplifying state management.

## Input/Output Specifications

*   **`saveApiKey(key: string)`:**
    *   **Input:** `key: string` - The ChatGPT API key to save.
    *   **Output:** `void` - Saves the key to `localStorage` and the `apiKey` property.
*   **`isConfigured()`:**
    *   **Input:** None
    *   **Output:** `boolean` - `true` if an API key is configured, `false` otherwise.
*   **`getApiKey()`:**
    *   **Input:** None
    *   **Output:** `string` - The currently configured API key. Can be an empty string if no key is set.
*   **`createChatCompletion(options: ChatCompletionOptions)`:**
    *   **Input:** `options: ChatCompletionOptions` - An object containing the parameters for the ChatGPT API request, including:
        *   `model: string` - The name of the ChatGPT model to use (e.g., "gpt-3.5-turbo").
        *   `messages: ChatCompletionMessage[]` - An array of messages representing the conversation history.
        *   `temperature?: number` (optional) - Controls the randomness of the generated text (default: 0.7).
        *   `max_tokens?: number` (optional) - The maximum number of tokens to generate (default: 1000).
    *   **Output:** `Promise<ChatCompletionResponse>` - A promise that resolves with a `ChatCompletionResponse` object containing the API's response.  The promise will reject with an `Error` object if the API request fails.

## Usage Examples

```typescript
import { chatGPTService, ChatCompletionMessage } from "./services/chatgpt";

// Example 1: Setting and retrieving the API key
chatGPTService.saveApiKey("YOUR_ACTUAL_API_KEY");
const apiKey = chatGPTService.getApiKey();
console.log("API Key:", apiKey); // Output: API Key: YOUR_ACTUAL_API_KEY

// Example 2: Checking if the API key is configured
const isConfigured = chatGPTService.isConfigured();
console.log("Is configured:", isConfigured); // Output: Is configured: true

// Example 3: Making a chat completion request
async function getChatResponse(prompt: string) {
  try {
    const messages: ChatCompletionMessage[] = [
      { role: "user", content: prompt },
    ];

    const response = await chatGPTService.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.8, //optional
    });

    console.log("Chat Completion Response:", response);
    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
}

// Example usage of getChatResponse
getChatResponse("Tell me a joke.").then(joke => {
  if (joke) {
    console.log("Joke:", joke);
  }
});

```

## Dependencies

*   **`localStorage`:** Used for storing the API key.  This is a browser-specific API, so this code will only work in a browser environment. **Important Note:** `localStorage` is client-side storage and should not be used to store sensitive information like API keys in a production environment. Consider using a more secure storage mechanism.
*   **`fetch` API:** Used for making HTTP requests to the OpenAI API.  This is a standard web API and is expected to be available.

## Important Notes

*   **Security:**  The current implementation stores the API key in `localStorage`, which is **insecure**.  For production applications, store the API key on the server-side and make requests to the OpenAI API from the server.  Never expose your API key directly in client-side code.  Consider using environment variables for local development and a secure key management system for production.
*   **Error Handling:** The code includes basic error handling, but you may want to add more sophisticated error handling and logging for production environments.
*   **Rate Limiting:** The OpenAI API has rate limits.  You should implement rate limiting in your application to avoid exceeding the limits and getting errors.
*   **Cost:**  Using the OpenAI API costs money.  Monitor your usage and set spending limits to avoid unexpected charges.
*   **Typescript:** The use of Typescript enhances code maintainability, readability and provides type safety, reducing potential runtime errors. Ensure your development environment is configured correctly to leverage these advantages.
*   **Singleton Pattern:** While convenient, the singleton pattern can sometimes make testing more difficult. Consider dependency injection for more flexible testing.
