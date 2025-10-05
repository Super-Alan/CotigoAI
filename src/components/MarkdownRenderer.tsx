'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-gray-100">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-200">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold mb-2 mt-3 text-gray-800 dark:text-gray-200">
            {children}
          </h4>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {children}
          </p>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="ml-4">
            {children}
          </li>
        ),

        // Emphasis
        strong: ({ children }) => (
          <strong className="font-bold text-gray-900 dark:text-gray-100">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-800 dark:text-gray-200">
            {children}
          </em>
        ),

        // Code
        code: ({ node, ...props }) => {
          const isInline = !props.className;
          return isInline ? (
            <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-pink-600 dark:text-pink-400" {...props} />
          ) : (
            <code className="block p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono overflow-x-auto mb-4" {...props} />
          );
        },

        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20">
            {children}
          </blockquote>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {children}
          </a>
        ),

        // Horizontal Rule
        hr: () => (
          <hr className="my-6 border-gray-300 dark:border-gray-700" />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
