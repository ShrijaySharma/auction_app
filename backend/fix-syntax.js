// Fix syntax errors in owner.js
const fs = require('fs');

const filePath = 'c:\\Users\\kanha\\OneDrive\\Desktop\\okay\\auction app updated\\auction app\\backend\\routes\\owner.js';
let content = fs.readFileSync(filePath, 'utf8');

// Split into lines
const lines = content.split('\n');

// Problem is on lines 286-287 (0-indexed: 285-286)
// Line 285: "                });"
// Line 286: "              });" <- DELETE THIS
// Line 287: "          }"  <- DELETE THIS  
// Line 288: blank
//  Line 289: "              // Place bid"

// Remove lines 286-287 (0-indexed 285-286)
if (lines[285] && lines[285].trim() === '});' && lines[286] && lines[286].trim() === '}') {
    console.log('Found problematic lines 286-287');
    lines.splice(285, 2);  // Remove 2 lines starting at index 285
    console.log('Fixed!');
} else {
    console.log('Lines 286-287 not matching expected pattern');
    console.log(`Line 286 (index 285): "${lines[285]}"`);
    console.log(`Line 287 (index 286): "${lines[286]}"`);
}

// Write back
const fixedContent = lines.join('\n');
fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('File saved');
