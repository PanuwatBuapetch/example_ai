import { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [todos, setTodo] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null); // เพิ่ม State สำหรับเก็บ ID ที่กำลังแก้
  
  const handleAddTodo = () =>{
    if (input.trim() === '' ) return; // ไม่เพิ่มถ้าข้อความว่าง
    if (editId) {
      // แก้ไขรายการที่มีอยู่
      setTodo(todos.map(todo => todo.id === editId ? { ...todo, text: input } : todo));
      setEditId(null);
    } else {
      // เพิ่มรายการใหม่
      setTodo([...todos, {id: Date.now(), text: input}]);
    }
    setInput(''); // ล้างช่องกรอกหลังเพิ่ม
  }

  const handleDeleteTodo = (id) => {
    setTodo(todos.filter(item => item.id !== id));
  };


  const toggleTodo = (id) => {
    setTodo(todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const startEdit = (todo) => {
      setEditId(todo.id);
      setInput(todo.text);
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
      <h1>ระบบ CRUD To-Do List</h1>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder={editId ? "แก้ไขงาน..." : "เพิ่มงานใหม่..."}
      />
      <button onClick={handleAddTodo}>{editId ? "Update" : "Add"}</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ marginBottom: '5px' }}>
            <span 
              onClick={() => toggleTodo(todo.id)} 
              style={{ 
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer' 
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => startEdit(todo)}>Edit</button>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h1>ระบบวิเคราะห์คำร้อง (AI)</h1>
      <textarea
        onChange={(e) => setText(e.target.value)}
        placeholder="พิมพ์คำร้อง..."
        style={{ width: '100%', height: '100px' }}
      />
      <button onClick={handleAnalyze} style={{ marginTop: '10px' }}>ส่งวิเคราะห์</button>

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <p><strong>หมวดหมู่:</strong> {result.category}</p>
          <p>
            <strong>ความมั่นใจ: </strong>
            {result.confidence != null && !isNaN(result.confidence)
              ? (result.confidence * 100).toFixed(2) + '%'
              : 'กำลังโหลด...'}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;