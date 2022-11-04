class BeeswarmChart {
    

    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;

        this.CHART_WIDTH = 900;
        this.CHART_HEIGHT = 150;
        this.MARGIN = { left: 20, bottom: 15, top: 20, right: 20 };
       
        // Grouped Data
        this.groupedData = d3.group(globalApplicationState.phraseData, d => d.category);
        let phraseData = globalApplicationState.phraseData;       
        
        // Axis Scale
        this.scaleLeaning = d3.scaleLinear()
            .domain(d3.extent(phraseData.map(d => parseFloat(d.percent_of_r_speeches) - parseFloat(d.percent_of_d_speeches))))
            .range([this.MARGIN.left, this.CHART_WIDTH - this.MARGIN.right]);

        this.xDomain = this.globalApplicationState.grouped
            ? d3.extent(phraseData.map(d => d.moveX))
            : d3.extent(phraseData.map(d => d.sourceX));
        
        this.xScale = d3.scaleLinear()
            .domain(this.xDomain)
            .range([this.MARGIN.left, this.CHART_WIDTH - this.MARGIN.right]);

        this.yDomain = this.globalApplicationState.grouped
            ? d3.extent(phraseData.map(d => d.moveY))
            : d3.extent(phraseData.map(d => d.sourceY));

        this.yRange = this.globalApplicationState.grouped
            ? [this.MARGIN.top, this.CHART_HEIGHT*6]
            : [this.MARGIN.top, this.CHART_HEIGHT];
        
        this.yScale = d3.scaleLinear()
            .domain(this.yDomain)
            .range(this.yRange);

        this.radialScale = d3.scaleRadial()
            .domain(d3.extent(phraseData.map(d => parseInt(d.total))))
            .range([2.25, 10.5]);

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

        this.drawScale();
        this.drawChart();
    }

    // DRAW SCALE
    drawScale() {
        let xAxis = d3.axisBottom();
        xAxis.scale(this.scaleLeaning)
            .ticks(10);
        
        let scaleText = d3.select('#scale').append('g');


        d3.select('#scale').append('g')
            .attr('transform', 'translate(0,30)')
            .call(xAxis);

        
        scaleText.append('text')
            .text('Republican Leaning')
            .attr('font-weight', 700)
            .attr('x', this.CHART_WIDTH - 150)
            .attr('y', 20);

        scaleText.append('text')
            .text('Democratic Leaning')
            .attr('font-weight', 700)
            .attr('x', 10)
            .attr('y', 20);

        d3.select('#axis')
            .append('line')
            
    }

    // DRAW THE CHART USING CLASS PHRASE DATA
    drawChart() {
        this.drawAxis();
        this.addBrush();
        this.addCircles();
        this.addCategories();
    }

    drawAxis() {
        let maxY = this.globalApplicationState.grouped
            ? d3.max(this.globalApplicationState.phraseData.map(d => this.yScale(d.moveY)))
            : d3.max(this.globalApplicationState.phraseData.map(d => this.yScale(d.sourceY)));


        d3.select('#axis').select('line')
            .join('line')
            .transition().duration(1000)
            .attr('x1', 436.85)
            .attr('y1', 0)
            .attr('x2', 436.85)
            .attr('y2', maxY)
            .style('stroke', 'black');

    }

    addCircles() {
        this.xDomain = this.globalApplicationState.grouped
        ? d3.extent(this.globalApplicationState.phraseData.map(d => d.moveX))
        : d3.extent(this.globalApplicationState.phraseData.map(d => d.sourceX));

        this.yDomain = this.globalApplicationState.grouped
        ? d3.extent(this.globalApplicationState.phraseData.map(d => d.moveY))
        : d3.extent(this.globalApplicationState.phraseData.map(d => d.sourceY));

        this.yRange = this.globalApplicationState.grouped
            ? [this.MARGIN.top, this.CHART_HEIGHT]
            : [this.MARGIN.top, this.CHART_HEIGHT*6];

        let circles = d3.select('#chart')
            .selectAll('circle')
            .data(this.globalApplicationState.phraseData)
            .join('circle');
            
            circles
            .on('mouseover', function(event, d) {
                let relX = globalApplicationState.grouped 
                    ? d.moveX - d3.select('#chart').node().getBoundingClientRect().x
                    : d.sourceX - d3.select('#chart').node().getBoundingClientRect().x;
                // Adjust for position on screen
                relX = relX < 600 ? relX + 150 : relX - 100;
                let relY = globalApplicationState.grouped ? d.moveY + 75 : d.correctedY + 75;

                // Outline bubble
                d3.select(this)
                    .attr('stroke-width', '1.5');

                // Display Tooltip
                let tooltip = d3.select('#tooltip');

                let tooltipEnter = tooltip.selectAll('text')
                    .data([d])
                    .enter();
                    
                tooltipEnter.append('rect')
                    .attr('rx', 5)
                    .attr('ry', 5)
                    .attr('x',relX - 20)
                    .attr('y', relY - 25)
                    .attr('width', 200)
                    .attr('height', 75)
                    .attr('fill', 'white')
                    .attr('opacity', 0.9)
                    .attr('border-radius', '10px');
                
                tooltipEnter.append('text')
                    .text(d.phrase.charAt(0).toUpperCase() + d.phrase.slice(1))
                    .attr('y', relY)
                    .attr('x', relX)
                    .attr('font-size', 20);
                
                tooltipEnter.append('text')
                    .text(d => {
                        let party = d.position > 0 ? 'R+ ' : 'D+ '
                        return party + d3.format("~r")(Math.abs((d.position)))+'%'
                    })
                    .attr('y', relY + 20)
                    .attr('x', relX)
                    .attr('font-size', 15);
                tooltipEnter.append('text')
                    .text(d => {
                        return 'In ' + d3.format(".0%")(d.total/50) + ' of speeches';
                    })
                    .attr('y', relY + 40)
                    .attr('x', relX)
                    .attr('font-size', 15);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0.5');

                d3.select('#tooltip')
                    .selectAll('text')
                    .remove();
                
                d3.select('#tooltip')
                    .selectAll('rect')
                    .remove();
            })
            .attr('fill', d => this.colorScale(d.category))
            .attr('r', d => this.radialScale(d.total))
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5')
            .transition().duration(1000)
            .attr('cx', d => {
                return this.globalApplicationState.grouped ? this.xScale(d.moveX) : this.xScale(d.sourceX);
            })
            .attr('cy', d => {
                return this.globalApplicationState.grouped ?  this.yScale(d.moveY) : this.yScale(d.sourceY);
            });

            this.circles = circles;
    }

    addCategories() {
        d3.select('#chart')
            .selectAll('text')
            .data(this.groupedData.keys())
            .join('text')
            .text(d => {
                return d.charAt(0).toUpperCase() + d.slice(1);
            })
            .attr('fill', 'darkgrey')
            .attr('font-size', 18)
            .transition().duration(1000)
            .attr('x', '0')
            .attr('y', (d,i) => {
                return this.globalApplicationState.grouped ? i * 165 + this.MARGIN.top  : -30;
            });
    }

    updateChart() {
        d3.select('#brush-layer')
            .call(this.brush.move, null);
        this.drawChart();
    }

    addBrush() {
        let extent = this.globalApplicationState.grouped 
            ? [[0, 0],[this.CHART_WIDTH, this.CHART_HEIGHT*6 + this.MARGIN.bottom]]
            : [[0, 0],[this.CHART_WIDTH, this.CHART_HEIGHT + this.MARGIN.bottom]]
        this.brush = d3.brush()
            .extent(extent)
            .on('start brush end', ({selection}) => {
                let value = [];

                // reset dots
                if(selection) {                    
                    this.circles
                        .attr("stroke", "grey")
                        .attr("fill", "grey")
                    const [[x0, y0], [x1, y1]] = selection;
                    
                    value = this.circles.filter(d => {
                            let x = this.globalApplicationState.grouped ? this.xScale(d.moveX) : this.xScale(d.sourceX);
                            let y = this.globalApplicationState.grouped ? this.yScale(d.moveY) : this.yScale(d.sourceY);
                            return x0 <= x && x < x1 && y0 <= y && y < y1;
                    })
                            .attr("fill", d => this.colorScale(d.category))
                            .data();

                    this.globalApplicationState.tableData = value;
                    this.globalApplicationState.table.updateTable();
                } else {
                    this.circles
                        .attr('fill', d => this.colorScale(d.category))
                        .attr('stroke', 'black')
                        .attr('stroke-width', '0.5')
                    this.globalApplicationState.tableData = this.globalApplicationState.phraseData;
                    this.globalApplicationState.table.updateTable();
                }
                    } )
            d3.select('#brush-layer')
                .call(this.brush)
    }
}