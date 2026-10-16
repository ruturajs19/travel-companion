import React, { Fragment } from 'react';

export function Markdown({ content }: { content: string }): React.ReactElement {
  const blocks = content.replace(/\r\n/g, '\n').split('/\n{2,}/');

  return (
    <div className="flex flex-col gap-4 leading-relaxed">
      {blocks.map((block, i) => (
        <Block key={i} text={block.trim()} />
      ))}
    </div>
  );
}

function Block({ text }: { text: string }): React.ReactElement | null {
  if (!text) return null;

  const heading = /^(#{1,3})\s+(.*)$/.exec(text);

  if (heading) {
    const level = (heading[1] ?? '#').length;
    const inner = <Inline text={heading[2] ?? ''} />;
    if (level === 1)
      return <h2 className="text-2xl font-bold tracking-tight">{inner}</h2>;
    if (level === 2) return <h3 className="text-xl font-semibold">{inner}</h3>;
    return <h4 className="text-lg font-semibold">{inner}</h4>;
  }

  const lines = text.split('\n');
  if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
    return (
      <ul className="list-disc pl-6">
        {lines.map((line, i) => (
          <li key={i} className="leading-relaxed">
            <Inline text={line.replace(/^\s*[-*]\s+/, '')} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p>
      <Inline text={lines.join(' ')} />
    </p>
  );
}

function Inline({ text }: { text: string }): React.ReactElement {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const pattern =
    /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))/;

  while (remaining.length > 0) {
    const match = pattern.exec(remaining);
    if (!match) {
      nodes.push(<Fragment key={key++}>{remaining}</Fragment>);
      break;
    }
    if (match.index > 0) {
      nodes.push(
        <Fragment key={key++}>{remaining.slice(0, match.index)}</Fragment>,
      );
    }
    if (match[1]) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
      nodes.push(
        <code key={key++} className="bg-muted rounded px-1 py-0.5 text-sm">
          {match[6]}
        </code>,
      );
    } else if (match[7]) {
      nodes.push(
        <a
          key={key++}
          href={match[9] ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {match[8]}
        </a>,
      );
    }
    remaining = remaining.slice(match.index + match[0].length);
  }

  return <>{nodes}</>;
}
