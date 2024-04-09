import React from "react";
import logoImg from "@/assets/fblogo.png";

import classes from "./main-header.module.css"
import Link from "next/link";
import Image from "next/image";
import MainHeaderBackground from "@/components/main-header/main-header-background";
import NavLink from "@/components/main-header/nav-link/nav-link";

const MainHeader: React.FC = (props): React.ReactElement => {
    return (<>
        <MainHeaderBackground />
        <header className={classes.header}>
            <Link className={classes.logo} href='/'>
                <Image src={logoImg} alt="A plate with food " priority/>
                NextLevel Foods!!
            </Link>
            <nav className={classes.nav}>
                <ul>
                    <NavLink href="/meals" >Brows Meals</NavLink>
                    <NavLink href="/community" >Foodies Community</NavLink>
                    <NavLink href="/about" >About</NavLink>
                </ul>
            </nav>
        </header>
    </>);
}

export default MainHeader;
