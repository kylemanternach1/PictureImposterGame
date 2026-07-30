import { GAME_DESCRIPTION, GAME_NAME, GAME_TAGLINE } from "../game/branding";

export function IntroScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="stack centered">
      <div className="stack centered game-hero" style={{ marginBottom: "0.5rem" }}>
        <span className="badge">Pass &amp; play · one device</span>
        <p className="game-tagline">{GAME_TAGLINE}</p>
        <h1 className="hero-title game-title">{GAME_NAME}</h1>
        <p className="hero-subtitle">{GAME_DESCRIPTION}</p>
      </div>

      <div className="card stack instructions-card">
        <h2>How to play</h2>

        <div className="instruction-step">
          <span className="step-number">1</span>
          <div>
            <strong>Pass the device privately</strong>
            <p className="muted">
              Each player taps their name, then taps Reveal to see the image. Nobody else should
              look.
            </p>
          </div>
        </div>

        <div className="instruction-step">
          <span className="step-number">2</span>
          <div>
            <strong>Build a story out loud</strong>
            <p className="muted">
              The app tells you who goes first. Take turns telling a story about the image —
              imposters only saw a sneak peek!
            </p>
          </div>
        </div>

        <div className="instruction-step">
          <span className="step-number">3</span>
          <div>
            <strong>Reveal the imposters</strong>
            <p className="muted">
              When you&apos;re done playing, tap to reveal who was faking it, then start a new game.
            </p>
          </div>
        </div>

        <div className="privacy-reminder">
          <strong>Privacy rule:</strong> Never hand the device to the next player while your image
          is still on screen. Always tap &ldquo;Done&rdquo; first.
        </div>
      </div>

      <button className="btn-primary" style={{ width: "100%", maxWidth: 320 }} onClick={onBegin}>
        Begin
      </button>
    </div>
  );
}
