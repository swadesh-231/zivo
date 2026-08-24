import { Fragment } from "react";

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

export function RichText({ children }: { children: string }) {
  const lines = children.split("\n");

  return lines.map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {lineIndex > 0 ? <br /> : null}
      {line.split(TOKEN).map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIndex} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={partIndex}
              className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        return <Fragment key={partIndex}>{part}</Fragment>;
      })}
    </Fragment>
  ));
}
