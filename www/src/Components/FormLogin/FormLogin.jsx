import React from 'react'
import icons from '../icons'
import styles from './FormLogin.module.css';
import './FormLogin.css'
import { MDBBtn } from 'mdbreact';

export default class FormLogin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
            keepIn: false,
        }
    };

    componentDidMount() {
        // MOQ
        setTimeout(() => {
            this.setState({ login: 'Suzie@lumihealth.com' });
            setTimeout(() => {
                this.setState({ password: '777' });
            }, 1000)
        }, 3000);
    }

    handleKeep = () => {
        this.setState({
            keepIn: !this.state.keepIn,
        })
    };

    onLoginChange = (e) => {
        this.setState({ login: e.target.value });
    }

    passwordChange = (e) => {
        this.setState({ password: e.target.value });
    }

    submitHandler = () => {
        const loginData = { ...this.state };

        this.props.onSubmit(
            loginData,
        );
    }

    render () {
        const { keepIn } = this.state;
        
        return (
            <>
                <div className={styles.section}>
                    <div className={styles.title}>Sign In</div>
                    <form className={styles.form}>
                        <label htmlFor="defaultFormLoginEmailEx" className={styles.label}>
                            YOUR USERNAME OR E-MAIL
                        </label>
                        <input 
                            type="email" 
                            onChange={this.onLoginChange} 
                            id="defaultFormLoginEmailEx" 
                            className={`form-control ${styles.input}`}
                            value={this.state.login}
                            ref={(e) => { this.inputLogin = e; }}
                        />
                        <br />
                        <label htmlFor="defaultFormLoginPasswordEx" className={styles.label}>
                            PASSWORD
                        </label>
                        <input 
                            type="password" 
                            onChange={this.passwordChange} 
                            id="defaultFormLoginPasswordEx" 
                            className={`form-control ${styles.input}`} 
                            value={this.state.password}
                            ref={(e) => { this.inputPassword = e; }}
                        />
                        <div className={styles.validate}>
                            <div className={`${styles.keep} ${keepIn ? 'check' : ''}`} onClick={this.handleKeep}>
                                <div className="icon-check">{icons.check}</div>
                                Keep me signed in
                            </div>
                            <div className={styles.forgot}>Forgot Password?</div>
                        </div>
                        <div className="text-center mt-4">
                            <MDBBtn color="signin" type="button" onClick={this.submitHandler} className={styles.signin}>SIGN IN</MDBBtn>
                            <div className={styles.google}>{icons.google}LOGIN WITH GOOGLE</div>
                        </div>
                        <div className={styles.logoTraced}>{icons.logoTraced}</div>
                    </form>
                    
                    <div className={styles.signup}>Not Registered? Sign Up</div>
                </div>
            </>
        )
    }
    
}
