import csv
from collections import Counter

# File name
file_name = 'aapl_EDGAR_all_filings.csv'

# Initialize a list to store "Form type" values
form_types = []

# Read the CSV file
with open(file_name, mode='r') as file:
    reader = csv.DictReader(file)
    # Extract values from "Form type" column
    for row in reader:
        form_types.append(row['Form type'])

# Count occurrences of each unique form type
form_type_counts = Counter(form_types)

# Convert to a list of tuples (Form type, Count) and sort alphabetically
sorted_form_type_counts = sorted(form_type_counts.items())

# Print the results
for form_type, count in sorted_form_type_counts:
    print(f"{form_type}: {count}")
