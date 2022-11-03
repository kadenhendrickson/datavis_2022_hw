class BeeswarmChart {
    

    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        console.log('Beeswarm Constructor: Application State', this.globalApplicationState);

        this.CHART_WIDTH = 900;
        this.CHART_HEIGHT = 150;
        this.MARGIN = { left: 20, bottom: 15, top: 75, right: 20 };
       
        // Grouped Data
        this.groupedData = d3.group(globalApplicationState.phraseData, d => d.category);
        console.log('grouped!', this.groupedData);
        let phraseData = globalApplicationState.phraseData;       
        
        // Axis Scale
        this.scaleLeaning = d3.scaleLinear()
            .domain(d3.extent(phraseData.map(d => parseFloat(d.percent_of_r_speeches) - parseFloat(d.percent_of_d_speeches))))
            .range([this.MARGIN.left, this.CHART_WIDTH - this.MARGIN.right]);

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

        d3.select('#scale')
            .call(xAxis);

        d3.select('#axis')
            .append('line')

    }

    // DRAW THE CHART USING CLASS PHRASE DATA
    drawChart() {
        this.drawAxis();
        this.addCircles();
        this.addCategories();
    }

    drawAxis() {

        let maxY = this.globalApplicationState.grouped
            ? d3.max(this.globalApplicationState.phraseData.map(d => d.moveY))
            : d3.max(this.globalApplicationState.phraseData.map(d => d.sourceY));

        // let center = ((this.CHART_WIDTH - this.MARGIN.right) - this.MARGIN.left) / 2;
        // let center = this.scaleLeaning(this.scaleLeaning.domain()[1] - (this.scaleLeaning.domain()[1] - this.scaleLeaning.domain()[0])/2);
        let center = this.scaleLeaning(0);
        console.log('max domain', this.scaleLeaning.domain()[1]);
        console.log('min domain', this.scaleLeaning.domain()[0]);

        console.log('alleged center:',this.scaleLeaning.domain()[1] - (this.scaleLeaning.domain()[1] - this.scaleLeaning.domain()[0])/2);
        d3.select('#axis').select('line')
            .join('line')
            .transition().duration(1000)
            .attr('x1', center)
            .attr('y1', 0)
            .attr('x2', center)
            .attr('y2', this.MARGIN.top + maxY + this.MARGIN.bottom)
            .style('stroke', 'black');

    }

    addCircles() {
        d3.select('#chart')
            .selectAll('circle')
            .data(this.globalApplicationState.phraseData)
            .join('circle')
            .attr('r', d => this.radialScale(d.total))
            .attr('fill', d => this.colorScale(d.category))
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5')
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
            .transition().duration(1000)
            .attr('cx', d => {
                return this.globalApplicationState.grouped ? d.moveX : d.sourceX;
            })
            .attr('cy', d => {
                return this.globalApplicationState.grouped ?  d.moveY + this.MARGIN.top : d.sourceY + this.MARGIN.top;
            });
        
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
                return this.globalApplicationState.grouped ? i * 128 + this.MARGIN.top - 30 : -30;
            });
    }

    updateTable() {
        this.drawChart();
    }


}