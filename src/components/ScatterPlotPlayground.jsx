import React, { useState, useEffect } from "react";

const ScatterPlotPlayground = () => {
  const [points, setPoints] = useState([]);
  const [correlation, setCorrelation] = useState(null);
  const [regressionLine, setRegressionLine] = useState(null);
  const [calculationSteps, setCalculationSteps] = useState(null);
  const [regressionSteps, setRegressionSteps] = useState(null);

  // Calculate correlation coefficient
  const calculateCorrelation = (points) => {
    if (points.length < 3) return { correlation: null, steps: null };

    const n = points.length;
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumXSquare = points.reduce((acc, p) => acc + p.x * p.x, 0);
    const sumYSquare = points.reduce((acc, p) => acc + p.y * p.y, 0);

    const yMean = sumY / n;
    const hasYVariation = points.some((p) => Math.abs(p.y - yMean) > 0.0001);
    if (!hasYVariation) return { correlation: 0, steps: null };

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumXSquare - sumX * sumX) * (n * sumYSquare - sumY * sumY)
    );

    if (Math.abs(denominator) < 0.0001) return { correlation: 0, steps: null };

    const correlation = denominator === 0 ? 0 : numerator / denominator;

    const steps = {
      n,
      sumX: sumX.toFixed(2),
      sumY: sumY.toFixed(2),
      sumXY: sumXY.toFixed(2),
      sumXSquare: sumXSquare.toFixed(2),
      sumYSquare: sumYSquare.toFixed(2),
      numerator: numerator.toFixed(2),
      denominator: denominator.toFixed(2),
    };

    return { correlation, steps };
  };

  // Calculate regression line
  const calculateRegression = (points) => {
    if (points.length < 3) return { line: null, steps: null };

    const n = points.length;
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumXSquare = points.reduce((acc, p) => acc + p.x * p.x, 0);

    const denominator = n * sumXSquare - sumX * sumX;
    if (denominator === 0) return { line: null, steps: null };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    const steps = {
      n,
      sumX: sumX.toFixed(2),
      sumY: sumY.toFixed(2),
      sumXY: sumXY.toFixed(2),
      sumXSquare: sumXSquare.toFixed(2),
      slope: slope.toFixed(3),
      intercept: intercept.toFixed(3),
      slopeNumerator: (n * sumXY - sumX * sumY).toFixed(2),
      slopeDenominator: denominator.toFixed(2),
    };

    return { line: { slope, intercept }, steps };
  };

  // Handle click on plot area
  const handlePlotClick = (e) => {
    // Get the plot container element
    const plotContainer = e.currentTarget;
    const rect = plotContainer.getBoundingClientRect();

    // Stop if we clicked on a point
    if (e.target.classList.contains("point")) {
      return;
    }

    // Calculate relative position within the plot (0 to 1)
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;

    // Convert to our coordinate system (-10 to 10)
    const x = Number((relativeX * 20 - 10).toFixed(2));
    const y = Number((-relativeY * 20 + 10).toFixed(2));

    // Check if point already exists at this location
    const pointExists = points.some((p) => p.x === x && p.y === y);
    if (!pointExists) {
      setPoints([...points, { x, y }]);
    }
  };

  // Update correlation and regression when points change
  useEffect(() => {
    const { correlation, steps } = calculateCorrelation(points);
    const regressionResult = calculateRegression(points);
    setCorrelation(correlation);
    setCalculationSteps(steps);
    setRegressionLine(regressionResult?.line);
    setRegressionSteps(regressionResult?.steps);
  }, [points]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Correlation & Regression Explorer
      </h1>

      <div className="mb-4 text-center">
        <p className="text-lg">
          Correlation: {correlation !== null ? correlation.toFixed(3) : "N/A"}
        </p>
      </div>

      <div className="flex justify-center gap-8 pl-8">
        <div>
          <div
            className="w-[600px] h-[600px] border-2 border-gray-300 relative bg-white cursor-crosshair"
            onClick={handlePlotClick}
          >
            {/* Grid Lines */}
            {[...Array(21)].map((_, i) => (
              <React.Fragment key={i}>
                {/* Vertical grid lines */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{ left: `${(i / 20) * 100}%` }}
                />
                {/* Horizontal grid lines */}
                <div
                  className="absolute left-0 right-0 h-px bg-gray-200"
                  style={{ top: `${(i / 20) * 100}%` }}
                />
              </React.Fragment>
            ))}

            {/* Axis Labels */}
            {[...Array(21)].map((_, i) => {
              const value = -10 + i;
              if (value % 2 === 0) {
                // Show every 2nd number to avoid crowding
                return (
                  <React.Fragment key={i}>
                    {/* X-axis labels */}
                    <div
                      className="absolute top-[50%] mt-2 text-xs transform -translate-x-1/2"
                      style={{ left: `${(i / 20) * 100}%` }}
                    >
                      {value}
                    </div>
                    {/* Y-axis labels */}
                    <div
                      className="absolute left-[50%] ml-2 text-xs transform -translate-y-1/2"
                      style={{ top: `${(i / 20) * 100}%` }}
                    >
                      {-value}
                    </div>
                  </React.Fragment>
                );
              }
              return null;
            })}

            {/* Axes (on top of grid lines) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-black" />

            {/* Points */}
            {points.map((point, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 bg-blue-500 rounded-full point"
                style={{
                  left: `${((point.x + 10) / 20) * 100}%`,
                  top: `${((10 - point.y) / 20) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            {/* Regression Line */}
            {regressionLine && (
              <svg
                className="absolute inset-0 pointer-events-none"
                viewBox="0 0 600 600"
              >
                {(() => {
                  const x1 = -10;
                  const x2 = 10;
                  const y1 =
                    regressionLine.slope * x1 + regressionLine.intercept;
                  const y2 =
                    regressionLine.slope * x2 + regressionLine.intercept;

                  // Convert coordinate system to SVG pixels (600x600)
                  const svgX1 = ((x1 + 10) / 20) * 600;
                  const svgY1 = ((10 - y1) / 20) * 600;
                  const svgX2 = ((x2 + 10) / 20) * 600;
                  const svgY2 = ((10 - y2) / 20) * 600;

                  return (
                    <line
                      x1={svgX1}
                      y1={svgY1}
                      x2={svgX2}
                      y2={svgY2}
                      stroke="red"
                      strokeWidth="2"
                    />
                  );
                })()}
              </svg>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <div className="w-64">
            <h3 className="text-lg font-semibold mb-2">Points</h3>
            <div className="mb-4">
              {points.map((point, index) => (
                <div key={index} className="text-sm">
                  Point {index + 1}: ({point.x}, {point.y})
                </div>
              ))}
            </div>
          </div>

          <div className="w-96">
            <div className="grid grid-cols-2 gap-8">
              {/* Correlation Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Correlation Calculation
                </h3>
                <div className="text-sm space-y-1">
                  <div className="mb-4">
                    <p className="font-semibold mb-2">
                      Pearson's Correlation Coefficient (r):
                    </p>
                    <div className="flex items-center">
                      <span className="mr-2">r =</span>
                      <div>
                        <div className="border-b border-black px-2">
                          n(∑xy) - (∑x)(∑y)
                        </div>
                        <div className="px-2 mt-1">
                          √[n(∑x²) - (∑x)²][n(∑y²) - (∑y)²]
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-[auto,1fr] gap-x-2">
                      <span>n</span>
                      <span>= {points.length}</span>

                      <span>∑x</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points.reduce((acc, p) => acc + p.x, 0).toFixed(2)
                          : "0.00"}
                      </span>

                      <span>∑y</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points.reduce((acc, p) => acc + p.y, 0).toFixed(2)
                          : "0.00"}
                      </span>

                      <span>∑xy</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points
                              .reduce((acc, p) => acc + p.x * p.y, 0)
                              .toFixed(2)
                          : "0.00"}
                      </span>

                      <span>∑x²</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points
                              .reduce((acc, p) => acc + p.x * p.x, 0)
                              .toFixed(2)
                          : "0.00"}
                      </span>

                      <span>∑y²</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points
                              .reduce((acc, p) => acc + p.y * p.y, 0)
                              .toFixed(2)
                          : "0.00"}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold">Numerator:</p>
                      <div className="ml-4">
                        <p>n(∑xy) - (∑x)(∑y)</p>
                        <p>
                          {points.length >= 3 && calculationSteps ? (
                            <>
                              = ({calculationSteps.n} × {calculationSteps.sumXY}
                              ) - ({calculationSteps.sumX} ×{" "}
                              {calculationSteps.sumY})
                            </>
                          ) : (
                            "= N/A"
                          )}
                        </p>
                        <p>
                          ={" "}
                          {points.length >= 3 && calculationSteps
                            ? calculationSteps.numerator
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="font-semibold">Denominator:</p>
                      <div className="ml-4">
                        <p>√[n(∑x²) - (∑x)²][n(∑y²) - (∑y)²]</p>
                        {points.length >= 3 && calculationSteps ? (
                          <>
                            <p>
                              = √[({calculationSteps.n} ×{" "}
                              {calculationSteps.sumXSquare}) - (
                              {calculationSteps.sumX})²]
                            </p>
                            <p className="ml-4">
                              × √[({calculationSteps.n} ×{" "}
                              {calculationSteps.sumYSquare}) - (
                              {calculationSteps.sumY})²]
                            </p>
                            <p>= {calculationSteps.denominator}</p>
                          </>
                        ) : (
                          <p className="text-gray-500">
                            = N/A (need at least 3 points)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 font-semibold">
                      <p>Final Result:</p>
                      <p className="ml-4">
                        r ={" "}
                        {points.length >= 3 && calculationSteps
                          ? `${calculationSteps.numerator} ÷ ${
                              calculationSteps.denominator
                            } = ${correlation?.toFixed(3)}`
                          : "N/A (need at least 3 points)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regression Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Linear Regression Calculation
                </h3>
                <div className="text-sm space-y-1">
                  <div className="mb-4">
                    <p className="font-semibold mb-2">
                      Linear Regression Equation: y = mx + b
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold">Slope (m):</p>
                        <div className="flex items-center">
                          <span className="mr-2">m =</span>
                          <div>
                            <div className="border-b border-black px-2">
                              n(∑xy) - (∑x)(∑y)
                            </div>
                            <div className="px-2 mt-1">n(∑x²) - (∑x)²</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold mt-2">Intercept (b):</p>
                        <div className="ml-4">b = (∑y - m∑x) / n</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-[auto,1fr] gap-x-2">
                      <span>n</span>
                      <span>= {points.length}</span>

                      <span>∑x</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points.reduce((acc, p) => acc + p.x, 0).toFixed(2)
                          : "N/A"}
                      </span>

                      <span>∑y</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points.reduce((acc, p) => acc + p.y, 0).toFixed(2)
                          : "N/A"}
                      </span>

                      <span>∑xy</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points
                              .reduce((acc, p) => acc + p.x * p.y, 0)
                              .toFixed(2)
                          : "N/A"}
                      </span>

                      <span>∑x²</span>
                      <span>
                        ={" "}
                        {points.length > 0
                          ? points
                              .reduce((acc, p) => acc + p.x * p.x, 0)
                              .toFixed(2)
                          : "N/A"}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold">Slope Calculation:</p>
                      <div className="ml-4">
                        {points.length >= 3 && regressionSteps ? (
                          <p>
                            m = {regressionSteps.slopeNumerator} ÷{" "}
                            {regressionSteps.slopeDenominator} ={" "}
                            {regressionSteps.slope}
                          </p>
                        ) : (
                          <p className="text-gray-500">
                            m = N/A (need at least 3 points)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="font-semibold">Intercept Calculation:</p>
                      <div className="ml-4">
                        {points.length >= 3 && regressionSteps ? (
                          <p>
                            b = ({regressionSteps.sumY} -{" "}
                            {regressionSteps.slope} × {regressionSteps.sumX}) ÷{" "}
                            {regressionSteps.n} = {regressionSteps.intercept}
                          </p>
                        ) : (
                          <p className="text-gray-500">
                            b = N/A (need at least 3 points)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 font-semibold">
                      <p>Final Equation:</p>
                      <p className="ml-4">
                        y ={" "}
                        {points.length >= 3 && regressionSteps ? (
                          <>
                            {regressionSteps.slope}x +{" "}
                            {regressionSteps.intercept}
                          </>
                        ) : (
                          "mx + b"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={() => setPoints([])}
      >
        Reset Points
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p>Click anywhere on the grid to add points.</p>
        <p>
          Correlation coefficient and regression line will appear after adding 3
          or more points.
        </p>
      </div>
    </div>
  );
};

export default ScatterPlotPlayground;
