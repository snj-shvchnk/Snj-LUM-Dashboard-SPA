import React from "react";
import styles from "./Ellipse.module.css";

export default function Ellipse(props) {
    const { count, text } = props;

    return (
        <div className={styles.ellipse}>
            <div className={styles.count}>{count}</div>
            <div className={styles.text}>{text}</div>
        </div>
    );
}
