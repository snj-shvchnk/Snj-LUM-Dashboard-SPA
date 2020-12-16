import React from "react";
import { Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import styles from "./App.module.css";
import SideNav from "../SideNav";
import Routes from "../../Routes";
import Wrapper from "../Wrapper";
import LoginPage from "../../Pages/LoginPage";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            logedIn: this.getAuthCookie('luminauth'),
        }
    }

    setAuthCookie = (c_name, value, exdays) => {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }
    
    getAuthCookie = (c_name) => {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x === c_name) {
                return unescape(y);
            }
        }
        return false;
    }

    onLogIn = ({ login, password, keepIn }) => {
        // console.log('onLogIn', {login, password});
        this.checkAuth(login, password);
    }

    onSuccessfullAutorization = () => {
        this.setAuthCookie('luminauth', 1, 1);
        this.setState({
            logedIn: true,
        });
    }

    onLogOut = () => {
        this.setAuthCookie('luminauth', 1, -1);
        this.setState({
            logedIn: false,
            credentialsAccepted: false,
        });
    }

    checkAuth = (login, password) => {
        login = (login || '').toLowerCase().trim();
        password = (password || '').trim();

        // mind that we going to DB by Ajax
        setTimeout(() => {
            if (login === 'suzie@lumihealth.com' && password === '777')
                this.onSuccessfullAutorization();
        }, 300);
    };

    collapseSidebar = (value) => {
        const sidebarCollapsed = 
            (typeof value === 'undefined') 
                ? !this.state.sidebarCollapsed
                : value;

        this.setState({ sidebarCollapsed });
    }

    render () {

        if (!this.state.logedIn) {
            return (
                <LoginPage 
                    onLogIn={this.onLogIn}
                    onCaming={this.onCaming} 
                />
            );
        }

        const navBar = () =>  <SideNav onLogOut={this.onLogOut} />
        return (
            <div className={`${styles.app} app-container`}>
                <Route path="/" component={navBar} />
                <Wrapper>
                    <Routes />
                </Wrapper>
            </div>
        );
    }
}


export default App;
