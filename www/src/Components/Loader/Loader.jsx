import React from 'react'
import styles from './Loader.module.css'

export default function Loader(props) {
    return (
        <div className={`${styles.loader} scale-up-center ${props.classes}`}>
            LOADING
        </div>
    )
}
