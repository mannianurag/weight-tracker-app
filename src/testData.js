// Test data generator for weight tracker
// Set ENABLE_TEST_DATA to false to disable test data

export const ENABLE_TEST_DATA = false;

export const generateTestData = () => {
  if (!ENABLE_TEST_DATA) return [];
  
  const testData = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 2); // 2 years ago
  
  const endDate = new Date();
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const numDataPoints = 45; // 45 data points
  const interval = Math.floor(totalDays / numDataPoints);
  
  for (let i = 0; i < numDataPoints; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + (i * interval));
    
    // Randomize weight between 60-70kg with some trend
    const baseWeight = 65;
    const randomVariation = (Math.random() - 0.5) * 10; // -5 to +5
    const trend = (i / numDataPoints) * 2; // Slight upward trend over time
    const weight = Math.round((baseWeight + randomVariation + trend) * 10) / 10;
    
    testData.push({
      date: date,
      weight: Math.max(60, Math.min(70, weight)) // Ensure weight stays within 60-70 range
    });
  }
  
  return testData;
};
