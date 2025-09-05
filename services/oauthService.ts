/**
 * Simulates a backend OAuth token exchange. In a real application, this logic
 * would live on a secure server to protect client secrets.
 * @param code The authorization code received from the OAuth provider.
 * @param platform The platform for which the token is being exchanged (e.g., 'facebook').
 * @returns A promise that resolves on successful exchange or rejects on failure.
 */
export const handleOAuthCallback = (
  code: string,
  platform: string
): Promise<{ success: true }> => {
  return new Promise((resolve, reject) => {
    console.log(`Received REAL authorization code for ${platform}: ${code}`);
    console.log('This is the point where a backend server is REQUIRED to securely exchange this code for an access token using your App Secret.');

    // Simulate network delay
    setTimeout(() => {
      // In a real application, you cannot proceed from here on the frontend.
      // The App Secret cannot be exposed here.
      // We are rejecting this promise to demonstrate that the final step must be handled by a server.
      reject(new Error('Backend server not implemented. Cannot securely exchange auth code for an access token on the client-side.'));
    }, 1500);
  });
};
