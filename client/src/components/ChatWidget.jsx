import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatWidget.css';

const apiBaseUrl = 'https://testing-app-server.vercel.app';
console.log(apiBaseUrl);

function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const toggleChat = () => setIsOpen(!isOpen);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/api/chat/messages`);
            // Assume each message has an 'author' field that says 'user' or 'bot'
            setMessages(response.data.map(msg => ({ ...msg, align: msg.author === 'user' ? 'right' : 'left' })));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        try {
            const message = { message: input, author: 'user' }; // Assuming 'user' identifies messages from the user
            const response = await axios.post(`${apiBaseUrl}/api/chat/message`, message);
            setMessages([...messages, { ...response.data, align: 'right' }]);
            setInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
            <button onClick={toggleChat}>Chat</button>
            {isOpen && (
                <div>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <p key={index} className={msg.align === 'right' ? 'message-user' : 'message-bot'}>{msg.body}</p>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
}


export default ChatWidget;
