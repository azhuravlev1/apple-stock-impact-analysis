import pandas as pd
import matplotlib.pyplot as plt

# Load datasets
aapl_raw_data = pd.read_csv("aapl_raw_data.csv")
aapl_split_adjusted = pd.read_csv("aapl_split_adjusted.csv")

# Convert 'date' column to datetime
aapl_raw_data['date'] = pd.to_datetime(aapl_raw_data['date'])
aapl_split_adjusted['date'] = pd.to_datetime(aapl_split_adjusted['date'])

# Extract 'year' from 'date' column
aapl_raw_data['year'] = aapl_raw_data['date'].dt.year
aapl_split_adjusted['year'] = aapl_split_adjusted['date'].dt.year

# Calculate yearly average closing price for both datasets
raw_yearly_avg = aapl_raw_data.groupby('year')['close'].mean()
split_adjusted_yearly_avg = aapl_split_adjusted.groupby('year')['close'].mean()

# Plotting
plt.figure(figsize=(12, 6))
plt.plot(raw_yearly_avg.index, raw_yearly_avg.values, label="Raw Data - Yearly Avg Close", marker='o')
plt.plot(split_adjusted_yearly_avg.index, split_adjusted_yearly_avg.values, label="Split-Adjusted - Yearly Avg Close", marker='o')

plt.title("Yearly Average Closing Price - Raw vs Split-Adjusted Data")
plt.xlabel("Year")
plt.ylabel("Average Closing Price")
plt.legend()
plt.grid()
plt.tight_layout()
plt.show()