<?php
include 'db.php';

class dbContext {
    private $dbAdapter;
    private $dbAccess;

    // DAL Initialization
    public function init($dbhost, $dbuser, $dbpass, $dbname) {
        $this->dbAccess = [ $dbhost, $dbuser, $dbpass, $dbname ];
        $this->dbAdapter = new DB($this->dbAccess);
    }

    // method for checking initialization result
    public function isInited() {
        return isset($this->dbAdapter);
    }

    // public wrapper for DAL
    public function _DB () {
        return $this->dbAdapter;
    }



    /**
     * 
     * DataSets is started heare...
     * 
     */
    
    // Single User DataSet:
    public function dataset_User($userId) {
        return  DB::getRow("
SELECT 
    p.id, 
    care_team_member_type,
    government_id,
    first_name,
    middle_name,
    last_name,
    dob,
    gender,
    phone_number,
    email,
    p.created_at,
    p.modified_at,
    login,
    password,
    roleId,
    CONCAT('role_', roleId) as role,
    permissions,
    company,
    position,
    photo
FROM Care_Team_Member_Profile p
INNER JOIN Care_Team_Member_Profile_Extended e
ON p.id=e.linkId
WHERE p.id=?         
            ", 
            [$userId]
        );
    }


    // Devices page:
    // - Main table data
    public function dataset_UserDevicesList($userId = -1) {
        $data = DB::getRows("
SELECT 

    d.id,
    d.id as patient_device_id,
    
    d.type AS d_type,
    d.model AS d_model,
    
    d.ship_date,
    d.deliviered_date,
    d.activated_date,
    IF( ISNULL(d.activated_date), NULL, l.reading_datetime ) 
            AS last_reading,
    
    d.lumi_patient_id,
    p.first_name AS p_first_name,
    p.middle_name AS p_middle_name,
    p.last_name AS p_last_name
    
FROM `Patient_Device` d
LEFT JOIN (
    SELECT m.patient_device_id, 
        MAX(m.reading_datetime) as reading_datetime 
        FROM (
            SELECT 
                s.patient_device_id, 
                MAX(s.reading_datetime) as reading_datetime
            FROM `Patient_Device_Scale` s
            GROUP BY s.patient_device_id
            UNION
            SELECT 
                b.patient_device_id, 
                MAX(b.reading_datetime) as reading_datetime
            FROM `Patient_Device_BP` b
            GROUP BY b.patient_device_id
        ) m
        GROUP BY patient_device_id
        ORDER BY reading_datetime DESC
    ) l 
ON l.patient_device_id = d.id
LEFT JOIN `Patient_Demographic` p ON d.lumi_patient_id = p.lumi_patient_id
WHERE (? = -1) OR (? = p.lumi_patient_id)
-- p.lumi_patient_id = 20
                "
             , [$userId, $userId]
            );

        return $data;
    }


    public function dataset_InterventionsList($uid, $iid) {
        return DB::getRows("
SELECT
    i.id,
    i.lumi_patient_id,
    i.care_team_member_id,
    i.intervention_code_id,
    i.patient_device_id,
    i.priority,
    i.is_complete,
    i.due_date,
    i.estimated_time,
    i.created_at,
    i.modified_at,
    
    c.name as d_type,

    p.first_name,
    p.middle_name,
    p.last_name,
    p.dob,
    p.gender,
    p.primary_phone,
    p.primary_phone_type,
    p.secondary_phone,
    p.secondary_phone_type,

    r.met_daily_target,
    l.reading_datetime,
    IF(
        DATE(l.reading_datetime) = DATE('2020-12-14'), 
        IF(met_daily_target = 0, 1, 0), -1
    ) as off_target
    
FROM `Interventions` i
LEFT JOIN `Intervention_Codes` c ON c.id = i.intervention_code_id
LEFT JOIN `Patient_Demographic` p ON i.lumi_patient_id = p.lumi_patient_id
LEFT JOIN `Patient_Target_Results` r 
ON (
    r.lumi_patient_id = p.lumi_patient_id 
    AND (
        r.bp_device_id = i.patient_device_id 
        OR
        r.scale_device_id = i.patient_device_id
    )
)
LEFT JOIN (
    SELECT m.patient_device_id, 
        MAX(m.reading_datetime) as reading_datetime 
        FROM (
            SELECT 
                s.patient_device_id, 
                MAX(s.reading_datetime) as reading_datetime
            FROM `Patient_Device_Scale` s
            GROUP BY s.patient_device_id
            UNION
            SELECT 
                b.patient_device_id, 
                MAX(b.reading_datetime) as reading_datetime
            FROM `Patient_Device_BP` b
            GROUP BY b.patient_device_id
        ) m
        GROUP BY patient_device_id
        ORDER BY reading_datetime DESC
    ) l 
ON l.patient_device_id = i.patient_device_id

-- WHERE care_team_member_id = ? OR i.id = ?
        ", [ $uid, $iid ]);
    }
// public function dataset_InterventionsList($uid, $iid) {
//     return DB::getRows("
// SELECT
//     i.id,
//     i.lumi_patient_id,
//     i.care_team_member_id,
//     i.intervention_code_id,
//     i.patient_device_id,
//     i.priority,
//     i.is_complete,
//     i.due_date,
//     i.estimated_time,
//     i.created_at,
//     i.modified_at,
  
//     c.name as d_type,

//     p.first_name,
//     p.middle_name,
//     p.last_name,
//     p.dob,
//     p.gender,
//     p.primary_phone,
//     p.primary_phone_type,
//     p.secondary_phone,
//     p.secondary_phone_type,
  
//     d.id as d_id,
//     -- d.type as d_type,
//     d.manufactor,
//     d.model,
//     d.serial,
//     d.ship_date,
//     d.deliviered_date,
//     d.activated_date
  
// FROM `Interventions` i
// LEFT JOIN `Intervention_Codes` c ON c.id = i.intervention_code_id
// LEFT JOIN `Patient_Demographic` p ON i.lumi_patient_id = p.lumi_patient_id
// LEFT JOIN `Patient_Device` d ON d.id = i.patient_device_id

// WHERE care_team_member_id = ? OR i.id = ?
//     ", [ $uid, $iid ]);
// }



    public function dataset_PatientInfo($pid=-1, $did=-1) {
        $data = DB::getRow("
SELECT
    p.lumi_patient_id,
    p.source_system_patient_id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.dob,
    p.gender,
    p.primary_phone,
    p.primary_phone_type,
    p.secondary_phone,
    p.secondary_phone_type,
    p.created_at,
    p.modified_at
FROM `Patient_Demographic` p
LEFT JOIN `Patient_Device` d
ON d.lumi_patient_id = p.lumi_patient_id
WHERE p.lumi_patient_id=? OR d.id=?
                ", [$pid, $did]
            );

        return $data;
    }


    public function dataset_DeviceInfo($did=-1, $pid=-1, $except=-1) {
        $data = DB::getRows("
    SELECT
        id,
        d.lumi_patient_id,
        type,
        manufactor,
        model,
        serial,
        ship_date,
        deliviered_date,
        d.activated_date,
        IF( ISNULL(d.activated_date), NULL, l.reading_datetime ) 
            AS last_reading,
        created_at,
        modified_at
    FROM `Patient_Device` d
    LEFT JOIN (
    SELECT m.patient_device_id, 
        MAX(m.reading_datetime) as reading_datetime 
        FROM (
            SELECT 
                s.patient_device_id, 
                MAX(s.reading_datetime) as reading_datetime
            FROM `Patient_Device_Scale` s
            GROUP BY s.patient_device_id
            UNION
            SELECT 
                b.patient_device_id, 
                MAX(b.reading_datetime) as reading_datetime
            FROM `Patient_Device_BP` b
            GROUP BY b.patient_device_id
        ) m
        GROUP BY patient_device_id
        ORDER BY reading_datetime DESC
    ) l 
    ON l.patient_device_id = d.id
    WHERE (d.id=? OR lumi_patient_id=?)
    AND d.id!=?
                ", [$did, $pid, $except]
            );

        return $data;
    }

    public function dataset_DeviceValues_BP($did=-1) {
        $data = DB::getRows(
            "
SELECT
    d.id,
    d.lumi_patient_id,
    d.patient_device_id,
    
    d.reading_datetime,
    d.diastolic_value,
    d.systolic_value,
    d.created_at,
    d.modified_at
            
FROM `Patient_Device_BP` d
WHERE d.patient_device_id = ?
AND reading_datetime > NOW() - INTERVAL 1 YEAR
            ", [$did]
        );      
        return $data;
    }

    public function dataset_DeviceValues_Scale($did=-1) {
        $data = DB::getRows(
                "
SELECT
    d.id,
    d.lumi_patient_id,
    d.patient_device_id,

    d.reading_datetime,
    d.weight_lbs,
    d.created_at,
    d.modified_at

FROM `Patient_Device_Scale` d
WHERE d.patient_device_id = ?
AND reading_datetime > NOW() - INTERVAL 1 YEAR
                ", [$did]
            );
        return $data;
    }

    public function dataset_UserMedication($uid=-1) {
        $medical = DB::getRow("
SELECT
    p.lumi_patient_id,
    (
        SELECT GROUP_CONCAT(DISTINCT m.generic_name SEPARATOR '|') 
        FROM `Patient_Medication` m 
        WHERE m.lumi_patient_id = p.lumi_patient_id
    ) AS medications_list,
    (
        SELECT GROUP_CONCAT(DISTINCT d.icd10_name SEPARATOR '|') 
        FROM `Patient_Diagnosis` d
        WHERE d.lumi_patient_id = p.lumi_patient_id
    ) AS diagnosis_list
FROM `Patient_Demographic` p
WHERE p.lumi_patient_id = ?
                ", [$uid]
            );

        $team = DB::getRows("
SELECT
    t.lumi_patient_id,
    t.care_team_member_id,
    t.relationship_type_id,
    r.relationship_description as specialization,
    CONCAT(p.first_name, ' ', p.last_name) as name, 
    p.phone_number as phone
FROM `Patient_Care_Team` t
LEFT JOIN `Care_Team_Relationship` r ON t.relationship_type_id = r.id
LEFT JOIN `Care_Team_Member_Profile` p ON p.id = t.care_team_member_id
WHERE t.lumi_patient_id = ?
GROUP BY (t.relationship_type_id)
ORDER BY t.relationship_type_id DESC
                ", [$uid]
            );

        $data = array();
        $data['medications_list'] = explode("|", $medical['medications_list']);
        $data['diagnosis_list'] = explode("|", $medical['diagnosis_list']);
        $data['contacts'] = $team;

        return $data;
    }

    public function dataset_DeviceActyvity() {
        $data = DB::getRows(
            "
SELECT 
    u.date,
    COUNT(u.id) as count,
    d.total
FROM (
    SELECT
        patient_device_id as id,
        DATE(reading_datetime) date,
        COUNT(patient_device_id)
    FROM `Patient_Device_BP` b
    GROUP BY date, patient_device_id

    UNION 

    SELECT
        patient_device_id as id,
        DATE(reading_datetime) date,
        COUNT(patient_device_id)
    FROM `Patient_Device_Scale` 
    GROUP BY date, patient_device_id
) u

LEFT JOIN (
    SELECT COUNT(id) as total
    FROM Patient_Device
) d ON 1=1
GROUP BY date
ORDER BY date
        ");      

        return $data;
    }   

}
