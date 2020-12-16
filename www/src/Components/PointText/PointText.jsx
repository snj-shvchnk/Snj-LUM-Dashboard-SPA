import React from 'react'
import styles from './PointText.module.css'

export default function PointText(props) {
    let { color, text, value, dotSize, fontSize, fontColor, style, classes, onClick } = props;

    classes = classes || '';
    let dotStyle = { background: color };
    if (dotSize) {
        dotStyle.width = `${dotSize}px`;
        dotStyle.height = `${dotSize}px`;
    }
    dotStyle = { ...dotStyle, ...style };

    const additionalParametrs = {};
    if (onClick) {
        if (typeof onClick === 'function') {
            additionalParametrs.onClick =  onClick;
        }
        classes += ` ${styles.clickable}`;
    }

    return (
        <div className={`${styles.pointtext} ${classes} pointData`} { ...additionalParametrs }>
            <div className={`${styles.point} pointDot`} style={dotStyle} />

            { 
                typeof value !== 'undefined' && 
                <div className={`${styles.pointValue} pointValue`}>{value}</div> 
            }

            <div 
                className={`${styles.text} pointText`}
                style={{ 
                    fontSize: fontSize ? `${fontSize}px` : null,
                    fontColor: fontColor ? fontColor : null,
                }}
            >
                {text}
            </div>

        </div>
    )
}
