
// ******* DATA LOADING *******
async function loadData () {
    const phraseData = await d3.json('data/words.json');
    return phraseData;
  }

// ******* STATE MANAGEMENT *******

const globalApplicationState = {
    grouped: false,
    tableData: null,
    phraseData: null,
    beeswarmChart: null,
    table: null,
  };



// ******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {

  
    globalApplicationState.phraseData = loadedData;
    globalApplicationState.tableData = loadedData;
  
    const beeswarmChart = new BeeswarmChart(globalApplicationState);
    const table = new Table(globalApplicationState);
  
    globalApplicationState.beeswarmChart = beeswarmChart;
    globalApplicationState.table = table;
  
    d3.select('#grouped-checkbox')
      .on('click', (d) => {
        console.log(d.target.checked);
        if(d.target.checked) {
            globalApplicationState.grouped = true;
            globalApplicationState.beeswarmChart.updateChart();
        } else {
            globalApplicationState.grouped = false;
            globalApplicationState.beeswarmChart.updateChart();
        }

      });
  });
  

  
  