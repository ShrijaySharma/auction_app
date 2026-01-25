// Fix syntax errors in owner.js
import fs from 'fs';

const filePath = 'c:\\\\Users\\\\kanha\\\\OneDrive\\\\Desktop\\\\okay\\\\auction app updated\\\\auction app\\\\backend\\\\routes\\\\owner.js';
let content = fs.readFileSync(filePath, 'utf8');

// Split into lines  
const lines = content.split(/\r?\n/);

console.log(`Total lines: ${lines.length}`);
console.log(`Line 285 (index 284): "${lines[284]}"`);
console.log(`Line 286 (index 285): "${lines[285]}"`);
console.log(`Line 287 (index 286): "${lines[286]}"`);
console.log(`Line 288 (index 287): "${lines[287]}"`);
console.log(`Line 289 (index 288): "${lines[288]}"`);

// Problem is on lines 286-287 (0-indexed: 285-286)
// We need to remove lines where we have extra closing braces
const line286 = lines[285]?.trim();
const line287 = lines[286]?.trim();

if (line286 === '});' && line287 === '}') {
    console.log('\\nFound problematic lines 286-287, removing them...');
    lines.splice(285, 2);  // Remove 2 lines starting at index 285
    console.log('Fixed!');

    // Write back
    const fixedContent = lines.join('\\r\\n');
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('File saved successfully');
} else {
    console.log('\\nLines 286-287 not matching expected pattern - manual review needed');
}
