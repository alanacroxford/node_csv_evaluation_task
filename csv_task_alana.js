
const fs = require('fs');
const readline = require('readline');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];


// Define a function to evaluate expressions given a dictionary with values
function evaluateExpression(expression, dictionary) {
    const keys = Object.keys(dictionary);
    const values = keys.map(key => parseInt(dictionary[key], 10));
    const func = new Function(...keys, `return ${expression};`);
    return func(...values);
}

// Read CSV file into a list
const readCSVFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const lines = [];
        const readInterface = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        readInterface.on('line', (line) => {
            lines.push(line);
        });

        readInterface.on('close', () => {
            resolve(lines);
        });

        readInterface.on('error', (err) => {
            reject(err);
        });
    });
};

// Separate first line of CSV into variable 1 and the rest into variable 2
const separateLines = (lines) => {
    const variable1 = lines.shift();
    const variable2 = lines; 
    return { variable1, variable2 };
};

// Create a dictionary of characters and integers from variable 1 using a while loop
const createDictionary = (firstLine) => {
    const dictionary = {};
    let index = 0;
    while (index < firstLine.length) {
        dictionary[characters[index]] = firstLine[index];
        index++;

    }
    return dictionary;
};

// Loop through rows of equations
// Loop through each equation on each row and then evaluate that expression
// Append values to list
// Append list of values to rows to be added to csv file
const values = []
const rows = []
const processData = (variable2, dictionary) => {
    for (let i = 0; i < variable2.length; i++) {
		values.length = 0; 
        const row = variable2[i].split(',');
        for (let j = 0; j < row.length; j++) {
            const result = evaluateExpression(row[j], dictionary);
            values.push(result);
        }
        rows.push(values.slice()); 
    }
};

// Main function
const main = async () => {
    try {
        const filePath = 'input.csv';
        const lines = await readCSVFile(filePath);
        const { variable1, variable2 } = separateLines(lines);
        const dictionary = createDictionary(variable1.split(','));
        processData(variable2, dictionary);
        const integers = variable1.split(',');
        const outputRows = [integers, ...rows];
		const ws = fs.createWriteStream('output.csv');
		const csvWriter = createCsvWriter({
      path: 'output.csv',
      header: outputRows[0]

    });
    csvWriter
      .writeRecords(outputRows[0]);
		outputRows.forEach((row) => {
		  ws.write(row.join(',') + '\n');
		});
		ws.end();
		console.log('CSV file has been written successfully.');

        processData(variable2, dictionary);
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

// Execute main function
main();