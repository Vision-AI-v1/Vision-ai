"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type MarkdownRendererProps = {
  content: string;
};

export default function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <div className="vision-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-7 mb-4 text-3xl font-semibold tracking-tight text-white">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mt-6 mb-3 text-2xl font-semibold tracking-tight text-white">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mt-5 mb-2 text-xl font-semibold text-white">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mt-4 mb-2 text-lg font-semibold text-white">
              {children}
            </h4>
          ),

          p: ({ children }) => (
            <p className="mb-4 text-[17px] leading-8 text-white/90">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic text-white/95">
              {children}
            </em>
          ),

          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc space-y-2 text-[17px] leading-8 text-white/90">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2 text-[17px] leading-8 text-white/90">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1">
              {children}
            </li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-4 border-white/30 pl-5 italic text-white/70">
              {children}
            </blockquote>
          ),

          hr: () => (
            <hr className="my-7 border-white/10" />
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline decoration-blue-400/40 underline-offset-4 transition hover:text-blue-300"
            >
              {children}
            </a>
          ),

          code: ({
            className,
            children,
            ...props
          }) => {
            const match = /language-(\w+)/.exec(
              className || ""
            );

            const code = String(children).replace(/\n$/, "");

            /*
             * Inline code
             */
            if (!match) {
              return (
                <code
                  className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.9em] text-white"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            /*
             * Code block
             */
            return (
              <div className="group relative my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#171717]">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {match[1]}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                    }}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    Copy
                  </button>
                </div>

                <pre className="overflow-x-auto p-5">
                  <code
                    className="font-mono text-[14px] leading-7 text-white/90"
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          pre: ({ children }) => (
            <>{children}</>
          ),

          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-left text-[16px]">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-white/[0.06]">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/10">
              {children}
            </tbody>
          ),

          tr: ({ children }) => (
            <tr className="transition hover:bg-white/[0.03]">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="border-r border-white/10 px-4 py-3 font-semibold text-white">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-r border-white/10 px-4 py-3 text-white/80">
              {children}
            </td>
          ),

          del: ({ children }) => (
            <del className="text-white/50">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}