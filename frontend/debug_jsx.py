
import re

def validate_jsx(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    
    # Simple regex to find self-closing and normal tags
    # Ignore comments
    
    tag_pattern = re.compile(r'</?[\w\.]+(\s+[^>]*)?/?>')
    
    errors = []

    for i, line in enumerate(lines):
        # Remove JSX comments
        clean_line = re.sub(r'{\s*/\*.*?\*/\s*}', '', line)
        if '//' in clean_line: # naive js comment removal
             clean_line = clean_line.split('//')[0]
             
        # Find tags
        matches = [m for m in tag_pattern.finditer(clean_line)]
        
        for m in matches:
            tag_str = m.group(0)
            is_closing = tag_str.startswith('</')
            is_self_closing = tag_str.endswith('/>')
            
            # extract tag name
            if is_closing:
                tag_name = tag_str[2:].replace('>', '').replace(' ', '').strip()
            else:
                tag_name = tag_str[1:].split()[0].replace('>', '').replace('/', '').strip()
            
            if is_self_closing:
                continue
                
            if tag_name in ['input', 'img', 'br', 'hr']: # common void elements
                continue
                
            if is_closing:
                if not stack:
                    errors.append(f"Line {i+1}: Unexpected closing tag </{tag_name}>")
                else:
                    last_tag = stack.pop()
                    if last_tag != tag_name:
                        errors.append(f"Line {i+1}: Mismatched closing tag </{tag_name}>. Expected closing for <{last_tag}>")
            else:
                stack.append(tag_name)

    if stack:
        errors.append(f"Unclosed tags at end of file: {stack}")
        
    return errors

errors = validate_jsx(r"c:\Users\kanha\OneDrive\Desktop\okay\auction app\frontend\src\pages\AdminDashboard.jsx")
if errors:
    print("Found errors:")
    for e in errors[:20]: # Print first 20
        print(e)
else:
    print("No obvious tag nesting errors found.")
