import fs from "node:fs/promises";
import path from "node:path";
import type { AuditResult } from "../types/audit.js";
import type { Finding, FindingSeverity } from "../types/finding.js";

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
  const qualityScore = calculateQualityScore(errorCount, warningCount);
  const qualityLabel = getQualityLabel(qualityScore);

  const findings = buildFindingsSection(sortedFindings);
  const recommendations = buildRecommendationsSection(sortedFindings);

  return `# Informe de auditoría

## Resumen ejecutivo

Proyecto analizado: **${result.projectName}**

- Errores: ${errorCount}
- Advertencias: ${warningCount}
- Información: ${infoCount}

## Puntuación

Calidad estimada: **${qualityScore}/100**
Nivel: **${qualityLabel}**

## Privacidad

La ruta local completa del proyecto se ha ocultado deliberadamente para evitar exponer información del sistema o del entorno de desarrollo.

## Tecnologías detectadas

${technologies}

## Hallazgos

${findings}

## Recomendaciones

${recommendations}

## Generado

\`${result.generatedAt}\`
`;
}

function buildFindingsSection(findings: Finding[]): string {
  if (findings.length === 0) {
    return "No se han detectado hallazgos todavía.";
  }

  return findings
    .map(
      (finding) =>
        `- **${finding.severity.toUpperCase()}** [${finding.category}] ${finding.title}: ${finding.message}`,
    )
    .join("\n");
}

function buildRecommendationsSection(findings: Finding[]): string {
  const actionableFindings = findings.filter(
    (finding) => finding.severity !== "info" && finding.recommendation,
  );

  if (actionableFindings.length === 0) {
    return "No hay recomendaciones pendientes.";
  }

  return actionableFindings
    .map(
      (finding) =>
        `### ${finding.title}

${finding.recommendation}`,
    )
    .join("\n\n");
}

function getSeverityWeight(severity: FindingSeverity): number {
  if (severity === "error") return 3;
  if (severity === "warning") return 2;
  return 1;
}

function calculateQualityScore(errorCount: number, warningCount: number): number {
  const score = 100 - errorCount * 15 - warningCount * 7;

  return Math.max(0, Math.min(100, score));
}

function getQualityLabel(score: number): string {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Buena";
  if (score >= 50) return "Mejorable";

  return "Crítica";
}
