import { useState, useEffect } from 'react'

interface ApiData {
  message: string
}

export default function Home() {
  const [data, setData] = useState<ApiData | null>(null)
  const [prompt, setPrompt] = useState<string>('')

  useEffect(() => {
    fetch('http://localhost:3001/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
  }, [])

  const sendPrompt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    fetch('http://localhost:3001/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })
    .then(res => res.json())
    .then(setData)
    .catch(console.error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">Scry</h1>

        <form className="space-y-4">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ resize: 'none' }} 
            className="w-full border-2 border-gray-300 rounded-lg p-4 focus:border-blue-500 focus:outline-none
            placeholder:text-gray-400 placeholder:italic"
            placeholder="What do you want to find?" 
            rows={8}
          />
          <button 
            onClick={sendPrompt} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 py-3 transition-colors"
          >
            Submit
          </button>
        </form>

        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          {data ? ( <p className="text-gray-800 whitespace-pre-wrap">{data.message}</p> )
          : ( <p className="text-gray-800 whitespace-pre-wrap">Connect to backend first!</p> )}
        </div>

      </div>
    </div>
  )
}
