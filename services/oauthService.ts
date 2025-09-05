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
    console.log(`Simulating token exchange for ${platform} with code: ${code}`);

    // Simulate network delay for the server-to-server call
    setTimeout(() => {
      // In a real app, you'd make a server request here with the code
      // and your client secret to get an access token.
      // We'll just assume success if the code is our mock code.
      if (code.startsWith('mock_auth_code')) {
        resolve({ success: true });
      } else {
        reject(new Error('Invalid authorization code.'));
      }
    }, 2000); // 2-second delay to simulate a real API call
  });
};
