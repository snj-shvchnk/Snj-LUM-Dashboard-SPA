import React from "react";
import styles from "./Dashboard.module.css";
import Box from "../../Components/Box";
import Title from "../../Components/Title";
import { Link } from "react-router-dom";
import PointText from "../../Components/PointText";
import Ellipse from "../../Components/Ellipse";
import Api from '../../Services/Api';

import ProgressBar from "../../Components/ProgressBar";
import InterventionsPopup from "../../Components/InterventionsPopup";
import icons from "../../Components/icons";

import Peers from "../../Components/Peers/Peers";
import ChartDailyActive from "../../Components/ChartDailyActive";
import RoundChart from "../../Components/RoundChart";
import ChartInterventionsSvg from "../../Components/ChartInterventionsSvg";
import ChartInterventions from "../../Components/ChartInterventions";
import Loader from "../../Components/Loader";

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this._API = new Api();

        this.state = {
            data: null,
        }

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
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        this._API.ajax(`dashboard/0/0`, 'GET', {},
            (responce, request) => {
                let json = JSON.parse(responce) || {};
                // console.log({ json });

                const table = json.table || [];
                const deviceActivity = json.deviceActivity || [];
                // console.log('Downloaded', { table, deviceActivity });

                // Format raw data
                let data = {};
                data = this.convertData(table);
                // console.log('Converted:', { ...model });
                
                // // Sorting
                data = [ ...this.sortTable(data) ];
                // console.log('Sorted:', { ...model });

                // console.log('Totals:', {
                //     data,
                //     priority: this.priority,
                //     completion: this.completion,
                //     inProgram: this.inProgram,
                // });

                this.setState({ data, deviceActivity });
            }
        );
    }

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

            item.dueDaysTitle = 
                (Object.keys(this.relativeDays).includes(item.dueDaysCount))
                    ? this.relativeDays[item.dueDaysCount]
                    : (item.dueDaysCount > 1)
                        ? `in ${item.dueDaysCount} Days`
                        : `${(-1)*item.dueDaysCount} Days ago`

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
                        profileId: item.lumi_patient_id,
                    },
                    item.estimated_title,
                    item.dueDaysTitle,
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
                    p_item.items = p_item.items || [];
                    p_item.items.push(item);
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
            this.completion.items.completed.items = this.completion.items.completed.items || [];
            this.completion.items.completed.items.push(item);
        } else
        if (dueDate < new Date()) {
            item.completionData = this.completion.items.late;
            this.completion.items.late.count++;
            this.completion.items.late.items = this.completion.items.late.items || [];
            this.completion.items.late.items.push(item);
        } else {
            item.completionData = this.completion.items.dueSoon;
            this.completion.items.dueSoon.count++;
            this.completion.items.dueSoon.items = this.completion.items.dueSoon.items || [];
            this.completion.items.dueSoon.items.push(item);
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

    daysDifference = (date1, date2, abs) => {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(date1);
        const secondDate = date2 ? new Date(date2) : new Date();
        const delta = (firstDate - secondDate) / oneDay;
        const diffDays = Math.round( abs ? Math.abs(delta) : delta);
        return diffDays;
    }

    mapObject = (items, handler) => {
        // console.log('MapObject', { items, handler })
        return (
            [ ...Object.keys(items) ].map((m) => handler(m, items[m]))
        );
    };

    generateChartData = () => {
        const data = {
            background: '#FFFFFF',
            total: 20,
            title: 'Total Interventions',
            items: [],
        };

        if (this.state.data) {
            data.total = this.state.data.length;
            this.mapObject(this.priority.items, (key, item) => {
                data.items.push({
                    id: item.id,
                    priority: parseInt(item.id),
                    key: key,
                    title: item.title,
                    color: item.color,
                    primaryColor: item.color,
                    hoverColor: item.colorFiltered,
                    borderColor: 'rgba(250, 173, 111, 0.2)',
                    inner_shadow: 'rgba(0,0,0,0.15)',
                    count: item.count,
                });
            });
        }

        return data;
    }

    showChartPopup = (priority) => {
        // console.log({ priority });
        this.setState({ chartPopapShown: priority });
    };
    
    render() {
        const { priority, showChartPopup, state } = this;
        const { chartPopapShown } = state;

        const chardData = this.generateChartData();
        // console.log({ chardData });

        const deviceActivityData = 
            !this.state.deviceActivity ? null 
            :this.state.deviceActivity
                .map( i => [
                    new Date(i.date).getTime(), 
                    Math.round((parseInt(i.count) / parseInt(i.total)) * 100),
                ]);
            ;
        // console.log(deviceActivityData);
           
        return (
            <div className={styles.dashboard}>
                
                <Box className={styles.box}>
                    <div className={styles.boxhead}>
                        <div className="flex-center-between">
                            <Title text="My Interventions" />
                            <Link to="/interventions" className={styles.link}>
                                More details
                            </Link>
                        </div>
                        <div className={styles.mainChartSelector}>
                            <div 
                                className={styles.link} 
                                onClick={()=>this.showChartPopup(this.priority.items.highImpact)}
                            >
                                    Interventions {icons.arrowDown}
                            </div>
                        </div>
                    </div>
    
                    <div className={styles.totalsChartWrapper}>
                        <div className={styles.totalsChart}>
                            { 
                                !this.state.data
                                    ?
                                    <Loader classes="mt-80" />
                                    :
                                    <ChartInterventions
                                        data={chardData} 
                                        selection={this.state.chartPopapShown} 
                                    /> 
                                    // <ChartInterventionsSvg
                                    //     id="mainChart"
                                    //     data={chardData} 
                                    //     selection={this.state.chartPopapShown}
                                    // />
                            }
                        </div>
                    </div>
    
                    {/* <RoundChart data={mainChartData} />     */}
    
                    <div>
                        <div className="flex-center">
                            
                            <PointText 
                                onClick={() => showChartPopup(priority.items.highImpact)}
                                color="#932688" 
                                text="High Impact" 
                                dotSize={12} 
                                fontSize={10} 
                            />
                            
                            <PointText 
                                onClick={() => showChartPopup(priority.items.important)}
                                color="#EF476A" 
                                text="Important" 
                                dotSize={12} 
                                fontSize={10} 
                            />
                            
                            <PointText 
                                onClick={() => showChartPopup(priority.items.maintenance)}
                                color="#FAAD6F" 
                                text="Maintenance" 
                                dotSize={12} 
                                fontSize={10} 
                            />
                        
                        </div>
                    </div>

                    {
                        this.state.data &&
                        <InterventionsPopup
                            status={!!chartPopapShown}
                            data={chartPopapShown}
                            handleClose={() => {this.setState({ chartPopapShown: false })}}
                        />
                    }

                </Box>
    
                <Box className={styles.box}>
                    <div className={styles.boxhead}>
                        <Title text="My Success" />
                        <div className={styles.titleLinks}>
                            <Link to="#!" className={styles.linkActive}>
                                My Goals
                            </Link>
                            <Link to="#!" className={styles.link}>
                                Details
                            </Link>
                        </div>
                    </div>
                    <div className={styles.goals}>
                        <div className={styles.goalscolumn}>
                            <Ellipse count="5" text="Golas" />
                        </div>
                        <div className={styles.goalscolumn}>
                            <PointText color="#06CF96" text="On Target" fontSize={10} fontColor="#5F6972" />
                            <div>
                                <span className={styles.goalscount}>1</span>
                                <span className={styles.goalstext}>Goal</span>
                            </div>
                        </div>
                        <div className={styles.goalscolumn}>
                            <PointText color="#FFD54F" text="Near Target" fontSize={10} fontColor="#5F6972" />
                            <div>
                                <span className={styles.goalscount}>2</span>
                                <span className={styles.goalstext}>Goals</span>
                            </div>
                        </div>
                        <div className={styles.goalscolumn}>
                            <PointText color="#BFC3C7" text="Off Target" fontSize={10} fontColor="#5F6972" />
                            <div>
                                <span className={styles.goalscount}>3</span>
                                <span className={styles.goalstext}>Goals</span>
                            </div>
                        </div>
                    </div>
    
                    <h3 className={styles.boxSubtitle}>My Ratings</h3>
    
                    <div className={styles.progressWraper}>
    
                        <div className={styles.progress}>
                            <h4>Patient Engagement Score</h4>
                            <Link to="#!">Guidance</Link>
                            <div className={styles.progressTotals}>
                                <span className={styles.progressTotalsCurrent}>25</span>
                                /100
                            </div>
                        </div>
                        <ProgressBar value={25} color="06CF96"  />
    
                        <div className={styles.progress}>
                            <h4>Coordination Score</h4>
                            <Link to="#!">Guidance</Link>
                            <div className={styles.progressTotals}>
                                <span className={styles.progressTotalsCurrent}>50</span>
                                /100
                            </div>
                        </div>
                        <ProgressBar value={50} color="06CF96" />
    
                        <div className={styles.progress}>
                            <h4>Clinical Score</h4>
                            <Link to="#!">Guidance</Link>
                            <div className={styles.progressTotals}>
                                <span className={styles.progressTotalsCurrent}>75</span>
                                /100
                            </div>
                        </div>
                        <ProgressBar value={75} color="C2D360" />
    
                    </div>
                </Box>
    
                <Box className={styles.box}>
                    <div className={styles.boxhead}>
                        <Title text="My Performance" />
                        <h3 className={styles.linkActive}>Compare your performance against your Peers</h3>
                    </div>
                    <Peers />
                </Box>
    
                <Box className={styles.box}>
                    <div className={styles.program}>
                        <div className={styles.programDivider} />
                        <div className={styles.programTotal}>
                            <Title text="Total Program Enrollment" />
                            <div className={styles.programGrid}>
                                {
                                    this.inProgram.totalProgramEnrollment
                                        ?
                                        <div className={styles.programChart}>
                                            <RoundChart 
                                                data={{
                                                    labels: ['a', 'b'],
                                                    datasets: [
                                                        {
                                                            data: [
                                                                this.inProgram.items?.offTarget.count ?? 0,
                                                                this.inProgram.items?.onTarget.count ?? 0,
                                                            ],
                                                            backgroundColor: [ '#ebcff7', '#d5a3be' ],
                                                            hoverBackgroundColor: [ '#E1A7F6', '#B55084' ],
                                                            borderColor: '#fff',
                                                            borderWidth: '1px',
                                                            hoverBorderWidth: [4, 4],
                                                            hoverBorderColor: ['rgba(225, 167, 246, 0.4)', 'rgba(181, 80, 132, 0.4)'],
                                                        }
                                                    ],
                                                }}
                                                options={{
                                                    cutoutPercentage: 20,
                                                    tooltips: { enabled: false },
                                                    hover: { animationDuration: 100 },
                                                    borderAlign: 'inner',
                                                }}
                                            />
                                        </div>
                                        : 
                                        <Loader />
                                }
                                <div className={styles.programColumn}>
                                    <div className={styles.programTotalText}>
                                        { this.inProgram.totalProgramEnrollment }
                                    </div>
                                    <h3 className={styles.programTotalsSubtitle}>Patients in Program</h3>
                                    <div className={styles.programTotalRow}>
                                        <PointText
                                            color="#E1A7F6"
                                            text="Off Target"
                                            fontSize={12}
                                            classes='program-legend'
                                        />
                                        <span>{ this.inProgram.items.offTarget.count }</span>
                                        <span
                                            className={styles.programTotalPercent}
                                        >
                                            ({
                                                Math.round(
                                                    (this.inProgram.items.offTarget.count/this.inProgram.totalProgramEnrollment)
                                                    * 100
                                                )
                                            }%)
                                        </span>
                                    </div>
                                    <div className={styles.programTotalRow}>
                                        <PointText
                                            color="#B55084"
                                            text="On Target"
                                            fontSize={12}
                                            classes='program-legend'
                                        />
                                        <span>{ this.inProgram.items.onTarget.count }</span>
                                        <span
                                            className={styles.programTotalPercent}
                                        >
                                            ({
                                                Math.round(
                                                    (this.inProgram.items.onTarget.count/this.inProgram.totalProgramEnrollment)
                                                    * 100
                                                )
                                            }%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.programDivider} />
                        <div className={styles.programRate}>
                            <div className="p-4">
                                <Title text="Readmission Rate" />
                            </div>
                            <div className={styles.readmitStep}>
                                {icons.readmitArrow}
                                <div className={styles.readmitarrowtext}>
                                    On Target
                                </div>
                            </div>
                            <div className={styles.readmitPercent}>
                                <div className={styles.readmitPercentCount}>
                                    11%
                                </div>
                                <div className={styles.readmitPercentText}>
                                    30 day <br />
                                    readmit rate
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
    
                <Box className={styles.box}>
                    <div className={styles.lineChartWrapper}>
                        {
                            deviceActivityData
                                ?
                                <ChartDailyActive data={deviceActivityData} />
                                :
                                <Loader classes="mt-100" />
                        }
                    </div>
                </Box>
    
            </div>
        );
    }
}
