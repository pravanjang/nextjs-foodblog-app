'use client';

import {ReactNode} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

import classes from "./nav-link.module.css";


export default function NavLink({href, children }:Readonly<{href: string, children?: ReactNode}>) {
    const path = usePathname();
    return (
        <li>
            <Link href={href} className={path.startsWith(href) ? `${classes.link} ${classes.active}` : classes.link}>{children}</Link>
        </li>
    );
}
