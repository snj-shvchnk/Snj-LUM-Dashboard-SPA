import React from "react";
import styles from "./Wrapper.module.css";

export default function Wrapper(props) {
    return <section className={styles.wrapper}>{props.children}</section>;
}
