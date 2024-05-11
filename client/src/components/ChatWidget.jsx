import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiBaseUrl = 'http://localhost:3001';
console.log(apiBaseUrl);

function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');



    const toggleChat = () => setIsOpen(!isOpen);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/api/chat/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen]); // This useEffect will call `fetchMessages` when the `isOpen` state changes.

    const sendMessage = async () => {
        try {
            const response = await axios.post(`${apiBaseUrl}/api/chat/message`, { message: input });
            setMessages([...messages, response.data]);
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
                        {messages.map(msg => (
                            <p key={msg._id}>{msg.body}</p>
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
