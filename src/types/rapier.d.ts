import type { Object3DProps } from "@react-three/fiber";
import type { RigidBodyUserData } from "../types";

declare module "@react-three/rapier" {
  // Expose the app-specific userData shape as a helper type for consumers
  // (cannot narrow the existing userData property type without conflicting
  // with upstream's declaration of `userData?: Object3DProps["userData"]`).
  export type AppRigidBodyUserData = RigidBodyUserData;

  interface RigidBodyOptions {
    userData?: Object3DProps["userData"];
  }
}
