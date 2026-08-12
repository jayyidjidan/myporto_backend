import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

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