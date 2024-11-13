// Define the metrics
const metrics = [
    "GDP per capita",
    "IQ average",
    "Gini Coefficient",
    "Life expectancy",
    "HDI",
    "Unemployment rate",
    "Public debt to GDP ratio",
    "CPI",
    "Rule of Law Index",
    "Democracy Index"
];

let data = []; // Will hold the fetched CSV data
let weights = {};


// Fetch and parse CSV data
function fetchData() {
    Papa.parse('data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            data = results.data; // Save the parsed data
            init(); // Initialize the app once data is loaded
        }
    });
}

// Function to get the flag URL for a given country
async function getFlagUrl(countryName) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
        const data = await response.json();
        return data[0].flags.svg; // Access the flag SVG URL
    } catch (error) {
        console.error(`Error fetching flag for ${countryName}:`, error);
        return null; // Return null if there is an error
    }
}

// Create sliders
function createSliders() {
    const container = document.getElementById('sliders-container');
    metrics.forEach(metric => {
        weights[metric] = 0.5; // Default weight
        const sliderGroup = document.createElement('div');
        sliderGroup.className = 'slider-group';

        const label = document.createElement('label');
        label.textContent = `${metric}: ${weights[metric].toFixed(2)}`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.01';
        slider.value = weights[metric];

        // Update weight and label on slider change
        slider.addEventListener('input', () => {
            weights[metric] = parseFloat(slider.value);
            label.textContent = `${metric}: ${weights[metric].toFixed(2)}`;
        });

        sliderGroup.appendChild(label);
        sliderGroup.appendChild(slider);
        container.appendChild(sliderGroup);
    });
}

// Calculate rankings based on slider weights
function calculateRankings() {
    const scores = data.map(country => {
        let score = 0;
        metrics.forEach(metric => {
            let value = parseFloat(country[metric]);
            // If the value is not a valid number, use 0 as a fallback
            if (isNaN(value)) {
                value = 0;
            }
            
            score += value * weights[metric];
            if (metric=="Democracy Index"){
            console.log(value)}
            
        });

        // Only return valid nations (non-empty names)
        return country["Nation Name"] ? { name: country["Nation Name"], score } : null;
    }).filter(Boolean); // Remove any null entries

    // Sort nations based on scores (descending order: highest score first)
    scores.sort((a, b) => b.score - a.score);

    // Display the rankings
    displayRankingsWithFlags(scores);
}

// Display rankings with flags
async function displayRankingsWithFlags(scores) {
    const topList = document.getElementById('top-list');
    const bottomList = document.getElementById('worst-list');

    // Get top 50 and bottom 50 nations
    const top50 = scores.slice(0, 50);
    const bottom50 = scores.slice(-50).reverse();

    topList.innerHTML = '';
    bottomList.innerHTML = '';

    // Fetch flags and add them to the top 50 list
    for (const [index, country] of top50.entries()) {
        const listItem = document.createElement('li');
        const flagUrl = await getFlagUrl(country.name);

        // Display flag and name only, no manual numbering
        if (flagUrl) {
            const flagImg = document.createElement('img');
            flagImg.src = flagUrl;
            flagImg.alt = `${country.name} flag`;
            flagImg.style.width = '30px';
            flagImg.style.marginRight = '10px';
            listItem.appendChild(flagImg);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${country.name}: ${country.score.toFixed(2)}`;

        listItem.appendChild(nameSpan);
        topList.appendChild(listItem);
    }

    // Fetch flags and add them to the bottom 50 list
    for (const [index, country] of bottom50.entries()) {
        const listItem = document.createElement('li');
        const flagUrl = await getFlagUrl(country.name);

        // Display flag and name only, no manual numbering
        if (flagUrl) {
            const flagImg = document.createElement('img');
            flagImg.src = flagUrl;
            flagImg.alt = `${country.name} flag`;
            flagImg.style.width = '30px';
            flagImg.style.marginRight = '10px';
            listItem.appendChild(flagImg);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${country.name}: ${country.score.toFixed(2)}`;

        listItem.appendChild(nameSpan);
        bottomList.appendChild(listItem);
    }
}

// Initialize the app
function init() {
    createSliders();
    // Add event listener to the calculate rankings button
    document.getElementById('calculate-button').addEventListener('click', calculateRankings);
}

function testEcharts() {
  window.onload = function() {
    var dom = document.getElementById('chart-container');
    var myChart = echarts.init(dom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    var app = {};

    var option;

    option = {
      xAxis: {},
      yAxis: {},
      series: [
        {
          symbolSize: 20,
          data: [
            [10.0, 8.04],
            [8.07, 6.95],
            [13.0, 7.58],
            [9.05, 8.81],
            [11.0, 8.33],
            [14.0, 7.66],
            [13.4, 6.81],
            [10.0, 6.33],
            [14.0, 8.96],
            [12.5, 6.82],
            [9.15, 7.2],
            [11.5, 7.2],
            [3.03, 4.23],
            [12.2, 7.83],
            [2.02, 4.47],
            [1.05, 3.33],
            [4.05, 4.96],
            [6.03, 7.24],
            [12.0, 6.26],
            [12.0, 8.84],
            [7.08, 5.82],
            [5.02, 5.68]
          ],
          type: 'scatter'
        }
      ]
    };


    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
  }
}

  
// Start the app by fetching the data
fetchData();
calculateRankings();
testEcharts()
