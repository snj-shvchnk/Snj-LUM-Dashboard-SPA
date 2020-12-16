import React from 'react'
import styles from './Title.module.css'

export default function Title({ text }) {
    return (
        <div className={styles.title}>{text}</div>
    )
}
