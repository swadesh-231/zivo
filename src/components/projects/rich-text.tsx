import { Fragment } from "react";

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;
const BULLET = /^\s*[-*]\s+/;

type Block =
  | { kind: "text"; lines: string[] }
  | { kind: "list"; items: string[] };

function renderInline(text: string) {
  return text.split(TOKEN).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** Groups consecutive bullet lines so a list renders as a list, not as literal dashes. */
function toBlocks(source: string): Block[] {
  const blocks: Block[] = [];

  for (const line of source.split("\n")) {
    const last = blocks.at(-1);

    if (BULLET.test(line)) {
      const item = line.replace(BULLET, "");

      if (last?.kind === "list") {
        last.items.push(item);
      } else {
        blocks.push({ kind: "list", items: [item] });
      }

      continue;
    }

    if (last?.kind === "text") {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "text", lines: [line] });
    }
  }

  return blocks;
}

/**
 * Renders the small slice of markdown the response agent is asked for:
 * `**bold**`, `` `code` ``, line breaks, and simple bullet lists.
 */
export function RichText({ children }: { children: string }) {
  return toBlocks(children).map((block, blockIndex) => {
    if (block.kind === "list") {
      return (
        <ul
          key={blockIndex}
          className="my-1 list-disc space-y-0.5 pl-5 marker:text-current/50"
        >
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <Fragment key={blockIndex}>
        {block.lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 ? <br /> : null}
            {renderInline(line)}
          </Fragment>
        ))}
      </Fragment>
    );
  });
}
