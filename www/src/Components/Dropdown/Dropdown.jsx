import React from "react";
import styles from "./Dropdown.module.css";
import {
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
} from "mdbreact";
export default function Dropdown() {
    return (
        <MDBDropdown className={styles.dropdown} color="default">
            <MDBDropdownToggle caret>MDBDropdown</MDBDropdownToggle>
            <MDBDropdownMenu basic>
                <MDBDropdownItem>Action</MDBDropdownItem>
                <MDBDropdownItem>Another Action</MDBDropdownItem>
                <MDBDropdownItem>Something else here</MDBDropdownItem>
                <MDBDropdownItem>Separated link</MDBDropdownItem>
            </MDBDropdownMenu>
        </MDBDropdown>
    );
}
