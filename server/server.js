const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = 3001;

app.use(cors());

app.get("/recipeStream", (req, res) => {
  const {
    mealType,
    cuisine,
    dietConcerns,
    cookingTime,
    servings,
    targetCalories,
  } = req.query;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (chunk) => {
    let chunkResponse;
    if (chunk.choices[0].finish_reason === "stop") {
      res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
    } else {
      if (
        chunk.choices[0].delta.role &&
        chunk.choices[0].delta.role === "assistant"
      ) {
        chunkResponse = { action: "start" };
      } else {
        chunkResponse = {
          action: "chunk",
          chunk: chunk.choices[0].delta.content,
        };
      }
      res.write(`data: ${JSON.stringify(chunkResponse)}\n\n`);
    }
  };

  // added changes

  const prompt = [];
  prompt.push("Generate a meal based on the following preferences:");
  prompt.push(`Meal Type: ${mealType}`);
  prompt.push(`Cuisine: ${cuisine}`);
  prompt.push(`Dietary Concerns: ${dietConcerns}`);
  prompt.push(`Cooking Time: ${cookingTime} minutes`);
  prompt.push(`Servings: ${servings}`);
  prompt.push(`Target Calories per Serving: ${targetCalories}`);
  prompt.push(
    "Provide a title, a list of ingredients, and step-by-step instructions. Format the output clearly."
  );

  const messages = [
    {
      role: "system",
      content: prompt.join(" "),
    },
  ];

  fetchOpenAiCompletionStream(messages, sendEvent);

  req.on("close", () => {
    res.end();
  });
});

async function fetchOpenAiCompletionStream(messages, callback) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Replace with your actual key
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const aiModel = "gpt-5-mini";

  try {
    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: messages,
      stream: true,
    });

    for await (const chunk of completion) {
      callback(chunk);
    }
  } catch (error) {
    console.error("OpenAI Error:", error);
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// demo
