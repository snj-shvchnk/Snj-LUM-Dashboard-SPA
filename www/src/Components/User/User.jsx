import React from "react";
import styles from "./User.module.css";

export default function User() {
    const userData = {
        image: "https://randomuser.me/api/portraits/women/66.jpg",
        name: "Suzie Smith",
        position: "Lumi Health, Founder",
    };

    const { image, name, position } = userData;
    return (
        <div className={`${styles.user} user-container`}>
            <div className={styles.image}>
                <img src={image} alt="" />
            </div>
            <div className={styles.text}>
                <div className={styles.name}>{name}</div>
                <div className={styles.position}>{position}</div>
            </div>
        </div>
    );
}
