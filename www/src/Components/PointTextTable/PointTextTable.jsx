import React from 'react'
import styles from './PointTextTable.module.css'

class PointTextTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    renderRow = ({ color, text, value, dotSize, fontSize, src, item, filters }) => {
        const dotStyle = { background: color };
        const rowStyle = {};
        const rowOptions = {};
        let rowClass = '';
        
        if (dotSize) {
            dotStyle.width = `${dotSize}px`;
            dotStyle.height = `${dotSize}px`;
        }
        
        // console.log({ filters });
        if (filters.length > 0) {
            rowStyle.opacity = 0.5;
            filters.forEach((filter) => {
                if (src.id === filter.filterData.data.id)
                    if (item.id === filter.filterData.item.id)
                        delete rowStyle.opacity;
            });
        }

        if (typeof this.props.onLabelClick === 'function') {
            rowOptions.onClick = () => this.props.onLabelClick(src, item);
            rowStyle.cursor = 'pointer';
            rowClass += ` ${styles.clickable_row}`;
        }

        return (
            <div 
                className={`${styles.pointTextTableRow} ${rowClass}`} 
                key={`${value}_${text}`}
                style={rowStyle}
                { ...rowOptions }
            >
                <div className={styles.point} style={dotStyle} />

                {
                    typeof value !== 'undefined' && 
                    <div className={styles.pointValue}>{value}</div> 
                }
    
                <div 
                    className={styles.text}
                    style={{ fontSize: fontSize ? `${fontSize}px` : null }}
                >
                    {text}
                </div>
            </div>
        );
    };

    mapObject = (items, handler) => {
        // console.log('MapObject', { items, handler })
        return (
            [ ...Object.keys(items) ].map((m) => handler(m, items[m]))
        );
    };

    // checkFiltering = ({ item, src, filters }) => {
    //     if (!filters) {
    //         item.filtered = true;
    //     } else {
    //         console.log({ item, src, filters });
    //         item.filtered = false;
            
    //         this.mapObject(filters, (k, filter) => {
    //             //if (filter.filterData.data.id = item.src.id)
    //             //if (filter.filterData.item.id = item.src.id)
                    
    //             //item.filtered = true;
    //             console.log('checkFiltering', { item, src, filters });
                
    //         });
    //     }
    //     return item;
    // }

    render() {
        // console.log('PT:', {props: this.props});
        const { activeFilters } = this.props;
        const filters =     
            this.mapObject(activeFilters, (key,i) => ({ key, ...i }));

        return (
            <div className={styles.pointTextTable}>
                {
                    this.props.data.labels && 
                    this.props.data.labels.map((label, i) => {
                        return this.renderRow({
                            text: label,
                            color: this.props.data.datasets[0].backgroundColor[i],
                            value: this.props.data.datasets[0].data[i],
                            src:   this.props.data.src,
                            item:  this.props.data.dataItems[i],
                            data: this.props.data,
                            filters,
                        });
                    })
                }
            </div>
        );
    }
    
} 

export default PointTextTable;