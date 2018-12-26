const csv = require('csv-parse')
const fs = require('fs')

const results = [];

const read = (filename) =>
    new Promise((resolve, reject) => {
        fs.createReadStream(filename)
            .pipe(csv({
                skip_empty_lines: true,
                columns: true,
                separator: ','
            }))
            .on('data', (msg) => {
                // console.log(msg)
                results.push(msg)
            })
            .on('error', (msg) => {
                reject(msg)
                console.log(msg)
            })
            .on('end', () => {
                resolve(results)
            })
    })

module.exports = read