import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // cleanup before re-render
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Providers", "Faxes", "Documents"],
        datasets: [
          {
            label: "Counts",
            data: [4, 80, 1000],
            backgroundColor: [
              "#b2ebf2", // Providers
              "#ffcdd2", // Faxes
              "#bbdefb", // Documents
            ],
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }, []);

  return (
    <div className="pie-chart-wrapper">
      <canvas ref={chartRef} width={300} height={300}></canvas>
    </div>
  );
};

export default PieChart;
