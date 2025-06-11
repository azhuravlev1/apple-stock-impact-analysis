

# Apple Stock Impact Analysis

This project analyzes how Apple Inc.'s product launches and SEC filings affect its stock price and volatility. It combines financial data from Kaggle, regulatory filings from SEC EDGAR, and historical product releases from Wikipedia.

## 📊 Goals
- Measure short-term stock return and volatility following product releases.
- Compare stock performance across different product categories.
- Analyze how different SEC filing types influence market reactions.

## 📁 Project Structure
- `data/`: All raw CSV datasets used for analysis.
- `notebooks/`: Jupyter notebooks and exploratory work.
- `scripts/`: Supporting Python scripts for data cleaning and parsing.
- `hive_queries/`: Hive SQL scripts for table creation and queries.
- `report/`: Final report and documentation.

## ⚙️ Tools Used
- Apache Hive (for managing large tabular data and complex joins)
- Python (for scraping and data preprocessing)
- Hadoop HDFS (for storage)
- Pandas & SQL (for validation and EDA)

## 📌 Highlights of Insights
- Early Apple product lines like 68000 and Printers generated significantly stronger market reactions than modern releases like the iPhone.
- Debt-related filings (e.g., 424B2, FWP) show consistently strong returns and low volatility.
- 8-K filings lead to the highest volatility, often tied to major corporate events.
  (more insights in the report)
