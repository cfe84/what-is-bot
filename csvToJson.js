const fs = require("fs")
const path = require("path")
const parse = require("csv-parse/lib/sync")

const file = process.argv[2]
const output = file.replace(path.extname(file), ".json")
const content = fs.readFileSync(file)

const parsed = parse(content, {
  columns: true,
  skipEmptyLines: true
})

fs.writeFileSync(output, JSON.stringify(parsed))