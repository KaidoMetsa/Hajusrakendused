const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

// Columnid
const headers = [
  'Tootekood',
  'Kirjeldus',
  'Column 3',
  'Column 4',
  'Column 5',
  'Colum 6',
  'Column 7',
  'Column 8',
  'Hind km(ta)',
  'Column10',
  'Hind km(ga)',
];
// Loebsisse cs
let fileContents = fs.readFileSync('LE.txt', 'utf8');

const rows = fileContents.trim().split('\n');

function removeQuotes(str) {
  return str.replace(/^"/, '').replace(/"$/, '');
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const searchQuery = urlParams.get('search') || '';

  const searchFormHtml = `
    <form>
      <input type="text" name="search" placeholder="Search..." value="${searchQuery}">
      <input type="submit" value="Search">
    </form>
  `;

  let tableHtml = `<h2>Search Data</h2>${searchFormHtml}<table><tr>`;

  headers.forEach(header => {
    tableHtml += `<th>${header}</th>`;
  });

  tableHtml += '</tr>';

  rows.forEach(row => {
    const cells = row.split('\t');
    const tootekood = removeQuotes(cells[0]);
    const kirjeldus = removeQuotes(cells[1]);
    if (tootekood.includes(searchQuery) || kirjeldus.includes(searchQuery)) {
      tableHtml += '<tr>';
      cells.forEach(cell => {
        const cellWithoutQuotes = removeQuotes(cell);
        tableHtml += `<td>${cellWithoutQuotes}</td>`;
      });
      tableHtml += '</tr>';
    }
  });

  tableHtml += '</table>';
  res.end(tableHtml);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
