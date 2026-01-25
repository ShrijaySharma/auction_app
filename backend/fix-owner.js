// Temporary script to view and fix owner.js file
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'routes', 'owner.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find lines 285-290
const lines = content.split('\n');
console.log('Lines 283-295:');
for (let i = 282; i < 295; i++) {
    console.log(`${i + 1}: "${lines[i]}"`);
}

// Fix: Remove lines 286-287 which are "}); }" 
// and fix indentation of lines 289-291
const fixedLines = [...lines];
fixedLines.splice(285, 2); // Remove lines 286-287

// Write back
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('\nFixed!');
