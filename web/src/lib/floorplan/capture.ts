export interface CaptureOpts {
  pixelRatio?: number;
  includeGrid?: boolean;
}

type Capturer = (opts?: CaptureOpts) => Promise<string>;

let capturer: Capturer | null = null;

export function registerCapturer(fn: Capturer | null) {
  capturer = fn;
}

export async function captureStage(opts?: CaptureOpts): Promise<string> {
  if (!capturer) throw new Error("Canvas is not ready");
  return capturer(opts);
}
