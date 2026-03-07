const express = require('express')
const cors = require('cors')

const { Ollama } = require('ollama')
const ollama = new Ollama({host: 'http://localhost:11434' })

const { saveMessage, getMessages, createConversation, clearConversation, getConversations, updateConversationTitle } = require('./database')

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
  let isNewConversation = false;
  if (conversationId === null) { 
    conversationId = createConversation('New conversation') 
    isNewConversation = true;
  }
  saveMessage(conversationId, 'user', prompt);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (isNewConversation) {
    const titleResponse = await ollama.chat({
      model: "qwen2.5-coder:14b",
      messages: [{
        role: "user",
        content: `Generate a short 3-5 word title for this conversation: "${prompt}"`
      }]
    })
    const title = titleResponse.message.content
    updateConversationTitle(conversationId, title);
  }

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

app.delete('/api/conversations/:conversationId', (req, res) => {
  const conversationId = parseInt(req.params.conversationId)
  clearConversation(conversationId)
  res.json({ message: 'Conversation cleared' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
