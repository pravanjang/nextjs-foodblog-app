'use client';
import React, {createContext, ReactNode, useState} from 'react';

interface NotificationType {
    type: 'success' | 'error' | 'pending';
    message: string;
    title: string;

}

const NotificationContext = createContext<any | null>(null);

function NotificationContextProvider (props:Readonly<{children: ReactNode}>) {
    const [notification, setNotification] = useState<NotificationType | null>(null);

    const showNotification = (type: 'success' | 'error', message: string, title: string) => {
        setNotification({ type, message, title });
        setTimeout(() => setNotification(null), 3000); // Hide after 3 seconds
    };

    return (
        <NotificationContext.Provider value={{ notification, showNotification }}>
            {props.children}
        </NotificationContext.Provider>
    );
};

export { NotificationContext, NotificationContextProvider };
