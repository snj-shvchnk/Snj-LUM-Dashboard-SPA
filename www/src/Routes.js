import React from "react";
import { Switch, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Interventions from "./Pages/Interventions";
import Devices from "./Pages/Devices";
import LoginPage from "./Pages/LoginPage";

/* Development section: */
import ApiDev from "./Pages/ApiDev";


const Routes = () => {
    return (
        <Switch>
            <Route exact path="/login" component={LoginPage} />

            <Route exact path="/" component={Dashboard} />
            <Route exact path="/interventions/" component={Interventions} />
            <Route exact path="/devices/" component={Devices} />

            {/* Development section: */}
            <Route exact path="/apidev/" component={ApiDev} />
        </Switch>
    );
};

export default Routes;
