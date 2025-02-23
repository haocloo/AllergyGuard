import React from "react";

// ui
import { Bot, User, Sparkle, Clock } from "lucide-react";

// external
import { Message } from "ai/react";
import { schema_general_ai_response } from "@/services/validation";

// pui
import Markdown from "./markdown";

type Props = {
  messages: Message[];
  isLoading: boolean;
  isMessageLoading?: boolean;
};

const timeZone = "Asia/Kuala_Lumpur";
const Messages = ({ messages, isLoading }: Props) => {

  const formatMessageTime = (date: Date) => {
    return date.toLocaleString("en-MY", {
      timeZone,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {messages.map((m, index) => {
        const messageTime = formatMessageTime(new Date(m.createdAt || Date.now()));

        if (m.role === "user") {
          return (
            <div key={m.id || index} className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  <h5 className="font-semibold text-blue-700 dark:text-blue-200">Your Answer</h5>
                </div>
                <Time timestamp={messageTime} />
              </div>
              <Markdown text={m.content} />
            </div>
          );
        } else if (m.role === "assistant") {
          try {
            const parsedContent = typeof m.content === "string" ? JSON.parse(m.content) : m.content;

            const validatedContent = schema_general_ai_response.parse(parsedContent);

            return (
              <div key={m.id || index} className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-green-600 dark:text-green-300" />
                      <h5 className="font-semibold text-green-700 dark:text-green-200">AI Feedback</h5>
                    </div>
                  </div>
                  <Markdown text={validatedContent.feedback || ""} />
                </div>
                {validatedContent.sample_answer && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg shadow-md mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Sparkle className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />
                        <h5 className="font-semibold text-yellow-700 dark:text-yellow-200">Sample Answer</h5>
                      </div>
                    </div>
                    <Markdown text={validatedContent.sample_answer || ""} />
                  </div>
                )}
              </div>
            );
          } catch (error) {
            console.error("Error parsing message content:", error);
            return null;
          }
        }
        return null;
      })}
      {isLoading && (
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 animate-pulse">
          <Bot className="w-5 h-5" />
          <p>AI is thinking...</p>
        </div>
      )}
    </div>
  );
};

const Time = ({ timestamp }: { timestamp: string }) => {
  return (
    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
      <Clock className="w-4 h-4 mr-1" />
      <span>{timestamp}</span>
    </div>
  );
};

export default Messages;
