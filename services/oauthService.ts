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
  return new Promise((resolve) => {
    console.log(`Simulating a successful OAuth token exchange for ${platform} with code: ${code}`);
    console.log('In a real application, this would be a secure backend call.');

    // Simulate network delay for a successful exchange
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
  });
};
