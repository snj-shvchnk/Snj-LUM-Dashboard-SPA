import React from 'react'
import styles from './Quiz.module.css';
import { Formik, Form } from 'formik';
import Collapser from "../Collapser";
import dataJSON from './form.json';
import InsertHTML from '../InsertHtml';
import Question from './Question';
import QuizModal from '../QuizModal';

export default function Quiz() {
    const pages = dataJSON.pages;
    return (
        <>
            <div className={styles.quiz}>
                <Formik
                    initialValues={{ }}
                    onSubmit={async (values) => {
                        // await new Promise((r) => setTimeout(r, 500));
                        // alert(JSON.stringify(values, null, 2));
                    }}
                >
                    {({ values }) => (
                        <Form className={styles.form}>
                            <div className={styles.questions}>
                                {pages.map((page, i) => {
                                    return (
                                        <Collapser title={page.title} collapsed={!!i} key={`page-${page.id}_${i}`}>

                                            <InsertHTML html={page.description} className="question-description" />

                                            {page.elements.map(({ type, name, html, title, choices }, j) => {
                                                return (
                                                    (type === 'html')
                                                    ? 
                                                    <InsertHTML html={html} className="question-title" key={`content-${page}-${j}`} />
                                                    :
                                                    <Question title={title} name={name} choices={choices} key={`quest-${page}-${j}`}/>
                                                );
                                            })}
                                        </Collapser>
                                    )
                                })}
                            </div>
                            <div className={styles.buttons}>
                                <QuizModal />
                                <button type="submit" className={styles.submit}>Complete</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <style>{`
            .question-title h3{
                font-size: 14px;
                text-transform: uppercase;
                font-weight: 700;
                color: #666666;
            }
            .question-description *{
                color: #666666;
                font-size: 12px;
                line-height: 14px;
                letter-spacing: -0.03em;
                margin-bottom: 20px;
            }
     `}</style>
        </>
    );

}





