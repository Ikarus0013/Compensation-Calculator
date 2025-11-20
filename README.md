# Compensation Calculator

A React-based interactive compensation calculator designed to model On-Target Earnings (OTE) based on performance metrics. This tool allows users to input current business snapshots and calculates potential bonuses based on Self-Serve Signups and Sales Qualified Leads (SQLs). It also includes a goal simulation to visualize requirements for reaching future revenue targets.

## Features

*   **Interactive Inputs**: Modify Base Salary, ARR, Subscribers, Enterprise Clients, and pricing models.
*   **Real-time Calculations**: Instantly see how changes affect total compensation.
*   **Bonus Modeling**:
    *   **Self-Serve Bonus**: Configurable threshold and payout rates.
    *   **SQL Bonus**: Configurable commission per lead with optional quarterly floors.
*   **Goal Simulation**: "Gap Analysis" feature to visualize what it takes to reach a specific revenue target (e.g., €10M ARR) via different growth channels.
*   **PDF Export**: One-click export of the current calculator state to a PDF file for sharing.
*   **Responsive Design**: Built with Tailwind CSS for a clean experience on desktop and mobile.

## Tech Stack

*   [React](https://react.dev/) - UI Library
*   [TypeScript](https://www.typescriptlang.org/) - Type Safety
*   [Vite](https://vitejs.dev/) - Build Tool & Dev Server
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
*   [Lucide React](https://lucide.dev/) - Icons
*   [html2canvas](https://html2canvas.hertzen.com/) & [jspdf](https://github.com/parallax/jsPDF) - PDF Generation

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Ikarus0013/Compensation-Calculator.git
    cd Compensation-Calculator
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```
    Open your browser to the URL shown (usually `http://localhost:5173`).

4.  **Build for production**
    ```bash
    npm run build
    ```
    The output will be in the `dist` directory.

## Usage

1.  **Current Business Snapshot**: Enter your current ARR, Base Salary, and customer counts.
2.  **Projected Performance**: Adjust the "Projected Annual Signups" and "Projected Annual SQLs" to see how they impact your bonus.
3.  **Settings**: Use the "Global Settings" toggle at the bottom to adjust commission rates.
4.  **Goal Simulation**: Scroll to the bottom to see the requirements to hit the €10M ARR goal.
5.  **Export**: Click the "Export as PDF" button to save a copy of your scenario.

## License

MIT
