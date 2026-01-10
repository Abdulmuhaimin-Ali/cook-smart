```markdown
## Purpose & Overview

This `server.js` file creates an Express.js server that provides a streaming endpoint for generating meal recipes using the OpenAI API.  It receives meal preferences as query parameters, constructs a prompt for OpenAI, streams the response, and sends the generated recipe to the client via Server-Sent Events (SSE).  The server also handles potential errors from the OpenAI API.

## Key Functions/Components

*   **Express.js Server:**  Handles incoming requests and manages the API endpoint.
*   **CORS Middleware:** Enables Cross-Origin Resource Sharing, allowing the server to be accessed from different domains.
*   **`/recipeStream` Endpoint:** This is the core endpoint that handles recipe generation requests.
*   **`fetchOpenAiCompletionStream` Function:**  This function interacts with the OpenAI API to generate recipe suggestions based on provided parameters in the `prompt`. It retrieves the data as a stream and passes it to a callback function.
*   **Server-Sent Events (SSE):**  The `/recipeStream` endpoint streams the recipe back to the client using SSE, allowing for real-time updates of the recipe as it's generated.
*   **Environment Variables:** Uses `dotenv` to load the OpenAI API key from a `.env` file.

## Business Logic (if applicable)

The business logic implemented in this file resides in how the `prompt` is created from the query parameters received via the `/recipeStream` endpoint. The `prompt` takes parameters like `mealType`, `cuisine`, `dietConcerns`, `cookingTime`, `servings`, and `targetCalories` to create a specific request to the OpenAI model so that it generates a relevant and desired recipe.

## Input/Output Specifications

*   **Input (Query Parameters to `/recipeStream`):**
    *   `mealType`: (String) Type of meal (e.g., breakfast, lunch, dinner).
    *   `cuisine`: (String) Cuisine type (e.g., Italian, Mexican, Indian).
    *   `dietConcerns`: (String) Dietary restrictions/preferences (e.g., vegetarian, vegan, gluten-free, nut allergy).
    *   `cookingTime`: (Number) Maximum cooking time in minutes.
    *   `servings`: (Number) Number of servings the recipe should yield.
    *   `targetCalories`: (Number) Target calories per serving.

*   **Output (Server-Sent Events from `/recipeStream`):**
    The server streams JSON objects via SSE. Each event is of the form `data: {JSON string}\n\n`. The JSON object has the following structure:

    *   `{ action: "start" }`: Indicates the start of the recipe generation process.  Typically only sent once at the beginning.
    *   `{ action: "chunk", chunk: "Some text" }`: Contains a fragment of the generated recipe text. These events are streamed in sequence, making up the complete recipe.
    *   `{ action: "close" }`: Indicates the end of the recipe generation process.

## Usage Examples

1.  **Client Request (Example using `fetch` in JavaScript):**

    ```javascript
    fetch('http://localhost:3001/recipeStream?mealType=dinner&cuisine=Italian&dietConcerns=vegetarian&cookingTime=30&servings=2&targetCalories=500', {
      method: 'GET',
      headers: {
        'Content-Type': 'text/event-stream' // Important for SSE
      }
    }).then(response => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log("Stream complete");
            return;
          }

          const chunk = decoder.decode(value);
          // Process the received chunk (SSE data format)
          const events = chunk.split('\n\n').filter(event => event.trim() !== ''); // Splitting SSEs

          events.forEach(event => {
              if (event.startsWith('data:')) {
                  try {
                      const jsonData = JSON.parse(event.substring(5));
                      console.log("Received data:", jsonData);

                      if(jsonData.action === "start"){
                        //handle start of response
                        console.log("Start of recipe generation");
                      } else if (jsonData.action === "chunk"){
                        //append chunk to recipe string
                        console.log("Recipe chunk: ", jsonData.chunk);
                      } else if (jsonData.action === "close"){
                        //handle close of response
                        console.log("End of recipe generation");
                      }

                  } catch (error) {
                      console.error("Error parsing JSON:", error);
                  }
              }
          });

          read(); // Continue reading from the stream
        });
      }
      read();
    }).catch(error => {
      console.error("Error fetching data:", error);
    });
    ```

2.  **Server Response (Example SSE Event):**

    ```
    data: {"action":"chunk","chunk":"First, chop the vegetables."}

    ```

## Dependencies

*   **express:** Web application framework for Node.js.
*   **cors:** Middleware for enabling Cross-Origin Resource Sharing.
*   **openai:** OpenAI API client library.
*   **dotenv:** Loads environment variables from a `.env` file.

## Important Notes

*   **API Key Security:** The OpenAI API key is loaded from a `.env` file.  **Never** commit your API key directly to your code repository. Store it securely.
*   **Error Handling:**  The `fetchOpenAiCompletionStream` function includes basic error handling. More robust error handling should be implemented, especially on the client-side, to handle API errors gracefully.
*   **OpenAI Model:** The `aiModel` variable currently specifies `gpt-5-mini`. This is a placeholder.  You should choose an appropriate OpenAI model (e.g., `gpt-3.5-turbo`, `gpt-4`) based on your needs and budget.  Consult the OpenAI documentation for available models. Note that `gpt-5` is not currently available.
*   **Rate Limiting:** The OpenAI API has rate limits.  Implement appropriate error handling and retry mechanisms to avoid exceeding these limits.
*   **Prompt Engineering:** The quality of the generated recipes depends heavily on the prompt. Experiment with different prompt formats and instructions to optimize the results.
*   **Client-Side Logic:** The client-side code needs to handle the SSE stream, parse the JSON events, and assemble the recipe text. A complete client-side implementation is necessary to consume this API effectively.
*   **Resource Management:** The `req.on("close", ...)` handler is important for cleaning up resources when the client disconnects. Without it, the server might continue generating the recipe even after the client has closed the connection.
*   **Model Choice:**  Consider the trade-offs between model cost, speed, and quality.  More powerful models might produce better recipes but will also be more expensive.
*   **Streaming Efficiency:**  The current implementation sends individual chunks of text.  Consider buffering the chunks on the server-side to send larger, more efficient SSE events.  However, this will increase the latency of the response.
*   **Input Validation:** The API should implement input validation to ensure that the query parameters are valid and within appropriate ranges. This can help prevent errors and improve the security of the API. For example, you could validate that `cookingTime` and `targetCalories` are positive numbers.
```