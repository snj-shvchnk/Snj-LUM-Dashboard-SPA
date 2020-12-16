import React, { useEffect, useState } from 'react';
import styles from './InterventionsPopup.module.css';
import { Link } from 'react-router-dom';
import icons from '../icons';

class InterventionsPopup extends React.Component {
    constructor(props) {
        super(props);
        this.limit = 3;
    }

    render() {
        const { limit, props } = this;
        const { status, handleClose } = props;
        const data = props.data?.items || [];
        return (
            <div className={`${styles.section} ${status && styles.sectionOut}`}>
                <div className={styles.head}><span className={styles.count}>{data.length}</span>{props.data?.title} Interventions
                <i className={styles.icon} onClick={handleClose}>{icons.close}</i></div>
                <div className={styles.body}>
                    <ul>
                        {
                            data.map((item, i) => {
                                return (i < limit) ? (
                                    <li className={styles.person} key={i}>
                                        <span className={styles.number}>{i + 1}</span>
                                        <Link className={styles.name} to="/interventions">{`${item.first_name} ${item.last_name}`}</Link>
                                        <span className={styles.status}>{item.d_type}</span>
                                        <span className={styles.active}>{item.dueDaysTitle}</span>
                                    </li>
                                ) : null;
                            })
                        }
                    </ul>
                </div>
                <Link to="/interventions" className={styles.link}>Go to Interventions <span>→</span></Link>
            </div>
        )
    }
}

export default InterventionsPopup;
