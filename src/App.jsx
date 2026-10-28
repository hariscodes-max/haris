import { useEffect, useState } from 'react'

const API = 'https://dummyjson.com/products'
const emptyForm = { title: '', price: '', category: '' }

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)

  // GET - fetch and display a list of items
  useEffect(() => {
    fetch(`${API}?limit=12`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  // POST - add an item using a form
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const res = await fetch(`${API}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    })
    const created = await res.json()
    // DummyJSON only simulates the change, so update state ourselves
    setProducts((prev) => [{ ...form, price: Number(form.price), id: created.id }, ...prev])
    setForm(emptyForm)
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditForm({ title: p.title, price: p.price, category: p.category })
  }

  // PUT - update an item
  const handleUpdate = async (id) => {
    const body = { ...editForm, price: Number(editForm.price) }
    // items created locally (id > 194) don't exist on the server
    if (id <= 194) {
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...body } : p)))
    setEditingId(null)
  }

  // DELETE - remove an item
  const handleDelete = async (id) => {
    if (id <= 194) await fetch(`${API}/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const input = 'border border-gray-300 rounded px-3 py-2 text-sm w-full'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 mb-1">React CRUD Sprint</h1>
        <p className="text-gray-500 mb-6">DummyJSON Products API - GET, POST, PUT, DELETE</p>

        <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-4 mb-6 grid gap-3 sm:grid-cols-4">
          <input className={input} placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className={input} placeholder="Price" type="number" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className={input} placeholder="Category" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700">
            Add Product
          </button>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              {editingId === p.id ? (
                <>
                  <input className={input} value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  <input className={input} type="number" value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                  <input className={input} value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(p.id)}
                      className="bg-green-600 text-white rounded px-3 py-1 text-sm">Save</button>
                    <button onClick={() => setEditingId(null)}
                      className="bg-gray-200 rounded px-3 py-1 text-sm">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="text-sm text-gray-500 capitalize">{p.category}</p>
                  <p className="font-bold text-blue-600">${p.price}</p>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => startEdit(p)}
                      className="bg-yellow-400 rounded px-3 py-1 text-sm">Update</button>
                    <button onClick={() => handleDelete(p.id)}
                      className="bg-red-600 text-white rounded px-3 py-1 text-sm">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
