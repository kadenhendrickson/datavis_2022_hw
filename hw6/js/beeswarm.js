class BeeswarmChart {
    

    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        console.log('Beeswarm Constructor: Application State', this.globalApplicationState);

        this.CHART_WIDTH = 900;
        this.CHART_HEIGHT = 150;
        this.MARGIN = { left: 20, bottom: 15, top: 15, right: 20 };
       
        // Grouped Data
        let groupedData = d3.group(globalApplicationState.phraseData, d => d.category);
        let phraseData = globalApplicationState.phraseData;
        // console.log('groupedData', groupedData);
       
        // console.log(d3.extent(phraseData.map(d => parseFloat(d.percent_of_r_speeches) - parseFloat(d.percent_of_d_speeches))));
        
        // X Scale
        this.scaleX = d3.scaleLinear()
            .domain(d3.extent(phraseData.map(d => d.sourceX)))
            .range([this.MARGIN.left, this.CHART_WIDTH-this.MARGIN.right])
            .nice();
        
        // Y Scale
        this.scaleY = d3.scaleLinear()
            .domain(d3.extent(phraseData.map(d => d.sourceY)))
            .range([this.MARGIN.bottom, this.CHART_HEIGHT - this.MARGIN.top])
            .nice();

        // Axis Scale
        this.scaleLeaning = d3.scaleLinear()
            .domain(d3.extent(phraseData.map(d => this.scaleX(parseFloat(d.percent_of_r_speeches)) - this.scaleX(parseFloat(d.percent_of_d_speeches)))))
            .range([this.MARGIN.left, this.CHART_WIDTH - this.MARGIN.right]);

        this.radialScale = d3.scaleRadial()
            .domain(d3.extent(phraseData.map(d => parseInt(d.total))))
            .range([2.25, 10.5]);

        this.colorScale = d3.scaleOrdinal()
            .domain(groupedData.keys())
            .range([
                '#45B39D',
                '#AF7AC5',
                '#5DADE2',
                '#F4D03F',
                '#CD6155',
                '#DC7633'
            ]);

        this.drawScale();
        this.drawChart();
    }

    // DRAW SCALE
    drawScale() {
        let xAxis = d3.axisBottom();
        xAxis.scale(this.scaleLeaning);
        d3.select('#scale')
            .call(xAxis);
    }


    // DRAW THE CHART USING CLASS PHRASE DATA
    drawChart() {
        let activeData = this.globalApplicationState.activeData;
        
        console.log('active data', activeData);
        let chartGroups = d3.select('#chart-area')
            .selectAll('.chart')
            .data(activeData);

        chartGroups.exit().remove();

        let groups = chartGroups.enter()
            .append('g')
            .attr('class', 'chart');

        this.addCategories();

            groups.append('svg')
            .attr('width', this.CHART_WIDTH)
            .attr('height', this.CHART_HEIGHT);

        this.addCircles();
    }

    addSvg() {
        if(this.globalApplicationState.grouped) {
            d3.selectAll('.chart')
                .append('svg')
                .attr('width', this.CHART_WIDTH)
                .attr('height', this.CHART_HEIGHT)
                .attr('id' ,'chart-svg');

        } else {
            d3.selectAll('.chart')
                .selectAll('svg')
                .remove();
        }
        // d3.selectAll('.chart')
        //     .filter((d,i) => i !== 0)
        //     .append('svg')
        //     .attr('width', this.CHART_WIDTH)
        //     .attr('height', this.CHART_HEIGHT);

    }


    addCircles() {
        let chartGroups = d3.selectAll('.chart');
        chartGroups.select('svg')
            .selectAll('circle')
            .data(d => {
                if(d.length > 2) {
                    return d;
                } else {
                    return d[1];
                }
                })
            .join('circle')
            .attr('r', d => this.radialScale(d.total))
            .attr('fill', d => this.colorScale(d.category))
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5')
            .transition().duration(1000)
            .attr('cx', d => this.scaleX(d.sourceX))
            .attr('cy', d => this.scaleY(d.sourceY));
    }

    addCategories() {
        if(this.globalApplicationState.grouped) {
            let chartGroups = d3.selectAll('.chart');
            chartGroups.selectAll('text')
                .data(d => [d])
                .join('text')
                .transition().duration(1000)
                .attr('x', this.scaleX(0))
                .attr('y', this.scaleY(0))
                .text(d => {
                    return d[0].charAt(0).toUpperCase() + d[0].slice(1);
                });
        } else {
            d3.selectAll('.chart')
                .selectAll('text')
                .remove()
        }
    }

    updateTable() {

        // d3.selectAll('.chart')
        //     .remove();

        this.drawChart();


    }


}