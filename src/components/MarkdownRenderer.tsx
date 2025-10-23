'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-renderer prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <style jsx global>{`
        /* CSS Counter for ordered lists */
        .markdown-renderer ol {
          counter-reset: list-counter;
          list-style: none;
        }
        .markdown-renderer ol > li {
          counter-increment: list-counter;
        }
        .markdown-renderer ol > li .number-marker::before {
          content: counter(list-counter);
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings - Apple style with proper spacing
        h1: ({ children }) => (
          <h1 className="text-[28px] font-semibold mb-4 mt-8 text-gray-900 dark:text-gray-100 tracking-tight">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-[22px] font-semibold mb-4 mt-8 pt-2 text-gray-900 dark:text-gray-100 tracking-tight border-t border-gray-100 dark:border-gray-800">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-[18px] font-semibold mb-3 mt-6 text-gray-800 dark:text-gray-200 tracking-tight">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-[16px] font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-200">
            {children}
          </h4>
        ),

        // Paragraphs - Apple style with optimal line height
        p: ({ children }) => (
          <p className="mb-5 leading-[1.7] text-[15px] text-gray-700 dark:text-gray-300">
            {children}
          </p>
        ),

        // Lists - Apple-inspired clean design
        ul: ({ children }) => (
          <ul className="mb-6 space-y-3 text-gray-800 dark:text-gray-200">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-6 space-y-5 text-gray-800 dark:text-gray-200">
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => {
          return (
            <li className="relative pl-10 leading-[1.7] text-[15px]">
              {/* Apple-style number marker with gradient */}
              <span className="number-marker absolute left-0 top-[2px] flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm">
                {/* Number injected via CSS counter */}
              </span>
              <span className="block">
                {children}
              </span>
            </li>
          );
        },

        // Emphasis - Apple style
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900 dark:text-gray-100">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-800 dark:text-gray-200">
            {children}
          </em>
        ),

        // Code - Apple style with subtle colors
        code: ({ node, ...props }) => {
          const isInline = !props.className;
          return isInline ? (
            <code className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[14px] font-mono text-blue-600 dark:text-blue-400 font-medium" {...props} />
          ) : (
            <code className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-[14px] font-mono overflow-x-auto mb-5 border border-gray-200 dark:border-gray-800" {...props} />
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
