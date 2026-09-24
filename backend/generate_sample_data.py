"""
Sample Sales Data Generator
Generates realistic sales data for demo purposes.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import random


def generate_sales_data(n_rows: int = 1000, output_dir: str = "data/samples") -> str:
    """Generate a realistic sales dataset."""
    np.random.seed(42)
    random.seed(42)

    # Date range: last 12 months
    end_date = datetime(2024, 12, 31)
    start_date = end_date - timedelta(days=365)
    dates = pd.date_range(start=start_date, end=end_date, periods=n_rows)

    # Products
    products = [
        ("Laptop Pro 15", "Electronics", 899.99),
        ("Wireless Mouse", "Electronics", 29.99),
        ("USB-C Hub", "Electronics", 49.99),
        ("Mechanical Keyboard", "Electronics", 129.99),
        ("Monitor 27\"", "Electronics", 399.99),
        ("Office Chair", "Furniture", 299.99),
        ("Standing Desk", "Furniture", 499.99),
        ("Desk Lamp", "Furniture", 39.99),
        ("Bookshelf", "Furniture", 149.99),
        ("Notebook Pack", "Stationery", 12.99),
        ("Pen Set", "Stationery", 8.99),
        ("Planner 2024", "Stationery", 19.99),
        ("Backpack", "Accessories", 59.99),
        ("Water Bottle", "Accessories", 24.99),
        ("Headphones", "Electronics", 199.99),
    ]

    regions = ["North", "South", "East", "West", "Central"]
    channels = ["Online", "Store", "Wholesale"]
    customer_segments = ["Consumer", "Corporate", "Small Business"]

    data = []
    for i in range(n_rows):
        product = random.choice(products)
        product_name, category, base_price = product

        # Add seasonality: more sales in Nov-Dec
        month = dates[i].month
        seasonal_factor = 1.0
        if month in [11, 12]:
            seasonal_factor = 1.5
        elif month in [1, 2]:
            seasonal_factor = 0.7
        elif month in [6, 7]:
            seasonal_factor = 1.2

        quantity = max(1, int(np.random.exponential(3) * seasonal_factor))
        discount = random.choice([0, 0, 0, 0.05, 0.10, 0.15, 0.20, 0.25])
        unit_price = round(base_price * (1 - discount), 2)
        revenue = round(unit_price * quantity, 2)
        cost = round(base_price * 0.6 * quantity, 2)
        profit = round(revenue - cost, 2)

        region = random.choice(regions)
        channel = random.choice(channels)
        segment = random.choice(customer_segments)

        # Customer satisfaction (1-5)
        satisfaction = round(np.clip(np.random.normal(4.0, 0.8), 1, 5), 1)

        # Delivery days
        delivery_days = max(1, int(np.random.normal(5, 2)))
        if channel == "Store":
            delivery_days = 0

        # Return flag (5% return rate)
        returned = random.random() < 0.05

        data.append({
            "date": dates[i].strftime("%Y-%m-%d"),
            "order_id": f"ORD-{10000 + i}",
            "product": product_name,
            "category": category,
            "quantity": quantity,
            "unit_price": unit_price,
            "discount_pct": discount,
            "revenue": revenue,
            "cost": cost,
            "profit": profit,
            "region": region,
            "channel": channel,
            "customer_segment": segment,
            "satisfaction_score": satisfaction,
            "delivery_days": delivery_days,
            "returned": returned,
        })

    df = pd.DataFrame(data)

    # Introduce some realistic data quality issues
    # 2% random nulls in satisfaction
    null_indices = np.random.choice(n_rows, size=int(n_rows * 0.02), replace=False)
    df.loc[null_indices, "satisfaction_score"] = np.nan

    # 1% nulls in delivery_days
    null_indices = np.random.choice(n_rows, size=int(n_rows * 0.01), replace=False)
    df.loc[null_indices, "delivery_days"] = np.nan

    # A few duplicate rows (0.5%)
    dup_indices = np.random.choice(n_rows, size=int(n_rows * 0.005), replace=False)
    duplicates = df.iloc[dup_indices].copy()
    df = pd.concat([df, duplicates], ignore_index=True)

    # Save
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, "sales_data.csv")
    df.to_csv(filepath, index=False)
    print(f"✅ Generated {len(df)} rows → {filepath}")
    print(f"   Columns: {list(df.columns)}")
    print(f"   Date range: {df['date'].min()} → {df['date'].max()}")
    print(f"   Revenue total: ${df['revenue'].sum():,.2f}")

    return filepath


if __name__ == "__main__":
    generate_sales_data()
