"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import dedent from "dedent";
import { useState } from "react";
import { Response } from "@/components/ai-elements/response";

const firstMessage = dedent`
You arrive in the small village of Misty Hollow, despite it's small size it seems to be bustling. Who are you?
`;

export default function MedievalChat() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    messages: [
      {
        role: "assistant",
        parts: [
          {
            type: "text",
            text: firstMessage,
          },
        ],
        id: "first-message",
      } as UIMessage,
    ],
  });
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-amber-50 via-yellow-50 to-amber-100">
      <div className="flex flex-col h-full max-w-6xl mx-auto p-8">
        {/* Parchment-like container */}
        <div className="flex flex-col h-full bg-[#f4e8d0] shadow-2xl rounded-sm border-4 border-[#8b7355] relative overflow-hidden">
          {/* Aged paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuNSIvPjwvc3ZnPg==')]"></div>

          {/* Title with decorative styling */}
          <div className="relative bg-linear-to-b from-[#8b7355] to-[#6b5644] p-6 border-b-4 border-[#5a4632]">
            <h1 className="text-3xl font-bold text-center text-[#f4e8d0] tracking-wider drop-shadow-md">
              ✦ Choose Your Own Adventure ✦
            </h1>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-1 bg-[#8b7355]"></div>
          </div>

          {/* Messages area with parchment styling */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-[#8b7355] scrollbar-track-[#e8d9c0]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.role === "user"
                    ? "bg-[#e8d9c0] ml-8"
                    : "bg-[#f0e5d0] mr-8"
                } p-4 rounded-sm border-2 border-[#c4a876] shadow-md`}
              >
                {/* Corner decoration */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-[#8b7355]"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-[#8b7355]"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-[#8b7355]"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-[#8b7355]"></div>

                <div className="font-bold mb-2 text-[#5a4632] text-sm uppercase tracking-wide">
                  {message.role === "user" ? "⚔ Your Choice" : "📜 The Story"}
                </div>
                <div className="whitespace-pre-wrap text-[#3a2820] leading-relaxed">
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text": // we don't use any reasoning or tool calls in this example
                        return (
                          <Response key={`${message.id}-${i}`}>
                            {part.text}
                          </Response>
                        );
                      case "reasoning":
                        return (
                          status === "streaming" && (
                            <Response
                              key={`${message.id}-${i}`}
                              className="text-sm text-gray-500"
                            >
                              {part.text}
                            </Response>
                          )
                        );
                      default:
                        return null;
                    }
                  })}
                  {error && (
                    <Response className="text-sm text-red-500">
                      {error.message}
                    </Response>
                  )}
                </div>
              </div>
            ))}

            {(status === "submitted" || status === "streaming") && (
              <div className="flex items-center justify-center gap-3 bg-[#f0e5d0] p-4 rounded-sm border-2 border-[#c4a876] shadow-md mx-8">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#8b7355] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-[#8b7355] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-[#8b7355] rounded-full animate-bounce"></span>
                </div>
                <span className="text-[#5a4632] italic text-sm">
                  The tale unfolds...
                </span>
              </div>
            )}
          </div>

          {/* Input area with aged styling */}
          <div className="relative bg-linear-to-t from-[#8b7355] to-[#6b5644] p-6 border-t-4 border-[#5a4632]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
              className="flex gap-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={status !== "ready"}
                placeholder="What do you do next?..."
                className="flex-1 bg-[#f4e8d0] border-2 border-[#8b7355] rounded-sm px-4 py-3 text-[#3a2820] placeholder:text-[#8b7355] placeholder:italic disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#c4a876] focus:border-[#c4a876] transition-all"
              />
              <button
                type="submit"
                disabled={status !== "ready"}
                className="bg-[#6b5644] hover:bg-[#5a4632] text-[#f4e8d0] font-bold px-6 py-3 rounded-sm border-2 border-[#5a4632] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:translate-y-0.5 uppercase tracking-wide"
              >
                Choose
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
