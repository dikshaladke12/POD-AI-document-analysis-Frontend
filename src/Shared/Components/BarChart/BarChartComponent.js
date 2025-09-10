// BarChartComponent.jsx
import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const BarChartComponent = ({ providers, faxes, documents }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Providers", "Faxes", "Documents"],
        datasets: [
          {
            label: "Count",
            data: [providers, faxes, documents],
            backgroundColor: [
              "#007e99", // Providers
              "#d6336c", // Faxes
              "#0056b3", // Documents
            ],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            barPercentage: 0.6,
            categoryPercentage: 0.6,
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }, [providers, faxes, documents]);

  return (
    <canvas ref={chartRef} style={{ maxHeight: "250px", width: "100%" }} />
  );
};

export default BarChartComponent;
