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

        slider.addEventListener('input', () => {
            weights[metric] = parseFloat(slider.value);
            label.textContent = `${metric}: ${weights[metric].toFixed(2)}`;
            calculateRankings();
        });

        sliderGroup.appendChild(label);
        sliderGroup.appendChild(slider);
        container.appendChild(sliderGroup);
    });
}

// Calculate rankings with NaN and empty name checks
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
        return country["Nation Name"] ? { name: country["Nation Name"], score } : null;
    }).filter(Boolean); // Remove any null entries

    // Sort nations based on scores
    scores.sort((a, b) => b.score - a.score);

    // Get top 10 and worst 10 nations
    const top10 = scores.slice(0, 10);
    const worst10 = scores.slice(-10).reverse();

    displayRankings(top10, worst10);
}



// Display rankings
function displayRankings(top10, worst10) {
    const topList = document.getElementById('top-list');
    const worstList = document.getElementById('worst-list');

    topList.innerHTML = '';
    worstList.innerHTML = '';

    top10.forEach((country, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${country.name}: ${country.score.toFixed(2)}`;
        topList.appendChild(listItem);
    });

    worst10.forEach((country, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${country.name}: ${country.score.toFixed(2)}`;
        worstList.appendChild(listItem);
    });
}

// Initialize the app
function init() {
    createSliders();
    calculateRankings();
}

// Start the app by fetching the data
fetchData();
