import React from 'react'
import styles from './DataTable.module.css'
import Loader from '../Loader'

export default class DataTable extends React.Component {
    constructor(props) {
        super(props);
        // console.log('DataTable.ctor', { props });  

        this.state = {
            // default - first row is selected
            selectedRow: props.selected || 0,
            primarySelected: true,
        };

        this.tdTableElement = null;
        this.tdHeadElement = null;
        this.debounceHeader = null;

        this.onCellClick = props.onCellClick || (() => {});
    }

    componentDidMount() {
        window.addEventListener('resize', this.streamStickyHeader);
        window.addEventListener('keydown', this.onKeyPress);
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.streamStickyHeader);
        window.removeEventListener('keydown', this.onKeyPress);
    }

    componentDidUpdate(prevProps) {
        this.streamStickyHeader();
        // Primary row selection, reupdate after data changing
        let needSelectFirst = this.state.primarySelected || false;
        
        if (this.props.table && this.props.table.data && this.props.table.data.length) {
            const selectedRow = this.props.table.data[this.state.selectedRow];
            const selectedId = selectedRow?.data.id ?? 0;
            if (needSelectFirst || selectedId !== this.state.selectedId) {
                this.setRowSelection(0);
            }
        }
    };

    handleCellClick = (id, cell, row) => {
        // Handle Medication form
        // console.log('DT.Action cell', {id, cell, row});
        if (cell.action) {
            cell.action({id, cell, row});
        }
        this.setRowSelection(row.index, false, id, cell, row);
    };

    processRowAction = ({ id, cell, row }) => {
        // console.info({ id, cell, row });
        if (cell.click) cell.click({ id, cell, row });
        this.onCellClick({ id, cell, row });
    };

    setRowSelection = (index, scroll, id, cell, row) => {
        // console.log('setRowSelection', { index, scroll });
        const activeRow = row || this.props.table.data[index];
        if (activeRow) {
            // console.log('setRowSelection:', { activeRow });

            const activeCell = activeRow.cells.filter(f => f.profileId)[0];
            //const actionCell = activeRow.cells.filter(f => f.action && typeof f.action === 'function')[0];
            // console.log('DataTable.interaction', {actionCell,  activeCell });

            const selectionState = {
                prev: this.state.selectedRow, 
                index, activeRow, activeCell,
            };

            if (activeCell) {
                this.processRowAction({
                    id: activeRow.data.id,
                    cell: activeCell,
                    row: activeRow,
                });

                this.setState({
                    selectedRow: index,
                    selectedId: activeRow.data.id,
                    primarySelected: false,
                });

                if (typeof this.props.onSelectionChanged === 'function') {
                    this.props.onSelectionChanged(
                        index, 
                        selectionState.prev, 
                        {
                            id: activeRow.data.id,
                            cell: activeCell,
                            row: activeRow,
                        },
                        scroll,
                    );
                }
            }
        } 
    }

    renderTableHeader = (head) => {
        return (head || []).map((colunum, index) => {
            colunum.key = colunum.key || `${colunum.id}_${index}`;
            return (
                <th 
                    className={styles.dtHeadCell} 
                    key={colunum.key}
                >
                        {colunum.title.toUpperCase()}
                </th>
            );
        })
    };

    renderTableData = (data) => {
        // console.log('renderTableData.TBODY', { data });
        if (!data || !data.length) return;

        return data.map((row, index) => {
            let rowClass = `dtRow ${styles.dtRow}`;

            const selectedRow = (index === this.state.selectedRow);
            if (selectedRow) {
                row.selectedRow = selectedRow;
                rowClass += ` dtRowSelected ${styles.dtRowSelected}`;
            }

            // console.log('renderTableData.ROW', { row, index });
            row.key = (row.key || 'r') + `_${index}_${data.length}`;
            row.index = index;

            return (
                <tr key={row.key} className={rowClass}>
                {
                    row.cells &&
                    row.cells.map((cell, index) => {
                        if (!cell.content) {
                            cell = { content: cell };
                        }

                        cell.key = (cell.key || 'c') + `_${index}_${row.cells.length}_${row.key}`;
                        cell.className = styles.dtCell;
                        if (cell.classes && cell.classes.length) {
                            cell.className += ` ${cell.classes.join(' ')}`;
                        }

                        // console.log('renderTableData.CELL', { cell, index });
                        return (
                            <td 
                                key={cell.key} 
                                className={`dtCell ${cell.className}`}
                                onClick={() => this.handleCellClick(cell.id, cell, row)}
                            >
                                {cell.content}
                            </td>
                        );
                    })
                }
                </tr>
            );
        });
    }

    onKeyPress = (e) => {
        // console.log('onKeyPress', { e });
        if (!this.props.table || !this.props.table.data || !this.props.table.data.length)
            return;

        e = e || window.event;
        let newIndex = 0;


        if (e.keyCode === '38' || e.keyCode === 38) {
            // down up
            newIndex = (this.state.selectedRow || 0);
            newIndex--;
            this.setRowSelection(newIndex, true);
        }
        else if (e.keyCode === '40' || e.keyCode === 40) {
            // down arrow
            newIndex = (this.state.selectedRow || 0);
            newIndex++;
            this.setRowSelection(newIndex, true);
        }
    }

    renderTable = ({ head, data }) => {
        // console.log('renderTable', { head, data });
        return (
            <>
                <table className={`${styles.dtTable} ${this.props.classes}`} ref={(e) => { this.tdTableElement = e; }}>
                    <thead>
                        <tr className={styles.dtHeader} ref={(e) => { this.tdHeadElement = e; }}>
                            {this.renderTableHeader(head)}
                        </tr>
                    </thead>

                    <tbody>
                        {this.renderTableData(data)}
                    </tbody>

                </table>

                { 
                    (!data || !data.length) &&
                    <div className="noDataHint">
                        The result of your search is emptiness
                        <div>Try to change filter settings</div>
                    </div>
                }
            </>
        );
    };

    tableScrollHandler = (e) => {
        if (!this.tdHeadElement) return;
        if (e.target.scrollTop === this.tdHeadElement.dataset.translateY) return;
        this.tdHeadElement.dataset.translateY = e.target.scrollTop;
        this.tdHeadElement.style.transform = `translateY(${e.target.scrollTop}px)`;
    };

    streamStickyHeader = () => {
        const { tdTableElement } = this;
        if (!tdTableElement) return;

        const tableParent = tdTableElement.parentNode;
        if ( !tableParent ) return;

        // Direct watcher:
        tableParent.removeEventListener('scroll', this.tableScrollHandler);
        tableParent.addEventListener('scroll', this.tableScrollHandler);
    };

    render() {
        // console.log('DataTable.render', {  ...this.props, ...this.state});
        return !!this.props.table
            ? (this.renderTable(this.props.table))
            : <Loader classes="table-loader" />
    }
}
 