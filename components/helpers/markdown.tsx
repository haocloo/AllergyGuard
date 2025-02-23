import React from "react";
import markdownit from "markdown-it";
import DOMPurify from "isomorphic-dompurify";

import { cn } from "@/lib/cn";

type Props = {
  text: string;
  className?: string;
};

const md = markdownit({});

const Markdown = ({ text, className }: Props) => {
  if (!text) return null;
  const htmlcontent = md.render(text);
  const sanitized = DOMPurify.sanitize(htmlcontent);
  return <div className={cn("prose prose-slate text-pretty dark:prose-invert max-w-none", className)} dangerouslySetInnerHTML={{ __html: sanitized }}></div>;
};

export default Markdown;
