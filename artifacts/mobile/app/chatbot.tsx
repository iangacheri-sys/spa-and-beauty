import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, API_BASE } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'owner';
  timestamp: string;
  senderName?: string;
  type?: 'text' | 'booking_confirm';
  bookingData?: {
    service?: string;
    therapist?: string;
    date?: string;
    time?: string;
    total?: number;
    bookingId?: string;
  };
}

const CHIPS = [
  'Book a Service', 'Check Availability', 'Services & Prices', 'Products', 'Directions', 'Talk to Spa'
];

export default function ChatbotScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const spaId = params.spaId as string;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [spa, setSpa] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'bot' | 'live'>('bot');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!spaId) {
      setMessages([{ id: 'err', text: 'Error: No spa selected.', sender: 'bot', timestamp: new Date().toISOString() }]);
      setLoading(false);
      return;
    }

    Promise.all([
      apiFetch(`/spas/${spaId}`),
      apiFetch(`/messages/policy?spaId=${spaId}`).catch(() => null),
      apiFetch(`/services?spaId=${spaId}`)
    ]).then(([spaData, policyData, servicesData]: any) => {
      setSpa(spaData);
      setPolicy(policyData);
      setServices(servicesData || []);
      
      setMessages([
        { 
          id: '1', 
          text: `Hello! I am the virtual assistant for ${spaData?.name || 'this spa'}. How can I help you today?`, 
          sender: 'bot', 
          timestamp: new Date().toISOString() 
        }
      ]);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [spaId]);

  // Poll for new messages when in live mode
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (mode === 'live' && conversationId) {
      interval = setInterval(async () => {
        try {
          const res: any = await apiFetch(`/api/messages/conversations/${conversationId}`);
          if (res && res.messages) {
            // Map server messages to local format
            const mapped = (res as any).messages.map((m: any) => ({
              id: m.id,
              text: m.text,
              sender: m.sender === 'client' ? 'user' : m.sender,
              senderName: m.senderName,
              timestamp: m.timestamp
            }));
            setMessages(mapped);
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [mode, conversationId]);

  const handleChip = (chip: string) => {
    processUserInput(chip);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    processUserInput(inputText.trim());
    setInputText('');
  };

  const processUserInput = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Optimistic UI
    if (mode === 'bot') {
      setMessages(prev => [...prev, userMessage]);
    }

    if (mode === 'live') {
      // Send to server
      if (conversationId) {
        try {
           await apiFetch(`/api/messages/conversations/${conversationId}/reply`, {
             method: 'POST',
             body: JSON.stringify({ text, senderName: user?.name || 'Client', sender: 'client' })
           });
           // Don't append manually, let polling handle it, but for snappy UI append locally
           setMessages(prev => [...prev, userMessage]);
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    // Bot logic
    const lower = text.toLowerCase();
    
    if (lower.includes('talk to spa') || lower.includes('human') || lower.includes('owner')) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Connecting you to the spa team... Please wait a moment.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
      
      try {
        const res = await apiFetch(`/api/messages/conversations`, {
          method: 'POST',
          body: JSON.stringify({
            spaId,
            clientId: user?.id || 'guest',
            clientName: user?.name || 'Guest Client',
            clientPhone: user?.phone || '',
            initialMessage: 'I would like to speak to someone from the spa.'
          })
        }) as any;
        if (res && res.id) {
          setConversationId(res.id);
          setMode('live');
        }
      } catch (e) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          text: 'Sorry, the spa team is currently unavailable. Please try again later.',
          sender: 'bot',
          timestamp: new Date().toISOString()
        }]);
      }
      return;
    }

    // Use AI with function calling (non-streaming) for full capability
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      text: '...',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }]);

    try {
      const data: any = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, spaId }),
      });

      // Check if the reply contains booking confirmation data
      const replyText = data?.reply || 'Sorry, I am having trouble connecting right now.';
      
      // Parse booking confirmation from reply text if present
      const isBookingConfirm = replyText.toLowerCase().includes('booking confirmed') || 
                               replyText.toLowerCase().includes('appointment') && replyText.toLowerCase().includes('confirmed');

      setMessages(prev => prev.map(m =>
        m.id === botMsgId ? { 
          ...m, 
          text: replyText,
          type: 'text',
        } : m
      ));
    } catch (err: any) {
      const isQuota = err?.message?.includes('quota') || err?.message?.includes('429') || err?.message?.includes('exceeded');
      const errText = isQuota
        ? '⚠️ The AI assistant is temporarily unavailable due to high demand. Please try again in a few minutes.'
        : 'Sorry, I am having trouble connecting right now. Please try again.';
      setMessages(prev => prev.map(m =>
        m.id === botMsgId ? { ...m, text: errText } : m
      ));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.foreground }]}>{spa?.name || 'Spa Assistant'}</Text>
          <Text style={[styles.status, { color: mode === 'live' ? '#F59E0B' : '#10B981' }]}>
            {mode === 'live' ? 'Live Chat' : 'Bot Assistant'}
          </Text>
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="more-horizontal" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            const showSender = msg.sender === 'owner' && (i === 0 || messages[i-1].sender !== 'owner');
            return (
              <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.messageUserWrapper : styles.messageBotWrapper]}>
                {!isUser && (
                  <View style={[styles.botAvatar, { backgroundColor: msg.sender === 'owner' ? colors.primary : '#8B5CF6' }]}>
                    <Feather name={msg.sender === 'owner' ? 'user' : 'cpu'} size={16} color="#FFF" />
                  </View>
                )}
                <View style={{ maxWidth: '85%' }}>
                  {showSender && <Text style={{ fontSize: 10, color: colors.mutedForeground, marginLeft: 4, marginBottom: 2 }}>{msg.senderName || 'Spa Team'}</Text>}
                  <View style={[
                    styles.messageBubble, 
                    isUser 
                      ? [styles.messageUser, { backgroundColor: colors.primary }] 
                      : [styles.messageBot, { backgroundColor: colors.card, borderColor: colors.border }]
                  ]}>
                    <Text style={[styles.messageText, { color: isUser ? '#FFF' : colors.foreground }]}>{msg.text}</Text>
                  </View>
                </View>
              </View>
            );
          })}
          
          {mode === 'bot' && messages[messages.length - 1]?.sender === 'bot' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer} contentContainerStyle={styles.chipsContent}>
              {CHIPS.map(chip => (
                <TouchableOpacity key={chip} style={[styles.chip, { borderColor: colors.primary }]} onPress={() => handleChip(chip)}>
                  <Text style={[styles.chipText, { color: colors.primary }]}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        <View style={[styles.inputArea, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
            placeholder={mode === 'live' ? "Type a message..." : "Ask me anything..."}
            placeholderTextColor={colors.mutedForeground}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.muted }]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={20} color={inputText.trim() ? '#FFF' : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1 },
  backBtn: { padding: 5, marginLeft: -5 },
  headerInfo: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  actionBtn: { padding: 5, marginRight: -5 },
  keyboardAvoid: { flex: 1 },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 40 },
  messageWrapper: { flexDirection: 'row', marginBottom: 16, width: '100%' },
  messageUserWrapper: { justifyContent: 'flex-end' },
  messageBotWrapper: { justifyContent: 'flex-start' },
  botAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 12 },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  messageUser: { borderBottomRightRadius: 4 },
  messageBot: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  chipsContainer: { marginTop: 8, marginBottom: 16, marginLeft: 42 },
  chipsContent: { gap: 8, paddingRight: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 15, borderTopWidth: 1 },
  input: { flex: 1, height: 48, borderRadius: 24, paddingHorizontal: 20, borderWidth: 1, marginRight: 10, fontSize: 15 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
