/** Class representing the line chart view. */
class LineChart {
  
  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState;
    const CHART_WIDTH = 700;
    const CHART_HEIGHT = 500;
    const MARGIN = { left: 80, bottom: 50, top: 20, right: 50 };

    // Filter out continent data
    let continentData = this.globalApplicationState.covidData.filter(data => data.iso_code.startsWith('OWID'));
    continentData = continentData.map(data => {
      if(data.total_cases_per_million === '') {
        data.total_cases_per_million = '0';
        return data;
      }
      return data;
    });                                               

    // Group data by location
    let groupedData = d3.group(continentData, d => d.location);
    let dateGroupedData = d3.group(continentData, d => d.date);


    // set up formats
    var parseTime = d3.timeParse('%Y-%m-%d');
    var formatTime = d3.timeFormat('%Y-%m-%d');
    var customFormat = function(val) {
      return Math.abs(val) < 1 ? d3.format('.2g')(val) : d3.format('.2~s')(val);
    };
    

    // Positition axis
    d3.select('#x-axis')
      .attr('transform', `translate(0, ${CHART_HEIGHT - MARGIN.bottom})`);
    d3.select('#y-axis')
      .attr('transform', `translate(${MARGIN.left}, 0)`)

    // Setup scales
    var xScale = d3.scaleTime()
                .domain(d3.extent(continentData.map(d => new Date(d.date))))
                .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

    var yScale = d3.scaleLinear()
                .domain(d3.extent(continentData.map(d => parseFloat(d.total_cases_per_million))))
                .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top])
                .nice();
  
    var colorScale = d3.scaleOrdinal()
                    .domain(groupedData.keys())
                    .range(d3.schemeCategory10);
    
    // Setup axis
    var xAxis = d3.axisBottom();
    xAxis.scale(xScale)
          .tickFormat(d3.timeFormat('%b %Y'));

    var yAxis = d3.axisLeft();
    yAxis.scale(yScale);
        
    // Draw Axis
    d3.select('#x-axis')
      .call(xAxis);

    d3.select('#y-axis')
      .call(yAxis);

    // Setup axis labels 
    d3.select('#line-chart')
      .append('text')
      .text('Date')
      .attr('fill', '#000')
      .attr('x', CHART_WIDTH/2)
      .attr('y', CHART_HEIGHT);

    d3.select('#line-chart')
      .append('text')
      .text('Cases per million')
      .attr('fill', '#000')
      .attr('transform', `translate(20, ${CHART_HEIGHT/2 + MARGIN.top}) rotate(-90)`);


    // Setup line generator
    var lineGenerator = d3.line()
                          .x(d => xScale(parseTime(d.date)))
                          .y(d => yScale(parseFloat(d.total_cases_per_million)));
                     

    // Draw initial continent lines
    d3.select('#lines').selectAll('.line')
      .data(groupedData)
      .join('path')
      .attr('stroke', d => colorScale(d[0]))
      .datum(d => d[1])
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('class', 'line')
      .attr('d', lineGenerator);

    d3.select('#line-chart')
      .on('mousemove', (d) => {
        
        let relPosition = d.x - d3.select('#line-chart').node().getBoundingClientRect().x;
        if(relPosition > MARGIN.left && relPosition < CHART_WIDTH - MARGIN.right) { 
          
          // Set line
         d3.select('#overlay')
            .select('line')
            .attr('x1', relPosition)
            .attr('y1', MARGIN.top)
            .attr('x2', relPosition)
            .attr('y2', CHART_HEIGHT-MARGIN.bottom)
            .attr('stroke', '#000000');
          
          let date = xScale.invert(relPosition)
          date = formatTime(date);
          let dateData = dateGroupedData.get(date);
          if(dateData === undefined){
            return;
          }
          let sortedData = dateData.sort((a,b) => b.total_cases_per_million - a.total_cases_per_million);

          // Set text
          d3.select('#overlay')
            .selectAll('text')
            .data(sortedData)
            .join('text')
            .text(d => d.location + ' ' + customFormat(d.total_cases_per_million))
            .attr('x', relPosition < CHART_WIDTH/2 + MARGIN.right  ?  relPosition + 50 : relPosition - 150)
            .attr('y', (d,i) => MARGIN.top + 20 * i)
            .attr('fill', d => colorScale(d.location));
        }
      })
  
  }

  updateSelectedCountries () {
    const CHART_WIDTH = 700;
    const CHART_HEIGHT = 500;
    const MARGIN = { left: 80, bottom: 50, top: 20, right: 50 };

    // When new countries are selected, remove vertical line and text
    d3.selectAll('#overlay text').remove();
    d3.select('#overlay line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', 0)

    // Get codes for selected countries.
    let selectedCountries = this.globalApplicationState.selectedLocations;

    // If no selected countries, use continents
    let chartData;
    if(selectedCountries.length === 0) {
      chartData = this.globalApplicationState.covidData.filter(data => data.iso_code.startsWith('OWID'));
    } else {
      let countryCodes = selectedCountries.map(d => d.id)
      chartData = this.globalApplicationState.covidData.filter(data => countryCodes.includes(data.iso_code));
    }

    // Get data in correct format
    chartData = chartData.map(data => {
      if(data.total_cases_per_million === '') {
        data.total_cases_per_million = '0';
        return data;
      }
      return data;
    });     

    // Group data by location and date
    let groupedData = d3.group(chartData, d => d.location);
    let dateGroupedData = d3.group(chartData, d => d.date);

    // Custom number formatting
    var customFormat = function(val) {
      return Math.abs(val) < 1 ? d3.format('.2g')(val) : d3.format('.2~s')(val);
    };

    // Time parsing 
    var parseTime = d3.timeParse('%Y-%m-%d');
    var formatTime = d3.timeFormat('%Y-%m-%d');

    // Setup scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(chartData.map(d => new Date(d.date))))
        .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

    var yScale = d3.scaleLinear()
            .domain(d3.extent(chartData.map(d => parseFloat(d.total_cases_per_million))))
            .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top])
            .nice();

    var colorScale = d3.scaleOrdinal()
                .domain(groupedData.keys())
                .range(d3.schemeCategory10);

    
    // Setup line generator
    var lineGenerator = d3.line()
        .x(d => xScale(parseTime(d.date)))
        .y(d => yScale(parseFloat(d.total_cases_per_million)));


    // Setup axis
    var xAxis = d3.axisBottom();
      xAxis.scale(xScale)
            .tickFormat(d3.timeFormat('%b %Y'));
  
    var yAxis = d3.axisLeft();
      yAxis.scale(yScale);
          
    // Draw Axis
    d3.select('#x-axis')
        .call(xAxis);
  
    d3.select('#y-axis')
        .call(yAxis);
    
    // Draw data lines
    d3.select('#lines').selectAll('.line')
        .data(groupedData)
        .join('path')
        .attr('stroke', d => colorScale(d[0]))
        .datum(d => d[1])
        .attr('fill', 'none')
        .attr('stroke-width', '1')
        .attr('class', 'line')
        .attr('d', lineGenerator);

    // Setup text/vertical line for mouseover
    d3.select('#line-chart')
        .on('mousemove', (d) => {
          let relPosition = d.x - d3.select('#line-chart').node().getBoundingClientRect().x;
          if(relPosition > MARGIN.left && relPosition < CHART_WIDTH - MARGIN.right) { 
            
            // Set line
           d3.select('#overlay')
              .select('line')
              .join('line')
              .attr('x1', relPosition)
              .attr('y1', MARGIN.top)
              .attr('x2', relPosition)
              .attr('y2', CHART_HEIGHT-MARGIN.bottom)
              .attr('stroke', '#000000');
            
            // Retrieve date from mouse position
            let date = xScale.invert(relPosition)
            date = formatTime(date);

            // Retrieve correct data for date
            let dateData = dateGroupedData.get(date);
            if(dateData === undefined){
              return;
            }
            let sortedData = dateData.sort((a,b) => b.total_cases_per_million - a.total_cases_per_million);
  
            // Set text
            d3.select('#overlay')
              .selectAll('text')
              .data(sortedData)
              .join('text')
              .text(d => d.location + ' ' + customFormat(d.total_cases_per_million))
              .attr('x', relPosition < CHART_WIDTH/2 + MARGIN.right ?  relPosition + 50 : relPosition - 150)
              .attr('y', (d,i) => MARGIN.top + 20 * i)
              .attr('fill', d => colorScale(d.location));
          }
        });
  }
}
