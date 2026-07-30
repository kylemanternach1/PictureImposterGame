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
              When it&apos;s your turn, tap your name. The screen stays covered until you do — nobody
              else should look.
            </p>
          </div>
        </div>

        <div className="instruction-step">
          <span className="step-number">2</span>
          <div>
            <strong>Learn your role &amp; study the image</strong>
            <p className="muted">
              Innocents see the full surreal scene. Imposters only get a cropped fragment and a few
              hint tags.
            </p>
          </div>
        </div>

        <div className="instruction-step">
          <span className="step-number">3</span>
          <div>
            <strong>Build the story together</strong>
            <p className="muted">
              Take turns adding words to one ongoing tale. Imposters must blend in without giving
              themselves away.
            </p>
          </div>
        </div>

        <div className="instruction-step">
          <span className="step-number">4</span>
          <div>
            <strong>Discuss &amp; vote</strong>
            <p className="muted">
              Talk about who derailed the story or fixated on a random detail. Vote out who you
              think is an imposter.
            </p>
          </div>
        </div>

        <div className="instruction-step">
          <span className="step-number">5</span>
          <div>
            <strong>Reveal</strong>
            <p className="muted">
              See the full image, who the imposters were, and how suspicious each contribution
              looked.
            </p>
          </div>
        </div>

        <div className="privacy-reminder">
          <strong>Privacy rule:</strong> Never hand the device to the next player while your image,
          role, or vote is still on screen. Always tap &ldquo;Done&rdquo; first.
        </div>
      </div>

      <button className="btn-primary" style={{ width: "100%", maxWidth: 320 }} onClick={onBegin}>
        Begin
      </button>
    </div>
  );
}
