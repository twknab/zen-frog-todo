import { ImageResponse } from "next/og";
import { FROG_ICON_PATH, FROG_ICON_VIEWBOX } from "@/lib/frogIcon";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="26" height="26" viewBox={FROG_ICON_VIEWBOX} fill="#6B8F71">
          <path d={FROG_ICON_PATH} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
