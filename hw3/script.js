// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DUATION = 450;

setup();

function setup () {

  // Fill in some d3 setting up here if you need
  // for example, svg for each chart, g for axis and shapes

  // Add chart svgs
  d3.select('#Barchart-div')
    .append('svg')
    .classed('bar-chart', true)
    .attr('width', CHART_WIDTH)
    .attr('height', CHART_HEIGHT);
  
  d3.select('#Linechart-div')
    .append('svg')
    .attr('width', CHART_WIDTH)
    .attr('height', CHART_HEIGHT);

  d3.select('#Areachart-div')
    .append('svg')
    .attr('width', CHART_WIDTH)
    .attr('height', CHART_HEIGHT);

  d3.select('#Scatterplot-div')
    .append('svg')
    .classed('scatter-plot', true)
    .attr('width', CHART_WIDTH)
    .attr('height', CHART_HEIGHT);


  // Add axis for charts
  d3.selectAll('svg')
    .append('g')
    .attr('class', 'yAxis')
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  d3.selectAll('svg')
    .append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0, ${CHART_HEIGHT - MARGIN.bottom})`);

  // Add path to Line chart
  d3.select('#Linechart-div')
    .select('svg')
    .append('path')
    .attr('class', 'line-chart');
  
  // Add path to Area chart
  d3.select('#Areachart-div')
    .select('svg')
    .append('path')
    .attr('class','area-chart');



  // Bind event listeners
  d3.selectAll('select')
    .on('change', function() {
      changeData();
    })
  d3.selectAll('#random')
    .on('change', function() {
      changeData();
    })
  
  // Populate first data set
  changeData();
    

}

/**
 * Render the visualizations
 * @param data
 */
function update (data) {

  // ****** TODO ******


  // Syntax for line generator.
  // when updating the path for line chart, use the function as the input for 'd' attribute.
  // https://github.com/d3/d3-shape/blob/main/README.md


  // const lineGenerator = d3.line()
  //   .x(d => the x coordinate for a point of the line)
  //   .y(d => the y coordinate for a point of the line);

  // Syntax for area generator.
  // the area is bounded by upper and lower lines. So you can specify x0, x1, y0, y1 seperately. Here, since the area chart will have upper and lower sharing the x coordinates, we can just use x(). 
  // Similarly, use the function as the input for 'd' attribute. 

  // const areaGenerator = d3.area()
  //   .x(d => the x coordinates for upper and lower lines, both x0 and x1)
  //   .y1(d => the y coordinate for the upper line)
  //   .y0(d=> the base line y coordinate for the area);


  //Set up scatter plot x and y axis. 
  //Since we are mapping death and case, we need new scales instead of the ones above. 
  //Cases would be the horizontal axis, so we need to use width related constants.
  //Deaths would be vertical axis, so that would need to use height related constants.


  //TODO 
  // call each update function below, adjust the input for the functions if you need to.

  updateBarChart(data);
  updateLineChart(data);
  updateAreaChart(data);
  updateScatterPlot(data);
}

/**
 * Update the bar chart
 */

function updateBarChart (data) {
  var barDiv = d3.select('#Barchart-div');
  var svg = barDiv.select('svg');
  var metric = d3.select("#metric").node().value;
  

  // Setup x scale and axis
  var xScale = d3.scaleBand()
              .domain(data.map(d => d.date))
              .range([MARGIN.left, CHART_WIDTH - MARGIN.right]).padding(.1);

  var xAxis = d3.axisBottom();
  xAxis.scale(xScale);
  
  // Setup y scale and axis
  var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
          if(metric === 'deaths'){
            return d.deaths;
          } 
          return d.cases;
        })])
        .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
        .nice();

  var yAxis = d3.axisLeft();
  yAxis.scale(yScale);

  // Select and update bars
  let bars = svg.selectAll('rect')
                .data(data);

  bars.join('rect')
      .on('mouseover', function(){
        d3.select(this)
          .classed('hovered', true);
      })
      .on('mouseout', function() {
        d3.select(this)
          .classed('hovered', false);
      })
      .transition().duration(ANIMATION_DUATION)
      .attr('x', (d,i) => xScale(d.date))
      .attr('width', d => xScale.bandwidth())
      .attr('height', d => {
        if(metric === 'deaths') {
          return yScale(0) - yScale(d.deaths);
        }
        return yScale(0) - yScale(d.cases);
      })
      .attr('y', d => {
        if(metric === 'deaths') {
          return CHART_HEIGHT + MARGIN.bottom - (CHART_HEIGHT - yScale(d.deaths));
        }
        return CHART_HEIGHT + MARGIN.bottom - (CHART_HEIGHT - yScale(d.cases));
        
      });
                                
  svg.select('.yAxis')
      .transition().duration(ANIMATION_DUATION)
      .call(yAxis);
  
  svg.select('.xAxis')
      .transition().duration(ANIMATION_DUATION)
      .call(xAxis);
}

/**
 * Update the line chart
 */
function updateLineChart (data) {
  var lineDiv = d3.select('#Linechart-div');
  var svg = lineDiv.select('svg');
  var metric = d3.select("#metric").node().value;
  var parseTime = d3.timeParse('%m/%d');
  
  // Setup x scale and axis
  var xScale = d3.scalePoint()
              // .domain([
              //   d3.min(data, d => parseTime(d.date)),
              //   d3.max(data, d => parseTime(d.date))
              // ])
              .domain(data.map(d => parseTime(d.date)))
              .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);       

  var xAxis = d3.axisBottom();
  xAxis.scale(xScale)
        .tickFormat(d3.timeFormat('%m/%d'));
  
  // Setup y scale and axis
  var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
          if(metric === 'deaths'){
            return d.deaths;
          } 
            return d.cases;
        })])
        .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
        .nice();

  var yAxis = d3.axisLeft();
  yAxis.scale(yScale);

  var line = d3.line()
                .x(d => xScale(parseTime(d.date)))
                .y(d => {
                  if(metric === 'deaths'){
                    return yScale(d.deaths) + MARGIN.top;
                  }
                  return yScale(d.cases) + MARGIN.top;
                  
                });


  svg.select('.line-chart')
      .datum(data)
      .attr('class','line-chart')
      .transition().duration(ANIMATION_DUATION)
      .attr('d', line);

  svg.select('.yAxis')
      .transition().duration(ANIMATION_DUATION)
      .call(yAxis);
  
  svg.select('.xAxis')
      .transition().duration(ANIMATION_DUATION)
      .call(xAxis);



}

/**
 * Update the area chart 
 */
function updateAreaChart (data) {
  var areaDiv = d3.select('#Areachart-div');
  var svg = areaDiv.select('svg');
  var metric = d3.select("#metric").node().value;
  var parseTime = d3.timeParse('%m/%d');

   // Setup x scale and axis
   var xScale = d3.scaleTime()
                  .domain([
                    d3.min(data, d => parseTime(d.date)),
                    d3.max(data, d => parseTime(d.date))
                  ])
                  .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);       

  var xAxis = d3.axisBottom();
  xAxis.scale(xScale)
        .tickFormat(d3.timeFormat('%m/%d'));

  // Setup y scale and axis
  var yScale = d3.scaleLinear()
                  .domain([0, d3.max(data, d => {
                  if(metric === 'deaths'){
                    return d.deaths;
                  } 
                  return d.cases;
                  })])
                  .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
                  .nice();

  var yAxis = d3.axisLeft();
  yAxis.scale(yScale);

  var area = d3.area()
              .x(d => xScale(parseTime(d.date)))
              .y1(d => {
                  if(metric === 'deaths'){
                    return yScale(d.deaths) + MARGIN.top;
                  }
                  return yScale(d.cases) + MARGIN.top;
                  
                })
              .y0(CHART_HEIGHT - MARGIN.bottom);


  svg.select('.area-chart')
      .datum(data)
      .attr('class','area-chart')
      .transition().duration(ANIMATION_DUATION)
      .attr('d', area);

  svg.select('.yAxis')
      .transition().duration(ANIMATION_DUATION)
     .call(yAxis);

  svg.select('.xAxis')
      .transition().duration(ANIMATION_DUATION)
     .call(xAxis);



}

/**
 * update the scatter plot.
 */

function updateScatterPlot (data) {
  var areaDiv = d3.select('#Scatterplot-div');
  var svg = areaDiv.select('svg');
  var metric = d3.select("#metric").node().value;

   // Setup x scale and axis
   var xScale = d3.scaleLinear()
                  .domain([0,d3.max(data, d => d.cases)])
                  .range([MARGIN.left, CHART_WIDTH - MARGIN.right])
                  .nice();       

  var xAxis = d3.axisBottom();
  xAxis.scale(xScale)


  // Setup y scale and axis
  var yScale = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.deaths)])
                  .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
                  .nice();

  var yAxis = d3.axisLeft();
  yAxis.scale(yScale);

  // Select and update bars
  let circles = svg.selectAll('circle')
                .data(data);

  circles.join('circle')
      .on('mouseover', function(){
        d3.select(this)
          .classed('hovered', true);
      })
      .on('mouseout', function() {
        d3.select(this)
          .classed('hovered', false);
      })
      .on('click', function(d,i) {
        console.log(`(${i.deaths},${i.cases})`);
      })
      .transition().duration(ANIMATION_DUATION)
      .attr('r', 5)
      .attr('cx', d => xScale(d.cases))
      .attr('cy', d => yScale(d.deaths) + MARGIN.top);

  svg.select('.yAxis')
      .transition().duration(ANIMATION_DUATION)
     .call(yAxis);

  svg.select('.xAxis')
      .transition().duration(ANIMATION_DUATION)
     .call(xAxis);

}


/**
 * Update the data according to document settings
 */
function changeData () {
  //  Load the file indicated by the select menu
  const dataFile = d3.select('#dataset').property('value');

  d3.csv(`data/${dataFile}.csv`)
    .then(dataOutput => {
      /**
       * D3 loads all CSV data as strings. While Javascript is pretty smart
       * about interpreting strings as numbers when you do things like
       * multiplication, it will still treat them as strings where it makes
       * sense (e.g. adding strings will concatenate them, not add the values
       * together, or comparing strings will do string comparison, not numeric
       * comparison).
       *
       * We need to explicitly convert values to numbers so that comparisons work
       * when we call d3.max()
       **/

      const dataResult = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
      }));
      if (document.getElementById('random').checked) {
        // if random subset is selected
        update(randomSubset(dataResult));
      } else {
        update(dataResult);
      }
    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset (data) {
  return data.filter((d) => Math.random() > 0.5);
}
