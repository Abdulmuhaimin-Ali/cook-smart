```markdown
## Purpose & Overview

The `server/server.js` file defines a Node.js server using the Express framework that provides a streaming endpoint for generating recipes using the OpenAI API. It receives recipe preferences via query parameters, constructs a prompt for OpenAI, and streams the generated recipe back to the client using Server-Sent Events (SSE).

## Key Functions/Components

*   **Express Server:** Sets up a basic Express server to handle incoming requests.
*   **CORS Middleware:** Enables Cross-Origin Resource Sharing (CORS) to allow requests from different domains (e.g., a frontend running on a separate port).
*   **`dotenv`:** Loads environment variables from a `.env` file (used for storing the OpenAI API key).
*   **`/recipeStream` Endpoint:** This is the core endpoint that handles recipe generation requests.
    *   **Query Parameter Parsing:** Extracts recipe preferences (meal type, cuisine, diet concerns, cooking time, servings, target calories) from the request's query parameters.
    *   **SSE Setup:** Configures the response headers for Server-Sent Events, enabling real-time streaming of data to the client.
    *   **OpenAI Prompt Construction:** Creates a dynamic prompt based on the user's preferences, which is then sent to the OpenAI API.
    *   **`fetchOpenAiCompletionStream` Function:** Handles the communication with the OpenAI API to get the recipe completion stream.
    *   **Event Sending:**  Processes each chunk of data from the OpenAI stream and sends it to the client via SSE.  Specifically, it identifies when the assistant starts, sends data chunks, and signals the end of the stream.
    *   **Connection Handling:**  Listens for the client's connection to close and ends the response. This is important for cleaning up resources and preventing memory leaks.
*   **`fetchOpenAiCompletionStream` Function:**  This asynchronous function is responsible for:
    *   **OpenAI API Interaction:** Initializes the OpenAI API client using the API key from the environment variables.
    *   **Streaming Completion:** Calls `openai.chat.completions.create` with `stream: true` to receive a stream of data from the OpenAI API.
    *   **Callback Execution:** Iterates over the stream and calls the provided `callback` function (`sendEvent` in this case) for each chunk of data received.
    *   **Error Handling:**  Catches potential errors from the OpenAI API and logs them to the console.
*   **Server Startup:** Starts the Express server and listens on the specified port (3001).

## Business Logic (if applicable)

The core business logic revolves around generating a recipe based on user-specified preferences.  This involves:

1.  **Gathering Preferences:** Collecting user inputs for meal type, cuisine, dietary restrictions, cooking time, servings, and target calories.
2.  **Prompt Engineering:** Crafting a well-structured prompt that instructs the OpenAI model to generate a recipe conforming to the given criteria.
3.  **OpenAI Interaction:** Sending the prompt to OpenAI and streaming the response.
4.  **Real-time Delivery:** Streaming the recipe in chunks to the client for immediate display and a better user experience.

## Input/Output Specifications

*   **Input (Query Parameters to `/recipeStream`):**
    *   `mealType`: (String) The type of meal (e.g., breakfast, lunch, dinner).
    *   `cuisine`: (String) The cuisine of the meal (e.g., Italian, Mexican, Indian).
    *   `dietConcerns`: (String) Dietary restrictions or concerns (e.g., vegetarian, gluten-free, allergies).
    *   `cookingTime`: (String) Maximum cooking time in minutes (e.g., 30).
    *   `servings`: (String) Number of servings the recipe should make (e.g., 2).
    *   `targetCalories`: (String) Target calories per serving (e.g., 500).

    *Note: All query parameters are strings. Validation and conversion should be done on the client-side.*

*   **Output (SSE stream from `/recipeStream`):**

    The server sends Server-Sent Events (SSE) to the client. Each event's `data` field is a JSON string with the following structure:

    *   `{ action: "start" }`: Sent at the beginning of the recipe generation to indicate it’s starting.
    *   `{ action: "chunk", chunk: "..." }`: Contains a portion of the recipe (text).  The client accumulates these chunks to build the complete recipe.
    *   `{ action: "close" }`: Signals the end of the recipe generation stream.

## Usage Examples

1.  **Client-side Request (Example using JavaScript `fetch`):**

    ```javascript
    const mealType = "dinner";
    const cuisine = "Italian";
    const dietConcerns = "vegetarian";
    const cookingTime = "45";
    const servings = "2";
    const targetCalories = "600";

    const url = `/recipeStream?mealType=${mealType}&cuisine=${cuisine}&dietConcerns=${dietConcerns}&cookingTime=${cookingTime}&servings=${servings}&targetCalories=${targetCalories}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "start") {
        console.log("Recipe generation started!");
      } else if (data.action === "chunk") {
        console.log("Chunk received:", data.chunk);
        // Append data.chunk to your UI to display the recipe
      } else if (data.action === "close") {
        console.log("Recipe generation complete!");
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };
    ```

2.  **Command-line Request (using `curl` or `wget` – primarily for debugging):**

    This is less useful as it won't automatically handle the SSE stream in a user-friendly way, but it can be used to verify that the endpoint is working and producing output.

    ```bash
    curl "http://localhost:3001/recipeStream?mealType=lunch&cuisine=Mexican&dietConcerns=vegan&cookingTime=20&servings=1&targetCalories=400"
    ```

    The output will be a continuous stream of `data: ...\n\n` lines.

## Dependencies

*   **express:**  Web framework for Node.js.  `npm install express`
*   **cors:** Middleware for enabling CORS. `npm install cors`
*   **openai:**  Node.js library for interacting with the OpenAI API. `npm install openai`
*   **dotenv:**  Loads environment variables from a `.env` file. `npm install dotenv`

## Important Notes

*   **Environment Variables:** Ensure you have a `.env` file in the server's root directory with the following content:

    ```
    OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
    ```

    Replace `<YOUR_OPENAI_API_KEY>` with your actual OpenAI API key.
*   **Error Handling:** The code includes basic error handling for OpenAI API calls.  More robust error handling should be implemented, including:
    *   Logging errors to a file or dedicated error tracking service.
    *   Sending appropriate error messages to the client using SSE.
    *   Implementing retry logic for transient errors.
*   **Rate Limiting:**  Be mindful of OpenAI's rate limits.  Implement appropriate rate limiting on your server to prevent exceeding these limits and getting your API key blocked.
*   **Security:**  Protect your OpenAI API key carefully.  Do not expose it in client-side code or commit it to version control.  Use environment variables and secure configuration management practices.
*   **Data Validation:** The code does minimal input validation. Implement thorough validation of query parameters to prevent unexpected behavior and potential security vulnerabilities. Consider using a validation library like `joi` or `express-validator`.
*   **Model Selection:**  The code uses `gpt-4o-mini`. Keep in mind that model names can change and that OpenAI can introduce new models.  Choose a model appropriate for your needs and consider making the model configurable.
*   **Prompt Engineering:** The quality of the generated recipes heavily depends on the prompt. Experiment with different prompt variations to optimize the results. Consider allowing the user to customize parts of the prompt for more control.
*   **Streaming Considerations:** SSE can be sensitive to network issues. Implement proper client-side error handling and reconnection logic to ensure a reliable streaming experience.  Consider using a library or framework to manage the SSE connection.
*   **Scalability:**  For high-traffic applications, consider using a message queue (e.g., RabbitMQ, Kafka) to handle the communication with the OpenAI API asynchronously. This can prevent the server from becoming overloaded.
*   **Cost:** Be aware of OpenAI's pricing model. Generating recipes can consume a significant number of tokens, which can incur costs. Monitor your OpenAI usage and set spending limits to avoid unexpected