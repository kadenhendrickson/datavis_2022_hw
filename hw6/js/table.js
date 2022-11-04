class Table {

    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        console.log('Table Constructor: Application State', this.globalApplicationState);

        this.phraseData = this.globalApplicationState.tableData;
        
        this.vizWidth = 150;
        this.vizHeight = 30;

        this.frequencyScale = d3.scaleLinear()
            .domain([0.0, 1.0])
            .range([0, this.vizWidth]);

        this.percentageScale = d3.scaleLinear()
            .domain([0,100])
            .range([1, this.vizWidth/2])

        this.groupedData = d3.group(globalApplicationState.phraseData, d => d.category);
        this.colorScale = d3.scaleOrdinal()
            .domain(this.groupedData.keys())
            .range([
                '#45B39D',
                '#AF7AC5',
                '#5DADE2',
                '#F4D03F',
                '#CD6155',
                '#DC7633'
            ]);

        this.headerData = [
            {
                ascending: false,
                key: 'phrase'
            },
            {
                ascending: false,
                key: 'total'
            },
            {
                ascending: false,
                sortType: 'R+'
            },
        ]
        this.drawTable();
        this.attachSortHandlers();
        this.drawCatScales();

    }

    drawCatScales() {
        d3.selectAll('.viz-header')
            .append('svg')
            .attr('width', this.vizWidth)
            .attr('height', this.vizHeight);

        let freqSvg = d3.select('#frequency-header').select('svg');
        freqSvg.selectAll('line')
            .data([0, .5, 1])
            .join('line')
            .attr('x1', (d,i) => i * (this.vizWidth-10)/2 + 5)
            .attr('y1', this.vizHeight - 10)
            .attr('x2', (d,i) => i * (this.vizWidth-10)/2 + 5)
            .attr('y2', this.vizHeight)
            .attr('stroke', 'black');

        freqSvg.selectAll('text')
            .data([0, .5, 1])
            .join('text')
            .text(d => d)
            .attr('x', (d,i) => i * (this.vizWidth-10)/2)
            .attr('y', this.vizHeight - 12)
            .attr('font-size', 8);

        let pctSvg = d3.select('#percentage-header').select('svg');
        pctSvg.selectAll('line')
            .data([-100, -50, 0, 50, 100])
            .join('line')
            .attr('x1', (d,i) => i * (this.vizWidth-10)/4 + 5)
            .attr('y1', this.vizHeight - 10)
            .attr('x2', (d,i) => i * (this.vizWidth-10)/4 + 5)
            .attr('y2', this.vizHeight)
            .attr('stroke', 'black');

        pctSvg.selectAll('text')
            .data([-100, -50, 0, 50, 100])
            .join('text')
            .text(d => Math.abs(d))
            .attr('x', (d,i) => i * (this.vizWidth-10)/4)
            .attr('y', this.vizHeight - 12)
            .attr('font-size', 8);
    }


    drawTable() {

        let rowSelection = d3.select('#phraseTableBody')
            .selectAll('tr')
            .data(this.phraseData)
            .join('tr');

        let phraseSelection = rowSelection.selectAll('td')
            .data(this.cellFormatData)
            .join('td')

        let textSelection = phraseSelection.filter(d => d.type === 'text');
        let vizSelection = phraseSelection.filter(d => d.type === 'viz');
       


        textSelection.selectAll('text')
            .data(d => [d])
            .join('text')
            .text(d => d.value);

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', this.vizHeight);

        let percentageSelection = svgSelect.filter(d => d.viz === 'percentage');
        let frequencySelection = svgSelect.filter(d => d.viz === 'frequency');

        
        this.drawFrequency(frequencySelection);
        this.drawPercentages(percentageSelection);

    }

    drawFrequency(frequencySelect) {
        frequencySelect.selectAll('rect')
            .data(d => [d])
            .join('rect')
            .attr('width', d => this.frequencyScale(d.frequency))
            .attr('height', this.vizHeight)
            .attr('x', 0)
            .attr('y', (this.vizHeight - this.vizHeight/1.5)/2)
            .attr('fill', d => this.colorScale(d.category));
    }

    drawPercentages(percentageSelection) {
        percentageSelection.selectAll('rect')
            .data(d => {
                return [
                    {
                        percentage: d.d_speeches,
                        party: 'D'
                    }, 
                    {
                        percentage: d.r_speeches,
                        party: 'R'
                    }
                ]
            })
            .join('rect')
            .attr('width', d => this.percentageScale(d.percentage))
            .attr('height', this.vizHeight)
            .attr('x', d => d.party === 'R' ? this.vizWidth/2 + 1 : this.vizWidth/2 - 1 - this.percentageScale(d.percentage))
            .attr('y', (this.vizHeight - this.vizHeight/1.5)/2)
            .attr('fill', d => d.party === 'R' ? '#CD6155' : '#5499C7')

    }

    attachSortHandlers() {
        let headerSelection = d3.selectAll('th');

        // phrase header
        headerSelection.filter((d,i) => i === 0)
            .on('click', () => {
                this.headerData.forEach((d,i) => i !== 0 ? d.ascending = false : null);
                let info = this.headerData[0];

                if(!info.ascending) {
                    // sort Alphabetical
                    info.ascending = true;
                    this.phraseData.sort((a,b) => a[info.key] < b[info.key] ? -1 : 1);

                } else {
                    info.ascending = false;
                    this.phraseData.reverse();
                }
                this.drawTable();
            })

        // frequency header AND total header
        headerSelection.filter((d,i) => i === 1 || i === 3)
            .on('click', () => {
                this.headerData.forEach((d,i) => i !== 1 ? d.ascending = false : null);
                let info = this.headerData[1];
                this.phraseData = this.globalApplicationState.tableData;

                if(!info.ascending) {
                    info.ascending = true;
                    this.phraseData.sort((a,b) => a[info.key]/50 < b[info.key]/50 ? -1 : 1);

                } else {
                    info.ascending = false;
                    this.phraseData.sort((a,b) => a[info.key]/50 > b[info.key]/50 ? -1 : 1);
                }
                this.drawTable();
            })

        // percentage header - carousels through R+, R-, D+, D-
        headerSelection.filter((d,i) => i === 2)
            .on('click', () => {
                this.headerData.forEach((d,i) => i !== 2 ? d.ascending = false : null);
                let info = this.headerData[2];

                if(info.sortType === 'R+') {
                    this.phraseData.sort((a,b) => parseFloat(a['percent_of_r_speeches']) < parseFloat(b['percent_of_r_speeches']) ? -1 : 1);
                    info.sortType = 'R-';

                } else if(info.sortType === 'R-') {
                    this.phraseData.sort((a,b) => parseFloat(a['percent_of_r_speeches']) > parseFloat(b['percent_of_r_speeches']) ? -1 : 1);
                    info.sortType = 'D+';
                } else if(info.sortType === 'D+') {
                    this.phraseData.sort((a,b) => parseFloat(a['percent_of_d_speeches']) < parseFloat(b['percent_of_d_speeches']) ? -1 : 1);
                    info.sortType = 'D-';

                } else {
                    this.phraseData.sort((a,b) => parseFloat(a['percent_of_d_speeches']) > parseFloat(b['percent_of_d_speeches']) ? -1 : 1);
                    info.sortType = 'R+';
                }
                this.drawTable();
            })
    }

    cellFormatData(d) {
        const phrase = {
            type: 'text',
            value: d.phrase
        };
        const frequency = {
            type: 'viz',
            viz: 'frequency',
            frequency: d.total/50,
            category: d.category
        };

        const percentages = {
            type: 'viz',
            viz: 'percentage',
            d_speeches: parseFloat(d.percent_of_d_speeches),
            r_speeches: parseFloat(d.percent_of_r_speeches)
        };

        const total = {
            type: 'text',
            value: parseFloat(d.total)
        };

        const data = [phrase, frequency, percentages,  total]
        return data
    }

    updateTable() {
        this.phraseData = this.globalApplicationState.tableData;
        // this.phraseData.sort((a,b) => a['category'] < b['category'] ? -1 : 1);
        this.drawTable();
    }    
}