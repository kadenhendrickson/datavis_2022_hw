/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        console.log(this.tableData);
        // add useful attributes
        for (let forecast of this.tableData)
        {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);

        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */

        let marginSvg = d3.select('#marginAxis')
            .attr('width', this.vizWidth)
            .attr('height', this.vizHeight);

        marginSvg.append('line')
            .attr('x1', this.vizWidth/2)
            .attr('y1', 0)
            .attr('x2', this.vizWidth/2)
            .attr('y2', this.vizHeight)
            .style("stroke", "black");
        
        let margins = [-75, -50, -25, 0, 25, 50, 75]
        marginSvg.selectAll('text')
            .data(margins)
            .join('text')
            .text(d => d !== 0 ? '+' + Math.abs(d) : '')
            .attr('x', d => this.scaleX(d) - 12)
            .attr('y', this.vizHeight/2 + 7)
            .attr('class', d => d > 0 ? 'trump' : 'biden');

       
    }

    drawTable() {
        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    this.toggleRow(d, this.tableData.indexOf(d));
                }
            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class);


         
        ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
         */
        
        let vizSelection = forecastSelection.filter(d => d.type === 'viz');
        let textSelection = forecastSelection.filter(d => d.type === 'text');

        textSelection.selectAll('text')
            .data(d => [d])
            .join('text')
            .text(d => d.value);

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d,i) => i === 1));
        this.addCircles(grouperSelect.filter((d,i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        };

        let winChance;
        if (d.isForecast)
        {
            const trumpWinChance = +d.winner_Rparty;
            const bidenWinChance = +d.winner_Dparty;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100)
            {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else
        {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList)
        {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */

        let headerSelection = d3.selectAll('#columnHeaders th')
            .classed('sorting', false);

        let iconSelection = d3.selectAll('#columnHeaders th i')
            .classed('no-display', true)
            .classed('fa-sort-up', false)
            .classed('fa-sort-down', false);
        
        let sortingIndex = this.headerData.findIndex(d => d.sorted === true);
        if(sortingIndex === -1)
            return;

        let ascending = this.headerData[sortingIndex].ascending;
        headerSelection
                .filter((d,i) => i === sortingIndex)
                .classed('sorting', true);

        if(ascending) {
            iconSelection
                .classed('no-display', false)
                .classed('fa-sort-down', false)
                .filter((d,i) => i === sortingIndex)
                .classed('fa-sort-up', true);
        } else {
            iconSelection
                .classed('no-display', false)
                .classed('fa-sort-down', false)
                .filter((d,i) => i === sortingIndex)
                .classed('fa-sort-down', true);

        }
    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */

        containerSelect.selectAll('line')
            .data(ticks)
            .join('line')
            .attr('x1', d => this.scaleX(d))
            .attr('y1', 0)
            .attr('x2', d => this.scaleX(d))
            .attr('y2', this.vizHeight)
            .style("stroke", d => d === 0 ? 'black' : 'grey');

    }

    addRectangles(containerSelect) {
        ////////////
        // PART 4 // 
        ////////////
        /**
         * add rectangles for the bar charts
         */

        containerSelect.selectAll('rect')
            .data(d => {
                if(!d.isForecast)
                    return [];

                if(d.value.marginHigh > 0 && d.value.marginLow < 0) {
                    let alt = [
                        {
                            marginLow: d.value.marginLow,
                            marginHigh: 0
                        },
                        {
                            marginLow: 0,
                            marginHigh: d.value.marginHigh
                        }
                    ];
                    return alt;
                }
                return [d.value];
            })
            .join('rect')
            .attr('width', d => this.scaleX(d.marginHigh) - this.scaleX(d.marginLow))
            .attr('height', this.vizHeight/1.5)
            .attr('x', d => this.scaleX(d.marginLow))
            .attr('y', (this.vizHeight - this.vizHeight/1.5)/2)
            .style('fill', d => d.marginHigh <= 0 ? 'steelblue' : 'firebrick')
            .attr('class', 'margin-bar');

       
    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */

        containerSelect.selectAll('circle')
            .data(d => [d])
            .join('circle')
            .attr('cx', d => this.scaleX(d.value.margin))
            .attr('cy', d => d.isForecast ? this.vizHeight/2 : this.smallVizHeight/2)
            .attr('r', d => d.isForecast ? 5 : 3)
            .attr('fill', d => d.value.margin < 0 ? 'steelblue' :'firebrick')
            .attr('class', 'margin-circle');
    }

    attachSortHandlers() 
    {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */

        let headerSelection = d3.selectAll('#columnHeaders th');

        // State
        headerSelection.filter((d,i) => i === 0)
            .on('click', () => { 
                this.collapseAll();

                this.headerData.forEach((d,i) => {
                    if(i === 0)
                        return;
                    d.sorted = false;
                    d.ascending = false;
                    return d;
                })
                let info = this.headerData[0];
                if(!info.ascending) {
                    this.tableData.sort((a,b) => a[info.key] < b[info.key] ? -1 : 1);
                    info.ascending = true;                    
                } else {
                    this.tableData.reverse();
                    info.ascending = false;                    
                }
                info.sorted = true;
                this.drawTable();
            });

        // Margin of Victory
        headerSelection.filter((d,i) => i === 1)
            .on('click', () => { 
                this.collapseAll();
                this.headerData.forEach((d,i) => {
                    if(i === 1)
                        return;
                    d.sorted = false;
                    d.ascending = false;
                    return d;
                })
                let info = this.headerData[1];
                if(!info.ascending) {
                    this.tableData.sort((a,b) => Math.abs(a[info.key]) < Math.abs(b[info.key]) ? -1 : 1);
                    info.ascending = true;                    
                } else {
                    this.tableData.reverse();
                    info.ascending = false;                    
                }
                info.sorted = true;
                this.drawTable();
            });
            
            
        // Wins
        headerSelection.filter((d,i) => i === 2)
            .on('click', () => { 
                this.collapseAll();
                this.headerData.forEach((d,i) => {
                    if(i === 2)
                        return;
                    d.sorted = false;
                    d.ascending = false;
                    return d;
                })
                let info = this.headerData[2];
                if(!info.ascending) {
                    this.tableData.sort((a,b) => parseFloat(a[info.key]) < parseFloat(b[info.key]) ? -1 : 1);
                    info.ascending = true;                    
                } else {
                    this.tableData.reverse();
                    info.ascending = false;                    
                }
                info.sorted = true;
                this.drawTable();
            });
    }

    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */

        let expanded = rowData['isExpanded'];
        let state = rowData['state'];
        let statePollData = this.pollData.get(state);
        if(!statePollData)
            return;

        statePollData.forEach(poll => poll.isForecast = false);

        if(!expanded) {
            this.tableData[index].isExpanded = true;
            this.tableData.splice(index+1, 0, ...statePollData);
        } else {
            this.tableData[index].isExpanded = false;
            this.tableData.splice(index+1, statePollData.length)
        }
        this.drawTable();
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast);
        this.tableData.forEach(d => d.isExpanded = false);
    }
}
