import fs from "node:fs/promises";
import path from "node:path";
import type { AuditResult } from "../types/audit.js";

export async function generateMarkdownReport(
  result: AuditResult,
  outputDir = "reports",
): Promise<string> {
  const absoluteOutputDir = path.resolve(outputDir);
  const reportPath = path.join(absoluteOutputDir, "report.md");

  await fs.mkdir(absoluteOutputDir, { recursive: true });

  const content = buildMarkdownContent(result);

  await fs.writeFile(reportPath, content, "utf-8");

  return reportPath;
}

function buildMarkdownContent(result: AuditResult): string {
  const technologies = result.technologies.map((technology) => `- ${technology}`).join("\n");

  const errorCount = result.findings.filter((finding) => finding.severity === "error").length;
  const warningCount = result.findings.filter((finding) => finding.severity === "warning").length;
  const infoCount = result.findings.filter((finding) => finding.severity === "info").length;

  const findings =
    result.findings.length > 0
      ? result.findings
          .map(
            (finding) =>
              `- **${finding.severity.toUpperCase()}** [${finding.category}] ${finding.title}: ${finding.message}`,
          )
          .join("\n")
      : "No se han detectado hallazgos todavía.";

  return `# Informe de auditoría

## Resumen

- Errores: ${errorCount}
- Advertencias: ${warningCount}
- Información: ${infoCount}

## Proyecto

\`${result.projectPath}\`

## Tecnologías detectadas

${technologies}

## Hallazgos

${findings}

## Generado

\`${result.generatedAt}\`
`;
}
