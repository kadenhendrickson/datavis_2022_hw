// ******* HTML SETUP *******
// Setting up basic HTML structure
function setupHtml() {
    // const chart = d3.select('#content');

    // chart.append('text')
    //     .attr('x', '0')
    //     .attr('y', '0')
    //     .text('Democratic Leaning');
    // chart.append('text')
    //     .attr('x', '0')
    //     .attr('y', '0')
    //     .text('Republican Leaning');
    
    //     chart.append('svg')
    //     .attr('id', 'chart-scale');
    // chart.append('g')
    //     .attr('id', 'chart-content');


}


// ******* DATA LOADING *******
// We took care of that for you
async function loadData () {
    const phraseData = await d3.json('data/words.json');
    return phraseData;
  }

// ******* STATE MANAGEMENT *******
// This should be all you need, but feel free to add to this if you need to 
// communicate across the visualizations
const globalApplicationState = {
    grouped: false,
    activeData: null,
    phraseData: null,
    beeswarmChart: null,
    table: null,
  };



// ******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {
    setupHtml();

  
    // Store the loaded data into the globalApplicationState
    globalApplicationState.phraseData = loadedData;
    globalApplicationState.activeData = [loadedData];
  
    // Creates the view objects with the global state passed in 
    const beeswarmChart = new BeeswarmChart(globalApplicationState);
    // const table = new Table(globalApplicationState);
  
    globalApplicationState.beeswarmChart = beeswarmChart;
    // globalApplicationState.table = table;
  
    //TODO add interactions for Clear Selected Countries button
    d3.select('#grouped-checkbox')
      .on('click', (d) => {
        console.log(d.target.checked);
        if(d.target.checked) {
            globalApplicationState.grouped = true;
            globalApplicationState.activeData = d3.group(globalApplicationState.phraseData, d => d.category);
            console.log('GLOBALAPPSTATE', globalApplicationState);
            globalApplicationState.beeswarmChart.updateTable();
            
        } else {
            globalApplicationState.grouped = false;
            globalApplicationState.activeData = [loadedData]
            console.log('GLOBALAPPSTATE', globalApplicationState);
            globalApplicationState.beeswarmChart.updateTable();


        }

      });
  });
  

  
  