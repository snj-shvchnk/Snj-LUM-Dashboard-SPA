import React from 'react'
import styles from './Profile.module.css'
import icons from '../icons'

export default function Profile({ 
    id,
    name,
    photo,
    sex,
    age,
    phones,
}) {

    const sexName = sex ? 'men' : 'women';
    const avatar =
        // /bob.png
        `https://randomuser.me/api/portraits/${sexName}/${id || age || name.length}.jpg`;

    const formatPhone = (str) => {
        let cleaned = ('' + str).replace(/\D/g, '');
        let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      
        return (match)
            ? ('(' + match[1] + ') ' + match[2] + '-' + match[3])
            : str;
    };

    return (
        <div className={styles.profile} key={id}>
            <div className={styles.imageHolder}>
                <img src={avatar} alt={name} />
            </div>
            <div className={styles.profileCard}>
                
                <div className={styles.profileName}>{name}</div>
                
                <div className={styles.profileData}>
                    <i className={styles.icon}>
                        { (sex === 1) ? icons.male : icons.female }
                    </i>
                    <div className={styles.profileItem}>
                        <span className={styles.gender}>{ (sex === 1) ? 'Male' : 'Female' }</span>
                        <span className={styles.ageLabel}>Age:</span>
                        <span className={styles.ageValue}>{age}</span>
                    </div>
                </div>

                <div className={styles.profileData}>
                    <i className={styles.icon}>
                        { icons.phone }
                    </i>
                    <div className={styles.profileItem}>
                        <div className={styles.phoneItem}>
                            <span className={`${styles.phoneType} phoneType`}>Primary:</span>
                            <span className={styles.phoneNumber}>{formatPhone( phones[0] )}</span>
                        </div>
                        {
                            phones[1] &&
                            <div className={styles.phoneItem}>
                                <span className={`${styles.phoneType} phoneType`}>Secondary:</span>
                                <span className={styles.phoneNumber}>{formatPhone( phones[1] )}</span>
                            </div>
                        }
                    </div>
                </div>

                <div className={styles.profileData}>
                    <i className={styles.icon}>{ icons.id }</i>
                    <div className={styles.profileItem}>
                        <span className={styles.profileId}>{id}</span>
                    </div>
                </div>

            </div>
        </div>
    )
}
