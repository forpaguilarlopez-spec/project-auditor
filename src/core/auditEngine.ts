import fs from "node:fs/promises";
import path from "node:path";
import { analyzeDependencies } from "../analyzers/dependencyAnalyzer.js";
import { analyzePackageJson } from "../analyzers/packageJsonAnalyzer.js";
import { analyzePrettier } from "../analyzers/prettierAnalyzer.js";
import { analyzeProjectStructure } from "../analyzers/projectStructureAnalyzer.js";
import { analyzeReadme } from "../analyzers/readmeAnalyzer.js";
import { detectTechnologies } from "../detectors/technologyDetector.js";
import type { AuditResult } from "../types/audit.js";

export async function runAudit(projectPath: string): Promise<AuditResult> {
  const absolutePath = path.resolve(projectPath);

  console.log("Motor de auditoría iniciado");
  console.log(`Ruta recibida: ${projectPath}`);
  console.log(`Ruta absoluta: ${absolutePath}`);

  try {
    const stats = await fs.stat(absolutePath);

    if (!stats.isDirectory()) {
      throw new Error(`La ruta indicada no es una carpeta: ${absolutePath}`);
    }

    console.log("✅ La carpeta existe y es válida");

    const technologies = await detectTechnologies(absolutePath);

    const findings = [
      ...(await analyzeReadme(absolutePath)),
      ...(await analyzeProjectStructure(absolutePath, technologies)),
      ...(await analyzePackageJson(absolutePath)),
      ...(await analyzeDependencies(absolutePath, technologies)),
      ...(await analyzePrettier(absolutePath)),
    ];

    return {
      projectPath: absolutePath,
      technologies,
      findings,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new Error(`La ruta indicada no existe: ${absolutePath}`);
    }

    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
