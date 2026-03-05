require('dotenv').config()

const express = require('express')
const cors = require('cors')

const { Ollama } = require('ollama')
const ollama = new Ollama({host: 'http://localhost:11434' })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get('/api/data', (req, res) => {
  res.json({ message: 'Connected to backend!' })
})

app.post('/api/data', async (req, res) => {
  const userPrompt = req.body.prompt;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await ollama.chat({
    model: "qwen2.5-coder:14b",
    stream: true,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });
  
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ content: chunk.message.content })}\n\n`);
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
