#!/bin/bash
# Run current file
# npx tsx scripts/alex.ts
filename=$1


# Check if the file path contains "shell"


if [[ $filename == *"shell"* ]]; then
    $filename
elif [[ $filename == *"/tests/"* ]]; then
    # Extract everything after "/tests/"
    path_after_tests=$(echo "$filename" | sed 's/.*\/tests\///')
    # Remove .ts extension if present
    path_after_tests=${path_after_tests%.ts}
    if [ -n "$2" ]; then
        ./test.sh custom $path_after_tests $2
    else
        ./test.sh custom $path_after_tests
    fi

elif [[ $filename == *".sh"* ]]; then
    $filename
else
    # NODE_ENV=development npx tsx $filename
    NODE_ENV=development bun $filename
fi


# # If filename ends with .sh, then run it
# if [ "${filename##*.}" = "sh" ]; then
#     ./$filename
# else if [ "${filename##*.}" = "ts" ]; then
#     npx tsx $filename
# else
#     echo "Invalid file extension"
# fi

# # npm run test