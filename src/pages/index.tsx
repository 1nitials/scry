import { useState, useEffect, useRef } from 'react'

interface ApiData {
  message: string
}

export default function Home() {
  const [data, setData] = useState<ApiData | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [prompt, setPrompt] = useState<string>('')

  {/* 
      useEffect(() => {
    fetch('http://localhost:3001/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
  }, [])
    */}

  const sendPrompt = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    setMessages(prev => [...prev, `User: ${prompt}`])
    setData({ message: '' })

    const response = await fetch('http://localhost:3001/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    let fullMessage = ''
    const aiMessageIndex = messages.length + 1
    setMessages(prev => [...prev, `AI: ${fullMessage}`])

    while(true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          const data = JSON.parse(line.slice(6))
          fullMessage += data.content
          
          setMessages(prev => {
            const updated = [...prev]
            updated[aiMessageIndex] = `AI: ${fullMessage}`
            return updated
          })
        }
      }
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e) => {
    setPrompt(e.target.value)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">Scry</h1>

        {/*
        <div className="mt-6 mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          {data ? ( <p className="text-gray-800 whitespace-pre-wrap">{data.message}</p> )
          : ( <p className="text-gray-800 whitespace-pre-wrap">Connect to backend first!</p> )}
        </div>
        */}

        <div className="mt-6 mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <p key={index} className="text-gray-800 whitespace-pre-wrap">{msg}</p>
          ))}
        </div>

        <form className="space-y-4">
          <textarea
            value={prompt}
            ref={textareaRef}
            onChange={handleChange}
            className="w-full border-2 border-gray-300 rounded-lg p-4 focus:border-blue-500 focus:outline-none
            placeholder:text-gray-400 placeholder:italic max-h-[300px]"
            placeholder="What do you want to find?" 
          />
          <button 
            onClick={sendPrompt} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 py-3 transition-colors"
          >
            Submit
          </button>
        </form>

      </div>
    </div>
  )
}
