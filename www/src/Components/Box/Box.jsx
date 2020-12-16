import React from "react";
import styles from "./Box.module.css";

export default function Box(props) {
    return <div className={`${styles.box} dash-box`}>{props.children}</div>;
}
