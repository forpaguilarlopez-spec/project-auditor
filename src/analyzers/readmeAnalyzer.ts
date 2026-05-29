import fs from "node:fs/promises";
import path from "node:path";
import type { Finding } from "../types/finding.js";

const MIN_README_LINES = 5;
const MIN_README_CHARS = 200;

export async function analyzeReadme(projectPath: string): Promise<Finding[]> {
  const readmePath = path.join(projectPath, "README.md");

  if (!(await exists(readmePath))) {
    return [
      {
        severity: "warning",
        category: "documentation",
        title: "README no encontrado",
        message: "El proyecto no tiene README.md en la raíz.",
        recommendation:
          "Crea un README.md con una descripción del proyecto, instrucciones de instalación, uso, scripts disponibles y estado actual.",
      },
    ];
  }

  const content = await fs.readFile(readmePath, "utf-8");
  const trimmedContent = content.trim();
  const lineCount = trimmedContent.split("\n").filter((line) => line.trim().length > 0).length;

  if (trimmedContent.length === 0) {
    return [
      {
        severity: "warning",
        category: "documentation",
        title: "README vacío",
        message: "El archivo README.md existe, pero no tiene contenido.",
        recommendation:
          "Completa el README.md con el objetivo del proyecto, cómo instalarlo, cómo ejecutarlo y qué funcionalidades incluye.",
      },
    ];
  }

  if (lineCount < MIN_README_LINES || trimmedContent.length < MIN_README_CHARS) {
    return [
      {
        severity: "warning",
        category: "documentation",
        title: "README demasiado básico",
        message: `El README.md existe, pero parece insuficiente: ${lineCount} líneas útiles y ${trimmedContent.length} caracteres.`,
        recommendation:
          "Amplía el README.md añadiendo contexto del proyecto, requisitos, instalación, uso, scripts y decisiones técnicas relevantes.",
      },
    ];
  }

  return [
    {
      severity: "info",
      category: "documentation",
      title: "README correcto",
      message: `El proyecto tiene README.md con ${lineCount} líneas útiles y ${trimmedContent.length} caracteres.`,
    },
  ];
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
