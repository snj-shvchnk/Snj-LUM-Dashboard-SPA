import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import styles from './QuizModal.module.css';
import icons from '../icons'
const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        position: "relative",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "8px",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        padding: "40px",
    },
}));

export default function QuizModal() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [validate, setValidate] = React.useState("");
    const [error, setError] = React.useState(false);

    const handleOpen = () => {
        setValidate("");
        setError(false);
        setOpen(true);
    };

    const handleClose = () => {
        if (validate != "") {
            // console.log(validate.length);
            setOpen(false);
        } else {
            setError(true)
            return false
        }
    };


    return (
        <div>
            <button type="button" onClick={handleOpen} className={styles.openModal}>Reject</button>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className={classes.paper}>
                        <i className={styles.close} onClick={() => setOpen(false)}>{icons.close}</i>
                        <h2 id="transition-modal-title" className={styles.title}>Reject Intervention</h2>
                        <p id="transition-modal-description" className={styles.question}>Are you sure you want to reject this intervention for Bob Smith?</p>
                        <p className={styles.textareaTitle}>Why?</p>
                        <form onSubmit={handleClose}>
                            <textarea className={error ? styles.textareaError : styles.textarea} id="textarea" onChange={(e) => {
                                const target = e.target;
                                setValidate(target.value);
                            }} />

                            <div className={error ? styles.validate : styles.validateFalse}>This field is required.</div>

                            <div className={styles.buttons}>
                                <div className={styles.back} onClick={() => setOpen(false)}>Back</div>
                                <div className={styles.reject} onClick={() => handleClose()} >Yes, reject</div>
                            </div>
                        </form>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
}