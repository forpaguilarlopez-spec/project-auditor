import fs from "node:fs/promises";
import path from "node:path";
import type { Technology } from "../types/technology.js";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export async function detectTechnologies(projectPath: string): Promise<Technology[]> {
  const technologies = new Set<Technology>();

  const packageJsonPath = path.join(projectPath, "package.json");

  if (await exists(packageJsonPath)) {
    technologies.add("node");

    const packageJson = await readPackageJson(packageJsonPath);
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if ("typescript" in dependencies) technologies.add("typescript");
    if ("react" in dependencies) technologies.add("react");
    if ("react-native" in dependencies) technologies.add("react-native");
    if ("expo" in dependencies) technologies.add("expo");
  }

  if (await exists(path.join(projectPath, "tsconfig.json"))) technologies.add("typescript");
  if (await exists(path.join(projectPath, "Dockerfile"))) technologies.add("docker");
  if (await exists(path.join(projectPath, "pom.xml"))) technologies.add("java");
  if (await exists(path.join(projectPath, "requirements.txt"))) technologies.add("python");

  if (technologies.size === 0) technologies.add("unknown");

  return [...technologies];
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
