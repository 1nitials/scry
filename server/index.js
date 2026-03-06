const express = require('express')
const cors = require('cors')

const { Ollama } = require('ollama')
const ollama = new Ollama({host: 'http://localhost:11434' })

const { saveMessage, getMessages, createConversation, getConversations } = require('./database')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get('/api/data', (req, res) => {
  res.json({ message: 'Connected to backend!' })
})

app.post('/api/data', async (req, res) => {
  const { prompt, context, currentConversationId } = req.body;

  let conversationId = currentConversationId;
  if (conversationId === null) { 
    conversationId = createConversation('New conversation') 
  }
  saveMessage(conversationId, 'user', prompt);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await ollama.chat({
    model: "qwen2.5-coder:14b",
    stream: true,
    messages: [
      {
        role: "system",
        content: `
        Relevant context: ${JSON.stringify(context, null, 2)}

        You are an expert software engineer.
        Answer the user question using the context above.
        `,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  
  let fullMessage = '';
  for await (const chunk of stream) {
    fullMessage += chunk.message.content;
    res.write(`data: ${JSON.stringify({ content: chunk.message.content })}\n\n`);
  }

  saveMessage(conversationId, 'ai', fullMessage);
  
  res.write(`data: ${JSON.stringify({ conversationId })}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
})

app.get('/api/messages/:conversationId', (req, res) => {
  const conversationId = parseInt(req.params.conversationId)
  const messages = getMessages(conversationId)
  res.json(messages.map(msg => ({ type: msg.type, content: msg.content })))
})

app.get('/api/conversations', (req, res) => {
  res.json(getConversations())
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
