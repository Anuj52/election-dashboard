# Electoral Analytics Dashboard

A high-performance, interactive election analytics dashboard designed to compare and visualize assembly election data (focusing on West Bengal and Kerala). Built with Next.js, React, and Tailwind CSS.

## Features

- **Interactive Maps**: State-wide choropleth maps with detailed, constituency-level data tooltips.
- **Data Explorer**: Comprehensive, filterable, and sortable data tables for deep dives into constituency results.
- **Swing Modeler**: A "What-If" uniform swing calculator to forecast potential outcomes based on vote share changes.
- **Deletion Risk Analysis**: Identifies and visualizes vulnerable constituencies based on historical deletion data.
- **Dynamic Visualizations**: Including donut charts for seat shares and interactive scatter plots for margin analysis.
- **Responsive Design**: Fully mobile-responsive interface utilizing a sleek, modern UI with Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Data Parsing**: [PapaParse](https://www.papaparse.com/)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Processing

The application expects standardized CSV files placed in the `public/data` directory containing constituency-level results for 2021 and 2026.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page.

## License

This project is licensed under the MIT License.
