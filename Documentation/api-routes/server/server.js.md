```markdown
## Documentation for `server/server.js`

This document provides comprehensive information about the `server/server.js` file, which defines an Express.js API for generating recipe suggestions using the OpenAI API.

### Purpose & Overview

The primary purpose of this file is to create a server endpoint that receives user preferences for a meal (type, cuisine, dietary restrictions, cooking time, etc.) and uses these preferences as a prompt to generate a recipe using OpenAI's language model. The generated recipe is streamed back to the client in real-time using Server-Sent Events (SSE).

### Key Functions/Components

1.  **`express`:** Main framework for creating the server and defining routes.
2.  **`cors`:** Middleware to enable Cross-Origin Resource Sharing, allowing requests from different domains.
3.  **`OpenAI`:**  The OpenAI client library for interacting with the OpenAI API.
4.  **`dotenv`:** Loads environment variables from a `.env` file (for accessing API keys safely).
5.  **`app`:** Express application instance.
6.  **`port`:** The port number the server listens on (default is 3001).
7.  **`/recipeStream` endpoint:**
    *   Handles incoming requests for recipe generation.
    *   Retrieves meal preferences from the request query parameters.
    *   Sets up the response headers for Server-Sent Events (SSE).
    *   Constructs a prompt for the OpenAI API based on the received preferences.
    *   Calls `fetchOpenAiCompletionStream` to get the recipe from OpenAI.
    *   Sends data chunks back to the client using SSE.
    *   Handles client disconnection (`req.on('close')`).
8.  **`fetchOpenAiCompletionStream(messages, callback)`:**
    *   Asynchronously interacts with the OpenAI API to generate recipe suggestions.
    *   Retrieves the OpenAI API key from the environment variables.
    *   Creates an OpenAI client.
    *   Calls the OpenAI API to generate text (completion) based on the provided prompt (`messages`).
    *   Streams the response back to the calling function using a `callback` function for each chunk of data received from OpenAI.
    *   Handles potential errors from the OpenAI API.
9.  **`app.listen(port, ...)`:** Starts the Express server and listens for incoming requests on the specified port.

### Business Logic (if applicable)

The business logic focuses on translating user preferences into a coherent prompt for the OpenAI API and then relaying the streamed response back to the client.  The key aspects are:

*   **Prompt Construction:**  Carefully crafting the prompt to guide OpenAI towards generating a useful and well-formatted recipe.  The prompts includes meal type, cuisine, diet preferences, serving sizes, and target calories.
*   **SSE Handling:**  Properly setting up the server to stream the data chunk by chunk to the client until the completion is signaled by OpenAI (finish_reason: 'stop').
*   **Error Handling:** Implementing basic error handling for both the OpenAI API calls.

### Input/Output Specifications

**`/recipeStream` Endpoint:**

*   **Input (Query Parameters):**
    *   `mealType`:  (string) The type of meal (e.g., breakfast, lunch, dinner).
    *   `cuisine`: (string) The desired cuisine (e.g., Italian, Mexican, Indian).
    *   `dietConcerns`: (string)  Dietary restrictions or concerns (e.g., vegetarian, vegan, gluten-free, nut allergy).
    *   `cookingTime`: (number) Maximum cooking time in minutes.
    *   `servings`: (number) The number of servings the recipe should yield.
    *   `targetCalories`: (number)  The target calories per serving.
*   **Output (SSE Stream):**
    The output is a stream of Server-Sent Events. Each event contains a JSON object with the following structure:

    *   **`data: { action: "start" }`**: Indicates the start of the recipe generation. This is sent only once at the beginning.
    *   **`data: { action: "chunk", chunk: "..." }`**: Contains a chunk of the generated recipe text. The `chunk` property contains a string of text. Sent multiple times throughout the recipe generation.
    *   **`data: { action: "close" }`**: Indicates the end of the recipe generation. Sent once when OpenAI signals the completion.

**`fetchOpenAiCompletionStream(messages, callback)`:**

*   **Input:**
    *   `messages`: An array of message objects representing the conversation history with the OpenAI API. The recipe generation prompt is the content of the last message.
    *   `callback`: A function that accepts a single argument, a `chunk` from the OpenAI stream. This function is called for each chunk of data received from the OpenAI API.
*   **Output:**  (Indirectly)
    *   The function calls the `callback` function for each chunk of data received from the OpenAI API. The `callback` function handles sending the data to the client.

### Usage Examples

**Example API Request:**

```
GET http://localhost:3001/recipeStream?mealType=dinner&cuisine=Italian&dietConcerns=vegetarian&cookingTime=30&servings=2&targetCalories=500
```

**Example SSE Event Data:**

```json
data: {"action": "start"}

data: {"action": "chunk", "chunk": " Title: Vegetarian Pasta"}

data: {"action": "chunk", "chunk": " Primavera\n\n"}

data: {"action": "chunk", "chunk": "Ingredients:\n- 8 "}

... (more chunks of the recipe)

data: {"action": "close"}
```

### Dependencies

*   **`express`:**  Web application framework.  `npm install express`
*   **`cors`:**  Middleware for enabling CORS.  `npm install cors`
*   **`openai`:**  OpenAI API client.  `npm install openai`
*   **`dotenv`:**  Loads environment variables from a `.env` file.  `npm install dotenv`

### Important Notes

*   **API Key Security:**  The OpenAI API key is loaded from a `.env` file.  Never commit your API key directly to your code repository.  Ensure that your `.env` file is included in your `.gitignore` file.
*   **OpenAI API Usage:** Be mindful of OpenAI API usage costs and rate limits.  Implement error handling and retry logic to manage potential API errors.
*   **Error Handling:** The current implementation includes basic error handling. Consider adding more robust error handling, including logging and custom error responses.
*   **Model Selection:**  The `aiModel` variable (`gpt-5-mini`) specifies the OpenAI model used for text generation. Choose a model appropriate for your needs, considering cost and performance. "gpt-5-mini" might not be a valid model; make sure replace it with a valid, accessible OpenAI model.
*   **Prompt Engineering:** The quality of the generated recipes heavily depends on the prompt. Experiment with different prompt formats and content to optimize the results.
*   **SSE Implementation:**  The SSE implementation assumes the client is prepared to handle a continuous stream of data. Consider adding buffering or other mechanisms to handle slow or unreliable client connections.
*   **Scalability:** For production environments, consider using a more robust streaming solution, such as WebSockets, or a message queue for handling high volumes of requests.
```