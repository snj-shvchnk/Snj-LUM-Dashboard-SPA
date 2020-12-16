import { Field } from 'formik';
import InsertHTML from '../InsertHtml';
import styles from './Question.module.css';

export default function Question({ title, name, choices }) {
    return (
        <>
            <div role="group" aria-labelledby="my-radio-group">
                <InsertHTML html={title} className="quiz-title" />
                <div className={styles.labelGroup}>
                    {choices.map((choice, index) => {
                        const { value, text } = choice;
                        return (
                            <label className={styles.label} key={`label_${value}_${index}`}>
                                <Field type="radio" name={name} value={value} />
                                {text}
                            </label>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
