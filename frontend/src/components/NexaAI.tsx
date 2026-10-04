import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { apiFetch } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export const NexaAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Hi! I am Nexa AI, your personal financial assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
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
    <TouchableOpacity 
      onPress={() => handleSend(text)}
      style={styles.suggestionChip}
    >
      <Text style={styles.suggestionText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.fabIcon}>✨</Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.chatContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.botAvatar}>
                  <Text style={styles.botAvatarText}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Nexa AI</Text>
                  <Text style={styles.onlineStatus}>● Online</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <MaterialIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Messages Area */}
            <ScrollView 
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              style={styles.messagesArea}
              contentContainerStyle={{ padding: 16 }}
            >
              {messages.map((msg, idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.messageBubble, 
                    msg.role === 'user' ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text style={styles.messageText}>{msg.content}</Text>
                </View>
              ))}
              
              {isLoading && (
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <ActivityIndicator size="small" color="#6366f1" />
                  <Text style={[styles.messageText, {marginLeft: 8, fontStyle: 'italic', color: '#9CA3AF'}]}>Nexa is thinking...</Text>
                </View>
              )}
            </ScrollView>

            {/* Suggestion Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer} contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 8}}>
              <SuggestionChip text="How much did I spend on food this month?" />
              <SuggestionChip text="Can I afford to spend ₹5000 today?" />
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything about your finances..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                onPress={() => handleSend()}
                disabled={isLoading || !input.trim()}
              >
                <MaterialIcons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 40, // Elevated to overlap the bottom nav nicely
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 1000,
  },
  fabIcon: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#1f2937',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  botAvatarText: {
    fontSize: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineStatus: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  messagesArea: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionsContainer: {
    flexGrow: 0,
    maxHeight: 50,
    marginBottom: 8,
  },
  suggestionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
  },
  suggestionText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '500',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    color: '#ffffff',
    fontSize: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  }
});
