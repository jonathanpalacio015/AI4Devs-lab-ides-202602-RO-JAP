import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/candidates"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Filtro de archivos (solo PDF/DOC/DOCX)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos PDF o DOCX"));
  }
};

// Exportar instancia de multer
const upload = multer({ storage, fileFilter });
export default upload;
