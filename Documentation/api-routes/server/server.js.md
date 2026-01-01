## Purpose & Overview

This `server.js` file implements a simple Express.js server that acts as a proxy to generate recipes based on user preferences using the OpenAI API. It exposes a single endpoint, `/recipeStream`, which receives meal preferences as query parameters and streams the generated recipe back to the client using Server-Sent Events (SSE).  This allows the client to display the recipe in real-time as it's being created.

## Key Functions/Components

*   **Express.js Server:** The core of the application, handling HTTP requests and routing.
*   **`/recipeStream` Endpoint:** Accepts recipe generation requests, constructs a prompt for the OpenAI API based on the query parameters, and streams the response back to the client.
*   **`fetchOpenAiCompletionStream` Function:** Handles communication with the OpenAI API, sending the prompt and streaming the response back to the `/recipeStream` endpoint for delivery to the client.
*   **Server-Sent Events (SSE):**  Used to stream the recipe generation response back to the client in real-time.
*   **OpenAI API Integration:**  Utilizes the `openai` Node.js library to interact with the OpenAI API for text generation.

## Business Logic (if applicable)

The primary business logic revolves around generating a prompt for the OpenAI API based on user preferences and formatting the streaming response for delivery to the client. This involves:

1.  **Receiving User Preferences:** Extracting meal type, cuisine, dietary concerns, cooking time, servings, and target calories from the request query parameters.
2.  **Constructing the Prompt:** Building a detailed prompt by combining the user preferences into a coherent instruction set for the OpenAI API.  The prompt requests a specific format output including title, ingredients, and instructions.
3.  **Streaming the Response:**  Using the `openai.chat.completions.create` method with `stream: true` to receive a stream of text chunks from the OpenAI API.
4.  **Formatting and Sending SSE:** Transforming each chunk from the OpenAI API into a Server-Sent Event. JSON objects are sent to the client indicating the start of the stream, individual data chunks, and the completion of the stream.

## Input/Output Specifications

**Endpoint:** `/recipeStream`

**Method:** `GET`

**Input (Query Parameters):**

*   `mealType` (string): Type of meal (e.g., breakfast, lunch, dinner).
*   `cuisine` (string): Desired cuisine (e.g., Italian, Mexican, Indian).
*   `dietConcerns` (string): Dietary restrictions or preferences (e.g., vegetarian, gluten-free, vegan, low-carb).
*   `cookingTime` (number): Maximum cooking time in minutes.
*   `servings` (number): Number of servings desired.
*   `targetCalories` (number): Target calorie count per serving.

**Output (Server-Sent Events):**

The server sends a stream of SSE messages with the following format:

*   `data: {"action": "start"}`: Indicates the beginning of the response.  This is usually the first event.
*   `data: {"action": "chunk", "chunk": "text chunk"}`: Contains a portion of the generated recipe text.  This will be sent repeatedly until the recipe has been fully generated.
*   `data: {"action": "close"}`: Signals the end of the response stream.

**Example:**

Request:

```
GET /recipeStream?mealType=dinner&cuisine=Italian&dietConcerns=vegetarian&cookingTime=30&servings=2&targetCalories=500
```

Response (SSE Stream):

```
data: {"action": "start"}

data: {"action": "chunk", "chunk": "Title: Vegetarian Pasta Primavera"}

data: {"action": "chunk", "chunk": "\n\nIngredients:"}

data: {"action": "chunk", "chunk": "\n- 8 oz pasta"}

...

data: {"action": "close"}
```

## Usage Examples

To use this server, send a GET request to the `/recipeStream` endpoint with the desired query parameters.  A JavaScript `EventSource` can be used on the client-side to listen for the SSE stream.

**Example Client-Side JavaScript:**

```javascript
const eventSource = new EventSource('http://localhost:3001/recipeStream?mealType=dinner&cuisine=Italian&dietConcerns=vegetarian&cookingTime=30&servings=2&targetCalories=500');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.action === 'start') {
    console.log('Recipe generation started...');
  } else if (data.action === 'chunk') {
    console.log(data.chunk); // Append this to your UI
  } else if (data.action === 'close') {
    console.log('Recipe generation complete.');
    eventSource.close();
  }
};

eventSource.onerror = (error) => {
  console.error('EventSource failed:', error);
  eventSource.close();
};
```

## Dependencies

*   **express:**  For creating the web server and handling requests.
*   **cors:** For enabling Cross-Origin Resource Sharing (CORS) to allow requests from different origins.
*   **openai:** For interacting with the OpenAI API.
*   **dotenv:** For loading environment variables from a `.env` file.

You can install these dependencies using npm:

```bash
npm install express cors openai dotenv
```

## Important Notes

*   **OpenAI API Key:**  The OpenAI API key must be set as an environment variable named `OPENAI_API_KEY`. Create a `.env` file in the root directory of the project and add the following line:

    ```
    OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

    Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key.
*   **Error Handling:** The current error handling in `fetchOpenAiCompletionStream` only logs the error to the console. More robust error handling, such as sending an error event to the client, should be implemented.
*   **Rate Limiting:**  The OpenAI API has rate limits.  Consider implementing rate limiting on the server-side to prevent exceeding these limits.
*   **Model Selection:** The `aiModel` variable is set to `"gpt-4o-mini"`. You can change this to other models based on your needs, but ensure that the model supports streaming.
*   **Prompt Engineering:** The quality of the generated recipes depends heavily on the prompt. Experiment with different prompts to achieve the desired results. Further refinement might be necessary to improve the structure and accuracy of the output.
*   The output of OpenAI is non-deterministic.  The recipe generated for the same inputs might vary each time.
*   Security:  Sanitize user input to prevent prompt injection attacks.
