/**
 * A burst of back-to-back requests from CI's shared runner IPs reliably trips a multi-minute
 * rate-limit/cooldown on ParaBank's demo instance (every page or endpoint, unrelated to what the
 * request does, starts timing out) — never observed from a residential IP. Both the UI and API
 * fixture files pace themselves the same way in CI using this shared constant/helper.
 */
export const CI_REQUEST_PACING_MS = 3000;

export async function pauseForRequestPacing(): Promise<void> {
  if (process.env.CI) {
    await new Promise((resolve) => setTimeout(resolve, CI_REQUEST_PACING_MS));
  }
}
