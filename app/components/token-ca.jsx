"use client";

const TOKEN_CA = "iACepJW3vyevPBMe2CwyzLTF9Hj6nWRYW4QukqVEASY";

export default function TokenCa() {
  async function copy() {
    try {
      await navigator.clipboard.writeText(TOKEN_CA);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      className="topbar-ca"
      onClick={copy}
      title="Click to copy contract address"
    >
      <span className="topbar-ca-label">CA</span>
      <span className="topbar-ca-value">{TOKEN_CA}</span>
    </button>
  );
}
