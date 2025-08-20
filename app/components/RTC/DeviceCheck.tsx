"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { Camera, CameraOff, Mic, MicOff, RotateCw } from "lucide-react";
import Room from "./Room";

export default function DeviceCheck() {
  const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  // stop and clear any existing stream/tracks
  const stopCurrentStream = () => {
    currentStreamRef.current?.getTracks().forEach((t) => t.stop());
    currentStreamRef.current = null;
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const getCam = async () => {
    setError(null);
    try {
      // clean up previous stream if any
      stopCurrentStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        // pass proper booleans/constraints
        video: videoOn ? { facingMode: "user" } : false,
        audio: audioOn ? true : false,
      });

      currentStreamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0] || null;
      const videoTrack = stream.getVideoTracks()[0] || null;

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      if (videoRef.current) {
        videoRef.current.srcObject = videoTrack ? new MediaStream([videoTrack]) : null;
        // some browsers require a play() kick
        if (videoTrack) {
          await videoRef.current.play().catch(() => {});
        }
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : "Could not access camera/microphone";
      setError(msg);
    }
  };

  // first load
  useEffect(() => {
    getCam();
    return () => {
      stopCurrentStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-init on toggles
  useEffect(() => {
    getCam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOn, audioOn]);

if (joined) {
  return (
    <Room
      name={name}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
}

  return (
    <section className="min-h-[calc(100vh-6rem)] bg-white text-black dark:bg-black dark:text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70 md:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Device Check</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Preview your camera & mic before joining a match.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Video preview */}
            <div>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-black dark:border-neutral-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setVideoOn((v) => !v)}
                  className={cn(
                    "h-10 rounded-lg px-3 py-2",
                    videoOn
                      ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                      : "bg-white text-black hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800",
                  )}
                >
                  {videoOn ? (
                    <span className="inline-flex items-center gap-2">
                      <CameraOff className="h-4 w-4" />
                      Turn camera off
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Turn camera on
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => setAudioOn((a) => !a)}
                  className={cn(
                    "h-10 rounded-lg px-3 py-2",
                    audioOn
                      ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                      : "bg-white text-black hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800",
                  )}
                >
                  {audioOn ? (
                    <span className="inline-flex items-center gap-2">
                      <MicOff className="h-4 w-4" />
                      Mute mic
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Unmute mic
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={getCam}
                  variant="outline"
                  className="h-10 rounded-lg px-3 py-2 border-neutral-300 dark:border-neutral-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Re-check
                  </span>
                </Button>
              </div>

              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            {/* Join form */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Display name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jayanth"
                  className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-4 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {["React", "Node", "DevOps", "Python", "ML", "TypeScript"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => setJoined(true)}
                disabled={!name}
                className="h-11 w-full rounded-lg bg-black text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Join match
              </Button>

              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You can change camera/mic after joining too.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
