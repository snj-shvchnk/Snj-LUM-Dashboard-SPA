import React from 'react'
import Loader from '../../Components/Loader'
import Api from '../../Services/Api'
import styles from './ApiDev.module.css'

export default class ApiDev extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            url: 'data/user/7',
            responce: '',
            loading: false,
        }
    }

    saveUrl = (e) => {
        this.setState({ url: e.target.value });
    }

    fetchApi = () => {
        if (this.state.loading) return;

        this.setState({ loading: true });
        const api = new Api();

        api.ajax( this.state.url, 'GET', {},
            (responce) => {
                this.setState({
                    responce, 
                    loading: false,
                });
            }
        );
    }

    render () {
        return (
            <div className={styles.apiDevWrapper}>
                <div>
                    <h1>API Development:</h1>
                    <p>
                        <input id="api-url-inp" type="text" value={this.state.url} onChange={this.saveUrl} />
                        &nbsp;
                        <button onClick={this.fetchApi}>FETCH</button>
                    </p>
                    <p>
                        Preview url:&nbsp;
                        <b style={{ fontWeight: 'bold', color: '#333' }}>
                            {this.state.url}
                        </b>
                    </p>
                    <hr/>
                </div>
                <div id="api-responce" className={styles.apiDevResponce}>
                    {
                        this.state.loading
                            ? <Loader />
                            : <div dangerouslySetInnerHTML={{ __html: this.state.responce }} />
                    }
                </div>
            </div>
        )
    }
}
