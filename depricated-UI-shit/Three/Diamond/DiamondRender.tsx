import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import { useGLTF, CubeCamera, MeshRefractionMaterial } from "@react-three/drei";
import { RGBELoader } from "three-stdlib";
import * as THREE from "three";

/* import { ob } from "../../../assets/shapes/dflat.glb"
 */

function Diamond({ index, z, speed }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF("/dflat.glb");
  const texture = useLoader(
    RGBELoader,
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr",
  );
  // Optional config
  const config = {
    bounces: 1,
    aberrationStrength: 0.01,
    ior: 1.25,
    fresnel: 1,
    color: "#dc0000",
    fastChroma: true,
  };

  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -z]);
  // Local component state, it is safe to mutate because it's fixed data
  const [data] = useState({
    // Randomly distributing the objects along the vertical
    y: THREE.MathUtils.randFloatSpread(height * 2),
    // This gives us a random value between -1 and 1, we will multiply it with the viewport width
    x: THREE.MathUtils.randFloatSpread(2),
    // How fast objects spin, randFlost gives us a value between min and max, in this case 8 and 12
    spin: THREE.MathUtils.randFloat(8, 12),
    // Some random rotations, Math.PI represents 360 degrees in radian
    rX: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  });

  useFrame((state, dt) => {
    if (ref.current) {
      if (dt < 0.1)
        ref.current.position.set(
          index === 0 ? 0 : data.x * width,
          (data.y += dt * speed),
          -z,
        );
      // Rotate the object around
      ref.current.rotation.set(
        (data.rX += dt / data.spin),
        Math.sin(index * 1000 + state.clock.elapsedTime / 10) * Math.PI,
        (data.rZ += dt / data.spin),
      );
      // If they're too far up, set them back to the bottom
      if (data.y > height * (index === 0 ? 4 : 1))
        data.y = -(height * (index === 0 ? 4 : 1));
    }
  });

  return (
    <CubeCamera resolution={128} frames={1} envMap={texture}>
      {(texture) => (
        <mesh
          castShadow
          ref={ref}
          geometry={(nodes.Diamond_1_0 as THREE.Mesh).geometry}
        >
          <MeshRefractionMaterial
            envMap={texture}
            {...config}
            toneMapped={false}
          />
        </mesh>
      )}
    </CubeCamera>
  );
}

export default function DiamondRender({
  speed = 1,
  count = 35,
  depth = 25,
  easing = (x: any) => Math.sqrt(1 - Math.pow(x - 1, 2)),
}) {
  return (
    <Canvas
      gl={{ antialias: true }}
      shadows
      camera={{ position: [0, 0, 10], fov: 20, near: 0.01, far: depth + 15 }}
    >
      <color attach="background" args={["red"]} />
      {Array.from(
        { length: count },
        (_, i) => <Diamond key={i} index={i} z={Math.round(easing(i / count) * depth)} speed={speed} /> /* prettier-ignore */,
      )}
    </Canvas>
  );
}
