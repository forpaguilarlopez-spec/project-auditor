import fs from "node:fs/promises";
import path from "node:path";
import type { Finding } from "../types/finding.js";

type PackageJson = {
  scripts?: Record<string, string>;
};

export async function analyzePackageJson(projectPath: string): Promise<Finding[]> {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (!(await exists(packageJsonPath))) {
    return [
      {
        severity: "warning",
        category: "dependencies",
        title: "package.json no encontrado",
        message: "No se ha encontrado package.json en la raíz del proyecto.",
      },
    ];
  }

  const packageJson = await readPackageJson(packageJsonPath);
  const findings: Finding[] = [];
  const scripts = packageJson.scripts ?? {};

  if (Object.keys(scripts).length === 0) {
    findings.push({
      severity: "warning",
      category: "general",
      title: "Scripts no definidos",
      message: "El package.json no tiene scripts definidos.",
    });

    return findings;
  }

  if (!scripts["lint"]) {
    findings.push({
      severity: "warning",
      category: "general",
      title: "Script lint no encontrado",
      message: "No se ha encontrado un script lint en package.json.",
    });
  } else {
    findings.push({
      severity: "info",
      category: "general",
      title: "Script lint encontrado",
      message: `Script lint: ${scripts["lint"]}`,
    });
  }

  if (!scripts["test"]) {
    findings.push({
      severity: "warning",
      category: "testing",
      title: "Script test no encontrado",
      message: "No se ha encontrado un script test en package.json.",
    });
  } else {
    findings.push({
      severity: "info",
      category: "testing",
      title: "Script test encontrado",
      message: `Script test: ${scripts["test"]}`,
    });
  }

  if (!scripts["typecheck"]) {
    findings.push({
      severity: "warning",
      category: "typescript",
      title: "Script typecheck no encontrado",
      message: "No se ha encontrado un script typecheck en package.json.",
    });
  } else {
    findings.push({
      severity: "info",
      category: "typescript",
      title: "Script typecheck encontrado",
      message: `Script typecheck: ${scripts["typecheck"]}`,
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
