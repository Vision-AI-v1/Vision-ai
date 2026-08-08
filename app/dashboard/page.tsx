"use client";

import { supabase } from "@/lib/supabase-client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import {
  Archive,
  Check,
  ChevronDown,
  Copy,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  feedback?: "up" | "down" | null;
};

type Chat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  archived?: boolean;
};

const STORAGE_KEY = "vision-ai-chats-v2";

const initialMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey 👋\n\nI'm Vision AI. What are we working on?",
  createdAt: Date.now(),
};

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function createChat(): Chat {
  const now = Date.now();

  return {
    id: createId(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        ...initialMessage,
        id: createId(),
        createdAt: now,
      },
    ],
  };
}

function getTitleFromMessage(text: string) {
  const clean = text
    .replace(/\s+/g, " ")
    .replace(/^#+\s*/, "")
    .trim();

  if (!clean) {
    return "New chat";
  }

  return clean.length > 42
    ? `${clean.slice(0, 42)}…`
    : clean;
}

function formatChatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return "";
  }

  const yesterday = new Date(now);

  yesterday.setDate(
    now.getDate() - 1
  );

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}

export default function Dashboard() {
  const [chats, setChats] = useState<Chat[]>(
    []
  );

  const [activeChatId, setActiveChatId] =
    useState("");

  const [input, setInput] = useState("");

  const [isStreaming, setIsStreaming] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [menuChatId, setMenuChatId] =
    useState<string | null>(null);

  const [renameChatId, setRenameChatId] =
    useState<string | null>(null);

  const [renameValue, setRenameValue] =
    useState("");

  const [deleteChatId, setDeleteChatId] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<string | null>(null);

  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const abortRef =
    useRef<AbortController | null>(null);

  /*
   * LOAD CHATS
   */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          setChats(parsed);

          const firstNonArchived =
            parsed.find(
              (chat: Chat) =>
                !chat.archived
            );

          setActiveChatId(
            firstNonArchived?.id ||
              parsed[0]?.id ||
              ""
          );

          return;
        }
      }
    } catch (error) {
      console.error(
        "Could not load chats:",
        error
      );
    }

    const firstChat = createChat();

    setChats([firstChat]);
    setActiveChatId(firstChat.id);
  }, []);

  /*
   * SAVE CHATS
   */

  useEffect(() => {
    if (chats.length === 0) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats)
      );
    } catch (error) {
      console.error(
        "Could not save chats:",
        error
      );
    }
  }, [chats]);

  /*
   * TOAST
   */

  const showToast = useCallback(
    (message: string) => {
      setToast(message);

      window.setTimeout(() => {
        setToast(null);
      }, 2200);
    },
    []
  );

  /*
   * ACTIVE CHAT
   */

  const activeChat = useMemo(() => {
    return chats.find(
      (chat) =>
        chat.id === activeChatId
    );
  }, [chats, activeChatId]);

  /*
   * AUTO SCROLL
   */

  const scrollToBottom =
    useCallback(
      (smooth = false) => {
        const element =
          scrollRef.current;

        if (!element) {
          return;
        }

        element.scrollTo({
          top: element.scrollHeight,
          behavior: smooth
            ? "smooth"
            : "auto",
        });
      },
      []
    );

  useEffect(() => {
    scrollToBottom(false);
  }, [
    activeChatId,
    scrollToBottom,
  ]);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        scrollToBottom(false);
      }, 20);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    activeChat?.messages.length,
    isStreaming,
    scrollToBottom,
  ]);

  /*
   * CREATE NEW CHAT
   */

  function handleNewChat() {
    if (isStreaming) {
      abortRef.current?.abort();
      setIsStreaming(false);
    }

    const chat = createChat();

    setChats((previous) => [
      chat,
      ...previous,
    ]);

    setActiveChatId(chat.id);
    setInput("");
    setMenuChatId(null);
    setSearchOpen(false);
    setSearchQuery("");

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  /*
   * SWITCH CHAT
   */

  function handleSelectChat(
    chatId: string
  ) {
    if (isStreaming) {
      abortRef.current?.abort();
      setIsStreaming(false);
    }

    setActiveChatId(chatId);
    setMenuChatId(null);
    setSearchOpen(false);
  }

  /*
   * RENAME
   */

  function startRename(chat: Chat) {
    setRenameChatId(chat.id);
    setRenameValue(chat.title);
    setMenuChatId(null);
  }

  function saveRename() {
    if (!renameChatId) {
      return;
    }

    const title =
      renameValue.trim() ||
      "New chat";

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === renameChatId
          ? {
              ...chat,
              title:
                title.length > 60
                  ? `${title.slice(
                      0,
                      60
                    )}…`
                  : title,
              updatedAt: Date.now(),
            }
          : chat
      )
    );

    setRenameChatId(null);
    setRenameValue("");

    showToast("Chat renamed");
  }

  /*
   * ARCHIVE
   */

  function archiveChat(
    chatId: string
  ) {
    const remainingActive =
      chats.filter(
        (chat) =>
          chat.id !== chatId &&
          !chat.archived
      );

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              archived: true,
              updatedAt: Date.now(),
            }
          : chat
      )
    );

    setMenuChatId(null);

    if (activeChatId === chatId) {
      const nextChat =
        remainingActive[0] ||
        chats.find(
          (chat) =>
            chat.id !== chatId
        );

      if (nextChat) {
        setActiveChatId(
          nextChat.id
        );
      } else {
        const newChat =
          createChat();

        setChats((previous) => [
          newChat,
          ...previous,
        ]);

        setActiveChatId(
          newChat.id
        );
      }
    }

    showToast("Chat archived");
  }

  /*
   * DELETE
   */

  function confirmDeleteChat() {
    if (!deleteChatId) {
      return;
    }

    const deletingId =
      deleteChatId;

    const remaining =
      chats.filter(
        (chat) =>
          chat.id !== deletingId
      );

    if (remaining.length === 0) {
      const newChat =
        createChat();

      setChats([newChat]);
      setActiveChatId(
        newChat.id
      );
    } else {
      setChats(remaining);

      if (
        activeChatId ===
        deletingId
      ) {
        const next =
          remaining.find(
            (chat) =>
              !chat.archived
          ) ||
          remaining[0];

        setActiveChatId(
          next.id
        );
      }
    }

    setDeleteChatId(null);
    setMenuChatId(null);

    showToast("Chat deleted");
  }

  /*
   * FEEDBACK
   */

  function setFeedback(
    messageId: string,
    feedback: "up" | "down"
  ) {
    if (!activeChat) {
      return;
    }

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              messages:
                chat.messages.map(
                  (message) =>
                    message.id ===
                    messageId
                      ? {
                          ...message,
                          feedback,
                        }
                      : message
                ),
            }
          : chat
      )
    );

    showToast(
      feedback === "up"
        ? "Thanks for the feedback! 👍"
        : "Thanks for the feedback!"
    );
  }

  /*
   * COPY
   */

  async function copyText(
    text: string
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      showToast("Copied!");
    } catch {
      showToast(
        "Couldn't copy"
      );
    }
  }

  /*
   * SEND MESSAGE
   */

  async function sendMessage() {
    const userText =
      input.trim();

    if (
      !userText ||
      isStreaming ||
      !activeChat
    ) {
      return;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: userText,
      createdAt: Date.now(),
    };

    const assistantMessage: Message =
      {
        id: createId(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        feedback: null,
      };

    const isFirstUserMessage =
      activeChat.messages.filter(
        (message) =>
          message.role ===
          "user"
      ).length === 0;

    const chatId =
      activeChat.id;

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title:
                isFirstUserMessage
                  ? getTitleFromMessage(
                      userText
                    )
                  : chat.title,
              updatedAt: Date.now(),
              messages: [
                ...chat.messages,
                userMessage,
                assistantMessage,
              ],
            }
          : chat
      )
    );

    setInput("");
    setIsStreaming(true);

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "auto";
    }

    window.setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    const controller =
      new AbortController();

    abortRef.current =
      controller;

    try {
      const conversation = [
        ...activeChat.messages,
        userMessage,
      ]
        .filter(
          (message) =>
            message.role ===
              "user" ||
            message.role ===
              "assistant"
        )
        .map((message) => ({
          role:
            message.role ===
            "assistant"
              ? ("assistant" as const)
              : ("user" as const),
          content:
            message.content,
        }));

      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              messages:
                conversation,
            }),
            signal:
              controller.signal,
          }
        );

      if (!response.ok) {
        let errorMessage =
          "Vision AI couldn't answer right now.";

        try {
          const errorData =
            await response.json();

          if (
            errorData?.error
          ) {
            errorMessage =
              errorData.error;
          }
        } catch {
          // Ignore invalid JSON.
        }

        throw new Error(
          errorMessage
        );
      }

      if (!response.body) {
        throw new Error(
          "No response stream was returned."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let fullText = "";

      while (true) {
        const { done, value } =
          await reader.read();

        if (done) {
          break;
        }

        const chunk =
          decoder.decode(value, {
            stream: true,
          });

        fullText += chunk;

        setChats((previous) =>
          previous.map(
            (chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    updatedAt:
                      Date.now(),
                    messages:
                      chat.messages.map(
                        (
                          message
                        ) =>
                          message.id ===
                          assistantMessage.id
                            ? {
                                ...message,
                                content:
                                  fullText,
                              }
                            : message
                      ),
                  }
                : chat
          )
        );

        window.requestAnimationFrame(
          () => {
            scrollToBottom(
              false
            );
          }
        );
      }

      if (!fullText.trim()) {
        throw new Error(
          "Vision AI returned an empty response."
        );
      }
    } catch (error) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      console.error(
        "Vision AI error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setChats((previous) =>
        previous.map(
          (chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages:
                    chat.messages.map(
                      (
                        currentMessage
                      ) =>
                        currentMessage.id ===
                        assistantMessage.id
                          ? {
                              ...currentMessage,
                              content:
                                `Sorry — I couldn't complete that request.\n\n${message}`,
                            }
                          : currentMessage
                    ),
                }
              : chat
        )
      );

      showToast(
        "Vision AI couldn't complete that request."
      );
    } finally {
      setIsStreaming(false);
      abortRef.current =
        null;

      window.setTimeout(() => {
        scrollToBottom(false);
      }, 50);
    }
  }

  /*
   * ENTER KEY
   */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /*
   * FILTER CHATS
   */

  const visibleChats =
    chats
      .filter(
        (chat) =>
          !chat.archived
      )
      .filter((chat) => {
        if (
          !searchQuery.trim()
        ) {
          return true;
        }

        return chat.title
          .toLowerCase()
          .includes(
            searchQuery
              .toLowerCase()
          );
      })
      .sort(
        (a, b) =>
          b.updatedAt -
          a.updatedAt
      );

  /*
   * MARKDOWN
   *
   * IMPORTANT:
   * Block code is handled by
   * <pre>, NOT by returning a
   * <div> from <code>.
   *
   * This prevents:
   *
   * <p>
   *   <code>
   *     <div>
   *
   * which causes hydration errors.
   */

  function MarkdownContent({
    content,
  }: {
    content: string;
  }) {
    return (
      <div className="vision-markdown">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            remarkMath,
          ]}
          rehypePlugins={[
            rehypeKatex,
          ]}
          components={{
            h1: ({ children }) => (
              <h1 className="vision-markdown-h1">
                {children}
              </h1>
            ),

            h2: ({ children }) => (
              <h2 className="vision-markdown-h2">
                {children}
              </h2>
            ),

            h3: ({ children }) => (
              <h3 className="vision-markdown-h3">
                {children}
              </h3>
            ),

            h4: ({ children }) => (
              <h4 className="vision-markdown-h4">
                {children}
              </h4>
            ),

            p: ({ children }) => (
              <p className="vision-markdown-p">
                {children}
              </p>
            ),

            ul: ({ children }) => (
              <ul className="vision-markdown-ul">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="vision-markdown-ol">
                {children}
              </ol>
            ),

            li: ({ children }) => (
              <li className="vision-markdown-li">
                {children}
              </li>
            ),

            blockquote: ({
              children,
            }) => (
              <blockquote className="vision-markdown-blockquote">
                {children}
              </blockquote>
            ),

            a: ({
              children,
              href,
            }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="vision-markdown-link"
              >
                {children}
              </a>
            ),

            strong: ({
              children,
            }) => (
              <strong className="vision-markdown-strong">
                {children}
              </strong>
            ),

            em: ({
              children,
            }) => (
              <em className="vision-markdown-em">
                {children}
              </em>
            ),

            del: ({
              children,
            }) => (
              <del className="vision-markdown-del">
                {children}
              </del>
            ),

            hr: () => (
              <hr className="vision-markdown-hr" />
            ),

            table: ({
              children,
            }) => (
              <div className="vision-table-wrapper">
                <table className="vision-table">
                  {children}
                </table>
              </div>
            ),

            thead: ({
              children,
            }) => (
              <thead>
                {children}
              </thead>
            ),

            tbody: ({
              children,
            }) => (
              <tbody>
                {children}
              </tbody>
            ),

            tr: ({
              children,
            }) => (
              <tr>
                {children}
              </tr>
            ),

            th: ({
              children,
            }) => (
              <th>
                {children}
              </th>
            ),

            td: ({
              children,
            }) => (
              <td>
                {children}
              </td>
            ),

            br: () => (
              <br />
            ),

            /*
             * INLINE CODE ONLY.
             *
             * We intentionally do NOT
             * create a div here.
             */
            code: ({
              children,
              className,
            }) => (
              <code
                className={
                  className
                    ? `vision-inline-code ${className}`
                    : "vision-inline-code"
                }
              >
                {children}
              </code>
            ),

            /*
             * BLOCK CODE.
             *
             * ReactMarkdown places
             * block code inside <pre>.
             *
             * The copy button therefore
             * lives outside <code>.
             */
            pre: ({
              children,
            }) => {
              let language =
                "code";

              const child =
                Array.isArray(
                  children
                )
                  ? children[0]
                  : children;

              if (
                child &&
                typeof child ===
                  "object" &&
                "props" in child
              ) {
                const props =
                  (
                    child as {
                      props?: {
                        className?: string;
                      };
                    }
                  ).props;

                const className =
                  props?.className;

                if (
                  typeof className ===
                  "string"
                ) {
                  const match =
                    className.match(
                      /language-(\S+)/
                    );

                  if (match?.[1]) {
                    language =
                      match[1];
                  }
                }
              }

              let codeText = "";

              if (
                child &&
                typeof child ===
                  "object" &&
                "props" in child
              ) {
                const props =
                  (
                    child as {
                      props?: {
                        children?: unknown;
                      };
                    }
                  ).props;

                if (
                  typeof props?.children ===
                  "string"
                ) {
                  codeText =
                    props.children.replace(
                      /\n$/,
                      ""
                    );
                }
              }

              return (
                <div className="vision-code-block">
                  <div className="vision-code-header">
                    <span className="vision-code-language">
                      {language}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          codeText
                        )
                      }
                      className="vision-code-copy"
                    >
                      <Copy
                        size={15}
                      />

                      <span>
                        Copy
                      </span>
                    </button>
                  </div>

                  <pre className="vision-code-pre">
                    {children}
                  </pre>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  /*
   * RENDER
   */

  return (
    <div className="vision-app">
      {/* SIDEBAR */}

      <aside
        className={`vision-sidebar ${
          sidebarOpen
            ? "vision-sidebar-open"
            : "vision-sidebar-closed"
        }`}
      >
        <div className="vision-sidebar-top">
          <div className="vision-brand">
            <div className="vision-brand-icon">
              V
            </div>

            <span>
              Vision AI
            </span>
          </div>

          <button
            type="button"
            onClick={
              handleNewChat
            }
            className="vision-new-chat"
          >
            <Plus size={19} />

            <span>
              New chat
            </span>
          </button>

          <div className="vision-sidebar-tools">
            {searchOpen ? (
              <div className="vision-search-box">
                <Search size={17} />

                <input
                  autoFocus
                  value={
                    searchQuery
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search chats"
                />

                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(
                      false
                    );

                    setSearchQuery(
                      ""
                    );
                  }}
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="vision-sidebar-tool"
                onClick={() =>
                  setSearchOpen(
                    true
                  )
                }
              >
                <Search
                  size={18}
                />

                <span>
                  Search chats
                </span>
              </button>
            )}
          </div>

          <div className="vision-history-heading">
            <span>
              History
            </span>
          </div>
        </div>

        <div className="vision-history">
          {visibleChats.length ===
          0 ? (
            <div className="vision-empty-history">
              <MessageSquare
                size={20}
              />

              <span>
                No chats found
              </span>
            </div>
          ) : (
            visibleChats.map(
              (chat) => {
                const date =
                  formatChatDate(
                    chat.updatedAt
                  );

                return (
                  <div
                    key={chat.id}
                    className={`vision-history-row ${
                      chat.id ===
                      activeChatId
                        ? "active"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="vision-history-chat"
                      onClick={() =>
                        handleSelectChat(
                          chat.id
                        )
                      }
                    >
                      <MessageSquare
                        size={17}
                      />

                      <span>
                        {
                          chat.title
                        }
                      </span>
                    </button>

                    {date && (
                      <span className="vision-history-date">
                        {date}
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label="Chat options"
                      className="vision-chat-options-button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setMenuChatId(
                          (
                            current
                          ) =>
                            current ===
                            chat.id
                              ? null
                              : chat.id
                        );
                      }}
                    >
                      <MoreHorizontal
                        size={18}
                      />
                    </button>

                    {menuChatId ===
                      chat.id && (
                      <div
                        className="vision-chat-menu"
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            startRename(
                              chat
                            )
                          }
                        >
                          <Pencil
                            size={
                              16
                            }
                          />

                          <span>
                            Rename
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            archiveChat(
                              chat.id
                            )
                          }
                        >
                          <Archive
                            size={
                              16
                            }
                          />

                          <span>
                            Archive
                          </span>
                        </button>

                        <div className="vision-menu-divider" />

                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            setDeleteChatId(
                              chat.id
                            );

                            setMenuChatId(
                              null
                            );
                          }}
                        >
                          <Trash2
                            size={
                              16
                            }
                          />

                          <span>
                            Delete
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            )
          )}
        </div>

        <div className="vision-sidebar-bottom">
          <div className="vision-profile">
            <div className="vision-profile-avatar">
              V
            </div>

            <div>
              <div className="vision-profile-name">
                Vision User
              </div>

              <div className="vision-profile-plan">
                Free plan
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          className="vision-mobile-overlay"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* MAIN */}

      <main className="vision-main">
        {/* TOP BAR */}

        <header className="vision-topbar">
          <div className="vision-topbar-left">
            <button
              type="button"
              className="vision-mobile-menu"
              onClick={() =>
                setSidebarOpen(
                  (current) =>
                    !current
                )
              }
              aria-label="Toggle sidebar"
            >
              <Menu size={21} />
            </button>

            {!sidebarOpen && (
              <button
                type="button"
                className="vision-top-new"
                onClick={
                  handleNewChat
                }
              >
                <Plus size={18} />

                <span>
                  New chat
                </span>
              </button>
            )}

            <button
              type="button"
              className="vision-model-button"
            >
              <span>
                Vision AI
              </span>

              <ChevronDown
                size={17}
              />
            </button>
          </div>

          <div className="vision-topbar-right">
            <button
              type="button"
              className="vision-pro-button"
            >
              <Sparkles
                size={16}
              />

              <span>
                Pro
              </span>
            </button>
          </div>
        </header>

        {/* CHAT */}

        <section
          ref={scrollRef}
          className="vision-messages"
        >
          <div className="vision-messages-inner">
            {activeChat?.messages.map(
              (message) => (
                <div
                  key={message.id}
                  className={`vision-message ${
                    message.role ===
                    "user"
                      ? "vision-user-message"
                      : "vision-ai-message"
                  }`}
                >
                  {message.role ===
                    "assistant" && (
                    <div className="vision-ai-avatar">
                      <Sparkles
                        size={18}
                      />
                    </div>
                  )}

                  <div className="vision-message-column">
                    {message.role ===
                    "user" ? (
                      <div className="vision-user-bubble">
                        {
                          message.content
                        }
                      </div>
                    ) : (
                      <>
                        {message.content ? (
                          <MarkdownContent
                            content={
                              message.content
                            }
                          />
                        ) : (
                          <div className="vision-thinking">
                            <span />
                            <span />
                            <span />
                          </div>
                        )}

                        {message.content && (
                          <div className="vision-message-actions">
                            <button
                              type="button"
                              title="Good response"
                              aria-label="Good response"
                              className={
                                message.feedback ===
                                "up"
                                  ? "selected"
                                  : ""
                              }
                              onClick={() =>
                                setFeedback(
                                  message.id,
                                  "up"
                                )
                              }
                            >
                              <ThumbsUp
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Bad response"
                              aria-label="Bad response"
                              className={
                                message.feedback ===
                                "down"
                                  ? "selected"
                                  : ""
                              }
                              onClick={() =>
                                setFeedback(
                                  message.id,
                                  "down"
                                )
                              }
                            >
                              <ThumbsDown
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Copy response"
                              aria-label="Copy response"
                              onClick={() =>
                                copyText(
                                  message.content
                                )
                              }
                            >
                              <Copy
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            )}

            {isStreaming && (
              <div className="vision-streaming-status">
                <span className="vision-live-dot" />

                Vision AI is thinking…
              </div>
            )}

            <div className="vision-bottom-spacer" />
          </div>
        </section>

        {/* COMPOSER */}

        <footer className="vision-composer-area">
          <div className="vision-composer">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => {
                setInput(
                  event.target.value
                );

                event.target.style.height =
                  "auto";

                event.target.style.height = `${Math.min(
                  event.target
                    .scrollHeight,
                  180
                )}px`;
              }}
              onKeyDown={
                handleKeyDown
              }
              placeholder="Message Vision AI"
              rows={1}
              disabled={isStreaming}
            />

            <button
              type="button"
              className={`vision-send ${
                !input.trim() ||
                isStreaming
                  ? "disabled"
                  : ""
              }`}
              disabled={
                !input.trim() ||
                isStreaming
              }
              onClick={
                sendMessage
              }
              aria-label="Send message"
            >
              {isStreaming ? (
                <span className="vision-stop-square" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          <div className="vision-disclaimer">
            Vision AI can make
            mistakes. Check important
            information.
          </div>
        </footer>
      </main>

      {/* RENAME MODAL */}

      {renameChatId && (
        <div className="vision-modal-backdrop">
          <div
            className="vision-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="vision-modal-header">
              <div>
                <h2>
                  Rename chat
                </h2>

                <p>
                  Give this
                  conversation a
                  name you'll
                  recognize.
                </p>
              </div>

              <button
                type="button"
                className="vision-modal-close"
                onClick={() =>
                  setRenameChatId(
                    null
                  )
                }
                aria-label="Close rename dialog"
              >
                <X size={19} />
              </button>
            </div>

            <input
              autoFocus
              value={
                renameValue
              }
              onChange={(
                event
              ) =>
                setRenameValue(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  saveRename();
                }

                if (
                  event.key ===
                  "Escape"
                ) {
                  setRenameChatId(
                    null
                  );
                }
              }}
              className="vision-modal-input"
              placeholder="Chat name"
            />

            <div className="vision-modal-actions">
              <button
                type="button"
                className="vision-cancel-button"
                onClick={() =>
                  setRenameChatId(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="vision-confirm-button"
                onClick={
                  saveRename
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteChatId && (
        <div className="vision-modal-backdrop">
          <div
            className="vision-modal delete-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="vision-modal-header">
              <div>
                <div className="vision-delete-icon">
                  <Trash2
                    size={20}
                  />
                </div>

                <h2>
                  Delete this
                  chat?
                </h2>

                <p>
                  This
                  conversation
                  will be
                  removed from
                  your Vision AI
                  history.
                </p>
              </div>

              <button
                type="button"
                className="vision-modal-close"
                onClick={() =>
                  setDeleteChatId(
                    null
                  )
                }
                aria-label="Close delete dialog"
              >
                <X size={19} />
              </button>
            </div>

            <div className="vision-modal-actions">
              <button
                type="button"
                className="vision-cancel-button"
                onClick={() =>
                  setDeleteChatId(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="vision-delete-button"
                onClick={
                  confirmDeleteChat
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="vision-toast">
          <Check size={17} />

          <span>
            {toast}
          </span>
        </div>
      )}
    </div>
  );
}