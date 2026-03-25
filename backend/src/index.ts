import express from "express";
import cors from "cors";
import path from "path";
import candidatesRoutes from "./routes/candidates";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/candidates", candidatesRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Servidor está funcionando correctamente" });
});

// Middleware de error (debe ser el último)
app.use(errorHandler);

export default app;
