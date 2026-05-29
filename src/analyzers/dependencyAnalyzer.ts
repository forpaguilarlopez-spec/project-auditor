import fs from "node:fs/promises";
import path from "node:path";
import type { Finding } from "../types/finding.js";
import type { Technology } from "../types/technology.js";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export async function analyzeDependencies(
  projectPath: string,
  technologies: Technology[],
): Promise<Finding[]> {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (!(await exists(packageJsonPath))) return [];

  const packageJson = await readPackageJson(packageJsonPath);
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const findings: Finding[] = [];

  if (technologies.includes("typescript") && !dependencies["typescript"]) {
    findings.push({
      severity: "warning",
      category: "typescript",
      title: "TypeScript no encontrado en dependencias",
      message: "El proyecto parece usar TypeScript, pero no declara typescript en package.json.",
      recommendation:
        "Instala TypeScript como dependencia de desarrollo para que el proyecto sea reproducible en otros entornos: npm install -D typescript.",
    });
  }

  if (!dependencies["eslint"]) {
    findings.push({
      severity: "warning",
      category: "general",
      title: "ESLint no encontrado",
      message: "No se ha encontrado eslint en dependencies ni devDependencies.",
      recommendation:
        "Instala y configura ESLint para detectar errores, inconsistencias y malas prácticas durante el desarrollo.",
    });
  } else {
    findings.push({
      severity: "info",
      category: "general",
      title: "ESLint encontrado",
      message: `Versión declarada: ${dependencies["eslint"]}`,
    });
  }

  const hasTestRunner = Boolean(dependencies["jest"] || dependencies["vitest"]);

  if (!hasTestRunner) {
    findings.push({
      severity: "warning",
      category: "testing",
      title: "Runner de tests no encontrado",
      message: "No se ha encontrado jest ni vitest en dependencies/devDependencies.",
      recommendation:
        "Añade un runner de tests como Vitest o Jest para poder automatizar pruebas y validar cambios con confianza.",
    });
  } else {
    findings.push({
      severity: "info",
      category: "testing",
      title: "Runner de tests encontrado",
      message: "El proyecto declara jest o vitest.",
    });
  }

  return findings;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readPackageJson(packageJsonPath: string): Promise<PackageJson> {
  const content = await fs.readFile(packageJsonPath, "utf-8");
  return JSON.parse(content) as PackageJson;
}
