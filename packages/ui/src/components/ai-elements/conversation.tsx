"use client";

import { Button } from "@crm/ui/components/button";
import { useMessages } from "@crm/ui/components/locale-provider";
import type { Messages } from "@crm/ui/lib/messages";
import { cn } from "@crm/ui/lib/utils";
import type { UIMessage } from "ai";
import { ArrowDownIcon, DownloadIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn(
      "flex flex-col gap-8 p-4 [&>*]:[contain-intrinsic-size:auto_10rem] [&>*]:[content-visibility:auto]",
      className
    )}
    {...props}
  />
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title,
  description,
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => {
  const msg = useMessages();

  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div className="space-y-1">
            <h3 className="font-medium text-sm">
              {title ?? msg.macDinh.chuaCoTin}
            </h3>
            <p className="text-muted-foreground text-sm">
              {description ?? msg.macDinh.batDauTroChuyen}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-md dark:bg-background dark:hover:bg-muted",
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};

const getMessageText = (message: UIMessage): string =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

export type ConversationDownloadProps = Omit<
  ComponentProps<typeof Button>,
  "onClick"
> & {
  messages: UIMessage[];
  filename?: string;
  formatMessage?: (message: UIMessage, index: number) => string;
};

const nhanVai = (message: UIMessage, msg: Messages): string =>
  message.role === "user" ? msg.chatMessage.roleUser : msg.chatMessage.roleAssistant;

const defaultFormatMessage =
  (msg: Messages) =>
  (message: UIMessage): string =>
    `**${nhanVai(message, msg)}:** ${getMessageText(message)}`;

export const messagesToMarkdown = (
  messages: UIMessage[],
  msg: Messages,
  formatMessage?: (message: UIMessage, index: number) => string
): string => {
  const dinhDang = formatMessage ?? defaultFormatMessage(msg);
  return messages.map((m, i) => dinhDang(m, i)).join("\n\n");
};

export const ConversationDownload = ({
  messages,
  filename = "conversation.md",
  formatMessage,
  className,
  children,
  ...props
}: ConversationDownloadProps) => {
  const msg = useMessages();
  const handleDownload = useCallback(() => {
    const markdown = messagesToMarkdown(messages, msg, formatMessage);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [messages, filename, formatMessage, msg]);

  return (
    <Button
      className={cn(
        "absolute top-4 right-4 rounded-md dark:bg-background dark:hover:bg-muted",
        className
      )}
      onClick={handleDownload}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      {children ?? <DownloadIcon className="size-4" />}
    </Button>
  );
};
