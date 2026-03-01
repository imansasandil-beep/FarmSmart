import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config';

export default function ChatScreen() {
    const { id, receiverId, receiverName } = useLocalSearchParams();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const flatListRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        const init = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                if (!userStr) {
                    router.replace('/');
                    return;
                }
                const user = JSON.parse(userStr);
                setCurrentUser(user);

                await fetchMessages();
                if (user._id) {
                    await markAsRead(user._id);
                }
            } catch (error) {
                console.error('Chat Init Error:', error);
            } finally {
                setLoading(false);
            }
        };
        init();

        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${id}`);
            const data = await response.json();
            if (response.ok) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Fetch Messages Error:', error);
        }
    };

    const markAsRead = async (userId) => {
        try {
            await fetch(`${API_BASE_URL}/api/messages/read/${id}/${userId}`, {
                method: 'PATCH',
            });
        } catch (error) {
            console.error('Mark Read Error:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || sending || !currentUser) return;

        setSending(true);
        try {
            // Determine receiver - ensure we get the string ID
            let targetReceiverId = receiverId;

            // Handle if receiverId is an object with _id
            if (targetReceiverId && typeof targetReceiverId === 'object') {
                targetReceiverId = targetReceiverId._id || targetReceiverId;
            }

            // If not provided in params, try to find from existing messages
            if (!targetReceiverId && messages.length > 0) {
                const lastMsg = messages[0];
                const senderId = lastMsg.senderId?._id || lastMsg.senderId;
                const msgReceiverId = lastMsg.receiverId?._id || lastMsg.receiverId;
                targetReceiverId = senderId === currentUser._id
                    ? msgReceiverId
                    : senderId;
            }

            if (!targetReceiverId) {
                console.error('Cannot determine receiver');
                setSending(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentUser._id,
                    receiverId: targetReceiverId,
                    text: inputText.trim(),
                }),
            });

            if (response.ok) {
                setInputText('');
                fetchMessages(); // Refresh immediately
            }
        } catch (error) {
            console.error('Send Error:', error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const senderId = item.senderId?._id || item.senderId;
        const isMe = senderId === currentUser?._id;
        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    isMe ? styles.myMessageText : styles.theirMessageText
                ]}>
                    {item.text}
                </Text>
                <Text style={[
                    styles.timeText,
                    isMe ? styles.myTimeText : styles.theirTimeText
                ]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6fdfc4" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{receiverName || 'Chat'}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item._id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#0a1f1c" />
                    ) : (
                        <Ionicons name="send" size={20} color="#0a1f1c" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1f1c',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#0a1f1c',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#6fdfc4',
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#1a4d45',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#0a1f1c',
    },
    theirMessageText: {
        color: 'white',
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: 'rgba(10, 31, 28, 0.6)',
    },
    theirTimeText: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        backgroundColor: '#0a1f1c',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: 'white',
        maxHeight: 100,
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: '#6fdfc4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
