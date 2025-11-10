// This module will handle the dynamic routing of API requests.

const ON_PREM_IMAGE_ANALYSIS_URL = "http://localhost:5001"; // Replace with your Mac Studio's local IP
const ON_PREM_KNOWLEDGE_BASE_URL = "http://localhost:5002"; // Replace with your Mac Studio's local IP

let isOnPrem = false;

export const checkOnPremStatus = async () => {
  try {
    // A simple health check to the on-prem service
    const response = await fetch(ON_PREM_IMAGE_ANALYSIS_URL);
    if (response.ok) {
      isOnPrem = true;
      console.log("On-premise services detected.");
    }
  } catch (error) {
    isOnPrem = false;
    console.log("On-premise services not detected. Using cloud gateway.");
  }
};

export const getApiEndpoints = () => {
  if (isOnPrem) {
    return {
      imageAnalysis: ON_PREM_IMAGE_ANALYSIS_URL,
      knowledgeBase: ON_PREM_KNOWLEDGE_BASE_URL,
    };
  } else {
    // TODO: Replace with the URL of your GCP API Gateway
    return {
      imageAnalysis: "https://your-cloud-gateway-url.run.app/image-analysis",
      knowledgeBase: "https://your-cloud-gateway-url.run.app/knowledge-base",
    };
  }
};