import React from "react";
import styles from "./Peers.module.css";
import icons from "../icons";
import PointText from "../PointText";

const Peers = () => {
    return (
        <div className={styles.peers}>
            <div className={styles.peersColumnLeft}>
                <div className={styles.head}>{icons.person}</div>

                <Peer quantity={10} count={20} side="left" />
                <Peer quantity={8} count={83} />
                <Peer quantity={8} count={79} />
                <Peer quantity={7} count={72} />
                <div className={styles.down}>
                    <PointText color="#BE7DB8" text="My Performance"  fontSize={10} classes="peers-dots" />
                </div>
            </div>
            <div className={styles.peersColumnCenter}>
                <h5 className={styles.text}>Case Load (Tasks)</h5>
                <h5 className={styles.text}>Patient Engagement Score</h5>
                <h5 className={styles.text}>Coordination Score</h5>
                <h5 className={styles.text}>Clinical Score</h5>
            </div>
            <div className={styles.peersColumnRight}>
                <div className={styles.head}>{icons.people} Average</div>
                <Peer quantity={8} count={15} side="left" />
                <Peer quantity={9} count={90} />
                <Peer quantity={8} count={65} />
                <Peer quantity={9} count={82} />
                <div className={styles.down}>
                    <PointText color="#5F6972" text="Peer Performance" fontSize={10} classes="peers-dots" />
                </div>
            </div>
        </div>
    );
};

export default Peers;

function Peer(props) {
    const { quantity, count } = props;
    const parts = [];
    for (let index = 0; index < quantity; index++) {
        parts.push("");
    }

    return (
        <div className={styles.peer}>
            <div className={styles.count}>{count}</div>
            {parts.map((part, index) => {
                return (
                    <span key={index} className={styles.part}>
                        {part}
                    </span>
                );
            })}
        </div>
    );
}
