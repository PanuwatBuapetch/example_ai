import express from "express";
import cors from "cors";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv"; // ติดตั้งด้วย: npm install dotenv

dotenv.config(); // โหลดค่าจาก .env

const app = express();
app.use(cors());
app.use(express.json());

const hf = new HfInference(process.env.HF_TOKEN); // ดึงจาก process.env

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
