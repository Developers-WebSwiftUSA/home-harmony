import { useEffect, useState } from "react";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

type State = {
  location: UserLocation | null;
  status: "idle" | "loading" | "ready" | "denied" | "unsupported" | "error";
};

export const useUserLocation = (enabled = true) => {
  const [state, setState] = useState<State>({ location: null, status: "idle" });

  useEffect(() => {
    if (!enabled) return;
    if (!navigator.geolocation) {
      setState({ location: null, status: "unsupported" });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading" }));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          location: {
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
          },
          status: "ready",
        });
      },
      (error) => {
        setState({
          location: null,
          status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
        });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 15_000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  return state;
};
