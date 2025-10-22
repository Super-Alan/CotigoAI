/**
 * 理论内容验证器单元测试
 */

import { ContentValidator } from '../../../scripts/generate-theory-content-v2'

describe('ContentValidator', () => {
  describe('validateConceptsContent', () => {
    it('应该验证有效的概念内容', () => {
      const validContent = {
        title: '批判性思维基础概念',
        introduction: '这是一个详细的引言，介绍了批判性思维的基本概念和重要性。批判性思维是一种系统性的思维方式，它要求我们对信息进行深入分析和评估。',
        sections: [
          {
            heading: '核心概念1',
            content: '这是第一个核心概念的详细解释。批判性思维包括多个维度，每个维度都有其独特的特点和应用场景。我们需要深入理解这些概念，才能在实际生活中有效应用。这个概念涉及到多个方面的内容，需要我们从不同角度来理解和掌握。',
            keyPoints: ['要点1', '要点2', '要点3'],
            examples: ['示例1', '示例2']
          },
          {
            heading: '核心概念2',
            content: '这是第二个核心概念的详细解释。这个概念与第一个概念相互关联，共同构成了批判性思维的理论基础。我们需要理解它们之间的关系，以及如何在实践中综合运用这些概念。通过深入学习这些内容，我们可以提高自己的思维质量。',
            keyPoints: ['要点A', '要点B'],
            examples: ['示例A']
          }
        ],
        summary: '总结部分强调了批判性思维的重要性和应用价值，为后续学习奠定基础。',
        nextSteps: '下一步学习建议'
      }

      const result = ContentValidator.validateConceptsContent(validContent)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测标题过短的问题', () => {
      const invalidContent = {
        title: '短',
        introduction: '这是一个足够长的引言内容，满足最低字数要求。批判性思维是一种重要的思维方式，需要我们深入学习和掌握。',
        sections: [
          {
            heading: '概念1',
            content: '足够长的内容描述，包含了详细的解释和说明。这个概念很重要，需要我们认真理解和掌握。通过学习这个概念，我们可以提高自己的思维能力，更好地分析和解决问题。',
            keyPoints: ['要点1', '要点2'],
            examples: ['示例1']
          },
          {
            heading: '概念2',
            content: '另一个足够长的内容描述，提供了更多的细节和解释。这个概念与前面的概念相互关联，共同构成了完整的知识体系。我们需要综合理解这些概念，才能真正掌握批判性思维的精髓。',
            keyPoints: ['要点A', '要点B'],
            examples: ['示例A']
          }
        ],
        summary: '总结内容足够长，强调了学习的重要性和应用价值。'
      }

      const result = ContentValidator.validateConceptsContent(invalidContent)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('标题过短或缺失')
    })

    it('应该检测引言内容不足的问题', () => {
      const invalidContent = {
        title: '有效的标题内容',
        introduction: '太短',
        sections: [
          {
            heading: '概念1',
            content: '足够长的内容描述，包含了详细的解释和说明。这个概念很重要，需要我们认真理解和掌握。通过学习这个概念，我们可以提高自己的思维能力，更好地分析和解决问题。',
            keyPoints: ['要点1', '要点2'],
            examples: ['示例1']
          },
          {
            heading: '概念2',
            content: '另一个足够长的内容描述，提供了更多的细节和解释。这个概念与前面的概念相互关联，共同构成了完整的知识体系。我们需要综合理解这些概念，才能真正掌握批判性思维的精髓。',
            keyPoints: ['要点A', '要点B'],
            examples: ['示例A']
          }
        ],
        summary: '总结内容足够长，强调了学习的重要性和应用价值。'
      }

      const result = ContentValidator.validateConceptsContent(invalidContent)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('引言内容不足')
    })

    it('应该检测章节数量不足的问题', () => {
      const invalidContent = {
        title: '有效的标题内容',
        introduction: '这是一个足够长的引言内容，满足最低字数要求。批判性思维是一种重要的思维方式，需要我们深入学习和掌握。',
        sections: [
          {
            heading: '唯一概念',
            content: '足够长的内容描述，包含了详细的解释和说明。这个概念很重要，需要我们认真理解和掌握。通过学习这个概念，我们可以提高自己的思维能力，更好地分析和解决问题。',
            keyPoints: ['要点1', '要点2'],
            examples: ['示例1']
          }
        ],
        summary: '总结内容足够长，强调了学习的重要性和应用价值。'
      }

      const result = ContentValidator.validateConceptsContent(invalidContent)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('章节数量不足')
    })
  })

  describe('validateModelsContent', () => {
    it('应该验证有效的模型内容', () => {
      const validContent = {
        frameworkName: '批判性分析框架',
        frameworkType: '流程图',
        introduction: '这是一个实用的批判性分析框架，帮助学习者系统性地分析问题。该框架包含多个步骤，每个步骤都有明确的目标和方法。',
        steps: [
          {
            step: '步骤1：问题识别',
            description: '首先需要明确问题的核心所在。这个步骤要求我们仔细观察和分析现象，识别出真正需要解决的问题。我们需要区分表面现象和深层问题，避免被表象所迷惑。通过系统性的分析，我们可以更准确地定位问题的本质。',
            tips: '使用5W1H方法',
            commonMistakes: '过于关注表面现象'
          },
          {
            step: '步骤2：信息收集',
            description: '收集与问题相关的各种信息和数据。这个步骤需要我们保持开放的心态，从多个渠道获取信息。我们要注意信息的可靠性和相关性，避免被无关信息干扰。同时要保持批判性思维，对收集到的信息进行初步筛选和评估。',
            tips: '多渠道验证信息',
            commonMistakes: '信息来源单一'
          },
          {
            step: '步骤3：分析评估',
            description: '对收集到的信息进行深入分析和评估。这个步骤是整个框架的核心，需要运用各种分析方法和工具。我们要从不同角度审视问题，考虑各种可能的因素和影响。通过系统性的分析，我们可以得出更加客观和准确的结论。',
            tips: '运用多种分析工具',
            commonMistakes: '分析过于主观'
          }
        ],
        visualization: {
          type: 'flowchart',
          description: '使用流程图展示分析步骤的逻辑关系'
        },
        applicationExample: '以学生选择专业为例，展示如何使用该框架进行系统性分析。首先识别核心问题：如何选择最适合自己的专业。然后收集相关信息：个人兴趣、能力特长、就业前景、家庭期望等。最后进行综合分析，权衡各种因素，做出理性决策。这个过程体现了批判性思维的系统性和客观性。',
        whenToUse: '适用于复杂问题分析',
        relatedFrameworks: ['SWOT分析', '决策树']
      }

      const result = ContentValidator.validateModelsContent(validContent)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测框架名称过短的问题', () => {
      const invalidContent = {
        frameworkName: '短',
        frameworkType: '流程图',
        introduction: '这是一个足够长的框架介绍，说明了框架的用途和价值。该框架经过精心设计，能够帮助用户系统性地分析问题。',
        steps: [
          {
            step: '步骤1',
            description: '足够长的步骤描述，详细说明了该步骤的具体操作方法和注意事项。这个步骤是整个框架的基础，需要认真执行。',
            tips: '实用技巧',
            commonMistakes: '常见错误'
          },
          {
            step: '步骤2',
            description: '另一个足够长的步骤描述，提供了详细的指导和建议。这个步骤与前面的步骤相互关联，共同构成完整的分析流程。',
            tips: '技巧',
            commonMistakes: '错误'
          },
          {
            step: '步骤3',
            description: '第三个步骤的详细描述，包含了具体的操作方法和实施要点。通过这个步骤，用户可以完成整个分析过程。',
            tips: '技巧',
            commonMistakes: '错误'
          }
        ],
        applicationExample: '这是一个详细的应用示例，展示了如何在实际情况中使用该框架。示例包含了具体的场景描述和分析过程，帮助用户更好地理解和掌握框架的使用方法。通过学习这个示例，用户可以举一反三，在其他场景中灵活运用该框架。'
      }

      const result = ContentValidator.validateModelsContent(invalidContent)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('框架名称过短或缺失')
    })
  })

  describe('validateDemonstrationsContent', () => {
    it('应该验证有效的演示内容', () => {
      const validContent = {
        scenario: '小明在选择大学专业时面临困难。他对计算机科学和心理学都有兴趣，但不知道该如何选择。他的父母希望他学习计算机科学，认为就业前景更好，但小明担心自己不够擅长数学和编程。同时，他对人类行为和心理现象很感兴趣，觉得心理学更符合自己的兴趣。这个选择将影响他未来的职业发展和人生道路。',
        question: '小明应该如何做出这个重要决定？',
        goodAnalysis: {
          title: '系统性分析方法',
          content: '优秀的分析应该从多个维度考虑这个问题。首先，小明需要深入了解自己的兴趣、能力和价值观。他可以通过职业测评、实习体验等方式更好地认识自己。其次，他需要客观了解两个专业的具体内容、学习要求和就业前景。不能仅凭表面印象做判断，而要通过实地调研、与专业人士交流等方式获取准确信息。第三，他需要考虑长远发展，不仅看当前的就业市场，还要考虑未来的发展趋势。最后，他需要平衡个人兴趣和现实因素，找到最适合自己的选择。这种系统性的分析方法体现了批判性思维的全面性和客观性。',
          strengths: ['多维度分析', '注重实证调研', '考虑长远发展'],
          appliedConcepts: ['系统性思维', '证据导向决策']
        },
        poorAnalysis: {
          title: '简单化处理',
          content: '错误的分析往往过于简单化。比如，仅仅因为父母的建议就选择计算机科学，或者仅仅因为个人兴趣就选择心理学。这种分析忽略了问题的复杂性，没有进行深入的思考和调研。另一种错误是过度依赖他人意见，没有形成自己的独立判断。还有一种错误是只考虑短期因素，忽略了长远发展的需要。',
          problems: ['分析过于简单', '缺乏独立思考', '忽略长远规划'],
          missedPoints: ['个人能力评估', '行业发展趋势']
        },
        expertCommentary: '两种分析方法的主要差异在于思维的系统性和深度。优秀的分析体现了批判性思维的核心特征：全面性、客观性和逻辑性。它不仅考虑了多个维度的因素，还注重实证调研和长远规划。而错误的分析则表现出思维的局限性，缺乏深度和广度。这个对比告诉我们，面对重要决策时，我们需要运用系统性的思维方法，避免简单化和主观化的错误。',
        keyLessons: [
          '重要决策需要系统性分析，不能简单化处理',
          '要平衡个人兴趣和现实因素，做出理性选择',
          '实证调研比主观判断更可靠'
        ],
        reflectionQuestions: [
          '你在做重要决定时通常采用什么方法？',
          '如何平衡个人兴趣和外部期望？'
        ]
      }

      const result = ContentValidator.validateDemonstrationsContent(validContent)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测情境描述不足的问题', () => {
      const invalidContent = {
        scenario: '太短的情境描述',
        question: '问题',
        goodAnalysis: {
          title: '优秀分析',
          content: '这是一个足够长的优秀分析示例，详细展示了正确的思维方法和分析过程。分析包含了多个层面的考虑，体现了批判性思维的特点。通过这个分析，我们可以看到系统性思维的重要性和价值。',
          strengths: ['优点1', '优点2'],
          appliedConcepts: ['概念1']
        },
        poorAnalysis: {
          title: '错误分析',
          content: '这是错误分析的示例，展示了常见的思维误区和问题。这种分析方法存在明显的缺陷，需要我们引以为戒。',
          problems: ['问题1', '问题2'],
          missedPoints: ['遗漏点1']
        },
        expertCommentary: '专家点评内容足够长，对比分析了两种方法的差异，指出了关键的学习要点。这个点评帮助学习者更好地理解批判性思维的要求和标准。',
        keyLessons: ['启示1', '启示2'],
        reflectionQuestions: ['问题1', '问题2']
      }

      const result = ContentValidator.validateDemonstrationsContent(invalidContent)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('情境描述不足')
    })
  })

  describe('validateContent', () => {
    it('应该根据内容类型调用相应的验证方法', () => {
      const conceptsContent = {
        title: '测试标题内容',
        introduction: '这是一个足够长的引言内容，满足验证要求。批判性思维是重要的思维技能，需要系统性学习和实践。',
        sections: [
          {
            heading: '概念1',
            content: '足够长的内容描述，包含详细解释。这个概念很重要，需要深入理解和掌握。通过学习可以提高思维能力。',
            keyPoints: ['要点1', '要点2'],
            examples: ['示例1']
          },
          {
            heading: '概念2',
            content: '另一个详细的内容描述，提供更多信息。这个概念与其他概念相关联，构成完整体系。',
            keyPoints: ['要点A', '要点B'],
            examples: ['示例A']
          }
        ],
        summary: '总结内容强调了学习的重要性和应用价值。'
      }

      const result = ContentValidator.validateContent('concepts', conceptsContent)
      expect(result.isValid).toBe(true)
    })

    it('应该处理未知内容类型', () => {
      const result = ContentValidator.validateContent('unknown', {})
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('未知内容类型')
    })
  })
})