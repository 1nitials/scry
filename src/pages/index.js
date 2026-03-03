import { useState, useEffect } from 'react'

export default function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
  }, [])

  return (
    <div className="w-96 h-96 p-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Scry</h1>
      <p className="text-gray-700">Tool to improve search precision and verify information.</p>
      {data && (
        <div className="mt-4 p-3 bg-white rounded shadow">
          <p className="text-sm">{data.message}</p>
        </div>
      )}
    </div>
  )
}
