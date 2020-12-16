import React from 'react';
import styles from './PatientDetails.module.css';

class PatientDetails extends React.Component {
    constructor(props) {
        // console.log('User loaded:', { ...props });
        super(props);
    }

    formatPhone = (str) => {
        let cleaned = ('' + str).replace(/\D/g, '');
        let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      
        return (match)
            ? ('(' + match[1] + ') ' + match[2] + '-' + match[3])
            : str;
    };

    render() {
        // console.log('PatientDetails', { props: this.props });
        const { data, goToMedicalRecord } = this.props;

        return (
            data 
            ?
            <div className={styles.patientDetails}>
                <div className={styles.patientDetailsList}>

                    {(
                        data?.diagnosis_list.length
                        ?
                        <>
                            <div className={styles.patientDetailsTitle}>Diagnosis</div>
                            <ul>
                                { data.diagnosis_list.map((d,i) => 
                                    d.title 
                                        ? 
                                        <li key={`diagnosis${i}`}>{d.title} { d.subtitle ? <span>({d.subtitle})</span> : null }</li>
                                        :
                                        <li key={`diagnosis${i}`}>{d}</li>
                                    )
                                }
                            </ul>
                        </>
                        : null
                    )}
                    
                    {(
                        data?.medications_list.length
                        ?
                        <>
                            <div className={styles.patientDetailsTitle}>Medications</div>
                            <ul>
                                { 
                                    data.medications_list.map((d, i) => 
                                        d.title 
                                        ? 
                                        <li key={`medications${i}`}>{d.title} { d.subtitle ? <span>({d.subtitle})</span> : null }</li>
                                        :
                                        <li key={`medication${i}`}>{d}</li>
                                    )
                                }
                            </ul>
                        </>
                        : null
                    )}

                </div>

                <div className={styles.patientDetailsList}>

                    {(
                        data?.contacts.length
                        ?
                        <>
                            {
                                data.contacts.map(
                                    (m,i) => (
                                        <div className={styles.patientDetailsRow} key={`doctors${i}`}>
                                            {m.specialization}: <span>{m.name}</span> 
                                            { m.phone && <span className="pull-r col-gr">{this.formatPhone(m.phone)}</span> }
                                        </div>
                                    )
                                )
                            }
                        </>
                        : null
                    )}

                    <a href="#!" onClick={goToMedicalRecord}>Medical Record</a>

                </div>
            </div>
            :
            <div className="noDataHint">
                Nothing selected
                <div>Select some intervention for view details</div>
            </div>
        );
    }
}

export default PatientDetails;