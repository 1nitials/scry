require('dotenv').config()

const express = require('express')
const cors = require('cors')

const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get('/api/data', (req, res) => {
  res.json({ message: 'Connected to backend!' })
})

/*
app.post('/api/data', (req, res) => {
  const userPrompt = req.body.prompt;
  res.json({ message: userPrompt })
})
*/

app.post('/api/data', async (req, res) => {
  const userPrompt = req.body.prompt;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
  
  res.json({ message: completion.choices[0].message.content })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
