# Supply Chain Resilience Digital Twin

A comprehensive Next.js 14 application that serves as a digital twin for monitoring supply chain resilience within the Department for Transport. This system visualizes, analyzes, and simulates supply chain dynamics, climate events, and geopolitical risks using synthetic data.

## Features

### Interactive Supply Chain Map

- Geospatial visualization with supplier locations across different countries
- Color-coded risk indicators (green, amber, red)
- Interactive filters for material types, risk levels, and supplier tiers
- Animated transportation routes showing material flows
- Weather event overlays

### Risk Dashboard

- Summary KPIs with supply chain health index
- Time-series charts for risk trends
- Top at-risk suppliers table
- Material shortage predictions
- Project delivery confidence indicators

### Simulation Engine

- Interface for running "what-if" scenarios
- Timeline visualization showing cascade effects
- Comparison view between baseline and simulated scenarios
- Mitigation recommendation system

### Supplier Details Portal

- Detailed supplier information
- Historical performance metrics
- Alternative supplier suggestions
- Geographical and climate risk factors

## Technical Stack

- **Framework**: Next.js 14 with App Router architecture
- **UI Component Library**: Shadcn UI with Radix primitives
- **Data Visualization**: D3.js for complex visualizations, Recharts for standard charts
- **State Management**:
  - Server Components for server-side state
  - React Context for client-side global state
  - React Query for async data fetching
- **Styling**: Tailwind CSS with custom theming
- **Performance Optimization**: React Server Components and Partial Prerendering
- **Development Tooling**: TypeScript, ESLint, Prettier, Husky

## Project Structure

```
src/
├── app/                    # Next.js App Router directory
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard page
│   ├── map/                # Interactive map page
│   ├── suppliers/          # Supplier directory pages
│   ├── simulations/        # Simulation engine pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── ui/                 # UI components (shadcn)
│   ├── maps/               # Map visualization components
│   ├── charts/             # Chart and graph components
│   ├── suppliers/          # Supplier-related components
│   └── simulations/        # Simulation-related components
├── lib/                    # Utility functions and shared logic
│   ├── data/               # Data fetching and transformation
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
└── providers/              # Context providers
```

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/supply-chain-resilience.git
cd supply-chain-resilience
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Run the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Models

The application uses synthetic data models for:

- Suppliers (50+)
- Materials (100+)
- Transport Routes
- Climate Events
- Projects (10+)

## Accessibility

The application is designed to meet WCAG 2.1 AA standards, including:

- Keyboard navigation throughout
- Alternative text for visualizations
- Semantic HTML
- High-contrast mode support

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

- Department for Transport for the project requirements
- Next.js team for the excellent framework
- Shadcn UI for the component library
