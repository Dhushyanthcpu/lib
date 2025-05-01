import { OpenAI } from "openai";

// Proper way to use API keys - load from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Make API calls
const chatCompletion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello world" }],
});
