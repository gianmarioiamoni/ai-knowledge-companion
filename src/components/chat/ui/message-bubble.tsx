'use client';

import { JSX, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Check, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { MessageBubbleProps } from '@/types/chat';

export function MessageBubble({ message }: MessageBubbleProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
        {/* Avatar */}
        {!isUser && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="" alt="AI" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              AI
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <Card className={`${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}>
            <CardContent className="p-3">
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </CardContent>
          </Card>

          {/* Message Metadata */}
          <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            
            {message.tokens_used && (
              <Badge variant="secondary" className="text-xs">
                {message.tokens_used} tokens
              </Badge>
            )}
            
            {message.model && (
              <Badge variant="outline" className="text-xs">
                {message.model}
              </Badge>
            )}

            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* RAG Sources */}
          {isAssistant && message.rag_chunks && message.rag_chunks.length > 0 && (
            <div className="mt-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSources(!showSources)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FileText className="h-3 w-3 mr-1" />
                {message.rag_chunks.length} source{message.rag_chunks.length !== 1 ? 's' : ''}
                {showSources ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>

              {showSources && (
                <div className="mt-2 space-y-2">
                  {message.rag_chunks.map((chunk) => (
                    <Card key={chunk.chunk_id} className="bg-gray-50 dark:bg-gray-700">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {chunk.document_name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {Number.isFinite(chunk.similarity_score)
                                  ? `${(chunk.similarity_score * 100).toFixed(1)}% match`
                                  : '—'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                              {chunk.content}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            onClick={() => {
                              // TODO: Open document preview
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
