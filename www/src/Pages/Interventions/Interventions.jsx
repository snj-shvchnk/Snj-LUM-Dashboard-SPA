import React from "react";
import styles from "./Interventions.module.css";
import Api from '../../Services/Api';
import RoundChart from "../../Components/RoundChart";
import PointTextTable from "../../Components/PointTextTable";
import Switcher from "../../Components/Switcher/Switcher";
import DataTable from "../../Components/DataTable/DataTable";
import Profile from "../../Components/Profile";
import Loader from "../../Components/Loader";
import Collapser from "../../Components/Collapser/Collapser";
import Quiz from "../../Components/Quiz";

import ChartBloodPreassure from "../../Components/ChartBloodPreassure"; 
import ChartWeight from '../../Components/ChartWeight'; 
import PatientDetails from "../../Components/PatientDetails";

export default class Interventions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            profileData: null,
            profileId: 0,
            filters: {},
            devicesData: null,
            medicationData: null,
            showCompleted: false,
        };

        this._API = new Api();

        this.head = [
            { id: 'priority', title: 'Priority' },
            { id: 'patientName', title: 'Patient Name' },
            { id: 'intervention', title: 'Intervention' },
            { id: 'estTime', title: 'Est. Time' },
            { id: 'dueDate', title: 'Due Date' },
        ];

        this.chartOptions = { 
            cutoutPercentage: 20,
            tooltips: { enabled: false },
            hover: { animationDuration: 100 },
            borderAlign: 'inner',
        };

        this.priority = {
            id: 1,
            title: 'Interventions Priority',
            items: {
                highImpact: { 
                    id: 3, 
                    title: 'High Impact', 
                    color: '#932688',
                    colorFiltered: '#c38ec0',
                    // hoverColor: '',
                    borderColor: 'rgba(147, 38, 136, 0.4)',
                    class: 'dt-lvl3-dot', 
                    count: 0 
                },
                important: { 
                    id: 2, 
                    title: 'Important', 
                    color: '#EF476A',
                    colorFiltered: '#f19eb1',
                    // hoverColor: '',
                    borderColor: 'rgba(239, 71, 106, 0.4)',
                    class: 'dt-lvl2-dot', 
                    count: 0 
                },
                maintenance: { 
                    id: 1, 
                    title: 'Maintenance', 
                    color: '#FF8624', 
                    colorFiltered: '#f9be8e',
                    // hoverColor: '',
                    borderColor: 'rgba(250, 173, 111, 0.4)',
                    class: 'dt-lvl1-dot', 
                    count: 0 
                },
            }
        };

        this.completion = {
            id: 2,
            title: 'Interventions Completion',
            items: {
                completed: { 
                    id: 3, 
                    title: 'Completed', 
                    color: '#00AE8B', 
                    colorFiltered: '#7ad2c2',
                    hoverColor: '#00AE8B',
                    borderColor: 'rgba(0, 174, 139, 0.4)',
                    count: 0,
                },
                dueSoon: { 
                    id: 2, 
                    title: 'Due Soon', 
                    color: '#EDCD67', 
                    colorFiltered: '#f1e2b0',
                    hoverColor: '#EDCD67',
                    borderColor: 'rgba(237, 205, 103, 0.4)',
                    count: 0,
                },
                late: { 
                    id: 1, 
                    title: 'Late', 
                    color: '#EF476A', 
                    colorFiltered: '#f29fb1',
                    hoverColor: '#EF476A',
                    borderColor: 'rgba(239, 71, 106, 0.4)',
                    count: 0,
                },
            }
         };

        this.inProgram = {
            id: 3,
            title: 'Interventions in Program',
            items: {
                offTarget: { 
                    id: 2, 
                    title: 'Off Target', 
                    color: '#E1A7F6', 
                    colorFiltered: '#ebcff7',
                    hoverColor: '#E1A7F6',
                    borderColor: 'rgba(225, 167, 246, 0.4)',
                    count: 0,
                },
                onTarget: { 
                    id: 1, 
                    title: 'On Target', 
                    color: '#B55084', 
                    colorFiltered: '#d5a3be',
                    hoverColor: '#B55084',
                    borderColor: 'rgba(181, 80, 132, 0.4)',
                    count: 0,
                },
            }
        };

        this.relativeDays = {
            '0': 'Today',
            '1': 'Tomorrow',
            '-1': 'Yesterday',
        }
    };

    componentDidMount() {
        // console.log('Inter.CDM:', { ...this });
        this.loadTableData(this.state.profileId);

        this.primaryTimer = 
            setTimeout(() => {
                this.primaryTimer = null;
                [ ...document.getElementsByClassName('totalsChart') ]
                    .forEach(item => item.classList.add('readyToShow'));
            }, 100);
    };

    componentWillUnmount() {
        if (this.primaryTimer) 
            clearTimeout(this.primaryTimer);
    };

    componentDidUpdate() {
        const { table, showCompleted, profileData } = this.state;
        
        // add "Show/Hide Completed" logic
        const tableResults = { ...(table || {}) };
        if (tableResults.data && !showCompleted) {
            tableResults.data = [ ...tableResults.data.filter(
                f => (parseInt(f.data.is_complete || '0') === 0)
            )];
        }

        // if (tableResults && tableResults.data && tableResults.data[0]) {
        //     const uid = tableResults.data[0].data.lumi_patient_id;
        //     if ((uid && !profileData) || uid != profileData.id) {
        //         this.reloadProfile(uid);
        //     }
        // } else {
        //     if (profileData && profileData.id) {
        //         this.setState({ profileData: null });
        //     }
        // }
    }

    processNewFilter = ({ data, item }) => {
        // console.log('processNewFilter', { data,item });
        const filter = {
            filterId: `data-${data.id}-value-${item.id}`,
            filterValue: true,
            item,
            filterHandler: (row) => {
                // console.log('filterHandler', { row, item, data });
                if (data.id === 1) return row.data.priorityData?.id === item.id;
                if (data.id === 2) return row.data.completionData?.id === item.id;
                if (data.id === 3) return row.data.inProgramData?.id === item.id;
            },
            filterData: { data, item }
        }
        const filters = this.toggleDataFilter(filter);
        this.loadTableData(false, filters);
    }

    toggleDataFilter = ({ filterId, filterValue, filterHandler, filterData  }) => {
        // add new filter to stack and update view
        const filters = { ...this.state.filters };
        if (filters[filterId]) {
            delete filters[filterId];
        } else {
            filters[filterId] = { filterId, filterValue, filterHandler, filterData };
        };
        // console.log({ filters });
        this.setState({ filters });
        return filters;
    };

    filterData = (data, _filters) => {
        // console.log('onFilterChange', { data, _filters });
        if (!_filters || !Object.keys(_filters).length) return data;

        const filters = _filters || this.state.filters;

        const filter_entity = this.mapObject(_filters, (key, item) => ({ key, ...item }));
        // console.log({ filter_entity });

        const filter_groups_keys = 
            this.distinct(filter_entity, (filter) => filter.filterData.data.id )
                .map(m => m._prop_value);
        // console.log({ filter_groups_keys });

        const filter_groups = 
            filter_groups_keys.map(id => filter_entity.filter(f => (f.filterData.data.id === id)));

        let all_results = [];
        const group_results = [];
        filter_groups.forEach((group, index) => {
            // console.log({ group });
            let results = [];
            this.mapObject(group, (k, f_item) => {
                // console.log('Processing...', { f_item });
                f_item.filtered = [ ...this.applyFilter(f_item, data) ];
                results = [  ...results, ...f_item.filtered ];
            });
            group_results.push({ fid: group[0].filterData.data.id, results });
            all_results = [ ...all_results, ...results ];
        });
        // console.log({ filter_groups, group_results });
        
        const intersection = [];
        if (group_results[0] && group_results[0].results) {
            group_results[0].results.forEach((item, index) => {
                const contained_groups = group_results.filter(({ results }) => !!results.filter(f => f.data.id === item.data.id).length);
                if (contained_groups.length === group_results.length) {
                    intersection.push(item);
                }
            });
        }

        // console.log({ intersection });
        return intersection || [];

        // Old version
        // let results = [];
        // // data before filtering
        // // console.log( 'All filter start', { results, ln: results.length, filters });
        // this.mapObject(filters, (k, f_item) => {
        //     f_item.filtered = [ ...this.applyFilter(f_item, data) ];
        //     // console.log({ f_item });
        //     results = [  ...results, ...f_item.filtered ];
        // });
        // results = this
        //             .distinct(results, item => item.data.id)
        //             .map(m => m.item);
        // console.log( 'All filter end', { results, ln: results.length, filters });
        // return results;
    };

    applyFilter = (filter, entity) => {
        const result = [];
        // console.log( 'filter start', { filter, entity, ln: entity.length  });

        [...entity].forEach((item) => {
            if (filter.filterHandler(item) === filter.filterValue) {
                result.push({ ...item });
            }
        });

        // console.log('filter out', { filter, result, ln: result.length  });
        return result;
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

    loadTableData = (force_reload, filters) => {
        // console.log('loadTableData', {force_reload});

        // if (this.state.loading) return;
        this.setState({ loading: true });

        // check data in cache
        if (!force_reload && this.cachedData) {
            // console.log('Updating, using cache data', { cache: this.cachedData });
            const filtered = [ ...this.filterData(this.cachedData.data, filters) ];
            const sorted  = [ ...this.sortTable(filtered) ];
            this.onTableDataLoaded({
                head: this.head,
                data: sorted,
            });
            return;
        };

        this._API.ajax(`interventions/table/1`, 'GET', {},
            (responce, request) => {
                let json = JSON.parse(responce) || {};
                const jsonData = json.table || [];
                // console.log('Downloaded', { jsonData });

                // Format raw data
                const model = {};
                model.data = this.convertData(jsonData);
                this.cachedData = model;
                // console.log('Converted:', { ...model });
                
                // Filtering
                const data = this.filterData(model.data);

                // // Sorting
                model.data = [ ...this.sortTable(model.data) ];
                // console.log('Sorted:', { ...model });

                // console.log('Totals:', {
                //     priority: this.priority,
                //     completion: this.completion,
                //     inProgram: this.inProgram,
                // });
                this.setState({ totalsLabel: data.length });
                this.onTableDataLoaded({ 
                    head: this.head,
                    data
                });
            }
        );
    };

    daysDifference = (date1, date2, abs) => {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(date1);
        const secondDate = date2 ? new Date(date2) : new Date();
        const delta = (firstDate - secondDate) / oneDay;
        const diffDays = Math.round( abs ? Math.abs(delta) : delta);
        return diffDays;
    }

    sortTable = (table) => {
        // console.log(table);
        table.sort(
            (row1, row2) => {
                // console.log({row1, row2});
                return row2.data.priorityData.id - row1.data.priorityData.id;
            }
        );
        return table;
    };

    onTableDataLoaded = ({ data, head }) => {
        // console.log('onTableDataLoaded', { data, head });

        // is Completed
        if (this.state.switchState)
            data = 
                data.filter((d) => d.data.completionData !== 3);

        this.setState({
            table: { head, data }, 
            loading: false,
        });

        if (data.length) {
            const pId = data[0]?.cells[1].profileId ?? false;
            if (this.state.profileId !== pId) {
                this.reloadProfile(pId);
            }
        } else {
            this.clearProfile();
        }
    };

    convertData = (data) => {
        // console.log('convertData', {data});

        // clear items count
        this.mapObject(
            this.priority.items, 
            (k, item) => { item.count = 0; }
        );

        data.forEach((item, index, entity) => {
            // console.log('convertData.item', { item, index, entity });
            
            item.patient_name = `${item.first_name} ${item.last_name}`;
            item.estimated_title = `${item.estimated_time} Min`;
            item.dueDaysCount = this.daysDifference(item.due_date);

            this.castPriority(item);
            this.castCompletion(item);
            this.castInProgram(item);
            
            entity[index] = {
                data: item,
                cells: [
                    { 
                        content: item.priorityData ? item.priorityData.title: '-', 
                        classes: item.priorityData ? [item.priorityData.class, 'dt-dot'] : [], 
                    },
                    {
                        content: item.patient_name,
                        classes: [ 'dt-link' ], 
                        profileId: item.lumi_patient_id,
                    },
                    {
                        content: item.d_type,
                        classes: [ 'dt-link' ], 
                        action: (params) => { 
                            // console.log('item.d_type action', { params });
                            setTimeout(this.showAdditionaForm, 50);
                        },
                    },
                    item.estimated_title,
                    item.dueDaysTitle = 
                        (Object.keys(this.relativeDays).includes(item.dueDaysCount))
                            ? this.relativeDays[item.dueDaysCount]
                            : (item.dueDaysCount > 1)
                                ? `in ${item.dueDaysCount} Days`
                                : `${(-1)*item.dueDaysCount} Days ago`,
                ],
            };
            // console.log('Converted:', { item: entity[index] });
        });

        // console.log('Converted All:', { data });
        return data;
    };

    castPriority = (item) => {
        const itemPriority = parseInt(item.priority);
        this.mapObject(
            this.priority.items,
            (k, p_item) => {
                if (p_item.id === itemPriority) {
                    item.priorityData = p_item;
                    p_item.count++;
                }
            }
        );
    };

    castCompletion = (item) => {
        const itemCompletion = parseInt(item.is_complete);
        const dueDate = new Date(item.due_date);
        if (itemCompletion === 1) {
            item.completionData = this.completion.items.completed;
            this.completion.items.completed.count++;
        } else
        if (dueDate < new Date()) {
            item.completionData = this.completion.items.late;
            this.completion.items.late.count++;
        } else {
            item.completionData = this.completion.items.dueSoon;
            this.completion.items.dueSoon.count++;
        }
    };

    castInProgram = (item) => {
        const { items } = this.inProgram;
        const target = parseInt(item.off_target);
        if (target != -1) {
            if (target === 1) {
                item.inProgramData = items.offTarget;
                items.offTarget.items = items.offTarget.items || [];
                items.offTarget.items.push(item);
                items.offTarget.count++;
            } else 
            if (target === 0) {
                item.inProgramData = items.onTarget;
                items.onTarget.items = items.onTarget.items || [];
                items.onTarget.items.push(item);
                items.onTarget.count++;
            }

            // calculate totals
            this.inProgram.totalProgramEnrollment = (
                this.inProgram.totalProgramEnrollment || 0
            )+1;
        }
        // console.log(item.inProgramData?.title ?? 'None', { item, data: this.inProgram });
    };

    generateChartData = (items, entity, filters) => {
        // console.log('generateChartData', { items, entity, filters });
        const chartData = { 
            labels: [],
            handlers: [],
            dataItems: [],
            datasets: [{ 
                data: [], 
                backgroundColor: [],  
                hoverBackgroundColor: [],
                hoverBorderColor: [],
                hoverBorderWidth: [],
            }],
        };

        this.mapObject(items, (k, item) => {
            
            let isFilterActive = !Object.keys(filters || {}).length;
            this.mapObject(filters, (k, filter) => {
                if (filter.filterData.data.id === entity.id) {
                    if (filter.filterData.item.id === item.id)
                    {
                        isFilterActive = true;
                    }
                }
                // console.log('isFilterActive', { filter, item, isFilterActive  });
            });

            chartData.labels.push(item.title);
            chartData.datasets[0].data.push(item.count);
            chartData.datasets[0].hoverBackgroundColor.push(item.hoverColor);
            chartData.datasets[0].hoverBorderColor.push(item.borderColor);
            
            // active filter higlighting
            chartData.datasets[0].backgroundColor.push(
                isFilterActive ? item.color : item.colorFiltered
            );

            chartData.dataItems.push(item);
        });

        return chartData;
    };

    mapObject = (items, handler) => {
        // console.log('MapObject', { items, handler })
        return (
            [ ...Object.keys(items) ].map((m) => handler(m, items[m]))
        );
    };

    calculateAge = (birthday) => {
        birthday = new Date(birthday);
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    detectSex = (title) => {
        return (title.toLowerCase().trim() === 'male') ? 1 : 0;
    };

    loadProfile = (id) => {

        if (this.state.profileData && this.state.profileData?.id.toString() === id) {
            this.onProfileLoaded(this.state.profileData);
            return;
        }

        this._API.ajax( `interventions/user/${id}`, 'GET', {},
            (responce, request) => {
                // console.log('JSON API Responce:', { responce, request });

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

    onProfileLoaded = (profile) => {
        this.setState({
            profileData: profile,
            profileId: profile.id,
            chartsLoading: true,
        });
        
        this.loadDevicesData(profile.id);
        this.loadMedicationData(profile.id);
    };

    loadMedicationData = (profileId) => {
        this._API.ajax(`interventions/medication/${profileId}`, 'GET', {},
            (responce, request) => {
                const { medicationData } = JSON.parse(responce) || {};
                // console.log('Downloaded Medication', { medicationData });
                // title & subtitle substraction
                // medicationData.diagnosis_list = 
                //     (medicationData.diagnosis_list || [])
                //         .map((item) => );
                this.setState({ medicationData });
            }
        );
        this.setState({ medicationData: null });
    };

    loadDevicesData = (uid) => {
        this.setState({ devicesData: null });
        this.timeframeListeners = {};

        this._API.ajax( `interventions/data/${uid}`, 'GET', {},
            (responce, request) => {
                // console.log('JSON API Responce:', { responce, request });

                const model = JSON.parse(responce) || {};
                // console.log('loadDevicesData', { model });

                let devicesData = null;
                if (model && model.devices && model.devices.length) {
                    devicesData = 
                        model.devices.map(device => ({
                            id: device.id,
                            model: device.d_model,
                            typeId: (device.d_type ?? '').toLowerCase().trim(),
                            type: device.d_type,
                            data: (device.data || []),
                        }));
                    // console.log({ devicesData });
                }
                this.setState({ devicesData });
                // this.timeframeListeners = {};
            });
    };

    onTableCellClick = (data) => {
        // console.log({ data });
        if (data.cell.profileId) {
            // reload profile
            this.reloadProfile(data.cell.profileId);
        }
    };

    clearProfile = (id) => {
        this.setState({
            profileData: (this.state.profileData && this.state.profileData.id.toString() === id) ? this.state.profileData : null,
            profileId: 0,
            medicationData: null,
            devicesData: null,
            additionalFormMode: null,
        });
    };

    reloadProfile = (id) => {
        this.clearProfile(id);
        this.loadProfile(id);
    };

    onChartClick = (data, item) => {
        // console.log('onChartClick', { data, item });
        this.processNewFilter({ data, item });
    };

    switchCompleted = (showCompleted) => {
        // console.log('switchCompleted', { showCompleted });
        this.setState({ showCompleted });
    }

    timeframeUpdater = (id, handler) => {
        // console.log('timeframeUpdater', {id, handler});
        this.timeframeListeners = this.timeframeListeners || {};
        if (!this.timeframeListeners[id])
            this.timeframeListeners[id] = handler;
    };

    updateTimeframe = (id, frame) => {
        // console.log('updateTimeframe', { frame, id, handlers: this.timeframeListeners });
        this.mapObject(
            this.timeframeListeners || {},
            (k,item) => item(frame),
        );
    };

    showAdditionaForm = () => {
        this.setState({ additionalFormMode: true });
    };

    clearFilters = () => {
        this.setState({ filters: {} });
        this.loadTableData(false, {});
    };

    render() {
        const { profileData, table, totalsLabel, filters, showCompleted } = this.state; 
        const { priority, completion, inProgram, chartOptions } = this;
        const devicesData = this.state.devicesData || [];
        
        // console.log('"Show/Hide Completed" logic', { table });
        // add "Show/Hide Completed" logic
        const tableResults = { ...(table || {}) };
        if (tableResults.data && !showCompleted) {
            tableResults.data = [ ...tableResults.data.filter(
                f => (parseInt(f.data.is_complete || '0') === 0)
            )];
        }
        const emptyTable = !tableResults.data?.length;

        return (
            <div className={styles.interventionsPage}>
                <div className={styles.interventionsTotlas}>
                    <h1 className={styles.title}>My Interventions</h1>
                    <div className={styles.totalsCounter}>
                        <div className={styles.totalsCount}>{totalsLabel}</div>
                        <div className={styles.totalsLabel}>Total Interventions</div>
                    </div>
                    {
                        this.mapObject(
                            { priority, completion, inProgram },
                            (k, section) => {
                                const chartData = this.generateChartData(section.items, section, this.state.filters);
                                chartData.src = section;
                                chartData.filters = this.state.filters;
                                return (
                                    <div key={`sec${section.id}`} className={styles.totalsSection}>
                                        <div className={styles.totalsTitle}>{section.title}</div>
                                        <div className={styles.totalsWrapper}>
                                            <div className={styles.totalsChartWrapper}>
                                                <div className={`${styles.totalsChart} totalsChart`}>
                                                    <RoundChart 
                                                        data={chartData} 
                                                        options={chartOptions}
                                                        onChartClick={
                                                            (i,t,d,l) => this.onChartClick(d,l)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.totalsLegend}>
                                                <PointTextTable 
                                                    data={chartData} 
                                                    activeFilters={this.state.filters}
                                                    onLabelClick={this.onChartClick}
                                                />
                                            </div>
                                        </div>
                                    </div> 
                                );
                            }
                        )
                    }

                    <div className={styles.totalsSwitch}>
                        <Switcher 
                            value={this.state.collapserFilter} 
                            label="Show completed" 
                            offLabel="Hide completed"
                            onChange={this.switchCompleted}
                        />
                    </div>

                    <div className={styles.filtersRemoveButtons}>
                        {
                            this.mapObject(filters, (key, filter) => {
                                // console.log('Filter buttons:', { filter });
                                return (
                                    <div 
                                        className={`${styles.filtersRemoveBtn} remove_filter`}
                                        onClick={() => this.toggleDataFilter(filter)}
                                        key={key}
                                    >{filter.filterData.item.title}</div>
                                );
                            })
                        }

                        {
                            (Object.keys(filters || {}).length > 1)
                            &&
                            <div className={styles.clearFilters}>
                                <a href="#!" onClick={this.clearFilters}>
                                    Clear Filters
                                </a>
                            </div>
                        }
                        
                    </div>

                </div>

                <div className={styles.interventionsList}>
                    <h2 className={styles.subtitle}>Interventions List</h2>
                    <div className={styles.interventionsTable}>
                        {
                                <DataTable 
                                    onCellClick={this.onTableCellClick} 
                                    table={this.state.loading ? null : tableResults}
                                />
                        }
                    </div>
                </div>

                <div className={styles.interventionsDetails}>
                    
                    <div className={styles.interventionsDetailsProfile}>
                        { 
                            emptyTable 
                                ?
                                <div className="noDataHint">
                                        Nothing selected
                                        <div>Select some intervention for view details</div>
                                </div>
                                :
                                profileData
                                    ? 
                                    <Profile { ...profileData } />
                                    :
                                    <Loader />
                        }
                    </div>

                    <div className={styles.additionalInfoWrapper}>
                        <div className={styles.additionalInfo}>
                            {
                                emptyTable ? null :
                                    this.state.additionalFormMode
                                    ? 
                                    <Quiz />
                                    :
                                    (<div className={`${styles.devicesDataHolder} ${devicesData.length ? styles.devicesDataHolderLoaded : ''}`}>
                                        {
                                            devicesData
                                                ?
                                                devicesData
                                                    .map((device, index) => (
                                                        (device.typeId === 'bp')
                                                            ? 
                                                            <ChartBloodPreassure
                                                                device={device} 
                                                                key={`${device.id}_${device.type}`} 
                                                                collectUpdater={this.timeframeUpdater}
                                                                onTimeframeUpdate={this.updateTimeframe}
                                                            />
                                                            :
                                                        (device.typeId === 'scale')
                                                            ?
                                                            <ChartWeight 
                                                                device={device} 
                                                                key={`${device.id}_${device.type}`} 
                                                                collectUpdater={this.timeframeUpdater} 
                                                                onTimeframeUpdate={this.updateTimeframe}
                                                            />
                                                            : null
                                                    ))
                                                :
                                                <Loader />
                                        }
                                        
                                        {
                                            this.state.medicationData && !emptyTable
                                                ?   <PatientDetails 
                                                        data={this.state.medicationData} 
                                                        goToMedicalRecord={this.showAdditionaForm}
                                                    />
                                                : null
                                        }

                                    </div>)
                                }


                        </div>
                    </div>

                </div>
    
            </div>
        );
    }
}
