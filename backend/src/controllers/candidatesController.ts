import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export const addCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, phone, address, educations, experiences } =
      req.body;
    const cvFilePath = req.file ? `/uploads/candidates/${req.file.filename}` : null;

    // Verificar si el email ya existe
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email },
    });

    if (existingCandidate) {
      return res
        .status(409)
        .json({ message: "El correo ya está registrado" });
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        cvFilePath,
        educations: {
          create: educations
            ? JSON.parse(educations).map((edu: any) => ({
                school: edu.school,
                degree: edu.degree,
                field: edu.field || null,
                startDate: edu.startDate ? new Date(edu.startDate) : null,
                endDate: edu.endDate ? new Date(edu.endDate) : null,
              }))
            : [],
        },
        experiences: {
          create: experiences
            ? JSON.parse(experiences).map((exp: any) => ({
                company: exp.company,
                role: exp.role,
                startDate: new Date(exp.startDate),
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                description: exp.description,
              }))
            : [],
        },
      },
      include: { educations: true, experiences: true },
    });

    res.status(201).json(candidate);
  } catch (error) {
    next(error);
  }
};
