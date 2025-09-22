import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";

import { CodeDuetWrite } from "./CodeDuetWrite";
import { CodeDuetRename } from "./CodeDuetRename";
import { CodeDuetDelete } from "./CodeDuetDelete";
import { CodeDuetAddDependency } from "./CodeDuetAddDependency";
import { CodeDuetExecuteSql } from "./CodeDuetExecuteSql";
import { CodeDuetAddIntegration } from "./CodeDuetAddIntegration";
import { CodeDuetEdit } from "./CodeDuetEdit";
import { CodeDuetCodebaseContext } from "./CodeDuetCodebaseContext";
import { CodeDuetThink } from "./CodeDuetThink";
import { CodeHighlight } from "./CodeHighlight";
import { useAtomValue } from "jotai";
import { isStreamingAtom } from "@/atoms/chatAtoms";
import { CustomTagState } from "./stateTypes";
import { CodeDuetOutput } from "./CodeDuetOutput";
import { CodeDuetProblemSummary } from "./CodeDuetProblemSummary";
import { IpcClient } from "@/ipc/ipc_client";

interface CodeDuetMarkdownParserProps {
  content: string;
}

type CustomTagInfo = {
  tag: string;
  attributes: Record<string, string>;
  content: string;
  fullMatch: string;
  inProgress?: boolean;
};

type ContentPiece =
  | { type: "markdown"; content: string }
  | { type: "custom-tag"; tagInfo: CustomTagInfo };

const customLink = ({
  node: _node,
  ...props
}: {
  node?: any;
  [key: string]: any;
}) => (
  <a
    {...props}
    onClick={(e) => {
      const url = props.href;
      if (url) {
        e.preventDefault();
        IpcClient.getInstance().openExternalUrl(url);
      }
    }}
  />
);

export const VanillaMarkdownParser = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        code: CodeHighlight,
        a: customLink,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

/**
 * Custom component to parse markdown content with CodeDuet-specific tags
 */
export const CodeDuetMarkdownParser: React.FC<CodeDuetMarkdownParserProps> = ({
  content,
}) => {
  const isStreaming = useAtomValue(isStreamingAtom);
  // Extract content pieces (markdown and custom tags)
  const contentPieces = useMemo(() => {
    return parseCustomTags(content);
  }, [content]);

  return (
    <>
      {contentPieces.map((piece, index) => (
        <React.Fragment key={index}>
          {piece.type === "markdown"
            ? piece.content && (
                <ReactMarkdown
                  components={{
                    code: CodeHighlight,
                    a: customLink,
                  }}
                >
                  {piece.content}
                </ReactMarkdown>
              )
            : renderCustomTag(piece.tagInfo, { isStreaming })}
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Pre-process content to handle unclosed custom tags
 * Adds closing tags at the end of the content for any unclosed custom tags
 * Assumes the opening tags are complete and valid
 * Returns the processed content and a map of in-progress tags
 */
function preprocessUnclosedTags(content: string): {
  processedContent: string;
  inProgressTags: Map<string, Set<number>>;
} {
  const customTagNames = [
    "codeduet-write",
    "codeduet-rename",
    "codeduet-delete",
    "codeduet-add-dependency",
    "codeduet-execute-sql",
    "codeduet-add-integration",
    "codeduet-output",
    "codeduet-problem-report",
    "codeduet-chat-summary",
    "codeduet-edit",
    "codeduet-codebase-context",
    "think",
    "codeduet-command",
  ];

  let processedContent = content;
  // Map to track which tags are in progress and their positions
  const inProgressTags = new Map<string, Set<number>>();

  // For each tag type, check if there are unclosed tags
  for (const tagName of customTagNames) {
    // Count opening and closing tags
    const openTagPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, "g");
    const closeTagPattern = new RegExp(`</${tagName}>`, "g");

    // Track the positions of opening tags
    const openingMatches: RegExpExecArray[] = [];
    let match;

    // Reset regex lastIndex to start from the beginning
    openTagPattern.lastIndex = 0;

    while ((match = openTagPattern.exec(processedContent)) !== null) {
      openingMatches.push({ ...match });
    }

    const openCount = openingMatches.length;
    const closeCount = (processedContent.match(closeTagPattern) || []).length;

    // If we have more opening than closing tags
    const missingCloseTags = openCount - closeCount;
    if (missingCloseTags > 0) {
      // Add the required number of closing tags at the end
      processedContent += Array(missingCloseTags)
        .fill(`</${tagName}>`)
        .join("");

      // Mark the last N tags as in progress where N is the number of missing closing tags
      const inProgressIndexes = new Set<number>();
      const startIndex = openCount - missingCloseTags;
      for (let i = startIndex; i < openCount; i++) {
        inProgressIndexes.add(openingMatches[i].index);
      }
      inProgressTags.set(tagName, inProgressIndexes);
    }
  }

  return { processedContent, inProgressTags };
}

/**
 * Parse the content to extract custom tags and markdown sections into a unified array
 */
function parseCustomTags(content: string): ContentPiece[] {
  const { processedContent, inProgressTags } = preprocessUnclosedTags(content);

  const customTagNames = [
    "codeduet-write",
    "codeduet-rename",
    "codeduet-delete",
    "codeduet-add-dependency",
    "codeduet-execute-sql",
    "codeduet-add-integration",
    "codeduet-output",
    "codeduet-problem-report",
    "codeduet-chat-summary",
    "codeduet-edit",
    "codeduet-codebase-context",
    "think",
    "codeduet-command",
  ];

  const tagPattern = new RegExp(
    `<(${customTagNames.join("|")})\\s*([^>]*)>(.*?)<\\/\\1>`,
    "gs",
  );

  const contentPieces: ContentPiece[] = [];
  let lastIndex = 0;
  let match;

  // Find all custom tags
  while ((match = tagPattern.exec(processedContent)) !== null) {
    const [fullMatch, tag, attributesStr, tagContent] = match;
    const startIndex = match.index;

    // Add the markdown content before this tag
    if (startIndex > lastIndex) {
      contentPieces.push({
        type: "markdown",
        content: processedContent.substring(lastIndex, startIndex),
      });
    }

    // Parse attributes
    const attributes: Record<string, string> = {};
    const attrPattern = /(\w+)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrPattern.exec(attributesStr)) !== null) {
      attributes[attrMatch[1]] = attrMatch[2];
    }

    // Check if this tag was marked as in progress
    const tagInProgressSet = inProgressTags.get(tag);
    const isInProgress = tagInProgressSet?.has(startIndex);

    // Add the tag info
    contentPieces.push({
      type: "custom-tag",
      tagInfo: {
        tag,
        attributes,
        content: tagContent,
        fullMatch,
        inProgress: isInProgress || false,
      },
    });

    lastIndex = startIndex + fullMatch.length;
  }

  // Add the remaining markdown content
  if (lastIndex < processedContent.length) {
    contentPieces.push({
      type: "markdown",
      content: processedContent.substring(lastIndex),
    });
  }

  return contentPieces;
}

function getState({
  isStreaming,
  inProgress,
}: {
  isStreaming?: boolean;
  inProgress?: boolean;
}): CustomTagState {
  if (!inProgress) {
    return "finished";
  }
  return isStreaming ? "pending" : "aborted";
}

/**
 * Render a custom tag based on its type
 */
function renderCustomTag(
  tagInfo: CustomTagInfo,
  { isStreaming }: { isStreaming: boolean },
): React.ReactNode {
  const { tag, attributes, content, inProgress } = tagInfo;

  switch (tag) {
    case "think":
      return (
        <CodeDuetThink
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </CodeDuetThink>
      );
    case "codeduet-write":
      return (
        <CodeDuetWrite
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </CodeDuetWrite>
      );

    case "codeduet-rename":
      return (
        <CodeDuetRename
          node={{
            properties: {
              from: attributes.from || "",
              to: attributes.to || "",
            },
          }}
        >
          {content}
        </CodeDuetRename>
      );

    case "codeduet-delete":
      return (
        <CodeDuetDelete
          node={{
            properties: {
              path: attributes.path || "",
            },
          }}
        >
          {content}
        </CodeDuetDelete>
      );

    case "codeduet-add-dependency":
      return (
        <CodeDuetAddDependency
          node={{
            properties: {
              packages: attributes.packages || "",
            },
          }}
        >
          {content}
        </CodeDuetAddDependency>
      );

    case "codeduet-execute-sql":
      return (
        <CodeDuetExecuteSql
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
              description: attributes.description || "",
            },
          }}
        >
          {content}
        </CodeDuetExecuteSql>
      );

    case "codeduet-add-integration":
      return (
        <CodeDuetAddIntegration
          node={{
            properties: {
              provider: attributes.provider || "",
            },
          }}
        >
          {content}
        </CodeDuetAddIntegration>
      );

    case "codeduet-edit":
      return (
        <CodeDuetEdit
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </CodeDuetEdit>
      );

    case "codeduet-codebase-context":
      return (
        <CodeDuetCodebaseContext
          node={{
            properties: {
              files: attributes.files || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </CodeDuetCodebaseContext>
      );

    case "codeduet-output":
      return (
        <CodeDuetOutput
          type={attributes.type as "warning" | "error"}
          message={attributes.message}
        >
          {content}
        </CodeDuetOutput>
      );

    case "codeduet-problem-report":
      return (
        <CodeDuetProblemSummary summary={attributes.summary}>
          {content}
        </CodeDuetProblemSummary>
      );

    case "codeduet-chat-summary":
      // Don't render anything for codeduet-chat-summary
      return null;

    case "codeduet-command":
      // Don't render anything for codeduet-command
      return null;

    default:
      return null;
  }
}
