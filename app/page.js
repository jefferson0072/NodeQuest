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
