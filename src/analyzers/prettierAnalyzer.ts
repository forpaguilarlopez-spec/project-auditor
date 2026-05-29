import fs from "node:fs/promises";
import path from "node:path";
import type { Finding } from "../types/finding.js";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const PRETTIER_CONFIG_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.js",
  ".prettierrc.cjs",
  "prettier.config.js",
  "prettier.config.cjs",
  "prettier.config.mjs",
];

export async function analyzePrettier(projectPath: string): Promise<Finding[]> {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (!(await exists(packageJsonPath))) return [];

  const packageJson = await readPackageJson(packageJsonPath);
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const prettierVersion = dependencies["prettier"];
  const prettierConfigFile = await findExistingPrettierConfig(projectPath);

  if (prettierVersion && prettierConfigFile) {
    return [
      {
        severity: "info",
        category: "general",
        title: "Prettier instalado y configurado",
        message: `Prettier está declarado (${prettierVersion}) y existe configuración en ${prettierConfigFile}.`,
      },
    ];
  }

  if (prettierVersion && !prettierConfigFile) {
    return [
      {
        severity: "warning",
        category: "general",
        title: "Prettier instalado sin configuración",
        message: `Prettier está declarado (${prettierVersion}), pero no se ha encontrado archivo de configuración.`,
      },
    ];
  }

  if (!prettierVersion && prettierConfigFile) {
    return [
      {
        severity: "warning",
        category: "general",
        title: "Configuración de Prettier sin dependencia",
        message: `Existe ${prettierConfigFile}, pero prettier no está declarado en package.json.`,
      },
    ];
  }

  return [
    {
      severity: "warning",
      category: "general",
      title: "Prettier no encontrado",
      message: "No se ha encontrado prettier ni configuración de Prettier en el proyecto.",
    },
  ];
}

async function findExistingPrettierConfig(projectPath: string): Promise<string | null> {
  for (const configFile of PRETTIER_CONFIG_FILES) {
    if (await exists(path.join(projectPath, configFile))) return configFile;
  }

  return null;
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
