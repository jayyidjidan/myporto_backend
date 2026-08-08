import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

export const uploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "process1image", maxCount: 1 },
  { name: "process2image", maxCount: 1 },
  { name: "process3image", maxCount: 1 },
  { name: "process4image", maxCount: 1 },
  { name: "result1image", maxCount: 1 },
  { name: "result2image", maxCount: 1 },
  { name: "result3image", maxCount: 1 },
  { name: "gallery1", maxCount: 1 },
  { name: "gallery2", maxCount: 1 },
  { name: "gallery3", maxCount: 1 },
  { name: "gallery4", maxCount: 1 },
  { name: "gallery5", maxCount: 1 },
  { name: "gallery6", maxCount: 1 },
  { name: "gallery7", maxCount: 1 },
  { name: "gallery8", maxCount: 1 },
  { name: "gallery9", maxCount: 1 },
]);
