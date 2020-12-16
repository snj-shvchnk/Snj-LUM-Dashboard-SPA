import React from "react";

function InsertHTML({ html, className }) {
    const thisIsMyCopy = html;

    return (
        <div className={className} dangerouslySetInnerHTML={{ __html: thisIsMyCopy }} />
    );
}

export default InsertHTML;
