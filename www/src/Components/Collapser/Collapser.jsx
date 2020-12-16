import React from 'react'
import styles from './Collapser.module.css'
import icons from '../icons'
import InsterHTML from '../InsertHtml';

export default class Collapser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: props.collapsed
        }

        this.section = null;
    }

    toggleCollapse = () => {
        // console.log('toggleCollapse');
        if (this.section) {
            const newState = !this.state.collapsed;
            this.setState({
                collapsed: newState,
            });
        }
    }

    render() {
        const { title, children } = this.props;
        const { collapsed } = this.state;
        let classes = styles.collapserGroup;
        if (collapsed) {
            classes += ` ${styles.collapserCollapsed}`;
            classes += ' collapserCollapsed';
        }

        return (
            <>
                <div className={classes}>
                    <div className={styles.collapserHeader} onClick={this.toggleCollapse}>
                        <InsterHTML html={title} className="collapser-title" />
                        <div className={styles.collapserToggler} >
                            <i>{collapsed ? icons.arrowDown : icons.arrowUp}</i>
                        </div>
                    </div>
                    <div
                        className={`${styles.collapserSection} collapserSection scale-out-ver-top ${collapsed ? '' : 'scale-in-ver-top'}`}
                        ref={(e) => { this.section = e; }}
                    >
                        {children}
                    </div>
                </div>
            </>
        )
    }
}
