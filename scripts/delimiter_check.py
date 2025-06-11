import os
import pandas as pd


def detect_delimiters_in_csv(directory_path):
    """
    Detects the delimiter used in each CSV file in the given directory.

    Parameters:
        directory_path (str): The full path to the directory containing CSV files.

    Returns:
        dict: A dictionary where keys are file names and values are the detected delimiters.
    """
    delimiters = {}
    potential_delimiters = [',', '\t', ';', '|', ':']

    for file_name in os.listdir(directory_path):
        file_path = os.path.join(directory_path, file_name)
        if os.path.isfile(file_path) and file_name.lower().endswith('.csv'):
            detected_delimiter = None
            for delimiter in potential_delimiters:
                try:
                    # Try to read the file with the given delimiter
                    pd.read_csv(file_path, delimiter=delimiter, nrows=5)
                    detected_delimiter = delimiter
                    break
                except Exception:
                    continue
            delimiters[file_name] = detected_delimiter or 'Unknown'

    return delimiters


# Example usage:
directory = "/Users/andrey/Desktop/TMU/DS8003 (Data and Tools)/Project"
result = detect_delimiters_in_csv(directory)
print(result)
