/**
 * Theory Content V3 Validator
 *
 * Comprehensive validation system for Theory Content V3 with quality scoring.
 * Implements strict validation rules from 02-DATA-ARCHITECTURE-V3.md and 07-QUALITY-IMPROVEMENT-PLAN.md
 */

import type {
  ConceptsContent,
  ModelsContent,
  DemonstrationsContent,
  QualityMetrics,
  ValidationResult,
  ValidationRules,
} from '@/types/theory-content-v3';

/**
 * Default validation rules configuration
 */
const DEFAULT_VALIDATION_RULES: ValidationRules = {
  concepts: {
    intro: { minLength: 200, maxLength: 400 },
    coreIdea: { minLength: 50, maxLength: 120 },
    definition: { minLength: 100, maxLength: 150 },
    minCommonMisconceptions: 2,
    minRealWorldExamples: 2,
  },
  models: {
    intro: { minLength: 150, maxLength: 250 },
    minSteps: 3,
    maxSteps: 8,
    stepDescription: { minLength: 300, maxLength: 600 }, // **核心要求!**
    minKeyThinkingPoints: 3,
    minCommonPitfalls: 2,
  },
  demonstrations: {
    intro: { minLength: 100, maxLength: 200 },
    scenario: { minLength: 300, maxLength: 500 },
    thinkingProcess: { minLength: 200, maxLength: 400 },
    minKeyInsights: 3,
    minCommonMistakes: 2,
    minTransferableSkills: 3,
  },
};

/**
 * Theory Content Validator Class
 */
export class TheoryContentValidator {
  private rules: ValidationRules;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(rules: ValidationRules = DEFAULT_VALIDATION_RULES) {
    this.rules = rules;
  }

  /**
   * Validate complete theory content and calculate quality score
   */
  validate(
    conceptsContent: ConceptsContent,
    modelsContent: ModelsContent,
    demonstrationsContent: DemonstrationsContent
  ): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Validate each section
    this.validateConcepts(conceptsContent);
    this.validateModels(modelsContent);
    this.validateDemonstrations(demonstrationsContent);

    // Calculate quality metrics
    const metrics = this.calculateQualityMetrics(
      conceptsContent,
      modelsContent,
      demonstrationsContent
    );

    // Calculate overall score
    const score = this.calculateScore(metrics);
    const isValid = this.errors.length === 0 && score >= 80;

    return {
      isValid,
      score,
      errors: this.errors,
      warnings: this.warnings,
      metrics,
    };
  }

  /**
   * Validate Concepts Content
   */
  private validateConcepts(content: ConceptsContent): void {
    const { intro, concepts } = content;
    const rules = this.rules.concepts;

    // Validate intro length
    const introLength = intro?.length || 0;
    if (introLength < rules.intro.minLength) {
      this.errors.push(
        `概念引言过短: ${introLength}字 (要求≥${rules.intro.minLength}字)`
      );
    }
    if (introLength > rules.intro.maxLength) {
      this.warnings.push(
        `概念引言过长: ${introLength}字 (建议≤${rules.intro.maxLength}字)`
      );
    }

    // Validate each concept
    concepts.forEach((concept, idx) => {
      const prefix = `概念${idx + 1} (${concept.name})`;

      // Core idea length
      const coreIdeaLength = concept.coreIdea?.length || 0;
      if (coreIdeaLength < rules.coreIdea.minLength) {
        this.errors.push(
          `${prefix}: 核心理念过短 (${coreIdeaLength}字, 要求≥${rules.coreIdea.minLength}字)`
        );
      }

      // Definition length
      const defLength = concept.definition?.length || 0;
      if (defLength < rules.definition.minLength) {
        this.errors.push(
          `${prefix}: 定义过短 (${defLength}字, 要求≥${rules.definition.minLength}字)`
        );
      }

      // Concept breakdown (recommended but not mandatory)
      if (!concept.conceptBreakdown) {
        this.warnings.push(`${prefix}: 缺少多层级概念分解 (conceptBreakdown)`);
      }

      // Critical thinking framework (mandatory)
      const framework = concept.criticalThinkingFramework;
      if (!framework || !framework.step1 || !framework.step2 || !framework.step3) {
        this.errors.push(
          `${prefix}: 批判性思维框架不完整 (至少需要3步)`
        );
      }

      // Common misconceptions
      const misconceptions = concept.commonMisconceptions || [];
      if (misconceptions.length < rules.minCommonMisconceptions) {
        this.errors.push(
          `${prefix}: 常见误区不足 (${misconceptions.length}个, 要求≥${rules.minCommonMisconceptions}个)`
        );
      }

      // Real world examples
      const examples = concept.realWorldExamples || [];
      if (examples.length < rules.minRealWorldExamples) {
        this.errors.push(
          `${prefix}: 真实案例不足 (${examples.length}个, 要求≥${rules.minRealWorldExamples}个)`
        );
      }

      // Visualization guide (mandatory)
      if (!concept.visualizationGuide || !concept.visualizationGuide.type) {
        this.errors.push(`${prefix}: 缺少可视化指南`);
      }
    });
  }

  /**
   * Validate Models Content
   */
  private validateModels(content: ModelsContent): void {
    const { intro, models } = content;
    const rules = this.rules.models;

    // Validate intro length
    const introLength = intro?.length || 0;
    if (introLength < rules.intro.minLength) {
      this.errors.push(
        `模型引言过短: ${introLength}字 (要求≥${rules.intro.minLength}字)`
      );
    }

    // Validate each model
    models.forEach((model, idx) => {
      const prefix = `模型${idx + 1} (${model.name})`;

      // Core logic (mandatory)
      if (
        !model.coreLogic ||
        !model.coreLogic.principle ||
        !model.coreLogic.whenWorks ||
        !model.coreLogic.whenFails
      ) {
        this.errors.push(`${prefix}: 缺少核心逻辑 (coreLogic) 完整定义`);
      }

      // Steps validation
      const steps = model.steps || [];
      if (steps.length < rules.minSteps) {
        this.errors.push(
          `${prefix}: 步骤过少 (${steps.length}步, 要求≥${rules.minSteps}步)`
        );
      }
      if (steps.length > rules.maxSteps) {
        this.warnings.push(
          `${prefix}: 步骤过多 (${steps.length}步, 建议≤${rules.maxSteps}步)`
        );
      }

      // **核心要求**: Validate each step
      steps.forEach((step, stepIdx) => {
        const stepPrefix = `${prefix} 步骤${stepIdx + 1}`;

        // Step description length (**CRITICAL REQUIREMENT**)
        const descLength = step.description?.length || 0;
        if (descLength < rules.stepDescription.minLength) {
          this.errors.push(
            `${stepPrefix}: 描述过短 (${descLength}字, **要求≥${rules.stepDescription.minLength}字**)`
          );
        }

        // Key thinking points
        const thinkingPoints = step.keyThinkingPoints || [];
        if (thinkingPoints.length < rules.minKeyThinkingPoints) {
          this.errors.push(
            `${stepPrefix}: 关键思考点不足 (${thinkingPoints.length}个, 要求≥${rules.minKeyThinkingPoints}个)`
          );
        }

        // Common pitfalls
        const pitfalls = step.commonPitfalls || [];
        if (pitfalls.length < rules.minCommonPitfalls) {
          this.errors.push(
            `${stepPrefix}: 常见陷阱不足 (${pitfalls.length}个, 要求≥${rules.minCommonPitfalls}个)`
          );
        }
      });

      // Full application example (mandatory)
      if (!model.fullApplicationExample || !model.fullApplicationExample.scenario) {
        this.errors.push(`${prefix}: 缺少完整应用案例 (fullApplicationExample)`);
      }

      // Visualization with step-by-step drawing
      if (
        !model.visualization ||
        !model.visualization.stepByStepDrawing ||
        model.visualization.stepByStepDrawing.length === 0
      ) {
        this.errors.push(`${prefix}: 缺少可视化绘图步骤 (stepByStepDrawing)`);
      }
    });
  }

  /**
   * Validate Demonstrations Content
   */
  private validateDemonstrations(content: DemonstrationsContent): void {
    const { intro, demonstrations } = content;
    const rules = this.rules.demonstrations;

    // Validate intro length
    const introLength = intro?.length || 0;
    if (introLength < rules.intro.minLength) {
      this.errors.push(
        `演示引言过短: ${introLength}字 (要求≥${rules.intro.minLength}字)`
      );
    }

    // Validate each demonstration
    demonstrations.forEach((demo, idx) => {
      const prefix = `演示${idx + 1} (${demo.title})`;

      // Learning objective (mandatory)
      if (!demo.learningObjective || demo.learningObjective.length < 80) {
        this.errors.push(`${prefix}: 学习目标缺失或过短`);
      }

      // **核心要求**: Theoretical foundation
      if (
        !demo.theoreticalFoundation ||
        !demo.theoreticalFoundation.conceptsUsed ||
        demo.theoreticalFoundation.conceptsUsed.length === 0
      ) {
        this.errors.push(`${prefix}: **缺少理论基础关联** (theoreticalFoundation)`);
      }

      // Scenario background length
      const bgLength = demo.scenario?.background?.length || 0;
      if (bgLength < rules.scenario.minLength) {
        this.errors.push(
          `${prefix}: 背景描述过短 (${bgLength}字, 要求≥${rules.scenario.minLength}字)`
        );
      }

      // **核心要求**: Step-by-step analysis with theory linkage
      const steps = demo.stepByStepAnalysis || [];
      steps.forEach((step, stepIdx) => {
        const stepPrefix = `${prefix} 分析步骤${stepIdx + 1}`;

        // Concept applied (**CRITICAL REQUIREMENT**)
        if (!step.conceptApplied || step.conceptApplied.trim() === '') {
          this.errors.push(`${stepPrefix}: **缺少概念应用标注** (conceptApplied)`);
        }

        // Thinking process length
        const thinkingLength = step.thinkingProcess?.length || 0;
        if (thinkingLength < rules.thinkingProcess.minLength) {
          this.errors.push(
            `${stepPrefix}: 思维过程过短 (${thinkingLength}字, 要求≥${rules.thinkingProcess.minLength}字)`
          );
        }
      });

      // Key insights
      const insights = demo.keyInsights || [];
      if (insights.length < rules.minKeyInsights) {
        this.errors.push(
          `${prefix}: 关键洞察不足 (${insights.length}个, 要求≥${rules.minKeyInsights}个)`
        );
      }

      // Common mistakes
      const mistakes = demo.commonMistakesInThisCase || [];
      if (mistakes.length < rules.minCommonMistakes) {
        this.errors.push(
          `${prefix}: 常见错误不足 (${mistakes.length}个, 要求≥${rules.minCommonMistakes}个)`
        );
      }

      // Transferable skills
      const skills = demo.transferableSkills || [];
      if (skills.length < rules.minTransferableSkills) {
        this.errors.push(
          `${prefix}: 可迁移技能不足 (${skills.length}个, 要求≥${rules.minTransferableSkills}个)`
        );
      }
    });
  }

  /**
   * Calculate comprehensive quality metrics
   */
  private calculateQualityMetrics(
    conceptsContent: ConceptsContent,
    modelsContent: ModelsContent,
    demonstrationsContent: DemonstrationsContent
  ): QualityMetrics {
    // Concepts metrics
    const concepts = conceptsContent.concepts || [];
    const conceptsWithBreakdown = concepts.filter((c) => c.conceptBreakdown).length;
    const conceptsWithFramework = concepts.filter(
      (c) => c.criticalThinkingFramework?.step3
    ).length;
    const conceptsWithVisualization = concepts.filter(
      (c) => c.visualizationGuide
    ).length;
    const totalMisconceptions = concepts.reduce(
      (sum, c) => sum + (c.commonMisconceptions?.length || 0),
      0
    );
    const totalExamples = concepts.reduce(
      (sum, c) => sum + (c.realWorldExamples?.length || 0),
      0
    );

    // Models metrics
    const models = modelsContent.models || [];
    const totalSteps = models.reduce((sum, m) => sum + (m.steps?.length || 0), 0);
    const totalStepWords = models.reduce(
      (sum, m) =>
        sum +
        (m.steps?.reduce((s, step) => s + (step.description?.length || 0), 0) || 0),
      0
    );
    const stepsWithThinkingPoints = models.reduce(
      (sum, m) =>
        sum +
        (m.steps?.filter((s) => (s.keyThinkingPoints?.length || 0) >= 3).length || 0),
      0
    );
    const stepsWithPitfalls = models.reduce(
      (sum, m) =>
        sum +
        (m.steps?.filter((s) => (s.commonPitfalls?.length || 0) >= 2).length || 0),
      0
    );
    const modelsWithFullExample = models.filter(
      (m) => m.fullApplicationExample?.scenario
    ).length;

    // Demonstrations metrics
    const demos = demonstrationsContent.demonstrations || [];
    const totalDemoSteps = demos.reduce(
      (sum, d) => sum + (d.stepByStepAnalysis?.length || 0),
      0
    );
    const stepsWithTheoryLink = demos.reduce(
      (sum, d) =>
        sum +
        (d.stepByStepAnalysis?.filter((s) => s.conceptApplied).length || 0),
      0
    );
    const totalDemoStepWords = demos.reduce(
      (sum, d) =>
        sum +
        (d.stepByStepAnalysis?.reduce(
          (s, step) => s + (step.thinkingProcess?.length || 0),
          0
        ) || 0),
      0
    );
    const demosWithInsights = demos.filter(
      (d) => (d.keyInsights?.length || 0) >= 3
    ).length;
    const demosWithMistakes = demos.filter(
      (d) => (d.commonMistakesInThisCase?.length || 0) >= 2
    ).length;

    // Calculate total words
    const conceptsWords =
      (conceptsContent.intro?.length || 0) +
      concepts.reduce(
        (sum, c) =>
          sum +
          (c.coreIdea?.length || 0) +
          (c.definition?.length || 0) +
          (c.whyImportant?.length || 0),
        0
      );
    const modelsWords = (modelsContent.intro?.length || 0) + totalStepWords;
    const demosWords =
      (demonstrationsContent.intro?.length || 0) + totalDemoStepWords;
    const totalWords = conceptsWords + modelsWords + demosWords;

    // Calculate structure score (0-100)
    const structureScore = this.calculateStructureScore(
      conceptsWithBreakdown,
      concepts.length,
      modelsWithFullExample,
      models.length,
      stepsWithTheoryLink,
      totalDemoSteps
    );

    // Calculate overall quality score (0-100)
    const overallQualityScore = this.calculateOverallScore(
      conceptsWithFramework,
      concepts.length,
      totalSteps > 0 ? totalStepWords / totalSteps : 0,
      stepsWithTheoryLink,
      totalDemoSteps,
      totalDemoSteps > 0 ? totalDemoStepWords / totalDemoSteps : 0
    );

    return {
      conceptsScore: {
        totalConcepts: concepts.length,
        conceptsWithBreakdown,
        conceptsWithFramework,
        conceptsWithVisualization,
        avgMisconceptionsPerConcept:
          concepts.length > 0 ? totalMisconceptions / concepts.length : 0,
        avgExamplesPerConcept:
          concepts.length > 0 ? totalExamples / concepts.length : 0,
      },
      modelsScore: {
        totalModels: models.length,
        avgStepsPerModel: models.length > 0 ? totalSteps / models.length : 0,
        avgWordCountPerStep: totalSteps > 0 ? totalStepWords / totalSteps : 0,
        stepsWithThinkingPoints,
        stepsWithPitfalls,
        modelsWithFullExample,
      },
      demonstrationsScore: {
        totalDemonstrations: demos.length,
        avgStepsPerDemo: demos.length > 0 ? totalDemoSteps / demos.length : 0,
        stepsWithTheoryLink,
        avgWordCountPerStep:
          totalDemoSteps > 0 ? totalDemoStepWords / totalDemoSteps : 0,
        demosWithInsights,
        demosWithMistakes,
      },
      totalWords,
      structureScore,
      overallQualityScore,
    };
  }

  /**
   * Calculate structure completeness score
   */
  private calculateStructureScore(
    conceptsWithBreakdown: number,
    totalConcepts: number,
    modelsWithExample: number,
    totalModels: number,
    stepsWithTheoryLink: number,
    totalDemoSteps: number
  ): number {
    const conceptScore =
      totalConcepts > 0 ? (conceptsWithBreakdown / totalConcepts) * 30 : 0;
    const modelScore =
      totalModels > 0 ? (modelsWithExample / totalModels) * 30 : 0;
    const demoScore =
      totalDemoSteps > 0 ? (stepsWithTheoryLink / totalDemoSteps) * 40 : 0;

    return Math.round(conceptScore + modelScore + demoScore);
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(
    conceptsWithFramework: number,
    totalConcepts: number,
    avgStepWords: number,
    stepsWithTheoryLink: number,
    totalDemoSteps: number,
    avgDemoStepWords: number
  ): number {
    // Concept framework score (0-25 points)
    const conceptScore =
      totalConcepts > 0 ? (conceptsWithFramework / totalConcepts) * 25 : 0;

    // Model step word count score (0-40 points) - **CRITICAL**
    const stepWordScore = Math.min((avgStepWords / 300) * 40, 40);

    // Demo theory linkage score (0-20 points) - **CRITICAL**
    const theoryLinkScore =
      totalDemoSteps > 0 ? (stepsWithTheoryLink / totalDemoSteps) * 20 : 0;

    // Demo step word count score (0-15 points)
    const demoWordScore = Math.min((avgDemoStepWords / 200) * 15, 15);

    return Math.round(conceptScore + stepWordScore + theoryLinkScore + demoWordScore);
  }

  /**
   * Calculate final score from metrics
   */
  private calculateScore(metrics: QualityMetrics): number {
    // If there are validation errors, score cannot exceed 79
    if (this.errors.length > 0) {
      return Math.min(metrics.overallQualityScore, 79);
    }

    return metrics.overallQualityScore;
  }
}

/**
 * Convenience function for quick validation
 */
export function validateTheoryContent(
  conceptsContent: ConceptsContent,
  modelsContent: ModelsContent,
  demonstrationsContent: DemonstrationsContent,
  customRules?: Partial<ValidationRules>
): ValidationResult {
  const rules = customRules
    ? { ...DEFAULT_VALIDATION_RULES, ...customRules }
    : DEFAULT_VALIDATION_RULES;

  const validator = new TheoryContentValidator(rules);
  return validator.validate(conceptsContent, modelsContent, demonstrationsContent);
}
