import express from "express";
import cors from "cors";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv"; // ติดตั้งด้วย: npm install dotenv

dotenv.config(); // โหลดค่าจาก .env

const app = express();
app.use(cors());
app.use(express.json());

const hf = new HfInference(process.env.HF_TOKEN); // ดึงจาก process.env
// Mock Data
let todos = [
    { id: 1, text: 'ทดสอบระบบ AI', completed: false },
    { id: 2, text: 'เตรียมสอบพนักงานมหาวิทยาลัย', completed: false }
];

// READ: ดึงข้อมูลทั้งหมด
app.get('/api/todos', (req, res) => res.json(todos));

// CREATE: เพิ่มข้อมูล
app.post('/api/todos', (req, res) => {
    const newTodo = { id: Date.now(), text: req.body.text, completed: false };
    todos.push(newTodo);
    res.json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
        todos[index].text = req.body.text;
        res.json(todos[index]);
    } else {
        res.status(404).json({ message: 'Not found' });
    }
})
// DELETE: ลบข้อมูล
app.delete('/api/todos/:id', (req, res) => {
    todos = todos.filter(t => t.id !== parseInt(req.params.id));
    res.json({ message: 'Deleted' });
});

app.post('/api/classify', async (req, res) => {
    const { text } = req.body;

    try {
        const result = await hf.zeroShotClassification({
            model: 'facebook/bart-large-mnli',
            inputs: text,
            parameters: { candidate_labels: ['วิชาการ', 'สิ่งอำนวยความสะดวก', 'การเงิน'] }
        });

        // แก้ไขบรรทัดที่ดึงข้อมูลตรงนี้ครับ:
        // ในเมื่อ result เป็น Array ให้ใช้ result[0]
        const topCategory = result[0].label; 
        const confidence = result[0].score;

        res.json({ 
            category: topCategory, 
            confidence: Number(confidence).toFixed(4) 
        });
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        res.status(500).json({ error: "ไม่สามารถประมวลผล AI ได้" });
    }
});
console.log("เช็คค่า Token:", process.env.HF_TOKEN ? "เจอ Token แล้ว!" : "ไม่พบ Token!");
app.listen(8000, () => console.log("Backend running on http://localhost:8000"));
