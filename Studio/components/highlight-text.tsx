import { DetailedHTMLProps, HTMLAttributes } from "react";

type THighlightTextProps = DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> & {
  text: string;
  highlightText: string;
};

export default function HighlightText({
  text,
  highlightText,
  ...props
}: THighlightTextProps) {
  if (!highlightText.trim()) return <span {...props}>{text}</span>;

  const regex = new RegExp(`(${highlightText})`, "gi");
  const parts = text.split(regex);

  return (
    <span {...props}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}
