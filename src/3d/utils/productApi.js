/**
 * Saves the product configuration to the backend.
 * @param {Object} payload - The complete product configuration object.
 * @returns {Promise<Object>} - The response from the server.
 */
export const saveProductConfiguration = async (payload) => {
  const API_URL = 'http://localhost:5000/products/save'; // Update with your actual backend URL

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save product');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const uploadModelFile = async (file) => {
  const formData = new FormData();
  formData.append("model", file);

  const response = await fetch("http://localhost:5000/api/upload/model", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  return result.url; // <-- permanent working URL
};

