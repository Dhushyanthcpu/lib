import { Anthropic } from "anthropic";

// Proper way to use Anthropic API keys - load from environment variables
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Never hardcode API keys
});

// Make API calls
const message = await client.messages.create({
  model: "claude-3-7-sonnet-20250219",
  max_tokens: 1000,
  messages: [
    {
      role: "user",
      content: "Hello, Claude!"
    }
  ]
});

// Set environment variables for API keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

