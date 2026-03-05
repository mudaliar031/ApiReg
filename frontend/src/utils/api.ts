const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Safe API fetch utility with comprehensive error handling
 * - Handles JSON responses
 * - Handles non-JSON responses (HTML, plain text, etc.)
 * - Gracefully handles network failures
 * - Returns meaningful error messages
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
    });

    // Handle 401 - Unauthorized
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
      return null;
    }

    // Try to parse as JSON
    let data: any = null;
    const contentType = response.headers.get("content-type");

    try {
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Response is not JSON, read as text
        const text = await response.text();
        console.warn("Server returned non-JSON response:", {
          status: response.status,
          contentType,
          text: text.substring(0, 200), // First 200 chars
        });

        // Try to extract error message from HTML if it's an error response
        if (!response.ok) {
          const errorMatch = text.match(/<p>(.*?)<\/p>/);
          const errorMessage = errorMatch?.[1] || text.substring(0, 200) || `Error ${response.status}`;
          throw new Error(errorMessage);
        }

        // For successful non-JSON responses, return empty object
        data = {};
      }
    } catch (parseErr: any) {
      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${parseErr.message}`);
      }
      data = {};
    }

    // Check HTTP status code
    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err: any) {
    const errorMessage = err?.message || "Network request failed";
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }
};