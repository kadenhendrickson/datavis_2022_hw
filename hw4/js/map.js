/** Class representing the map view. */
class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState;

    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([400, 250]); // This moves the map to the center of the SVG

    let path = d3.geoPath()
        .projection(projection);

    let graticule = d3.geoGraticule();
    let outline = graticule.outline();

    // Convert topoJson to geoJson
    let geoJsonFeatures = topojson.feature(globalApplicationState.mapData, globalApplicationState.mapData.objects.countries).features;


    var dataMap = {};
    globalApplicationState.covidData.forEach(dataPoint => {
      let location = dataPoint.iso_code;
      let cases = parseFloat(dataPoint.total_cases_per_million);
      
      // If no case data, ignore
      if(dataPoint.total_cases_per_million === ''){
        return;
      } 
      
      // Create data map so we can look up max cases by country
      if(dataMap[location] === undefined){
        dataMap[location] = cases;
      } else {
        if(dataMap[location] < cases){
          dataMap[location] = cases;
        }
      }
    });

    // Add a 'value' property to each location, indicating maxiumum total_cases_per_million
    geoJsonFeatures.forEach(dataPoint => {
      if(dataMap[dataPoint.id] === undefined) {
        dataPoint.value = 0;
      } else {
        dataPoint.value = dataMap[dataPoint.id]
      }
    });

    // Set up color scale
    let colorScale = d3.scaleLinear()
      .domain([0, d3.max(geoJsonFeatures, d => d.value)])
      .range(['#FEF8F9','#DC1C13', '#84110B']);
    
    var customFormat = function(val) {
      return Math.abs(val) < 1 ? d3.format('.1g')(val) : d3.format('.2~s')(val);
    };
    // Draw map graticule
    d3.select("#map #graticules")
      .datum(graticule)
      .append('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke-width', '0.25')
      .attr('stroke', 'black');

    // Draw graticule outline
    d3.select("#map #graticules")
      .datum(outline)
      .append('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('stroke', 'black');

    // Draw map
    d3.select('#map #countries').selectAll('path')
      .data(geoJsonFeatures)
      .join('path')
      .attr('d', path)
      .attr('fill', d => colorScale(d.value))
      .attr('class', 'country')
      .attr('id', d => d.id)
      .on('click', (d, i) => {
        if(globalApplicationState.selectedLocations.includes(i)) {
          globalApplicationState.selectedLocations = globalApplicationState.selectedLocations.filter(d => d.id !== i.id)
        } else {
          globalApplicationState.selectedLocations.push(i);
        }
        this.updateSelectedCountries();
      });

    var linearGradient = d3.select('#map')
      .append('defs')
      .append('linearGradient')
      .attr('id', 'legendGradient');


    linearGradient.append('stop')
      .attr('offset', '0%')
      .style('stop-color', '#FEF8F9')
      .style('stop-opacity', 1);

    linearGradient.append('stop')
      .attr('offset', '50%')
      .style('stop-color', '#DC1C13');

    linearGradient.append('stop')
      .attr('offset', '100%')
      .style('stop-color', '#84110B');

    // Draw legend box
    d3.select('#map')
      .append('rect')
      .attr('width', 160)
      .attr('height', 25)
      .attr('x', 0)
      .attr('y', 475)
      .attr('fill', 'url(#legendGradient)');

    d3.select('#map')
      .append('text')
      .text(customFormat(d3.max(geoJsonFeatures, d => d.value)))
      .attr('x', 125)
      .attr('y', 470);
    
    d3.select('#map')
      .append('text')
      .text(customFormat(d3.min(geoJsonFeatures, d => d.value)))
      .attr('x', 0)
      .attr('y', 470);

    
  }

  updateSelectedCountries () {
    d3.select('#map #countries')
      .selectAll('path')
      .classed('selected', false)
      .filter(d => this.globalApplicationState.selectedLocations.includes(d))
      .classed('selected', true);

    this.globalApplicationState.lineChart.updateSelectedCountries();
  }
}
