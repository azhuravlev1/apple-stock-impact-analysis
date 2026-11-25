# Apple Stock Impact Analysis (1980–2024)

How did Apple's stock react to its product launches and to its regulatory filings? This was a four-person team project for DS8003 (Management of Big Data and Tools) at Toronto Metropolitan University, Fall 2024. The team stored and processed 44 years of daily AAPL prices with Hadoop, MapReduce, Hive, PySpark and Elasticsearch/Kibana. My part was the product-launch and SEC-filing impact analysis, along with the price and volume study. The data and scripts in this repository are from that part.

The team's final presentation is in [`report/Final_Presentation.pdf`](report/Final_Presentation.pdf).

## Data

| File | What it is | Rows |
|---|---|---|
| `data/aapl_raw_data.csv`, `data/aapl_split_adjusted.csv` | Daily AAPL prices and volume since December 1980 (Kaggle), raw and split-adjusted | 10,925 |
| `data/apple_products_release_dates.csv` | Every Apple product with release date, product family and discontinuation date, scraped from Wikipedia's List of Apple products | 701 |
| `data/aapl_EDGAR_all_filings.csv` | Every Apple filing on SEC EDGAR since 1994 with form type and filing date | 2,106 |
| `data/aapl_EDGAR_10-K_and_10-Q.csv` | The annual and quarterly reports only | 126 |

## Method

Each product release and each filing was treated as an event. For every event I measured the stock's short-term return and volatility in the days that followed, then averaged by product family and by filing type, so the comparison is between kinds of events, not single days.

## Findings

Product launches. The families with the strongest average reaction are almost all from Apple's early years: the 68000-based Macintosh line averaged a 14.2% return after releases, followed by printers and the AirPort Express. Modern launches, including the iPhone, move the stock much less. The likely reasons are lower expectations and a smaller company in the early years, and the fact that today's launches are anticipated and priced in well before the event.

SEC filings. Debt-related filings were received best: 424B2 prospectus supplements (+1.37%) and free writing prospectuses (+1.31%), with low volatility. 8-K current reports also averaged a positive return (+1.32%) but had the highest volatility (2.32%), since they announce material events in both directions. Updates to existing plans did worst: 424B3 prospectus updates (-1.79%), preliminary proxy statements (-1.08%) and SEC no-action letters (-0.89%).

## Scripts

- `scripts/apple_products_wikipidea_scrape.py` scrapes the product tables from Wikipedia into a single release-date table.
- `scripts/EDGAR_filings_types.py` counts and groups filings by form type.
- `scripts/average_annual_closing_price.py` compares raw and split-adjusted prices by year.
- `scripts/delimiter_check.py` detects the delimiter of every CSV before loading them into Hive.

Requirements: pandas, matplotlib, requests and beautifulsoup4.
