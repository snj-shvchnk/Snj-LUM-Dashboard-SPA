import React, { Component } from 'react';
import styles from "./Switcher.module.css";

class Switcher extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value || false,
        }
    }

    handleSwitchChange = () => {
        // console.log('handleSwitchChange');
        this.setState({
            value: !this.state.value
        });

        if (this.props.onChange) {
            this.props.onChange(!this.state.value);
        } 

    }

    render() {
        return (
            <div className={styles.switcherWrapper}>
                <div className='custom-control custom-switch' onClick={this.handleSwitchChange}>
                    <input
                        checked={this.state.value}
                        type='checkbox'
                        className='custom-control-input'
                        readOnly
                    />
                    <label className='custom-control-label' htmlFor='customSwitches'>
                        {
                            (!this.state.value && this.props.offLabel)
                                ? this.props.offLabel
                                : this.props.label
                        }
                    </label>
                </div>
            </div>
        );
    }
}

export default Switcher;