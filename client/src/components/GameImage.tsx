import type { CropRegion } from "./types";

interface GameImageProps {
  imageUrl: string;
  viewMode: "full" | "partial";
  cropRegion?: CropRegion | null;
  colorTags?: string[] | null;
  alt?: string;
}

export function GameImage({
  imageUrl,
  viewMode,
  cropRegion,
  colorTags,
  alt = "Round image",
}: GameImageProps) {
  if (viewMode === "partial" && cropRegion) {
    const scale = 100 / cropRegion.width;
    const posX = (cropRegion.x / (100 - cropRegion.width)) * 100;
    const posY = (cropRegion.y / (100 - cropRegion.height)) * 100;

    return (
      <div className="image-frame partial">
        <div
          role="img"
          aria-label={alt}
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${scale * 100}%`,
            backgroundPosition: `${posX}% ${posY}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="partial-overlay" />
        <div className="partial-hint">
          <div className="muted" style={{ marginBottom: "0.35rem" }}>
            Sneak peek only — you only see a fragment
          </div>
          {colorTags && colorTags.length > 0 && (
            <div className="tag-row">
              {colorTags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="image-frame">
      <img src={imageUrl} alt={alt} />
    </div>
  );
}
