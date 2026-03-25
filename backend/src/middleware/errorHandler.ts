import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  field?: string;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  console.error(`[${statusCode}] ${message}`, err);

  // Manejo de errores específicos de Prisma
  if (err.name === "PrismaClientKnownRequestError") {
    if ((err as any).code === "P2002") {
      const field = (err as any).meta?.target?.[0] || "campo desconocido";
      return res
        .status(409)
        .json({ message: `Duplicate entry: ${field} ya existe` });
    }
    if ((err as any).code === "P2025") {
      return res.status(404).json({ message: "Registro no encontrado" });
    }
  }

  res.status(statusCode).json({ message });
};
