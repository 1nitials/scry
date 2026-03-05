import { useState, useEffect, useRef } from 'react'

interface ApiData {
  message: string
}

interface Message {
  type: 'user' | 'ai'
  content: string
}

export default function Home() {
  const [data, setData] = useState<ApiData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState<string>('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const handleChange = (e) => {
    setPrompt(e.target.value)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const sendPrompt = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    setMessages(prev => [...prev, { type: 'user', content: prompt }])
    setPrompt('')
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
    setMessages(prev => [...prev, { type: 'ai', content: fullMessage }])
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

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
            updated[aiMessageIndex] = {type: 'ai', content: fullMessage }
            return updated
          })
        }
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendPrompt(e as any)
    }
  }

  return (

    <div className="h-screen bg-custom-blue flex p-8">
      <div className="max-w-screen w-full flex border border-white rounded-2xl">
        <div className="w-1/2 rounded-2xl p-8 text-white">
          <h1 className="font-pirata uppercase text-[72px]">Scry</h1>
          <p className="font-neuton leading-[1.0] text-[24px]">AI programming documentation lookup assistant</p>
        </div>
        
          <div className="max-w-screen w-full flex flex-col justify-end bg-custom-dark-blue rounded-2xl p-8 text-white">
            {messages.length > 0 && <div className="flex flex-col mb-6 p-2 rounded-lg flex-1 overflow-y-scroll">
              {messages.map((msg, index) => {
               const typeVariance = msg.type === 'user' ? 'text-right text-ai-color' : 'text-left text-white'
                return (
                  <div className={`p-4 ${typeVariance} rounded-lg font-neuton`}>
                    <p key={index} className="text-[18px] whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )
            })}
            <div ref={messagesEndRef} />
          </div>}
          
          {messages.length === 0 && <h1 className="font-prata text-center text-[24px] mb-16">How may I be of <br/> assistance right now?</h1>}

          <div className="space-y-4 flex flex-row bg-white rounded-lg">
            <textarea
              onKeyDown={handleKeyDown}
              value={prompt}
              ref={textareaRef}
              onChange={handleChange}
              style={{resize: 'none'}}
              className="w-full bg-transparent p-4 focus:outline-none text-black font-neuton text-[20px]
              placeholder:text-[20px] placeholder:text-gray-400 placeholder:font-neuton placeholder:italic max-h-[150px] xl:max-h-[400px]"
              placeholder="What do you want to find?" 
            />
            <button onClick={sendPrompt} className="text-black flex items-start px-2">
              <img src="/img/back-to-top.png" className="w-8 h-8" alt="Submit button"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
