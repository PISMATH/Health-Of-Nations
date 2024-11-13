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
        });

        // Only return valid nations (non-empty names)
        return country["Nation Name"] ? { name: country["Nation Name"], value: score } : null;
    }).filter(Boolean); // Remove any null entries

    // Sort nations based on scores (descending order: highest score first)
    scores.sort((a, b) => b.value - a.value);

    // Display the rankings
    displayEchartsMap(scores)
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
        nameSpan.textContent = `${country.name}: ${country.value.toFixed(2)}`;

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
        nameSpan.textContent = `${country.name}: ${country.value.toFixed(2)}`;

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

function displayEchartsMap(scores) {
  const countriesJsonPath = './data/countries.geo.json';
  var dom = document.getElementById('map-chart-container');
  var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
  });

  // Fetch the JSON data for all countries
  fetch(countriesJsonPath)
    .then(response => response.json())
    .then(countriesJson => {
      // Hide loading if needed
      myChart.hideLoading();

      // Register the map with ECharts and apply filters to focus on the USA
      echarts.registerMap('world', countriesJson);

      // Define data specifically for the United States states
      const data = scores;
      /* const data = [
        { name: 'Philippines', value: 4822023 },
        { id: 'AFG', value: 4822023 },
      ]; */

      console.log(data)

      // Sort data
      data.sort((a, b) => a.value - b.value);

      // Define map options, focusing on USA region
      const mapOption = {
        visualMap: {
          left: 'right',
          min: 0,
          max: 10,
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          },
          text: ['High', 'Low'],
          calculable: true
        },
        series: [
          {
            id: 'population',
            type: 'map',
            roam: true,
            map: 'world',
            emphasis: {
              focus: 'series'
            },
            center: [0, 0], // Center the map on the USA
            zoom: 1.3, // Adjust zoom to focus on USA
            nameMap: {
              // Map state names if needed
              'United States': 'USA'
            },
            animationDurationUpdate: 1000,
            universalTransition: true,
            data: data
          }
        ]
      };

      myChart.setOption(mapOption);
    })
    .catch(error => console.error('Error loading the countries JSON:', error));
}

  
// Start the app by fetching the data
fetchData();
calculateRankings();
