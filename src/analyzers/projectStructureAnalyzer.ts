import fs from "node:fs/promises";
import path from "node:path";
import type { Finding } from "../types/finding.js";
import type { Technology } from "../types/technology.js";

export async function analyzeProjectStructure(
  projectPath: string,
  technologies: Technology[],
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const isMobileProject = technologies.includes("expo") || technologies.includes("react-native");

  if (isMobileProject) {
    const hasMobileStructure =
      (await existsDirectory(path.join(projectPath, "src"))) ||
      (await existsDirectory(path.join(projectPath, "app"))) ||
      (await existsDirectory(path.join(projectPath, "components")));

    if (hasMobileStructure) {
      findings.push({
        severity: "info",
        category: "structure",
        title: "Estructura mobile encontrada",
        message: "El proyecto tiene estructura compatible con Expo/React Native.",
      });
    } else {
      findings.push({
        severity: "warning",
        category: "structure",
        title: "Estructura mobile no encontrada",
        message: "No se ha encontrado src, app ni components en la raíz.",
        recommendation:
          "Revisa si el proyecto debería tener carpetas como app, src o components. Si usa Expo Router, normalmente app/ será una carpeta clave.",
      });
    }
  } else if (await existsDirectory(path.join(projectPath, "src"))) {
    findings.push({
      severity: "info",
      category: "structure",
      title: "Carpeta src encontrada",
      message: "El proyecto tiene carpeta src.",
    });
  } else {
    findings.push({
      severity: "warning",
      category: "structure",
      title: "Carpeta src no encontrada",
      message: "No se ha encontrado una carpeta src en la raíz del proyecto.",
      recommendation:
        "Valora organizar el código fuente dentro de una carpeta src para separar código de configuración, documentación y archivos auxiliares.",
    });
  }

  const hasTestsDirectory =
    (await existsDirectory(path.join(projectPath, "tests"))) ||
    (await existsDirectory(path.join(projectPath, "test"))) ||
    (await existsDirectory(path.join(projectPath, "__tests__")));

  if (hasTestsDirectory) {
    findings.push({
      severity: "info",
      category: "testing",
      title: "Carpeta de tests encontrada",
      message: "El proyecto tiene una carpeta de tests.",
    });
  } else {
    findings.push({
      severity: "warning",
      category: "testing",
      title: "Carpeta de tests no encontrada",
      message: "No se ha encontrado tests, test ni __tests__ en la raíz.",
      recommendation:
        "Añade una carpeta tests, test o __tests__ para empezar a separar pruebas automáticas del código principal.",
    });
  }

  if (await existsDirectory(path.join(projectPath, "docs"))) {
    findings.push({
      severity: "info",
      category: "documentation",
      title: "Carpeta docs encontrada",
      message: "El proyecto tiene carpeta docs.",
    });
  }

  return findings;
}

async function existsDirectory(directoryPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(directoryPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
