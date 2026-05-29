import fs from "node:fs/promises";
import path from "node:path";
import type { AuditResult } from "../types/audit.js";
import type { FindingSeverity } from "../types/finding.js";

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

  const sortedFindings = [...result.findings].sort(
    (a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity),
  );

  const errorCount = result.findings.filter((finding) => finding.severity === "error").length;
  const warningCount = result.findings.filter((finding) => finding.severity === "warning").length;
  const infoCount = result.findings.filter((finding) => finding.severity === "info").length;

  const findings =
    sortedFindings.length > 0
      ? sortedFindings
          .map(
            (finding) =>
              `- **${finding.severity.toUpperCase()}** [${finding.category}] ${finding.title}: ${finding.message}`,
          )
          .join("\n")
      : "No se han detectado hallazgos todavía.";

  return `# Informe de auditoría

## Resumen ejecutivo

Proyecto analizado: **${result.projectName}**

- Errores: ${errorCount}
- Advertencias: ${warningCount}
- Información: ${infoCount}

## Privacidad

La ruta local completa del proyecto se ha ocultado deliberadamente para evitar exponer información del sistema o del entorno de desarrollo.

## Tecnologías detectadas

${technologies}

## Hallazgos

${findings}

## Generado

\`${result.generatedAt}\`
`;
}

function getSeverityWeight(severity: FindingSeverity): number {
  if (severity === "error") return 3;
  if (severity === "warning") return 2;
  return 1;
}
