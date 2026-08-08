import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      {/* NAVBAR */}
      <header className="landing-header">
        <nav className="landing-nav">
          <Link href="/" className="brand">
            <span className="brand-mark">V</span>
            <span>Vision AI</span>
          </Link>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#use-cases">Use cases</a>
          </div>

          <div className="nav-actions">
            <Link href="/login" className="nav-login">
              Log in
            </Link>

            <Link href="/signup" className="nav-cta">
              Get started
              <span>↗</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          <span className="status-dot" />
          The intelligent workspace for your ideas
          <span className="badge-arrow">→</span>
        </div>

        <h1>
          Think bigger.
          <br />
          <span>Build with AI.</span>
        </h1>

        <p className="hero-description">
          Vision AI is your intelligent workspace for asking questions,
          understanding images and files, creating content, writing code,
          and turning ideas into real work.
        </p>

        <div className="hero-buttons">
          <Link href="/signup" className="hero-primary">
            Start for free
            <span>↗</span>
          </Link>

          <a href="#features" className="hero-secondary">
            Explore Vision AI
            <span>↓</span>
          </a>
        </div>

        <div className="hero-trust">
          <span>✓ No credit card required</span>
          <span>✓ Built for creators</span>
          <span>✓ Fast & intelligent</span>
        </div>

        {/* AI APP PREVIEW */}
        <div className="ai-window-wrap">
          <div className="ai-window-glow" />

          <div className="ai-window">
            <div className="ai-window-top">
              <div className="window-dots">
                <span />
                <span />
                <span />
              </div>

              <div className="window-title">
                <span className="mini-logo">V</span>
                Vision AI
              </div>

              <div className="window-actions">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="ai-window-body">
              <aside className="ai-sidebar">
                <div className="sidebar-brand">
                  <div className="brand">
                    <span className="mini-logo">V</span>
                    Vision AI
                  </div>
                </div>

                <div className="sidebar-new">
                  <span>＋</span>
                  New conversation
                </div>

                <div className="sidebar-item active">
                  <span>⌕</span>
                  Search
                </div>

                <div className="sidebar-label">
                  HISTORY
                </div>

                <div className="sidebar-history">
                  Help me turn this idea into a real product.
                </div>

                <div className="sidebar-history">
                  Explain this image
                </div>

                <div className="sidebar-history">
                  Build a landing page
                </div>
              </aside>

              <div className="ai-chat">
                <div className="chat-center">
                  <div className="chat-logo">V</div>

                  <h3>Your AI workspace.</h3>

                  <p>
                    Ask anything. Understand anything. Create anything.
                  </p>

                  <div className="prompt-grid">
                    <div className="prompt-card">
                      <span>✦</span>
                      <div>
                        <strong>Ask anything</strong>
                        <small>Get intelligent answers</small>
                      </div>
                    </div>

                    <div className="prompt-card">
                      <span>◈</span>
                      <div>
                        <strong>Understand images</strong>
                        <small>Analyze visual content</small>
                      </div>
                    </div>

                    <div className="prompt-card">
                      <span>◇</span>
                      <div>
                        <strong>Work with files</strong>
                        <small>Read and understand documents</small>
                      </div>
                    </div>

                    <div className="prompt-card">
                      <span>⌘</span>
                      <div>
                        <strong>Build with AI</strong>
                        <small>Create real projects</small>
                      </div>
                    </div>
                  </div>

                  <div className="fake-input">
                    Ask Vision AI anything...
                    <button>↑</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section">
        <div className="section-heading">
          <div className="section-eyebrow">ONE WORKSPACE</div>

          <h2>
            One AI.
            <br />
            <span>Many possibilities.</span>
          </h2>

          <p>
            Everything you need to think, create, learn and build —
            brought together in one intelligent workspace.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card feature-large">
            <div>
              <div className="feature-icon">✦</div>
            </div>

            <div>
              <h3>Intelligence</h3>
              <p>
                Ask complex questions, brainstorm ideas, learn new concepts,
                solve problems and get clear answers without leaving your
                workspace.
              </p>
            </div>

            <span className="card-arrow">↗</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">◈</div>

            <div>
              <h3>Vision</h3>
              <p>
                Upload images and let Vision AI understand, analyze and
                explain what you are looking at.
              </p>
            </div>

            <span className="card-arrow">↗</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">◇</div>

            <div>
              <h3>Files</h3>
              <p>
                Work with documents, notes and other files to find answers
                and extract useful information.
              </p>
            </div>

            <span className="card-arrow">↗</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✎</div>

            <div>
              <h3>Create</h3>
              <p>
                Turn rough ideas into polished writing, concepts,
                presentations and creative work.
              </p>
            </div>

            <span className="card-arrow">↗</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⌘</div>

            <div>
              <h3>Build</h3>
              <p>
                Write code, design websites and turn ideas into working
                digital products with AI.
              </p>
            </div>

            <span className="card-arrow">↗</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <div className="section-heading">
          <div className="section-eyebrow">HOW IT WORKS</div>

          <h2>
            From idea
            <br />
            <span>to reality.</span>
          </h2>

          <p>
            Vision AI is designed to stay out of your way and help you
            move from thinking to doing.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>

            <h3>Tell Vision AI</h3>

            <p>
              Ask a question, describe an idea, upload an image or give
              Vision AI a file to work with.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>

            <h3>Understand & create</h3>

            <p>
              Vision AI analyzes your input and helps you understand,
              improve, create or solve what you need.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>

            <h3>Make it real</h3>

            <p>
              Take the result and turn it into something useful —
              a project, document, design, answer or idea.
            </p>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="section">
        <div className="section-heading">
          <div className="section-eyebrow">BUILT FOR YOU</div>

          <h2>
            Whatever you're
            <br />
            <span>working on.</span>
          </h2>
        </div>

        <div className="use-grid">
          <div className="use-card">
            <div className="use-number">01</div>

            <h3>Learn</h3>

            <p>
              Understand difficult topics, study smarter and get
              explanations that actually make sense.
            </p>

            <div className="use-arrow">↗</div>
          </div>

          <div className="use-card">
            <div className="use-number">02</div>

            <h3>Create</h3>

            <p>
              Write, brainstorm, plan and transform rough thoughts into
              polished ideas.
            </p>

            <div className="use-arrow">↗</div>
          </div>

          <div className="use-card">
            <div className="use-number">03</div>

            <h3>Build</h3>

            <p>
              Develop websites, apps and digital products with an AI
              that helps you move faster.
            </p>

            <div className="use-arrow">↗</div>
          </div>

          <div className="use-card">
            <div className="use-number">04</div>

            <h3>Explore</h3>

            <p>
              Research ideas, analyze information and discover new
              possibilities.
            </p>

            <div className="use-arrow">↗</div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-section">
        <div className="final-card">
          <div className="final-glow" />

          <div className="final-logo">V</div>

          <h2>
            Your ideas.
            <br />
            <span>Now possible.</span>
          </h2>

          <p>
            Start with a question. End with something real.
          </p>

          <Link href="/signup" className="final-button">
            Get started
            <span>↗</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="mini-logo">V</span>
          Vision AI
        </div>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#use-cases">Use cases</a>
        </div>

        <div>© 2026 Vision AI</div>
      </footer>
    </main>
  );
}