'use client';
import { useContext } from 'react';

import classes from './notification.module.css';
import {NotificationContext} from '@/store/notification-context';

function Notification() {
    const notificationCtx: any = useContext(NotificationContext);

    //const notificationCtx = useNotificationContext();

    console.log("Notification: ",notificationCtx);
    //const notification = notificationCtx.notification;
    if (!notificationCtx) {
        console.log("Notification context is null");
        return <></>;
    }
    const {notification, showNotification} = notificationCtx;

    if (!notification) {
        console.log("activeNotification is null");
        return <div></div>;
    }

    console.log("Notification context", notification);

    function closeNotificationHandler() {
        console.log("Closing notification!");
        showNotification(null);
    }

    let statusClasses = '';

    if (notification?.type === 'success') {
        statusClasses = classes.success;
    }

    if (notification?.type === 'error') {
        statusClasses = classes.error;
    }

    if (notification?.type === 'pending') {
        statusClasses = classes.pending;
    }

    const activeClasses = `${classes.notification} ${statusClasses}`;
    return (
        <div className={activeClasses} onClick={closeNotificationHandler} >
            <h2>{notification?.title}</h2>
            <p>{notification?.message}</p>
        </div>
    );
}

export default Notification;