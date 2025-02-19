type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

class ServerApiClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(accessToken: string) {
    //@ts-ignore
    this.baseUrl = process.env.API_URL;
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v2${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    };

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle auth errors specifically
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // For DELETE or when response has no content, return empty object
      if (
        method === "DELETE" ||
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return {} as T;
      }

      // Only parse as JSON if there's content to parse
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return {} as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, "GET");
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, "POST", data);
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, "PUT", data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, "DELETE");
  }
}

export function getServerApiClient(accessToken: string): ServerApiClient {
  return new ServerApiClient(accessToken);
}
