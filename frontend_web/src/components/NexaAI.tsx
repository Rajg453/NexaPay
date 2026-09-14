import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../services/api';

export const NexaAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Hi! I am Nexa AI, your personal financial assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiFetch('/ai/advisor', {
        method: 'POST',
        body: JSON.stringify({ question: text })
      });
      
      setMessages([...newMessages, { role: 'ai', content: response.advice }]);
    } catch (error: any) {
      setMessages([...newMessages, { role: 'ai', content: `Oops, I had trouble processing that: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SuggestionChip = ({ text }: { text: string }) => (
    <button 
      onClick={() => handleSend(text)}
      style={{
        padding: '6px 12px',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: '#818cf8',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        fontSize: '12px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        marginRight: '8px'
      }}
    >
      {text}
    </button>
  );

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          zIndex: 1000,
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? '✖' : '✨'}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '350px',
          height: '500px',
          backgroundColor: '#111827',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(to right, rgba(99,102,241,0.1), transparent)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', 
              backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', marginRight: '12px', fontSize: '16px'
            }}>🤖</div>
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>Nexa AI</h3>
              <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 500 }}>● Online</span>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: msg.role === 'user' ? '#6366f1' : '#1F2937',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                fontSize: '14px',
                lineHeight: '1.5',
                border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}>
                {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#1F2937', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                <span style={{ color: '#9CA3AF', fontSize: '14px', fontStyle: 'italic' }}>Nexa is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div style={{ padding: '0 16px 12px 16px', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <SuggestionChip text="How much did I spend on food this month?" />
            <SuggestionChip text="Can I afford to spend ₹5000 today?" />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your finances..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '20px',
                border: '1px solid #374151',
                backgroundColor: '#1F2937',
                color: 'white',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                backgroundColor: input.trim() ? '#6366f1' : '#374151',
                color: 'white', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      <style>
        {`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}
      </style>
    </>
  );
};
