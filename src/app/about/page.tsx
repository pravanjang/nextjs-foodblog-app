'use client';

import {NotificationContext} from "@/store/notification-context";
import {useContext} from "react";

export default function Page() {

    const context = useContext(NotificationContext);
    //const context = useNotificationContext();

    console.log("Page context", context);



    function handleClick(){
        console.log("Page clicked: ", context);
        if(!context){
            console.log("context is not defined");
            return;
        }

        context.showNotification("Page title", "Page message","success");
    }


    return (
        <>
            <div className="justify-center">Coming soon....</div>
            <button onClick={handleClick}>Click me!</button>
        </>
    );
}
