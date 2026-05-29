export type FindingSeverity = "info" | "warning" | "error";

export type FindingCategory =
  | "structure"
  | "documentation"
  | "dependencies"
  | "security"
  | "typescript"
  | "testing"
  | "docker"
  | "general";

export type Finding = {
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  message: string;
  recommendation?: string;
};
