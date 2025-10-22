#!/usr/bin/env tsx
/**
 * Theory Content V3 - Generation Script
 *
 * Generates high-quality theory content using AI with validation and retry mechanisms.
 * Usage: npm run generate:theory-v3 -- --dimension causal_analysis --level 1
 */

import { PrismaClient } from '@prisma/client';
import { aiRouter } from '@/lib/ai/router';
import {
  CONCEPTS_PROMPT_V3,
  SINGLE_MODEL_PROMPT_V3,
  DEMONSTRATIONS_PROMPT_V3,
} from './prompts/theory-generation-prompts-v3';
import {
  getDimensionById,
  getLevelConfig,
  getAllDimensionIds,
  validateDimensionLevel,
} from './config/dimensions';
import { validateTheoryContent } from './validators/theory-content-validator';
import type {
  ConceptsContent,
  ModelsContent,
  DemonstrationsContent,
  QualityMetrics,
} from '@/types/theory-content-v3';

const prisma = new PrismaClient();

/**
 * Extract and parse JSON from AI response with robust error handling
 */
function extractAndParseJSON<T>(content: string, contentType: string): T {
  if (!content || content.trim() === '') {
    throw new Error(`AI returned empty response for ${contentType}`);
  }

  let jsonStr = '';

  // Method 1: Try to find JSON in markdown code block (```json ... ```)
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
    console.log(`  📦 Extracted JSON from code block (${jsonStr.length} chars)`);
  }

  // Method 2: If no code block, try to find pure JSON object
  if (!jsonStr) {
    // Find the first { and last } to extract JSON
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = content.substring(firstBrace, lastBrace + 1);
      console.log(`  📦 Extracted JSON object (${jsonStr.length} chars, positions ${firstBrace}-${lastBrace})`);
    }
  }

  // Method 3: If still no JSON, try to find it with a more aggressive regex
  if (!jsonStr) {
    const jsonMatch = content.match(/\{[\s\S]*"intro"[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
      console.log(`  📦 Extracted JSON with intro pattern (${jsonStr.length} chars)`);
    }
  }

  if (!jsonStr) {
    console.error(`\n  ❌ Failed to extract JSON for ${contentType}`);
    console.error(`  📄 AI Response (first 1000 chars):`);
    console.error(content.substring(0, 1000));
    console.error(`  📄 AI Response (last 500 chars):`);
    console.error(content.substring(Math.max(0, content.length - 500)));
    throw new Error(`AI response does not contain valid JSON for ${contentType}`);
  }

  // Try to parse JSON
  try {
    const parsed = JSON.parse(jsonStr) as T;
    console.log(`  ✅ JSON parsed successfully`);
    return parsed;
  } catch (parseError: any) {
    console.error(`\n  ❌ JSON Parse Error for ${contentType}:`, parseError.message);
    console.error(`  📄 Extracted JSON (first 1000 chars):`);
    console.error(jsonStr.substring(0, 1000));
    console.error(`  📄 Extracted JSON (last 500 chars):`);
    console.error(jsonStr.substring(Math.max(0, jsonStr.length - 500)));

    // Try to fix common JSON issues
    console.log(`\n  🔧 Attempting to fix JSON...`);
    const fixedJson = attemptJSONFix(jsonStr);

    if (fixedJson) {
      try {
        const parsed = JSON.parse(fixedJson) as T;
        console.log(`  ✅ JSON fixed and parsed successfully!`);
        return parsed;
      } catch (fixError) {
        console.error(`  ❌ Failed to parse fixed JSON:`, fixError);
      }
    }

    throw new Error(`Failed to parse JSON from AI response for ${contentType}: ${parseError.message}`);
  }
}

/**
 * Attempt to fix common JSON syntax errors
 */
function attemptJSONFix(jsonStr: string): string | null {
  try {
    // Fix 1: Remove trailing commas before } or ]
    let fixed = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    // Fix 2: Ensure the JSON ends properly (find last valid } )
    const braceStack: string[] = [];
    let lastValidIndex = -1;

    for (let i = 0; i < fixed.length; i++) {
      const char = fixed[i];
      if (char === '{' || char === '[') {
        braceStack.push(char);
      } else if (char === '}') {
        if (braceStack[braceStack.length - 1] === '{') {
          braceStack.pop();
          if (braceStack.length === 0) {
            lastValidIndex = i;
          }
        }
      } else if (char === ']') {
        if (braceStack[braceStack.length - 1] === '[') {
          braceStack.pop();
        }
      }
    }

    // If we found a valid ending, truncate there
    if (lastValidIndex > 0 && lastValidIndex < fixed.length - 1) {
      console.log(`  🔧 Truncating JSON at position ${lastValidIndex + 1} (was ${fixed.length})`);
      fixed = fixed.substring(0, lastValidIndex + 1);
    }

    return fixed;
  } catch (error) {
    console.error(`  ❌ Failed to fix JSON:`, error);
    return null;
  }
}

/**
 * CLI Arguments Interface
 */
interface CLIArgs {
  dimension?: string;
  level?: number;
  all?: boolean;
  validate?: boolean;
  retry?: boolean;
  maxRetries?: number;
}

/**
 * Generation Result
 */
interface GenerationResult {
  success: boolean;
  thinkingTypeId: string;
  level: number;
  conceptsContent?: ConceptsContent;
  modelsContent?: ModelsContent;
  demonstrationsContent?: DemonstrationsContent;
  qualityMetrics?: QualityMetrics;
  score?: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Parse CLI arguments
 */
function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const parsed: CLIArgs = {
    validate: true, // Default to validate
    retry: true, // Default to retry
    maxRetries: 3,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--dimension' && args[i + 1]) {
      parsed.dimension = args[i + 1];
      i++;
    } else if (arg === '--level' && args[i + 1]) {
      parsed.level = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--all') {
      parsed.all = true;
    } else if (arg === '--validate') {
      parsed.validate = true;
    } else if (arg === '--no-validate') {
      parsed.validate = false;
    } else if (arg === '--retry') {
      parsed.retry = true;
    } else if (arg === '--no-retry') {
      parsed.retry = false;
    } else if (arg === '--max-retries' && args[i + 1]) {
      parsed.maxRetries = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return parsed;
}

/**
 * Generate Concepts Content with AI
 */
async function generateConcepts(
  dimensionId: string,
  level: number
): Promise<ConceptsContent> {
  const dimension = getDimensionById(dimensionId);
  const levelConfig = getLevelConfig(dimensionId, level);

  if (!dimension || !levelConfig) {
    throw new Error(`Invalid dimension or level: ${dimensionId}, ${level}`);
  }

  console.log(`  📝 Generating Concepts (核心概念)...`);

  const prompt = CONCEPTS_PROMPT_V3(dimension, levelConfig);
  const response = await aiRouter.chat(
    [{ role: 'user', content: prompt }],
    { stream: false }
  );

  // Parse JSON response (aiRouter.chat returns string when stream=false)
  const content = typeof response === 'string' ? response : '';

  // Extract and parse JSON with improved logic
  const conceptsContent = extractAndParseJSON<ConceptsContent>(content, 'Concepts');

  console.log(`  ✅ Concepts generated (${conceptsContent.concepts.length} concepts)`);
  return conceptsContent;
}

/**
 * Generate Models Content with AI (Batch generation - one model at a time)
 */
async function generateModels(
  dimensionId: string,
  level: number
): Promise<ModelsContent> {
  const dimension = getDimensionById(dimensionId);
  const levelConfig = getLevelConfig(dimensionId, level);

  if (!dimension || !levelConfig) {
    throw new Error(`Invalid dimension or level: ${dimensionId}, ${level}`);
  }

  console.log(`  🔧 Generating Models (思维模型)...`);

  const models: any[] = [];
  const modelCount = 2; // Generate 2 models
  const existingModelNames: string[] = [];

  // Generate models one by one
  for (let i = 1; i <= modelCount; i++) {
    console.log(`    ⚙️  Generating model ${i}/${modelCount}...`);

    const prompt = SINGLE_MODEL_PROMPT_V3(dimension, levelConfig, i, existingModelNames);
    const response = await aiRouter.chat(
      [{ role: 'user', content: prompt }],
      { stream: false, maxTokens: 10000 }  // Sufficient for single model
    );

    // Parse JSON response
    const content = typeof response === 'string' ? response : '';

    // Extract and parse single model object
    const singleModel = extractAndParseJSON<any>(content, `Model ${i}`);

    models.push(singleModel);
    existingModelNames.push(singleModel.name);

    console.log(`    ✅ Model ${i} generated: ${singleModel.name} (${singleModel.steps?.length || 0} steps)`);
  }

  // Generate intro for all models
  const intro = `在日常生活和工作中,我们常常面临复杂问题,需要系统化的思维工具来帮助分析。本章节介绍${modelCount}个实用的思维模型,它们能帮助你从不同角度审视问题,识别真正的原因,并做出更理性的决策。这些模型简单易学,适合初学者快速上手,为后续更高阶的批判性思维训练打下坚实基础。`;

  const modelsContent: ModelsContent = {
    intro,
    models,
  };

  console.log(`  ✅ Models generated (${models.length} models, ${models.reduce((sum: number, m: any) => sum + (m.steps?.length || 0), 0)} steps total)`);
  return modelsContent;
}

/**
 * Generate Demonstrations Content with AI
 */
async function generateDemonstrations(
  dimensionId: string,
  level: number,
  conceptsContent: ConceptsContent,
  modelsContent: ModelsContent
): Promise<DemonstrationsContent> {
  const dimension = getDimensionById(dimensionId);
  const levelConfig = getLevelConfig(dimensionId, level);

  if (!dimension || !levelConfig) {
    throw new Error(`Invalid dimension or level: ${dimensionId}, ${level}`);
  }

  console.log(`  💡 Generating Demonstrations (实例演示)...`);

  // Extract concepts and models list
  const conceptsList = conceptsContent.concepts.map(
    (c, i) => `${i + 1}. ${c.name} (${c.conceptId})`
  );
  const modelsList = modelsContent.models.map(
    (m, i) => `${i + 1}. ${m.name} (${m.modelId})`
  );

  const prompt = DEMONSTRATIONS_PROMPT_V3(dimension, levelConfig, conceptsList, modelsList);
  const response = await aiRouter.chat(
    [{ role: 'user', content: prompt }],
    { stream: false, maxTokens: 12000 }  // Increase max tokens for detailed demonstration content
  );

  // Parse JSON response (aiRouter.chat returns string when stream=false)
  const content = typeof response === 'string' ? response : '';

  // Use robust JSON extraction
  const demonstrationsContent = extractAndParseJSON<DemonstrationsContent>(content, 'Demonstrations');

  console.log(`  ✅ Demonstrations generated (${demonstrationsContent.demonstrations.length} demos)`);
  return demonstrationsContent;
}

/**
 * Generate Theory Content for a specific dimension and level
 */
async function generateTheoryContentV3(
  dimensionId: string,
  level: number,
  options: { validate: boolean; retry: boolean; maxRetries: number }
): Promise<GenerationResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 Generating Theory Content V3`);
  console.log(`   Dimension: ${dimensionId}`);
  console.log(`   Level: ${level}`);
  console.log(`${'='.repeat(60)}\n`);

  // Validate dimension and level
  const validation = validateDimensionLevel(dimensionId, level);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < (options.retry ? options.maxRetries : 1)) {
    attempt++;
    if (attempt > 1) {
      console.log(`\n🔄 Retry attempt ${attempt}/${options.maxRetries}...\n`);
    }

    try {
      // Step 1: Generate Concepts
      const conceptsContent = await generateConcepts(dimensionId, level);

      // Step 2: Generate Models
      const modelsContent = await generateModels(dimensionId, level);

      // Step 3: Generate Demonstrations (pass concepts and models)
      const demonstrationsContent = await generateDemonstrations(
        dimensionId,
        level,
        conceptsContent,
        modelsContent
      );

      // Step 4: Validate if enabled
      if (options.validate) {
        console.log(`\n  🔍 Validating content quality...`);
        const validationResult = validateTheoryContent(
          conceptsContent,
          modelsContent,
          demonstrationsContent
        );

        console.log(`  📊 Validation Score: ${validationResult.score}/100`);
        console.log(`  ❌ Errors: ${validationResult.errors.length}`);
        console.log(`  ⚠️  Warnings: ${validationResult.warnings.length}`);

        if (validationResult.errors.length > 0) {
          console.log(`\n  ❌ Validation Errors:`);
          validationResult.errors.forEach((err, idx) => {
            console.log(`     ${idx + 1}. ${err}`);
          });
        }

        if (validationResult.warnings.length > 0) {
          console.log(`\n  ⚠️  Validation Warnings:`);
          validationResult.warnings.slice(0, 5).forEach((warn, idx) => {
            console.log(`     ${idx + 1}. ${warn}`);
          });
          if (validationResult.warnings.length > 5) {
            console.log(`     ... and ${validationResult.warnings.length - 5} more warnings`);
          }
        }

        // If validation fails and retry is enabled, retry
        if (!validationResult.isValid && options.retry && attempt < options.maxRetries) {
          console.log(`\n  ⚠️  Content quality below threshold. Retrying...\n`);
          lastError = new Error(`Validation failed with score ${validationResult.score}`);
          continue;
        }

        // If validation passes or no more retries
        return {
          success: validationResult.isValid,
          thinkingTypeId: dimensionId,
          level,
          conceptsContent,
          modelsContent,
          demonstrationsContent,
          qualityMetrics: validationResult.metrics,
          score: validationResult.score,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        };
      }

      // If validation disabled, return success
      return {
        success: true,
        thinkingTypeId: dimensionId,
        level,
        conceptsContent,
        modelsContent,
        demonstrationsContent,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`\n  ❌ Generation failed: ${lastError.message}\n`);

      if (!options.retry || attempt >= options.maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Generation failed after maximum retries');
}

/**
 * Save generated content to database
 */
async function saveToDatabase(result: GenerationResult): Promise<void> {
  if (!result.success) {
    console.log(`\n  ⚠️  Skipping database save due to validation failure\n`);
    return;
  }

  console.log(`\n  💾 Saving to database...`);

  const dimension = getDimensionById(result.thinkingTypeId);
  const levelConfig = getLevelConfig(result.thinkingTypeId, result.level);

  if (!dimension || !levelConfig) {
    throw new Error('Invalid dimension or level configuration');
  }

  // Calculate estimated time (rough estimate based on content)
  const estimatedTime = calculateEstimatedTime(result.level);

  // Extract keywords from content
  const keywords = extractKeywords(
    result.conceptsContent!,
    result.modelsContent!
  );

  // Upsert theory content record (create or update if exists)
  await prisma.theoryContent.upsert({
    where: {
      thinkingTypeId_level_version: {
        thinkingTypeId: result.thinkingTypeId,
        level: result.level,
        version: '3.0.0',
      },
    },
    update: {
      title: `${dimension.name} - Level ${result.level}`,
      subtitle: levelConfig.levelTitle,
      description: dimension.description,
      learningObjectives: levelConfig.learningGoals,
      conceptsIntro: result.conceptsContent!.intro,
      conceptsContent: result.conceptsContent as any,
      modelsIntro: result.modelsContent!.intro,
      modelsContent: result.modelsContent as any,
      demonstrationsIntro: result.demonstrationsContent!.intro,
      demonstrationsContent: result.demonstrationsContent as any,
      estimatedTime,
      difficulty: levelConfig.difficulty,
      tags: [dimension.name, levelConfig.levelTitle],
      keywords,
      prerequisites: result.level > 1 ? [`${dimension.name} Level ${result.level - 1}`] : [],
      relatedTopics: [],
      qualityMetrics: result.qualityMetrics as any,
      validationStatus: result.success ? 'validated' : 'draft',
      validationErrors: result.errors && result.errors.length > 0 ? { errors: result.errors } : undefined,
      feedbackCount: 0,
      version: '3.0.0',
      isPublished: false,
      qualityScore: result.score,
      viewCount: 0,
    },
    create: {
      thinkingTypeId: result.thinkingTypeId,
      level: result.level,
      title: `${dimension.name} - Level ${result.level}`,
      subtitle: levelConfig.levelTitle,
      description: dimension.description,
      learningObjectives: levelConfig.learningGoals,
      conceptsIntro: result.conceptsContent!.intro,
      conceptsContent: result.conceptsContent as any,
      modelsIntro: result.modelsContent!.intro,
      modelsContent: result.modelsContent as any,
      demonstrationsIntro: result.demonstrationsContent!.intro,
      demonstrationsContent: result.demonstrationsContent as any,
      estimatedTime,
      difficulty: levelConfig.difficulty,
      tags: [dimension.name, levelConfig.levelTitle],
      keywords,
      prerequisites: result.level > 1 ? [`${dimension.name} Level ${result.level - 1}`] : [],
      relatedTopics: [],
      qualityMetrics: result.qualityMetrics as any,
      validationStatus: result.success ? 'validated' : 'draft',
      validationErrors: result.errors && result.errors.length > 0 ? { errors: result.errors } : undefined,
      feedbackCount: 0,
      version: '3.0.0',
      isPublished: false,
      qualityScore: result.score,
      viewCount: 0,
    },
  });

  console.log(`  ✅ Saved to database successfully\n`);
}

/**
 * Helper: Calculate estimated reading time (minutes)
 */
function calculateEstimatedTime(level: number): number {
  // Base time increases with level
  const baseTime = 15;
  const levelMultiplier = level * 5;
  return baseTime + levelMultiplier; // 20-35 minutes range
}

/**
 * Helper: Extract keywords from content
 */
function extractKeywords(
  conceptsContent: ConceptsContent,
  modelsContent: ModelsContent
): string[] {
  const keywords: string[] = [];

  // Extract from concept names
  conceptsContent.concepts.forEach((concept) => {
    keywords.push(concept.name);
  });

  // Extract from model names
  modelsContent.models.forEach((model) => {
    keywords.push(model.name);
  });

  return keywords.slice(0, 10); // Limit to 10 keywords
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();

  try {
    if (args.all) {
      // Generate all dimensions and levels
      console.log('\n🚀 Batch Generation Mode: Generating all 25 contents...\n');

      const allDimensions = getAllDimensionIds();
      let successCount = 0;
      let failCount = 0;

      for (const dimensionId of allDimensions) {
        for (let level = 1; level <= 5; level++) {
          try {
            const result = await generateTheoryContentV3(dimensionId, level, {
              validate: args.validate ?? true,
              retry: args.retry ?? true,
              maxRetries: args.maxRetries ?? 3,
            });

            await saveToDatabase(result);
            successCount++;

            // Pause every 5 contents for review
            if (successCount % 5 === 0) {
              console.log(`\n⏸️  Paused after ${successCount} contents. Press Enter to continue...`);
              // In production, you might want to add actual pause logic here
            }
          } catch (error) {
            console.error(`\n❌ Failed to generate ${dimensionId} Level ${level}:`, error);
            failCount++;
          }
        }
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Batch Generation Complete`);
      console.log(`   ✅ Success: ${successCount}/25`);
      console.log(`   ❌ Failed: ${failCount}/25`);
      console.log(`${'='.repeat(60)}\n`);
    } else if (args.dimension && args.level) {
      // Generate single dimension and level
      const result = await generateTheoryContentV3(args.dimension, args.level, {
        validate: args.validate ?? true,
        retry: args.retry ?? true,
        maxRetries: args.maxRetries ?? 3,
      });

      await saveToDatabase(result);

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ Generation Complete`);
      console.log(`   Score: ${result.score}/100`);
      console.log(`   Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`${'='.repeat(60)}\n`);
    } else {
      // Show usage
      console.log(`
Theory Content V3 Generator

Usage:
  npm run generate:theory-v3 -- --dimension <id> --level <1-5>
  npm run generate:theory-v3 -- --all

Options:
  --dimension <id>    Dimension ID (causal_analysis, premise_challenge, etc.)
  --level <1-5>       Level number (1-5)
  --all               Generate all 25 contents (5 dimensions × 5 levels)
  --validate          Enable validation (default: true)
  --no-validate       Disable validation
  --retry             Enable retry on failure (default: true)
  --no-retry          Disable retry
  --max-retries <n>   Maximum retry attempts (default: 3)

Examples:
  npm run generate:theory-v3 -- --dimension causal_analysis --level 1
  npm run generate:theory-v3 -- --all --validate --max-retries 5
      `);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run main function
main();
