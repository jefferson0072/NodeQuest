import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="site-wrap">
      <header className="topbar">
        <Link href="/" className="brand-link">
          <Image src="/logo.png" alt="NodeQuest" width={34} height={34} className="brand-image" />
          <span>NodeQuest</span>
        </Link>
        <nav className="nav">
          <Link href="/how-it-works">How it works</Link>
          <a
            href="https://x.com/nodequestlol"
            target="_blank"
            rel="noreferrer"
            className="nav-icon"
            aria-label="NodeQuest on X"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </a>
          <a
            href="https://github.com/jefferson0072/nodequest"
            target="_blank"
            rel="noreferrer"
            className="nav-icon"
            aria-label="NodeQuest on GitHub"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"
              />
            </svg>
          </a>
          <Link href="/bounty-compute" className="nav-cta">Launch app</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <p className="eyebrow">NodeQuest</p>
        <h1>GPU bounties that feel instant.</h1>
        <p className="lead">
          Buyers post workloads. Providers compete. NodeQuest verifies output and settles rewards in QST.
        </p>
        <div className="hero-actions">
          <Link href="/bounty-compute" className="btn-primary">Launch App</Link>
          <Link href="/how-it-works" className="btn-secondary">How It Works</Link>
        </div>
      </section>

      <section className="workflow">
        <div className="workflow-head">
          <h2>Workflow</h2>
          <p>Simple flow, strict verification.</p>
        </div>
        <div className="workflow-line" />
        <div className="workflow-steps">
          <article className="workflow-step">
            <span className="step-node">1</span>
            <h3>Post</h3>
            <p>Define workload and lock QST bounty.</p>
          </article>
          <article className="workflow-step">
            <span className="step-node">2</span>
            <h3>Race</h3>
            <p>Tier-matched providers execute and submit.</p>
          </article>
          <article className="workflow-step">
            <span className="step-node">3</span>
            <h3>Settle</h3>
            <p>Consensus verified winner gets paid.</p>
          </article>
        </div>
      </section>

      <section className="cta-strip">
        <h2>Ready to run your first bounty?</h2>
        <Link href="/bounty-compute" className="btn-primary">Open Bounty Compute</Link>
      </section>
    </main>
  );
}
