import { Router, Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import upload from "../middleware/uploads";

const router = Router();

// Crear candidato con CV
router.post(
  "/",
  upload.single("cvFile"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, phone, address, educations, experiences } =
        req.body;

      // Validaciones básicas
      if (!firstName || !lastName || !email) {
        return res
          .status(400)
          .json({
            message: "Nombre, apellido y correo son obligatorios",
          });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Correo inválido" });
      }

      // Verificar si email ya existe
      const existingCandidate = await prisma.candidate.findUnique({
        where: { email },
      });

      if (existingCandidate) {
        return res
          .status(409)
          .json({ message: "El correo ya está registrado" });
      }

      // Procesar archivo CV
      const cvFilePath = req.file ? `/uploads/candidates/${req.file.filename}` : null;

      // Procesar educaciones
      let eduArray: any[] = [];
      if (educations) {
        try {
          eduArray = JSON.parse(educations);
        } catch {
          return res.status(400).json({ message: "Formato de educaciones inválido" });
        }
      }

      // Procesar experiencias
      let expArray: any[] = [];
      if (experiences) {
        try {
          expArray = JSON.parse(experiences);
        } catch {
          return res.status(400).json({ message: "Formato de experiencias inválido" });
        }
      }

      // Crear candidato en DB
      const candidate = await prisma.candidate.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          address,
          cvFilePath,
          educations: {
            create: eduArray.map((edu) => ({
              school: edu.school,
              degree: edu.degree,
              field: edu.field || null,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
            })),
          },
          experiences: {
            create: expArray.map((exp) => ({
              company: exp.company,
              role: exp.role,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description,
            })),
          },
        },
        include: { educations: true, experiences: true },
      });

      res.status(201).json(candidate);
    } catch (error) {
      next(error);
    }
  }
);

// Listar candidatos
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: { educations: true, experiences: true },
    });
    res.json(candidates);
  } catch (error) {
    next(error);
  }
});

// Obtener candidato por ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({
      where: { id: Number(id) },
      include: { educations: true, experiences: true },
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidato no encontrado" });
    }

    res.json(candidate);
  } catch (error) {
    next(error);
  }
});

// Actualizar candidato
router.put(
  "/:id",
  upload.single("cvFile"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, address, educations, experiences } =
        req.body;

      // Validar que sea un ID válido
      const candidateExists = await prisma.candidate.findUnique({
        where: { id: Number(id) },
      });

      if (!candidateExists) {
        return res.status(404).json({ message: "Candidato no encontrado" });
      }

      // Preparar datos de actualización
      const updateData: any = {
        firstName,
        lastName,
        email,
        phone,
        address,
      };

      if (req.file) {
        updateData.cvFilePath = `/uploads/candidates/${req.file.filename}`;
      }

      // Procesar y actualizar educaciones
      if (educations) {
        try {
          const eduArray = JSON.parse(educations);

          // Eliminar educaciones antiguas
          await prisma.education.deleteMany({
            where: { candidateId: Number(id) },
          });

          // Crear nuevas educaciones
          updateData.educations = {
            create: eduArray.map((edu: any) => ({
              school: edu.school,
              degree: edu.degree,
              field: edu.field || null,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
            })),
          };
        } catch {
          return res.status(400).json({ message: "Formato de educaciones inválido" });
        }
      }

      // Procesar y actualizar experiencias
      if (experiences) {
        try {
          const expArray = JSON.parse(experiences);

          // Eliminar experiencias antiguas
          await prisma.experience.deleteMany({
            where: { candidateId: Number(id) },
          });

          // Crear nuevas experiencias
          updateData.experiences = {
            create: expArray.map((exp: any) => ({
              company: exp.company,
              role: exp.role,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description,
            })),
          };
        } catch {
          return res.status(400).json({ message: "Formato de experiencias inválido" });
        }
      }

      const candidate = await prisma.candidate.update({
        where: { id: Number(id) },
        data: updateData,
        include: { educations: true, experiences: true },
      });

      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }
);

// Eliminar candidato
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id: Number(id) },
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidato no encontrado" });
    }

    await prisma.candidate.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Candidato eliminado correctamente" });
  } catch (error) {
    next(error);
  }
});

export default router;

