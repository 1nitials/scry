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
  }

  return (
    <div className="w-96 h-96 p-4 bg-gray-100">
      <h1 className="text-2xl font-bold text-blue-600 mb-2">Scry</h1>

      <form>
        <textarea 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ resize: 'none' }} 
        className="bg-grey border border-black w-full mt-4 p-2
        placeholder:text-gray-400 placeholder:italic"
        placeholder="What do you want to find?" 
        rows={5}></textarea>
        <button onClick={sendPrompt} className="bg-blue-700 text-white font-bold rounded-xl px-4 py-2 mt-2">Submit</button>
      </form>

      {data && (
        <div className="mt-4 p-3 bg-white rounded shadow max-h-[300px] overflow-y-scroll">
          <p className="text-sm">{data.message}</p>
        </div>
      )}
    </div>
  )
}
