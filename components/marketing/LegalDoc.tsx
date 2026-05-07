import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LegalDocProps {
  /** Page title (rendered above the markdown content) */
  title: string;
  /** Raw markdown content */
  content: string;
}

/**
 * Renders a legal document (Privacy Policy, Terms, etc.) as a styled page
 * that matches the marketing site's look.
 *
 * Usage: read the markdown file in a server component (with fs.readFile)
 * and pass the content here.
 */
export function LegalDoc({ title, content }: LegalDocProps) {
  return (
    <div className="bg-white">
      {/* Hero band — matches marketing pages */}
      <div className="border-b border-[#1d3557]/[0.06] bg-gradient-to-b from-[#F9FAFB] to-white">
        <div className="mx-auto max-w-[800px] px-6 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1d3557] tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Document body */}
      <article className="mx-auto max-w-[800px] px-6 py-12 md:py-16">
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#1d3557]
            prose-h1:hidden
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-[#1d3557]/80
            prose-li:text-[15px] prose-li:leading-relaxed prose-li:text-[#1d3557]/80
            prose-strong:text-[#1d3557] prose-strong:font-semibold
            prose-a:text-[#457b9d] prose-a:font-medium hover:prose-a:text-[#3a6781] prose-a:no-underline hover:prose-a:underline
            prose-table:text-[14px] prose-table:border prose-table:border-[#1d3557]/[0.08] prose-table:rounded-xl prose-table:overflow-hidden
            prose-th:bg-[#F9FAFB] prose-th:text-[#1d3557] prose-th:font-semibold prose-th:px-4 prose-th:py-3 prose-th:text-left
            prose-td:px-4 prose-td:py-3 prose-td:text-[#1d3557]/80 prose-td:border-t prose-td:border-[#1d3557]/[0.04]
            prose-blockquote:border-l-4 prose-blockquote:border-[#457b9d] prose-blockquote:bg-[#457b9d]/[0.04] prose-blockquote:rounded-r-xl prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-[#1d3557]/80
            prose-hr:border-[#1d3557]/[0.06] prose-hr:my-12
            prose-code:bg-[#F9FAFB] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-mono prose-code:text-[#1d3557] prose-code:before:content-none prose-code:after:content-none"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
