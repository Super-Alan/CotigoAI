import React from 'react';
import Markdown from 'react-native-markdown-display';
import { StyleSheet } from 'react-native';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Markdown style={markdownStyles}>
      {content}
    </Markdown>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  heading1: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    color: '#334155',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  strong: {
    fontWeight: '600',
    color: '#0EA5E9',
  },
  em: {
    fontStyle: 'italic',
    color: '#64748B',
  },
  link: {
    color: '#0EA5E9',
    textDecorationLine: 'underline',
  },
  list_item: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    color: '#0EA5E9',
    fontFamily: 'Menlo, Monaco, monospace',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
    color: '#0C4A6E',
    fontFamily: 'Menlo, Monaco, monospace',
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
    marginBottom: 12,
  },
  fence: {
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
    color: '#0C4A6E',
    fontFamily: 'Menlo, Monaco, monospace',
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
    marginBottom: 12,
  },
  blockquote: {
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
});
