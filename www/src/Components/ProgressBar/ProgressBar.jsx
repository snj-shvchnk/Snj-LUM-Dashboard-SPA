import React from 'react'
import styles from './ProgressBar.module.css'
import { MDBProgress } from 'mdbreact';

export default function ProgressBar(props) {
    let className = props.className || '';
    className += ' my-2';
    className += ' progress-color-' + props.color;

    return (
        <div className={styles.progressbar}>
              <MDBProgress {...props} className={className} />
        </div>
    )
}
