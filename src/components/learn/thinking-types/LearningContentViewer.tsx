'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Clock, BookOpen, FileText, Lightbulb, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningContent {
  id: string;
  contentType: 'concepts' | 'frameworks' | 'examples' | 'practice_guide';
  title: string;
  description: string;
  content: {
    markdown: string;
    sections?: Array<{
      type: string;
      title: string;
      content: string;
    }>;
  };
  estimatedTime: number;
  tags: string[];
}

interface LearningContentViewerProps {
  thinkingTypeId: string;
  level: number;
  contents: LearningContent[];
  onProgressUpdate?: (contentId: string, completed: boolean) => void;
}

const CONTENT_TYPE_CONFIG = {
  concepts: {
    label: '概念讲解',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  frameworks: {
    label: '分析框架',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  examples: {
    label: '典型案例',
    icon: Lightbulb,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  practice_guide: {
    label: '实践指南',
    icon: CheckSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

export default function LearningContentViewer({
  thinkingTypeId,
  level,
  contents,
  onProgressUpdate,
}: LearningContentViewerProps) {
  const [activeTab, setActiveTab] = useState<string>('concepts');
  const [completedContents, setCompletedContents] = useState<Set<string>>(new Set());

  const handleMarkAsComplete = (contentId: string) => {
    const newCompleted = new Set(completedContents);
    const isCompleted = !newCompleted.has(contentId);

    if (isCompleted) {
      newCompleted.add(contentId);
    } else {
      newCompleted.delete(contentId);
    }

    setCompletedContents(newCompleted);
    onProgressUpdate?.(contentId, isCompleted);
  };

  const groupedContents = contents.reduce((acc, content) => {
    if (!acc[content.contentType]) {
      acc[content.contentType] = [];
    }
    acc[content.contentType].push(content);
    return acc;
  }, {} as Record<string, LearningContent[]>);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(CONTENT_TYPE_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const count = groupedContents[type]?.length || 0;

            return (
              <TabsTrigger
                key={type}
                value={type}
                disabled={count === 0}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{config.label}</span>
                {count > 0 && (
                  <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(CONTENT_TYPE_CONFIG).map(([type, config]) => {
          const typeContents = groupedContents[type] || [];

          return (
            <TabsContent key={type} value={type} className="mt-6">
              {typeContents.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">暂无{config.label}内容</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {typeContents.map((content) => {
                    const isCompleted = completedContents.has(content.id);

                    return (
                      <Card key={content.id} className="overflow-hidden">
                        {/* Header */}
                        <div className={cn('p-4 border-b', config.bgColor)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">
                                {content.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {content.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{content.estimatedTime} 分钟</span>
                                </div>
                                {content.tags && content.tags.length > 0 && (
                                  <div className="flex gap-2">
                                    {content.tags.slice(0, 3).map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-white rounded-full text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleMarkAsComplete(content.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                isCompleted
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              )}
                            >
                              {isCompleted ? '✓ 已完成' : '标记完成'}
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xl font-semibold mb-3 mt-5">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-lg font-medium mb-2 mt-4">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-4 leading-7 text-gray-700">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-6 mb-4 space-y-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal pl-6 mb-4 space-y-2">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-gray-700">{children}</li>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto mb-4">
                                    <table className="min-w-full divide-y divide-gray-200 border">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({ children }) => (
                                  <th className="px-4 py-2 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-4 py-2 text-sm text-gray-700 border-b">
                                    {children}
                                  </td>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic">
                                    {children}
                                  </blockquote>
                                ),
                                code: ({ className, children }) => {
                                  const isBlock = className?.includes('language-');
                                  if (isBlock) {
                                    return (
                                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                                        <code className="text-sm">{children}</code>
                                      </pre>
                                    );
                                  }
                                  return (
                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {content.content.markdown}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
