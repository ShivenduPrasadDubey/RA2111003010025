var express = require('express');
var app = express();
const axios = require('axios');
const { performance } = require('perf_hooks');
let storedNumbers = [];
let windowSize = 10;
app.get('/', function (req, res) {
   res.send('Hello World');
})
function calculateAverage(numbers) {
  if (numbers.length === 0) return null;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}
async function fetchNumbersFromTestServer(type) {
  try {
    const startTime = performance.now();
    console.log(type);
    const response = await axios.get(`http://20.244.56.144/test/${type}`);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    console.log(response);
    if (elapsedTime > 500) {
      console.log('Response took too long, ignoring.');
      return [];
    }
    return response.data.numbers.filter(number => !storedNumbers.includes(number));
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    return [];
  }
}
async function updateStoredNumbers(req, res, next) {
  const { type } = req.params;
  let x='a';
  if(type==='e') {
    a='even';
  }
  if(type==='f') {
    a='fibo';
  }
  if(type==='p') {
    a='prime';
  }
  if(type==='r') {
    a='rand';
  }
  const newNumbers = await fetchNumbersFromTestServer(a);
  if (storedNumbers.length + newNumbers.length > windowSize) {
    const diff = storedNumbers.length + newNumbers.length - windowSize;
    storedNumbers = storedNumbers.slice(diff);
  }
  storedNumbers.push(...newNumbers);
  next();
}

app.get('/numbers/:type', updateStoredNumbers, (req, res) => {
  const { type } = req.params;
  const windowPrevState = storedNumbers.slice(0, Math.max(0, storedNumbers.length - windowSize));
  const windowCurrState = storedNumbers.slice(-windowSize);
  const avg = calculateAverage(windowCurrState);
  res.json({
    numbers: windowCurrState,
    windowPrevState,
    windowCurrState,
    avg
  });
});

var server = app.listen(5000, function () {
   console.log("Express App running at http://127.0.0.1:5000/");
})