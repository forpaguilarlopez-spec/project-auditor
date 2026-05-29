#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { runAudit } from "../core/auditEngine.js";
import { generateMarkdownReport } from "../reporters/markdownReporter.js";

const program = new Command();

program.name("project-auditor").description("Auditor local de proyectos").version("0.1.0");

program
  .command("analyze <projectPath>")
  .description("Analiza un proyecto")
  .action(async (projectPath: string) => {
    try {
      console.log(chalk.green("🔍 Analizando proyecto..."));
      console.log(chalk.blue(`📁 Proyecto: ${projectPath}`));

      const result = await runAudit(projectPath);

      console.log("🧠 Tecnologías detectadas:");

      for (const technology of result.technologies) {
        console.log(`- ${technology}`);
      }

      const reportPath = await generateMarkdownReport(result);

      console.log(chalk.green(`📄 Informe generado: ${reportPath}`));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";

      console.error(chalk.red(`❌ Error: ${message}`));
      process.exitCode = 1;
    }
  });

program.parse();
