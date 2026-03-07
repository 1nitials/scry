import { useState, useEffect, useRef } from 'react'

interface ApiData {
  message: string
}

interface Message {
  type: 'user' | 'ai'
  content: string
}

interface Conversation {
  id: number,
  title: string
}

export default function Home() {
  const [data, setData] = useState<ApiData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [prompt, setPrompt] = useState<string>('')

  const [{loading, streaming}, setState] = useState({
    loading: false,
    streaming: false
  })
  const setLoading = (bool: boolean) => {
    setState(prev => ({...prev, loading: bool}))
  }
  const streamingRef = useRef(false)
  const setStreaming = (bool: boolean) => {
    streamingRef.current = bool
    setState(prev => ({...prev, streaming: bool}))
  }
  const stopStreaming = () => {
    setStreaming(false)
  }

  const [isHovered, setIsHovered] = useState<number | null>(null);
  const handleMouseEnter = (index) => {
    setIsHovered(index)
  }
  const handleMouseLeave = () => {
    setIsHovered(null)
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const handleChange = (e) => {
    setPrompt(e.target.value)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (currentConversationId) {
      fetch(`http://localhost:3001/api/messages/${currentConversationId}`)
        .then(res => res.json())
        .then(setMessages)
    }
  }, [currentConversationId])
  useEffect(() => {
    fetch('http://localhost:3001/api/conversations')
      .then(res => res.json())
      .then(data => {
        setConversations(data)
      })
  }, [])
  const deleteConversation = async (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    await fetch(`http://localhost:3001/api/conversations/${id}`, { method: 'DELETE' })
    setConversations(prev => prev.filter(conv => conv.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setMessages([])
    }
  }


  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sendPrompt = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const context = messages.map(msg => ({ role: msg.type, content: msg.content }))
    setMessages(prev => [...prev, { type: 'user', content: prompt }])
    setPrompt('')

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
    setLoading(true)
    setStreaming(true)

    setData({ message: '' })

    const response = await fetch('http://localhost:3001/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt,
        context,
        currentConversationId
      })
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    let fullMessage = ''
    const aiMessageIndex = messages.length + 1
    setMessages(prev => [...prev, { type: 'ai', content: fullMessage }])
    setLoading(false)

    while(true) {
      if(!streamingRef.current) {
        reader.cancel()
        break
      }

      const { done, value } = await reader!.read()
      if (done){
        setStreaming(false)
        break
      } 

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          const data = JSON.parse(line.slice(6))

          if (data.conversationId) {
            setCurrentConversationId(data.conversationId)
            fetch('http://localhost:3001/api/conversations')
              .then(res => res.json())
              .then(setConversations)
          } else {
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
  }


  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      if (streamingRef.current || !prompt.trim()) return
      sendPrompt(e as any)
    }
  }

  return (

    <div className="h-screen bg-custom-blue flex p-8">
      <div className="max-w-screen w-full flex border border-white rounded-2xl">
        <div className="w-1/2 rounded-2xl p-8 text-white">
          <h1 className="font-pirata uppercase text-[72px]">Scry</h1>
          <p className="font-neuton leading-[1.0] text-[24px] border-b border-white pb-6">AI programming documentation lookup assistant</p>
          {conversations.length > 0 && <div className="pt-4 space-y-4">
            {conversations.map((conv, index) => (
              <div key={conv.id}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => setCurrentConversationId(conv.id)}
              className="flex border-b border-white p-2 pb-2 hover:bg-conversation-hover">
                {isHovered === index && <button onClick={(e) => {
                  e.stopPropagation()
                  deleteConversation(e, conv.id)
                }} className="text-white border-2 border-white rounded font-bold px-2">X</button>}
                <p className="font-neuton ml-auto text-[20px]">{conv.title}</p>
              </div>
            ))}
          </div>}
        </div>
        
          <div className="max-w-screen w-full flex flex-col justify-end bg-custom-dark-blue rounded-2xl p-8 text-white">
            {messages.length > 0 && <div className="flex flex-col mb-6 p-2 rounded-lg flex-1 overflow-y-scroll">
              {messages.map((msg, index) => {
               const typeVariance = msg.type === 'user' ? 'text-right text-user-color' : 'text-left text-white'
                return (
                  <div key={index} className={`p-4 ${typeVariance} rounded-lg font-neuton`}>
                    <p className="text-[18px] whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )
            })}
            {loading && 
            <div className="p-4 text-left text-grey-300 rounded-lg font-neuton">
                <p className="text-[18px]">...Loading</p>
            </div>}
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
            {
              !streaming ?
            <button onClick={sendPrompt} className="text-black flex items-start px-2">
              <img src="/img/back-to-top.png" className="w-8 h-8" alt="Submit button"/>
            </button> :
            <button onClick={stopStreaming} className="text-black flex items-start px-2">
              <img src="/img/stop-button.png" className="w-8 h-8" alt="Submit button"/>
            </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
