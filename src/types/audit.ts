import type { Finding } from "./finding.js";
import type { Technology } from "./technology.js";

export type AuditResult = {
  projectPath: string;
  projectName: string;
  technologies: Technology[];
  findings: Finding[];
  generatedAt: string;
};
