import { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [todos, setTodos] = useState([]); // แก้จาก setTodo เป็น setTodos ให้ตรงกัน
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);

  // READ: ดึงข้อมูลจาก Backend
  useEffect(() => {
    fetch('http://localhost:8000/api/todos')
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error("Error fetching:", err));
  }, []);

  // CREATE & UPDATE: รวมไว้ในฟังก์ชันเดียว
 const handleAdd = async () => {
    if (input.trim() === '') return;

    if (editId) {
      // UPDATE: เรียกใช้ PUT API
      const res = await fetch(`http://localhost:8000/api/todos/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      const updatedTodo = await res.json();
      
      // อัปเดต State ให้ตรงกับที่แก้ใน Backend
      setTodos(todos.map(t => t.id === editId ? updatedTodo : t));
      setEditId(null);
    } else {
      // CREATE: เรียกใช้ POST API (เหมือนเดิม)
      const res = await fetch('http://localhost:8000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
    }
    setInput('');
  };
  
  // DELETE
  const handleDelete = async (id) => {
    await fetch(`http://localhost:8000/api/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleAnalyze = async () => {
    const response = await fetch('http://localhost:8000/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    setResult(data);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>To-Do List (Backend Connected)</h1>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="เพิ่มงาน..." />
      <button onClick={handleAdd}>{editId ? "Update" : "Add"}</button>

      <ul>
        {todos.map(t => (
          <li key={t.id}>
            {t.text}
            <button onClick={() => { setEditId(t.id); setInput(t.text); }}>Edit</button>
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* ส่วน AI Classification คงเดิม */}
      <h1>ระบบวิเคราะห์คำร้อง (AI)</h1>
      <textarea onChange={(e) => setText(e.target.value)} placeholder="พิมพ์คำร้อง..." style={{ width: '100%', height: '100px' }} />
      <button onClick={handleAnalyze} style={{ marginTop: '10px' }}>ส่งวิเคราะห์</button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <p><strong>หมวดหมู่:</strong> {result.category}</p>
          <p><strong>ความมั่นใจ:</strong> {(result.confidence * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

export default App;