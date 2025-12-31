## Purpose & Overview

The `server/server.js` file implements a simple web server using Node.js and Express.js. The primary purpose of this server is to act as a backend for an application that generates recipe suggestions based on user-defined preferences.  It leverages the OpenAI API (specifically the chat completions endpoint with streaming functionality) to generate the recipe content and streams the response back to the client in real-time using Server-Sent Events (SSE). The server receives recipe parameters via query parameters, constructs a prompt for the OpenAI API, and relays the response data to the client for display.

## Key Functions/Components

*   **Express.js Server:** Handles HTTP requests and responses.
*   **`/recipeStream` Endpoint:**  The core endpoint that receives recipe preferences, interacts with the OpenAI API, and streams the generated recipe back to the client.
*   **`fetchOpenAiCompletionStream` Function:**  Handles the communication with the OpenAI API, including authentication, request construction, and streaming the response chunks.
*   **Server-Sent Events (SSE):**  The mechanism used to stream the recipe content to the client in real-time.
*   **Environment Variables:** Uses `.env` file to store sensitive information like the OpenAI API key.

## Business Logic (if applicable)

The "business logic" of this server can be broken down as follows:

1.  **Request Processing:** Receives a request to the `/recipeStream` endpoint containing recipe preferences (meal type, cuisine, dietary concerns, cooking time, servings, target calories) as query parameters.

2.  **Prompt Construction:**  Constructs a prompt for the OpenAI API based on the user's preferences.  The prompt includes instructions to generate a meal with specific instructions regarding the desired format of the response(title, ingredients, instructions).

3.  **OpenAI Interaction:** Calls the `fetchOpenAiCompletionStream` function to send the prompt to the OpenAI API and initiates the streaming of the API's response.

4.  **Response Streaming:** As the OpenAI API generates the recipe in chunks, the `fetchOpenAiCompletionStream` function calls the provided callback (`sendEvent`). The callback function formats these chunks into SSE data events and sends them to the client.  It signals the end of the stream when the OpenAI gives a `stop` reason.

5.  **Client Disconnection Handling:** Handles client disconnections by closing the SSE connection and terminating the OpenAI stream.

## Input/Output Specifications

**Input (for `/recipeStream` endpoint):**

*   **HTTP Method:** GET
*   **Query Parameters:**
    *   `mealType` (string): Type of meal (e.g., Breakfast, Lunch, Dinner).
    *   `cuisine` (string): Cuisine preference (e.g., Italian, Mexican, Indian).
    *   `dietConcerns` (string): Dietary restrictions/concerns (e.g., Vegetarian, Vegan, Gluten-Free).
    *   `cookingTime` (string): Maximum cooking time in minutes.
    *   `servings` (string): Number of servings.
    *   `targetCalories` (string): Target calories per serving.

**Output (for `/recipeStream` endpoint):**

*   **HTTP Status Code:** 200 OK
*   **Content Type:** `text/event-stream`
*   **Data Format:** Server-Sent Events (SSE)
    *   Each SSE event contains a `data` field with a JSON object.
    *   The JSON object has an `action` field and potentially a `chunk` field:
        *   `{ action: "start" }`: Indicates the beginning of the response from the OpenAI API. This is usually accompanied by the AI role
        *   `{ action: "chunk", chunk: "..." }`: Contains a partial piece of the generated recipe content. The `chunk` field is a string.
        *   `{ action: "close" }`: Indicates the end of the response from the OpenAI API.

**Example SSE Data Stream:**

```
data: {"action":"start"}

data: {"action":"chunk", "chunk": "Okay, here's"}

data: {"action":"chunk", "chunk": " a recipe"}

data: {"action":"chunk", "chunk": " for you"}

data: {"action":"close"}
```

## Usage Examples

1.  **Starting the Server:**

    ```bash
    node server/server.js
    ```

2.  **Making a Request (example using `curl`):**

    ```bash
    curl "http://localhost:3001/recipeStream?mealType=Dinner&cuisine=Italian&dietConcerns=Vegetarian&cookingTime=30&servings=2&targetCalories=500" --header "Accept: text/event-stream"
    ```

    This `curl` command sends a request to the `/recipeStream` endpoint with specific recipe preferences.  The `--header "Accept: text/event-stream"` is important for the client to indicate it expects an SSE stream.

3.  **Client-Side Handling (Conceptual):**

    A client-side JavaScript application would use the `EventSource` API to connect to the `/recipeStream` endpoint and listen for SSE events.  The client would then parse the JSON data in each event and update the user interface accordingly.

    ```javascript
    const eventSource = new EventSource('http://localhost:3001/recipeStream?mealType=Dinner&cuisine=Italian&dietConcerns=Vegetarian&cookingTime=30&servings=2&targetCalories=500');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'start') {
            console.log("Starting recipe generation");
        } else if (data.action === 'chunk') {
            // Append the received chunk to the UI
            console.log("Recipe Chunk: " + data.chunk);
        } else if (data.action === 'close') {
            console.log("Recipe generation complete!");
            eventSource.close(); // Close the connection
        }
    };

    eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        eventSource.close();
    };
    ```

## Dependencies

*   **express:** Web framework for Node.js.  `npm install express`
*   **cors:** Middleware for enabling Cross-Origin Resource Sharing. `npm install cors`
*   **openai:**  Node.js library for interacting with the OpenAI API.  `npm install openai`
*   **dotenv:**  Loads environment variables from a `.env` file.  `npm install dotenv`

## Important Notes

*   **API Key Security:**  The OpenAI API key should be stored securely as an environment variable and **never** committed directly to the codebase. Use a `.env` file (as shown) and ensure it's excluded from version control (e.g., by adding it to `.gitignore`).
*   **Error Handling:** The code includes basic error handling within the `fetchOpenAiCompletionStream` function.  More robust error handling should be implemented for production use, including handling network errors, API errors, and invalid input.
*   **Rate Limiting:** The OpenAI API has rate limits.  The code doesn't currently implement any rate limiting or retry mechanisms. Consider adding these to improve the reliability and resilience of the server.
*   **Prompt Engineering:** The quality of the generated recipes depends heavily on the prompt provided to the OpenAI API.  Experiment with different prompt formulations to optimize the results.
*   **SSE Connection Management:**  The code currently only handles client disconnections. More robust SSE connection management might be required for production to handle network interruptions and ensure that the stream is properly closed in all cases.
*   **OpenAI Model:** The code uses `"gpt-4o-mini"`. Always use a valid model and monitor its usage and cost. Model names should be configurable using environment variables.
*   **CORS Configuration:** The current `cors()` setup is very permissive. For a production environment, carefully configure CORS to only allow requests from authorized origins.
*   **Input Sanitization:** It is important to sanitize and validate user inputs (query parameters) to prevent potential security vulnerabilities and ensure the prompt construction is safe and effective.
