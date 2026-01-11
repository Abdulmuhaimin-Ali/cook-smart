```markdown
## Purpose & Overview

This `server.js` file creates an Express server that exposes a single API endpoint (`/recipeStream`) which leverages the OpenAI API to generate a recipe based on user-provided preferences. The server streams the recipe generation process to the client using Server-Sent Events (SSE), providing a near real-time experience.  It uses environment variables to securely manage the OpenAI API key.

## Key Functions/Components

   **`express()`:**  The core Express framework instance for creating the web server.
   **`cors()`:** Middleware for enabling Cross-Origin Resource Sharing (CORS), allowing requests from different origins (e.g., a frontend running on a different port).
*   **`OpenAI`:**  The OpenAI library for interacting with the OpenAI API.
*   **`dotenv.config()`:**  Loads environment variables from a `.env` file.
*   **`/recipeStream` endpoint:**
    *   Handles incoming requests with recipe preferences as query parameters.
    *   Sets up the SSE headers (`Content-Type`, `Cache-Control`, `Connection`).
    *   Constructs a prompt for the OpenAI API based on the provided parameters.
    *   Calls `fetchOpenAiCompletionStream()` to generate the recipe using the OpenAI API.
    *   Sends data chunks as SSE events to the client.
    *   Handles client disconnection to prevent memory leaks.
*   **`fetchOpenAiCompletionStream(messages, callback)`:**
    *   Asynchronously fetches completion results from OpenAI's `chat.completions.create` API.
    *   Uses the `stream: true` option for streaming responses.
    *   Iterates through the stream of chunks.
    *   Calls the provided `callback` function for each chunk, allowing the server to process and send the data to the client. Includes error handling.
*   **`sendEvent(chunk)`:**  Formats the chunks received from OpenAI into SSE messages and sends them to the client. This function handles the following cases:
      *  Sends a `close` event when the OpenAI API signals the end of the stream (`chunk.choices[0].finish_reason === "stop"`).
      *  Sends a `start` event when the assistant role is first received.
      *  Sends `chunk` events containing the content of each chunk.
*   **`app.listen(port, ...)`:** Starts the Express server and listens on the specified port.

## Business Logic (if applicable)

The primary business logic involves constructing a prompt for the OpenAI API based on user preferences. This prompt is designed to guide the AI model to generate a recipe that meets the specified criteria:

1.  **Prompt Construction:** The `/recipeStream` route constructs a prompt from the query parameters received in the HTTP request. It creates a specific set of instructions.
2.  **API Interaction:** The `fetchOpenAiCompletionStream` function then sends the prompt to the OpenAI API.
3.  **Streaming Response:** The API returns a stream of data, which is processed and sent to the client in real-time.
4.  **SSE Formatting:** The `sendEvent` function formats each chunk from OpenAI into a specific format for Server-Sent Events (SSE) to be easily consumed by the client.

## Input/Output Specifications

**Input ( `/recipeStream` endpoint - Query Parameters):**

*   `mealType`: (String) e.g., "Breakfast", "Lunch", "Dinner"
*   `cuisine`: (String) e.g., "Italian", "Mexican", "Indian"
*   `dietConcerns`: (String) e.g., "Vegetarian", "Gluten-Free", "Vegan"
*   `cookingTime`: (Number) Cooking time in minutes.
*   `servings`: (Number) Number of servings the recipe should yield.
*   `targetCalories`: (Number) Target calories per serving.

**Output (SSE Stream):**

The server streams data in the following JSON format through SSE. Each `data:` line represents a single event.

*   **`data: { "action": "start" }`:** Indicates the start of the recipe generation.  Sent when the assistant role is first received.
*   **`data: { "action": "chunk", "chunk": "..." }`:** Contains a portion of the generated recipe text.  The `chunk` field holds the text segment.
*   **`data: { "action": "close" }`:** Indicates the end of the recipe generation.

**Error Handling:**

If the OpenAI API returns an error, the server logs the error to the console.  The current implementation doesn't send error messages to the client.  A more robust implementation should include error handling that sends error information to the client via SSE.

## Usage Examples

**Example Request (from a browser or using `curl`):**

```
fetch('http://localhost:3001/recipeStream?mealType=Dinner&cuisine=Italian&dietConcerns=Vegetarian&cookingTime=30&servings=4&targetCalories=600')
  .then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(decoder.decode(value));
            push();
          });
        }
        push();
      }
    });
  })
  .then(stream => new Response(stream))
  .then(response => response.text())
  .then(result => {
    // Process the SSE stream (result)
    // Parse each line as a JSON object.
    result.split('\n\n').forEach(event => {
      if (event.trim() !== '') {
        try {
          const data = JSON.parse(event.replace('data: ', ''));  // important to remove data:
          console.log("Received data:", data);
        } catch (error) {
          console.error("Error parsing SSE event:", error, event);
        }
      }
    });
  })
  .catch(error => {
    console.error("Error fetching recipe stream:", error);
  });
```

This example requests a vegetarian Italian dinner recipe that should take 30 minutes to cook, serve 4 people, and have a target of 600 calories per serving.  The client code demonstrates how to consume a SSE stream in JavaScript.

**Expected Output (SSE Stream):**

The client receives a stream of events structured as described in the Input/Output Specifications.  The client-side code needs to parse these events to build the recipe dynamically.

## Dependencies

*   **express:**  Web application framework for Node.js.  `npm install express`
*   **cors:** Middleware for enabling CORS. `npm install cors`
*   **openai:** OpenAI's Node.js library for interacting with their API. `npm install openai`
*   **dotenv:**  Loads environment variables from a `.env` file. `npm install dotenv`

## Important Notes

*   **API Key Security:**  The OpenAI API key is loaded from the `.env` file.  **Never** commit your API key directly into your codebase.  Use environment variables or a secrets management system.
*   **Error Handling:**  The error handling in the `fetchOpenAiCompletionStream` function is basic.  A production system should handle errors more gracefully, potentially sending error messages to the client via SSE.
*   **Rate Limiting:** Be mindful of OpenAI's API rate limits.  Implement appropriate rate limiting mechanisms on the server-side to prevent exceeding the limits.
*   **Model Choice:**  The code uses `gpt-5-mini` as the model. You may need to change this to a model available to your OpenAI account (e.g., `"gpt-3.5-turbo"` or `"gpt-4"`) and appropriate to your use case. The documentation may also be incorrect (e.g. gpt-5-mini might not exist).
*   **Prompt Engineering:** The quality of the generated recipes depends heavily on the prompt. Experiment with different prompt structures to optimize the results.
*   **SSE Client Implementation:** The provided JavaScript example shows how to consume an SSE stream. You will likely need to adapt this code to fit your specific frontend framework or library.
*   **Resource Management:**  The `req.on('close', ...)` code is crucial.  Without it, the SSE stream can remain open indefinitely, leading to resource leaks.
*   **Client Timeout:**  Consider implementing a timeout on the client-side to handle cases where the server becomes unresponsive.


