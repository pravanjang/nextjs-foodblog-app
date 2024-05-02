import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainHeader from "@/components/main-header/main-header";
import Notification from "@/components/notification/notification";
import {ReactNode, useContext} from "react";
import {NotificationContextProvider} from "@/store/notification-context";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Food Blog",
  description: "Delicious meals, shared by a food-loving community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
      <NotificationContextProvider>
          <MainHeader />
          {children}
          {<Notification />}
      </NotificationContextProvider>

      </body>
    </html>
  );
}
