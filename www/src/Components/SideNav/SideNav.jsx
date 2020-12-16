import React from "react";
import styles from "./SideNav.module.css";
import { MDBNavbarNav, MDBNavLink, MDBNavItem } from "mdbreact";
import User from "../User/";
import icons from "../icons"

class SideNav extends React.Component {
    constructor(props) {
        super(props);

        const { 
            speed, speedActive, 
            interventions, interventionsActive,
            devices, devicesActive,
            male, 
            people,
        } = icons;
        

        console.log({ icons })
        this.navList = [
            {
                icon: speed,
                activeIcon: speedActive,
                text: "Dashboard",
                href: "/",
                id: 1,
            },
            {
                icon: interventions,
                activeIcon: interventionsActive,
                text: "Interventions",
                href: "/interventions",
                id: 2,
            },
            {
                icon: devices,
                activeIcon: devicesActive,
                text: "Devices",
                href: "/devices",
                id: 3,
            },

            // // Development
            // {
            //     icon: male,
            //     text: "API Dev",
            //     href: "/apidev",
            //     id: 5,
            // },

            {
                icon: people,
                text: 'LogOut',
                click: this.props.onLogOut,
                id: 4,
            }
        ];
    }

    render(){
        return (
            <div className={`${styles.sidenav} sidebar-nav-wrapper`}>

                <div className={`${styles.logoContainer} logo-container`}>
                    <img className={styles.logoImg} src="/logo.png" alt="Lumihealth" />
                </div>

                <User />

                <MDBNavbarNav className="flex-column">
                    {
                        this.navList.map((navItem) => {
                            const { icon, activeIcon, text, href, click, id } = navItem;
                            return (
                                href
                                ?
                                <MDBNavItem className={styles.navItem} key={id}>
                                    <MDBNavLink exact to={href} className={`${styles.linkWrapper} side-nav-item`}>
                                        <i className={`${styles.icon} nav-icon`}>
                                            {icon}
                                        </i>
                                        <i className={`${styles.icon} nav-active-icon`}>
                                                {activeIcon || icon}
                                        </i>
                                        {text}
                                    </MDBNavLink>
                                </MDBNavItem>
                                :
                                <div className={styles.navItem} key={id}>
                                    <div onClick={click || (() => {})} className={styles.linkWrapper}>
                                        <i className={styles.icon}>
                                            {icon}
                                        </i>
                                        {text}
                                    </div>
                                </div>
                            );
                        }
                    )}
                </MDBNavbarNav>

                <div onClick={() => document.body.classList.toggle('sidebar-collapsed')} className={`${styles.collapse} collapseBtn`}>
                    <i>{icons.arrowDown}</i>
                </div>

            </div>
        );
    }
}

export default SideNav;
