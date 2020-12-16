import React from "react";
import styles from "./Devices.module.css";
import Api from '../../Services/Api';
import RoundChart from "../../Components/RoundChart";
import DataTable from "../../Components/DataTable/DataTable";
import Profile from "../../Components/Profile";
import Loader from "../../Components/Loader";
import Select from 'react-select'
import PointText from "../../Components/PointText";
import Tools from '../../Services/Tools';

export default class Devices extends React.Component {
    constructor(props) {
        super(props);

        this.statuses = {
            active: { id: 4, title: 'Active', color: '#00ae8b', colorPassive: '#7bd2c2', class: 'dt-active-dot' },
            delivered: { id: 2, title: 'Delivered', color: '#ff8625', colorPassive: '#fabe8e', class: 'dt-delivered-dot' },
            shipped: { id: 3, title: 'Shipped', color: '#edcd68', colorPassive: '#f0e1af', class: 'dt-shipped-dot' },
            disconnected: { id: 1, title: 'Disconnected', color: '#ef476a', colorPassive: '#f29fb1', class: 'dt-disconnected-dot' },
        };

        this.daysOfflineForDisconnected = 7;

        this.lastFilterHash = '';

        this.state = {
            profileData: null,
            profileId: 0,

            table: null,
            loaded: false,

            controls: null,

            deviceData: null,
            deviceId: 0,
        }

        this.chartOptions = { 
            cutoutPercentage: 20,
            tooltips: { enabled: false },
            hover: { animationDuration: 100 },
            borderAlign: 'inner',
        };

        this.lastAjaxCalling = Date.now();
        this.ajaxWaitingTimer = null;

        this.ajaxTimer_profile = Tools.debounce((diviceId) => {
            this.loadProfile(diviceId);
        }, 100);

        this.ajaxTimer_device = Tools.debounce((diviceId) => {
            this.loadAdditionals(diviceId);
        }, 200);
    };

    componentDidMount() {
        this.loadTableData();
    };

    componentWillUnmount() {

    }

    onProfileLoaded = (profile) => {
        this.setState({
            profileData: profile,
            profileId: profile.id,
        });
    };

    onAdditionalLoaded = (additional) => {
        this.setState({
            deviceData: additional,
            deviceId: additional.device.id,
        });
    };

    loadTableData = () => {
        if (this.state.loading) return;
        this.setState({ loading: true });

        // check data in cache
        const { cachedData_table, cachedData_controls } = this;
        if (cachedData_controls && cachedData_table) {
            this.onTableDataLoaded({ 
                table: cachedData_table, 
                controls: cachedData_controls,
            });
            return;
        }

        const api = new Api({ endpointUrl: this.baseUrl });

        // Rows:
        // [{ statusId: 1, status: 'Active', days: 23, patientId: 0, patientName: 'Jack Ryan', deviceTypeId: 0, deviceTypeName: 'BP Monitor'  },];

        api.ajax('devices/table/0', 'GET', {},
            (responce, request) => {
                // console.log('JSON API Responce:', { responce, request });
                let model = JSON.parse(responce) || {};
                model.table = model.table || [];
                // sg({ model });

                // Format raw data
                model = this.convertData(model);

                // Sorting
                model.table = this.sortTable(model.table);

                // Add (1) count
                model.deviceTypes.forEach((item, index, entity) => {
                    if (item.value)
                        entity[index].label += ` (${item.count})`
                });

                const controls = { 
                        deviceTypes: model.deviceTypes,
                        // deviceTypes: [
                        //     { value: 0, label: 'All' },
                        //     { value: 1, label: 'BP Monitor' },
                        //     { value: 2, label: 'Weight Scale' },
                        // ],
                    };

                const table = {
                    head: [ 
                        { id: 1, title: 'Status' }, 
                        { id: 2, title: 'Days' }, 
                        { id: 3, title: 'Patient name' }, 
                        { id: 4, title: 'Device type' },
                        { id: 5, title: 'Device model' },
                    ],
                    data: model.table,
                };
                
                // console.log({ table, controls });
                this.cachedData = this.cachedData || {};
                this.cachedData.table = table;
                this.cachedData.controls =  controls;

                this.onTableDataLoaded({ table, controls });
            }
        );
    }

    determinateDeviceStatus = (item) => {
        let statusDate;
        let status;
        // console.log('Item determination:', { item });
        
        if ( item.ship_date ) {
            status = this.statuses.shipped;
            statusDate = item.ship_date;
        }

        if ( item.deliviered_date ) {
            status = this.statuses.delivered;
            statusDate = item.deliviered_date;
        }

        if ( item.activated_date ) {
            status = this.statuses.active;
            statusDate = item.activated_date;

            item.daysOffline = this.daysDifference(item.last_reading);
            // console.log({ daysOffline: item.daysOffline });
            // device is disconnected after one week after last connection
            if (!item.last_reading || item.daysOffline > this.daysOfflineForDisconnected) {
                status = this.statuses.disconnected;
                statusDate = item.last_reading || statusDate;
            }
        }

        // console.log('Item determination DONE', { status, statusDate });
        return { status, statusDate };
    }

    convertData = (model) => {
        const deviceTypes = [{ value: 0, label: 'All' }];
        model.table.forEach((item, index, entity) => {
            // console.log('DEVICES.convertData', { item, index, entity });
            
            const { status, statusDate } = this.determinateDeviceStatus(item);

            item.status = status || {};
            item.statusTitle = item.status.title;
            item.statusDate = statusDate || '-';
            item.d_type = (item.d_type || '').trim();

            // add DISTINCTED device type
            if (!deviceTypes.filter(f => f.label === item.d_type).length) {
                deviceTypes.push({ 
                    value: deviceTypes.length,
                    label: item.d_type,
                    d_type: item.d_type,
                    count: 1,
                    });
            } else {
                deviceTypes.filter(f => f.label === item.d_type)[0].count++;
            }

            entity[index] = {
                data: item,
                cells: [
                    { 
                        content: status ? status.title : '-', 
                        classes: status ? [status.class, 'dt-dot'] : [], 
                    },
                    (statusDate ? this.daysDifference(statusDate) : '-'),
                    {
                        content: `${item.p_first_name} ${item.p_last_name}`,
                        classes: [ 'dt-link' ], 
                        profileId: item.id,
                        // deviceId: 
                    },
                    item.d_type,
                    item.d_model,
                ],
            }
        });

        model.deviceTypes = deviceTypes;
        return model;
    }

    daysDifference = (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(date1);
        const secondDate = date2 ? new Date(date2) : new Date();
        const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
        return diffDays;
    }

    sortTable = (table) => {
        // console.log(table);
        table.sort(
            (row1, row2) => {
                // console.log({row1, row2});
                return row1.data.status.id - row2.data.status.id;
            }
        );
        return table;
    }

    onTableDataLoaded = ({ table, controls }) => {
        // console.log('onTableDataLoaded', { table, controls });

        this.setState({
            table, 
            controls,
            loading: false,
        });
    }

    onTableCellClick = (data) => {
        // console.log('onTableCellClick HANDLER', { data });
        // SET ROW SELECTED...
        const deviceId = data?.row.data.patient_device_id;
        const profileId = data?.row.data.lumi_patient_id;
        
        if (profileId && deviceId) {
            // console.log('Cell data', { profileId, deviceId });
            this.reloadProfile(deviceId);
            this.reloadAdditionals(deviceId);
        }
    };

    onTableSelection = (selected, deselected, data, scroll) => {
        // console.log({ selected, deselected, data, scroll });
        if (scroll && this.tableScroll) {
            const top = this.tableScroll.scrollTop;

            const srow = this.tableScroll.getElementsByClassName('dtRowSelected')[0];
            if (!srow) return;

            let bais = 0;
            bais = srow[(selected > deselected) ? 'previousSibling' : 'nextSibling']?.offsetHeight ?? 0;

            this.tableScroll.scrollTo({ 
                top: (top + ((selected-deselected)*bais)), 
                // behavior: 'smooth',
            });
        }
    };

    clearProfile = () => {
        this.setState({
            profileData: false,
            profileId: 0,
        });
    };

    clearAdditionals = () => {
        this.setState({
            deviceId: 0,
            deviceData: null,
        });
    };

    reloadProfile = (did) => {
        this.clearProfile();
        this.ajaxTimer_profile(did);
    };

    reloadAdditionals = (did) => {
        this.clearAdditionals();
        this.ajaxTimer_device(did);
    }

    loadProfile = (did) => {
        // console.log('Devices.loadProfile', { uid: did });
        const api = new Api({ endpointUrl: this.baseUrl });
        api.ajax( `devices/user/${did}`, 'GET', {},
            (responce, request) => {
                // console.log('DEVICES.loadProfile: JSON API Responce:', { responce, request });

                const model = JSON.parse(responce) || {};
                model.user = model.user || {};
                // console.log({ model });

                const profile = {
                        id: model.user.lumi_patient_id,
                        name: `${model.user.first_name} ${model.user.last_name}`,
                        sex: this.detectSex(model.user.gender),
                        age: this.calculateAge(model.user.dob),
                        phones: [ model.user.primary_phone ],
                    };

                    if (model.user.secondary_phone) {
                        profile.phones.push(model.user.secondary_phone)
                    }

                this.onProfileLoaded(profile);
            });
    };

    loadAdditionals = (did) => {
        const api = new Api({ endpointUrl: this.baseUrl });
        api.ajax( `devices/device/${did}`, 'GET', {},
            (responce, request) => {
                // console.log('JSON API Responce:', { responce, request });

                const model = JSON.parse(responce) || {};
                // console.log({ model });

                const device = { ...(model.device || {}) };
                const { status, statusDate } = this.determinateDeviceStatus(device);
                device.status = status || {};
                device.statusDate = statusDate;
                device.statusTitle = status?.title ?? '';
                device.statusDays = this.daysDifference(statusDate);

                const related = model.related || [];
                related.forEach((m) => {
                    const { status, statusDate } = this.determinateDeviceStatus(m);
                    m.status = status || {};
                    m.statusDate = statusDate;
                    m.statusTitle = status?.title ?? '';
                    m.statusDays = this.daysDifference(statusDate);
                });

                const service = {
                    ...(model.additionals || {}),
                };

                this.onAdditionalLoaded({ device, related, service });
            });
    };

    calculateAge = (birthday) => {
        birthday = new Date(birthday);
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    detectSex = (title) => {
        if (title.toLowerCase().trim() === 'male')
            return 1;
        else
            return 0;
    };

    selectorChanged = (selector) => { 
        // console.log({ selector });
        this.setState({
            filter__d_type: selector.d_type,
            // filter__status: []
        });
        // this.totalsPrimary = null;
        this.forceUpdate();
    }

    filterTable = (raw) => {
        // console.log('Filters', { ...this.state });
        const { filter__d_type, filter__status, table } = this.state;

        const filterHash = `${filter__d_type}_${filter__status}_${table && table.data ? table.data.length : 0}`;
        // console.log('Filter hashes', { filterHash, prev: this.lastFilterHash });

        if (this.lastFilterHash === filterHash) return this.lastFilterResult;

        this.lastFilterHash = filterHash;
        this.lastFilterResult = {
            head: (table && table.head) ? table.head : [],
            data: [
                ...(table && table.data ? table.data : [])
                    .filter((f) => {
                        if (raw) return true;

                        // Device type filter
                        if (filter__d_type && f.data.d_type !== filter__d_type) return false;

                        // Status filter
                        if (filter__status && filter__status.length) 
                            if (!filter__status.includes(f.data.statusTitle))
                                return false;

                        return true;
                    })
            ]
        };

        setTimeout(() => {
            if (this.tableScroll) {
                this.tableScroll.scrollTo(0, 0);
            }
        }, 100);

        return this.lastFilterResult;
    };

    distinct = (array, propertyGetter) => {
        const result = [];
        array.forEach((item) => {
            const curent_value = propertyGetter(item);
            if (result.filter(f => (f._prop_value === curent_value)).length) {
                result.filter(f => (f._prop_value === curent_value))[0].count++;
            } else {
                result.push({
                    _prop_value: curent_value,
                    item,
                    count: 1,
                });
            }
        });
        return result;
    };

    generateChart = (table) => {
        // console.log('distinct', { table });
        const chartData = 
            this.distinct(table.data, ({ data={} }) => (data.status || {}).title)
                .filter(f => typeof f._prop_value !== 'undefined');
        
        // console.log('generateChart', { table, chartData });

        const chartOptions = {
            total:  [...chartData].length || 0,
            filter__status: (this.state.filter__status || []),
            filter__d_type: (this.state.filter__d_type || null),
            labels: [ ...chartData.map(m => m.item.data.statusTitle) ],
            datasets: [
                {
                    data: [...chartData.map(m => m.count)],
                    backgroundColor: [...chartData.map(m => m.item.data.status.colorPassive)],
                    hoverBackgroundColor: [...chartData.map(m => m.item.data.status.color)],
                    hoverBorderColor: [...chartData.map(m => m.item.data.status.colorPassive)],
                    // borderColor:[...chartData.map(m => 'rgba(0,0,0,0)')],
                    borderWidth:[...chartData.map(m => 1)],
                }
            ]
        };

        // console.log(chartOptions);
        return chartOptions;
    };

    addStatusFilter = (filter) => {
        // console.log({ filter, stat: this.state.filter__status });
        let filter__status = (this.state.filter__status || []);

        if (filter__status.includes(filter))
            filter__status = filter__status.filter(f => f !== filter)
        else
            filter__status.push(filter);

        // console.log('addStatusFilter', { filter, filter__status });

        this.setState({ filter__status });
        this.forceUpdate();
    }

    clearFilters = () => {
        this.setState({ filter__status: [] });
        this.forceUpdate();
    }

    formatDate = (date) => {
        return (
            date
                ? (new Date(date).toLocaleDateString(
                    "en-US", {year: 'numeric', month: 'short', day: 'numeric'}
                   ))
                : '-'
        );
    };

    render() {
        // console.log('Devices.render', { p: this.props, s: this.state });
        const { 
            profileData, 
            deviceData,
            table 
        } = this.state; 

        const controls = this.state.controls || {};
        const selectorOptions = controls.deviceTypes || [];

        // Filtering
        const displaingRows = this.filterTable();
        const rawRows = this.filterTable(true);
        // console.log({ rawRows });

        const mainChartData = this.generateChart(displaingRows);
        const raw = this.generateChart(rawRows);
        // console.log({ raw });

        // console.log({ mainChartData });
        const mainChartLoaded =  !!(table);

        let totalsChart = {};
        if (mainChartLoaded) {
            totalsChart = {
                active: raw.datasets[0].data[raw.labels.indexOf( this.statuses.active.title )],
                delivered: raw.datasets[0].data[raw.labels.indexOf( this.statuses.delivered.title )],
                shipped: raw.datasets[0].data[raw.labels.indexOf( this.statuses.shipped.title )],
                disconnected: raw.datasets[0].data[raw.labels.indexOf( this.statuses.disconnected.title )],
            };
            this.totalsPrimary =  this.totalsPrimary || { ...totalsChart };
        }

        const statusFilterState = this.state.filter__status || [];
        const statusFilterActive = statusFilterState.length;

        // console.log(selectorOptions, this.state.filter__d_type);
        selectorOptions.forEach((item) => {
                // console.log({ item, state: this.state });
                const isSelrcted = item.d_type === this.state.filter__d_type;
                item.element = (
                    <div 
                        key={item.label}
                        className={`${styles.filterButtonTag} ${isSelrcted ? styles.filterBtnActive : ''}`}
                        onClick={() => this.selectorChanged(item)}
                    >
                        { item.label }
                    </div>
                );
                
        });

        // console.log({ selectorOptions });
        return (
            <div className={styles.deviceManagerPage}>
                
                <div className={styles.deviceManagerTotlas}>
                    <h1 className={styles.title}>Device Manager</h1>

                    <div className={styles.devicesSelectorWrapper}>
                        <div className={styles.devicesSelectorLabel}>Device Type:</div>

                        <Select 
                            // value={ typeof( this.state.filter__d_type ) === 'undefined' ? null : this.state.filter__d_type}
                            className={(this.state.filter__status || []).length ? '' : styles.hidden} 
                            options={selectorOptions} 
                            onChange={this.selectorChanged} 
                        />

                        <div className={`${(this.state.filter__status || []).length ? styles.hidden : '' } ${styles.filterButtons}`}>
                            { selectorOptions.map(m => m.element) }
                        </div>

                    </div>
                    
                    <div className={styles.mainChartContainer}>
                        {
                            mainChartLoaded
                            ?   <RoundChart 
                                    data={mainChartData}
                                    options={this.chartOptions}
                                    classes={styles.devicesChartContainer}
                                    onChartClick={(chartLabel) => {
                                        // console.log({ chartLabel })
                                        this.addStatusFilter(chartLabel);
                                    }}
                                    centerCircle={true}
                                    centerCircleCount={rawRows?.data.length || '0'}
                                    centerCircleLabel="Total"
                                />
                            : <Loader />
                        }
                    </div>

                    { 
                        mainChartLoaded ? (
                            <div className={`${styles.mainChartLegendItemsContainer} ${statusFilterActive ? styles.statusFiltered : ''}`}>
                                
                                <div className={`${styles.mainChartLegendItem} mainChartLegendItem ${statusFilterActive && statusFilterState.includes(this.statuses.active.title) ? styles.f_status_active :  ''}`}
                                    onClick={() => this.addStatusFilter(this.statuses.active.title)}>
                                    <PointText
                                        color={this.statuses.active.color} 
                                        dotSize={10} fontSize={9} />
                                    <div className={styles.bold}>{
                                        this.totalsPrimary.active || 0
                                    }</div>
                                    <div>{this.statuses.active.title}</div>
                                </div>

                                <div className={`${styles.mainChartLegendItem} mainChartLegendItem ${statusFilterActive && statusFilterState.includes(this.statuses.delivered.title) ? styles.f_status_active :  ''}`}
                                    onClick={() => this.addStatusFilter(this.statuses.delivered.title)}>
                                    <PointText
                                        color={this.statuses.delivered.color} 
                                        dotSize={10} fontSize={9} />
                                    <div className={styles.bold}>{
                                        this.totalsPrimary.delivered || 0
                                    }</div>
                                    <div>{this.statuses.delivered.title}</div>
                                </div>

                                <div className={`${styles.mainChartLegendItem} mainChartLegendItem ${statusFilterActive && statusFilterState.includes(this.statuses.shipped.title) ? styles.f_status_active :  ''}`}
                                    onClick={() => this.addStatusFilter(this.statuses.shipped.title)}>
                                    <PointText
                                        color={this.statuses.shipped.color} 
                                        dotSize={10} fontSize={9} />
                                    <div className={styles.bold}>{
                                        this.totalsPrimary.shipped || 0
                                    }</div>
                                    <div>{this.statuses.shipped.title}</div>
                                </div>

                                <div className={`${styles.mainChartLegendItem} mainChartLegendItem ${statusFilterActive && statusFilterState.includes(this.statuses.disconnected.title) ? styles.f_status_active :  ''}`}
                                    onClick={() => this.addStatusFilter(this.statuses.disconnected.title)}>
                                    <PointText
                                        color={this.statuses.disconnected.color} 
                                        dotSize={10} fontSize={9} />
                                    <div className={styles.bold}>{
                                        this.totalsPrimary.disconnected || 0
                                    }</div>
                                    <div>{this.statuses.disconnected.title}</div>
                                </div>

                            </div>
                        ) : null
                    }

                    {
                        statusFilterActive ? (
                            <div className={styles.statusFilterRemoveButtons}>
                                {
                                    statusFilterState.map(m => (
                                        <div 
                                            className={`${styles.statusFilterRemoveBtn} remove_filter`}
                                            onClick={() => this.addStatusFilter(m)}
                                            key={`filter-remove-${m}`}
                                        >
                                            {m}
                                        </div>
                                    ))
                                }

                                {
                                    ((statusFilterState || []).length > 1)
                                    &&
                                    <div className={styles.clearFilters}>
                                        <a href="#!" onClick={this.clearFilters}>
                                            Clear Filters
                                        </a>
                                    </div>
                                }
                            </div>
                        ) : null
                    }

                </div>
    
                <div className={styles.deviceManagerList}>
                    <h2 className={styles.subtitle}>Device Manager List</h2>
                    <div className={styles.deviceManagerTable} ref={(e) => { this.tableScroll = e; }}>
                        
                        <DataTable 
                            onCellClick={ this.onTableCellClick } 
                            onSelectionChanged={ this.onTableSelection }
                            // table={ null } 
                            table={ this.state.loading ? null : displaingRows } 
                        />

                    </div>
                </div>
    
                <div className={styles.deviceManagerDetails}>
                    <div className={styles.deviceManagerDetailsProfile}>
                        {
                            profileData
                                ? <Profile { ...profileData } />
                                : <Loader />
                        }
                    </div>

                    <div className={styles.additionalInfoWrapper}>
                        <div className={styles.additionalInfo}>

                            {
                                deviceData 
                                    ?
                                    (<>
                                        <div className={styles.additionalHeader}>
                                            {deviceData.device.type} Monitor
                                        </div>

                                        <div className={styles.additionalData}>
                                            <div className={styles.additionalDataLabel}>Device ID:</div>
                                            <div className={styles.additionalDataValue}>{deviceData.device.serial}</div>

                                            <div className={styles.additionalDataLabel}>Model:</div>
                                            <div className={styles.additionalDataValue}>{deviceData.device.model}</div>

                                            <div className={styles.additionalDataLabel}>Manufacturer:</div>
                                            <div className={styles.additionalDataValue}>{deviceData.device.manufactor}</div>

                                            <div className={styles.additionalDataLabel}>Operational Status:</div>
                                            <div className={styles.additionalDataValue} style={{ color: deviceData.device.status?.color ?? '#333' }}>
                                                {
                                                    !!deviceData.device.statusTitle && `${deviceData.device.statusTitle} `
                                                }
                                                {
                                                    !isNaN(deviceData.device.statusDays) && ` (${deviceData.device.statusDays} Days)`
                                                }
                                            </div>
                                            
                                            <div className={styles.additionalDividerSmall}/>
                                            <div className={styles.additionalDividerSmall}/>

                                            <div className={styles.additionalDataLabel}>Date Last Active:</div>
                                            <div className={styles.additionalDataValue}>
                                                {this.formatDate(deviceData.device.last_reading)}
                                            </div>

                                            <div className={styles.additionalDataLabel}>Date Activated:</div>
                                            <div className={styles.additionalDataValue}>
                                                { this.formatDate(deviceData.device.activated_date) }
                                            </div>

                                            <div className={styles.additionalDataLabel}>Date Delivered:</div>
                                            <div className={styles.additionalDataValue}>
                                                { this.formatDate(deviceData.device.deliviered_date) }
                                            </div>

                                            <div className={styles.additionalDataLabel}>Date Shipped:</div>
                                            <div className={styles.additionalDataValue}>
                                                { this.formatDate(deviceData.device.ship_date) }
                                            </div>

                                        </div>

                                        <div className={styles.additionalDivider} />

                                        <div className={styles.additionalLinks}>
                                            <div className={styles.additionalDataLabel}>Other Devices:</div>
                                            <div className={styles.additionalDataValue}>
                                                
                                                {
                                                    // console.log({deviceData}) ||
                                                    !!deviceData.related
                                                    ?
                                                    deviceData.related.map((item) => {
                                                        return (
                                                            <PointText 
                                                                key={`${item.id}_${item.serial}`}
                                                                color={item.status.color || '#333'}
                                                                text={`(${item.status.title})`}
                                                                value={item.type}
                                                                dotSize={8}
                                                                fontSize={14}
                                                                fontColor={item.status.color || '#333'}
                                                                onClick={() => this.reloadAdditionals(item.id)}
                                                            />
                                                        )
                                                    })
                                                    :
                                                    'none'
                                                }
                                                

                                            </div>
                                        </div>

                                        <div className={styles.additionalTechnical}>
                                            <div className={styles.additionalDataLabel}>Lumi Customer Service</div>
                                            <div className={styles.additionalDataValue}>{window._frontConfig.lumiService || '-'}</div>
                                        </div>
                                    </>)
                                    :
                                    <Loader classes="vert-center" />
                            }

                        </div>
                    </div>

                </div>
    
            </div>
        );
    }
}
