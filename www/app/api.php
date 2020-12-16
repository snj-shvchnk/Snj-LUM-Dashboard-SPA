<?php
class ApiController {
    public function init( $dbContext ) {
        $this->DBC = $dbContext;
    }

    public function process($model, $data1, $data2) { 
        switch ($model) {
            case "dashboard":  
                $this->processDashboard();  
                break;

            case "interventions": 
                $this->processInterventions($data1, $data2);
                break;

            case "devices": 
                $this->processDevices($data1, $data2); 
                break;

            default: echo "404 Not found";
        }
    }

    public function processDashboard() {
        $responce = array();
        $responce['deviceActivity'] = $this->DBC->dataset_DeviceActyvity();
        $responce['table'] = $this->DBC->dataset_InterventionsList(NULL, NULL);
        $this->JSONResponce($responce);
    }

    public function processDevices($type, $id) {
        switch ($type) {

            case "table": 
                $responce = array();
                $responce['table'] = $this->DBC->dataset_UserDevicesList();
                $this->JSONResponce($responce);
                break;

            case "user":
                $responce = array();
                $responce['user'] = $this->DBC->dataset_PatientInfo(NULL, $id); 
                $this->JSONResponce($responce);
                break;

            case "device":
                $responce = array();
                // Get current device info
                $responce['device'] = $this->DBC->dataset_DeviceInfo($id)[0];
                // Get 'Other devices'
                $responce['related'] = 
                    $this->DBC->dataset_DeviceInfo(null, $responce['device']['lumi_patient_id'], $id);
                $this->JSONResponce($responce);
                break;

            default: echo "404 Not found";
        }
    }

    public function processInterventions($type, $id) {
        switch ($type) {

            case "table": 
                $responce = array();
                $responce['table'] = $this->DBC->dataset_InterventionsList($id, NULL);
                $this->JSONResponce($responce);
                break;

            case "user":
                // var_dump($type, $id);die();
                $responce = array();
                $responce['user'] = $this->DBC->dataset_PatientInfo($id, NULL); 
                $this->JSONResponce($responce);
                break;

            case "medication":
                $responce = array();
                $responce['medicationData'] = $this->DBC->dataset_UserMedication($id, NULL);
                $this->JSONResponce($responce);
                break;

            case "data":
                // var_dump($type, $id);die();
                $responce = array();
                $devices = $this->DBC->dataset_UserDevicesList($id); 

                if (is_array($devices)) {
                    foreach ($devices as &$device) {

                        $d_type = strtolower(trim($device['d_type']));
                        $deviceData = array();
                        switch ($d_type) {
                            case 'bp':
                                //  'Bp';
                                $deviceData = $this->DBC->dataset_DeviceValues_BP($device['id']);
                                break;
                            case 'scale':
                                // echo 'Scale';
                                $deviceData = $this->DBC->dataset_DeviceValues_Scale($device['id']);
                                break;
                            default:
                                echo 'Deffault';
                        }
                        $device['data'] = $deviceData;
                    }
                }

                // BackTools::dev_dump($devices, true);
                $responce['devices'] = $devices;
                $this->JSONResponce($responce);
                break;

            default: echo "404 Not found";
        }
    }

    private function JSONResponce($data) {
        $json_responce = json_encode($data);
        echo $json_responce;
        die();
    }
}