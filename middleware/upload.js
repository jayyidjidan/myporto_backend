import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // controller memakai file.buffer
  limits: { fileSize: 8 * 1024 * 1024, files: 60 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Hanya file gambar yang diperbolehkan."));
  },
}).any(); // terima nama field dinamis: coverImage, s0_b0_img0, dst.

export const uploadFields = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      // error multer dijawab JSON, bukan HTML
      return res.status(400).json({ success: false, message: err.message });
    }

    // .any() menghasilkan array; ubah ke { fieldname: [file, ...] }
    // supaya cocok dengan cara controller membaca req.files
    const grouped = {};
    for (const file of req.files || []) {
      (grouped[file.fieldname] ||= []).push(file);
    }
    req.files = grouped;

    next();
  });
};