"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  expandedObjects,
  type SceneObject,
  type StudioDesign,
} from "@/lib/studio/design";
import { catalogItem } from "@/lib/studio/catalog";
export type SceneView = "perspective" | "eye" | "room" | "photo";
const cm = (n: number) => n / 100;
const mat = (color: string, kind = "matte") =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: kind === "glass" ? 0.08 : kind === "metal" ? 0.25 : 0.8,
    metalness: kind === "metal" ? 0.65 : 0,
    transparent: kind === "glass",
    opacity: kind === "glass" ? 0.33 : 1,
    side: THREE.DoubleSide,
  });
function mesh(g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) {
  const p = new THREE.Mesh(g, m);
  p.position.set(x, y, z);
  p.castShadow = true;
  p.receiveShadow = true;
  return p;
}
const cylinder = (
  r: number,
  h: number,
  m: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
) => mesh(new THREE.CylinderGeometry(r, r, h, 24), m, x, y, z);
const ball = (r: number, m: THREE.Material, x = 0, y = 0, z = 0) =>
  mesh(new THREE.SphereGeometry(r, 10, 7), m, x, y, z);
function objectModel(o: SceneObject, simple = false) {
  const group = new THREE.Group(),
    w = cm(o.width),
    d = cm(o.depth),
    h = cm(o.height),
    material = mat(o.color, catalogItem(o.catalogId)?.material),
    green = mat("#5f7a50"),
    gold = mat("#b49867", "metal");
  if (o.kind === "flower" || o.kind === "foliage") {
    for (let i = 0; i < o.count; i++) {
      const a = i * 2.399 + o.catalogId.length * 0.4,
        r = Math.sqrt(i / Math.max(1, o.count)) * w * 0.9,
        x = Math.cos(a) * r,
        z = Math.sin(a) * r,
        top = h * (0.75 + Math.sin(i * 3.1) * 0.1);
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(),
        new THREE.Vector3(x, top, z),
      );
      group.add(mesh(new THREE.TubeGeometry(curve, 1, 0.002, 4, false), green));
      if (o.kind === "foliage") {
        for (let j = 1; j < 8; j++) {
          const t = j / 8,
            leaf = ball(
              0.035,
              material,
              x * t + Math.sin(j * 2.5) * 0.025,
              top * t,
              z * t,
            );
          leaf.scale.set(o.catalogId === "eucalyptus" ? 1 : 0.5, 0.14, 1);
          leaf.rotation.set(0.4, j * 2.5, 0.3);
          group.add(leaf);
        }
      } else {
        const head = new THREE.Group();
        if (o.catalogId === "hydrangea") {
          for (let j = 0; j < (simple ? 12 : 25); j++) {
            const b = j * 2.399,
              rad = Math.sqrt(j / 25) * w * 0.42;
            for (let k = 0; k < 4; k++) {
              const petal = ball(
                w * 0.085,
                material,
                Math.cos(b) * rad + Math.cos((k * Math.PI) / 2) * w * 0.04,
                Math.sqrt(1 - j / 26) * w * 0.22,
                Math.sin(b) * rad + Math.sin((k * Math.PI) / 2) * w * 0.04,
              );
              petal.scale.y = 0.25;
              head.add(petal);
            }
          }
        } else {
          for (let layer = 0; layer < (simple ? 3 : 5); layer++)
            for (let j = 0; j < 7 + layer * 2; j++) {
              const a = (j / (7 + layer * 2)) * Math.PI * 2 + layer * 0.7,
                s = (layer + 1) / 5,
                p = ball(
                  w * (0.14 + s * 0.035),
                  material,
                  Math.cos(a) * w * 0.26 * s,
                  (1 - s) * w * 0.16,
                  Math.sin(a) * w * 0.26 * s,
                );
              p.scale.set(1, 0.27 + s * 0.18, 1.35);
              p.rotation.set(Math.cos(a) * 0.6, a, Math.sin(a) * 0.6);
              head.add(p);
            }
          head.add(
            ball(
              w * 0.07,
              mat(new THREE.Color(o.color).multiplyScalar(0.75).getStyle()),
              0,
              w * 0.14,
              0,
            ),
          );
        }
        head.position.set(x, top, z);
        head.rotation.set(Math.cos(a) * 0.3, a, Math.sin(a) * 0.3);
        group.add(head);
      }
    }
  } else if (o.kind === "vessel") {
    const points =
      o.catalogId === "compote"
        ? [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(w * 0.22, 0),
            new THREE.Vector2(w * 0.18, h * 0.1),
            new THREE.Vector2(w * 0.1, h * 0.4),
            new THREE.Vector2(w * 0.4, h * 0.65),
            new THREE.Vector2(w * 0.5, h),
            new THREE.Vector2(w * 0.46, h),
            new THREE.Vector2(w * 0.34, h * 0.68),
          ]
        : [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(w * 0.5, 0),
            new THREE.Vector2(w * 0.49, h * 0.2),
            new THREE.Vector2(w * (o.catalogId === "bud-vase" ? 0.27 : 0.5), h),
            new THREE.Vector2(
              w * (o.catalogId === "bud-vase" ? 0.23 : 0.46),
              h,
            ),
          ];
    group.add(mesh(new THREE.LatheGeometry(points, 32), material));
  } else if (o.kind === "plate") {
    group.add(
      mesh(
        new THREE.LatheGeometry(
          [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(w * 0.34, 0),
            new THREE.Vector2(w * 0.44, h * 0.55),
            new THREE.Vector2(w * 0.5, h),
            new THREE.Vector2(w * 0.5, h * 0.65),
            new THREE.Vector2(w * 0.34, -0.004),
            new THREE.Vector2(0, -0.004),
          ],
          40,
        ),
        material,
      ),
    );
  } else if (o.kind === "glass") {
    group.add(
      cylinder(w * 0.35, 0.006, material, 0, 0.003),
      cylinder(0.005, h * 0.45, material, 0, h * 0.23),
    );
    const bowl = mesh(
      new THREE.SphereGeometry(
        w * 0.5,
        24,
        16,
        0,
        Math.PI * 2,
        Math.PI * 0.12,
        Math.PI * 0.84,
      ),
      material,
      0,
      h * 0.73,
    );
    bowl.scale.y = (h * 0.36) / (w * 0.5);
    group.add(bowl);
  } else if (o.kind === "candle") {
    const taper = o.catalogId === "taper";
    group.add(cylinder(w * 0.45, 0.02, gold, 0, 0.01));
    if (taper) group.add(cylinder(0.007, h * 0.23, gold, 0, h * 0.115));
    group.add(
      cylinder(taper ? 0.013 : w * 0.28, h * 0.72, material, 0, h * 0.55),
    );
    if (!taper)
      group.add(cylinder(w * 0.49, h, mat("#e6e2d0", "glass"), 0, h * 0.5));
    const flame = ball(
      0.008,
      new THREE.MeshBasicMaterial({ color: "#ffc678" }),
      0,
      h,
      0,
    );
    flame.scale.y = 2.2;
    group.add(flame);
  } else if (o.kind === "napkin") {
    group.add(mesh(new THREE.BoxGeometry(w, 0.006, d), material, 0, 0.005));
    const fold = mesh(
      new THREE.BoxGeometry(w * 0.7, 0.005, d),
      material,
      w * 0.1,
      0.012,
    );
    fold.rotation.z = 0.025;
    group.add(fold);
  } else if (o.kind === "paper" || o.kind === "sign") {
    const sign = o.kind === "sign";
    group.add(
      mesh(
        new THREE.BoxGeometry(w, sign ? h : 0.001, sign ? d : d),
        material,
        0,
        sign ? h / 2 : 0.003,
      ),
    );
    if (o.imageUrl) {
      const texture = new THREE.TextureLoader().load(o.imageUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      const artwork = mesh(
        new THREE.PlaneGeometry(w, sign ? h : d),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        }),
        0,
        sign ? h / 2 : 0.005,
        sign ? d / 2 + 0.001 : 0,
      );
      if (!sign) artwork.rotation.x = -Math.PI / 2;
      group.add(artwork);
    }
    if (sign && h > 0.35) {
      group.add(
        cylinder(0.012, h * 0.7, gold, -w * 0.35, h * 0.22, 0.05),
        cylinder(0.012, h * 0.7, gold, w * 0.35, h * 0.22, 0.05),
      );
    }
  } else if (o.kind === "arch") {
    const points = [
      new THREE.Vector3(-w / 2, 0, 0),
      new THREE.Vector3(-w / 2, h * 0.7, 0),
    ];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI - (i / 20) * Math.PI;
      points.push(
        new THREE.Vector3(
          (Math.cos(a) * w) / 2,
          h * 0.7 + Math.sin(a) * h * 0.3,
          0,
        ),
      );
    }
    points.push(new THREE.Vector3(w / 2, 0, 0));
    group.add(
      mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          60,
          0.025,
          8,
          false,
        ),
        material,
      ),
    );
    for (const x of [-w / 2, w / 2])
      group.add(mesh(new THREE.BoxGeometry(0.4, 0.02, d), material, x, 0.01));
  } else if (o.kind === "drape") {
    const geo = new THREE.PlaneGeometry(w, h, 40, 10),
      pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++)
      pos.setZ(i, Math.sin((pos.getX(i) / w) * Math.PI * 12) * d * 0.3);
    geo.computeVertexNormals();
    group.add(mesh(geo, material, 0, h / 2));
  } else {
    group.add(mesh(new THREE.BoxGeometry(w, h, d), material, 0, h / 2));
    if (o.kind === "favor") {
      group.add(
        mesh(
          new THREE.BoxGeometry(w + 0.002, 0.005, d + 0.002),
          mat("#ece3cd"),
          0,
          h,
        ),
        mesh(
          new THREE.BoxGeometry(w * 0.13, h + 0.005, d + 0.004),
          mat("#8c9b75"),
          0,
          h / 2,
        ),
      );
    }
    if (o.kind === "light") {
      const light = new THREE.SpotLight("#ffe2b0", 3, 4, Math.PI / 7, 0.7);
      light.position.y = h;
      light.target.position.set(0, 3, -0.2);
      group.add(light, light.target);
    }
  }
  group.position.set(cm(o.x), cm(o.y), cm(o.z));
  group.rotation.y = (-o.rotation * Math.PI) / 180;
  group.traverse((child) => {
    child.userData.objectId = o.id;
  });
  return group;
}
function tableModel(d: StudioDesign, selected?: string, simple = false) {
  const g = new THREE.Group(),
    s = d.surface,
    w = cm(s.width),
    depth = cm(s.depth),
    h = s.shape === "none" ? 0 : cm(s.height);
  if (s.shape !== "none") {
    const wood = mat("#b09670"),
      linen = mat(s.linen);
    if (s.shape === "round") g.add(cylinder(w / 2, 0.06, wood, 0, h - 0.03));
    else g.add(mesh(new THREE.BoxGeometry(w, 0.06, depth), wood, 0, h - 0.03));
    for (const x of [-1, 1])
      for (const z of [-1, 1])
        g.add(cylinder(0.025, h, wood, x * w * 0.3, h / 2, z * depth * 0.3));
    const drop = Math.max(0, Math.min(cm(s.linenDrop), h - 0.01));
    if (s.shape === "round") {
      const geo = new THREE.LatheGeometry(
        [
          new THREE.Vector2(0, h + 0.008),
          new THREE.Vector2(w * 0.35, h + 0.008),
          new THREE.Vector2(w / 2, h + 0.004),
          new THREE.Vector2(w / 2 + 0.015, h - 0.015),
          new THREE.Vector2(w / 2 + 0.025, h - drop),
        ],
        72,
      );
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++)
        if (p.getY(i) < h - 0.04) {
          const a = Math.atan2(p.getZ(i), p.getX(i)),
            r = Math.sin(a * 32) * 0.009;
          p.setX(i, p.getX(i) + Math.cos(a) * r);
          p.setZ(i, p.getZ(i) + Math.sin(a) * r);
        }
      geo.computeVertexNormals();
      g.add(mesh(geo, linen));
    } else {
      g.add(
        mesh(
          new THREE.BoxGeometry(w + 0.012, 0.012, depth + 0.012),
          linen,
          0,
          h,
        ),
      );
      if (drop)
        for (const side of [-1, 1])
          g.add(
            mesh(
              new THREE.BoxGeometry(w + 0.02, drop, 0.009),
              linen,
              0,
              h - drop / 2,
              side * (depth / 2 + 0.006),
            ),
            mesh(
              new THREE.BoxGeometry(0.009, drop, depth + 0.02),
              linen,
              side * (w / 2 + 0.006),
              h - drop / 2,
            ),
          );
    }
    if (s.runner)
      g.add(
        mesh(
          new THREE.BoxGeometry(w * 0.25, 0.003, depth + 0.015),
          mat(s.runner),
          0,
          h + 0.011,
        ),
      );
    for (let i = 0; i < s.seats; i++) {
      const a = (i / Math.max(1, s.seats)) * Math.PI * 2,
        chair = new THREE.Group();
      chair.add(mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), wood, 0, 0.43));
      for (const x of [-0.17, 0.17])
        for (const z of [-0.17, 0.17])
          chair.add(cylinder(0.013, 0.44, wood, x, 0.22, z));
      for (const x of [-0.17, 0.17])
        chair.add(cylinder(0.013, 0.45, wood, x, 0.67, 0.17));
      chair.add(
        mesh(new THREE.BoxGeometry(0.38, 0.045, 0.025), wood, 0, 0.84, 0.17),
      );
      if (s.shape === "round") {
        const r = w / 2 + 0.32;
        chair.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
        chair.rotation.y = a;
      } else {
        const half = Math.ceil(s.seats / 2),
          row = i < half ? 0 : 1,
          col = i % half;
        chair.position.set(
          ((col - (half - 1) / 2) * w) / half,
          0,
          (row ? 1 : -1) * (depth / 2 + 0.32),
        );
        chair.rotation.y = row ? 0 : Math.PI;
      }
      g.add(chair);
    }
  }
  for (const o of expandedObjects(d)) {
    const model = objectModel(o, simple);
    model.position.y += h + 0.012;
    g.add(model);
    if (o.id === selected) {
      const ring = mesh(
        new THREE.RingGeometry(
          Math.max(cm(o.width), cm(o.depth)) * 0.6,
          Math.max(cm(o.width), cm(o.depth)) * 0.6 + 0.01,
          40,
        ),
        new THREE.MeshBasicMaterial({
          color: "#5e7850",
          side: THREE.DoubleSide,
        }),
        cm(o.x),
        h + 0.018,
        cm(o.z),
      );
      ring.rotation.x = -Math.PI / 2;
      g.add(ring);
    }
  }
  return g;
}
function dispose(g: THREE.Object3D) {
  const geos = new Set<THREE.BufferGeometry>(),
    mats = new Set<THREE.Material>();
  g.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      geos.add(o.geometry);
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
        mats.add(m),
      );
    }
    if (o instanceof THREE.DirectionalLight || o instanceof THREE.SpotLight)
      o.shadow.dispose();
  });
  geos.forEach((g) => g.dispose());
  mats.forEach((m) => {
    (m as THREE.MeshBasicMaterial).map?.dispose();
    m.dispose();
  });
}
function mergedModel(d: StudioDesign) {
  const model = tableModel(d, undefined, true);
  model.updateMatrixWorld(true);
  const buckets = new Map<
    string,
    { material: THREE.Material; geometries: THREE.BufferGeometry[] }
  >();
  model.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const m = o.material as THREE.MeshPhysicalMaterial,
      key = `${m.type}|${m.color?.getHex()}|${m.opacity}|${m.roughness}|${m.map?.uuid || ""}`,
      b = buckets.get(key) || { material: m.clone(), geometries: [] };
    let geo = o.geometry.clone().applyMatrix4(o.matrixWorld);
    if (geo.index) {
      const old = geo;
      geo = geo.toNonIndexed();
      old.dispose();
    }
    b.geometries.push(geo);
    buckets.set(key, b);
  });
  const result = new THREE.Group();
  for (const b of buckets.values()) {
    const geo = mergeGeometries(b.geometries);
    b.geometries.forEach((g) => g.dispose());
    if (geo) result.add(mesh(geo, b.material));
  }
  model.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return result;
}
type Engine = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  content: THREE.Group;
  draw: () => void;
};
export function ScenePreview({
  design,
  view = "perspective",
  quantity = 1,
  selected,
  onSelect,
  onExportReady,
  onUnavailable,
}: {
  design: StudioDesign;
  view?: SceneView;
  quantity?: number;
  selected?: string;
  onSelect?: (id: string) => void;
  onExportReady?: (fn: () => string) => void;
  onUnavailable?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    engine = useRef<Engine | null>(null),
    select = useRef(onSelect);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (failed) onUnavailable?.();
  }, [failed, onUnavailable]);
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    try {
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(36, 1, 0.01, 200),
        controls = new OrbitControls(camera, renderer.domElement),
        content = new THREE.Group();
      scene.add(content);
      camera.position.set(2.9, 2.5, 3.5);
      controls.target.set(0, 0.75, 0);
      controls.enableDamping = true;
      controls.minDistance = 0.35;
      controls.maxDistance = 40;
      controls.maxPolarAngle = Math.PI * 0.49;
      let frame = 0;
      const draw = () => {
        if (frame) return;
        let count = 0;
        const tick = () => {
          controls.update();
          renderer.render(scene, camera);
          frame = ++count < 20 ? requestAnimationFrame(tick) : 0;
        };
        frame = requestAnimationFrame(tick);
      };
      engine.current = { renderer, scene, camera, controls, content, draw };
      controls.addEventListener("change", draw);
      const resize = new ResizeObserver(() => {
        const r = el.getBoundingClientRect();
        renderer.setSize(r.width, r.height);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        draw();
      });
      resize.observe(el);
      const click = (event: PointerEvent) => {
        const r = el.getBoundingClientRect(),
          ray = new THREE.Raycaster();
        ray.setFromCamera(
          new THREE.Vector2(
            ((event.clientX - r.left) / r.width) * 2 - 1,
            (-(event.clientY - r.top) / r.height) * 2 + 1,
          ),
          camera,
        );
        const hit = ray
          .intersectObject(content, true)
          .find((x) => x.object.userData.objectId);
        if (hit) select.current?.(hit.object.userData.objectId);
      };
      renderer.domElement.addEventListener("click", click);
      const lost = (e: Event) => {
        e.preventDefault();
        setFailed(true);
      };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      draw();
      return () => {
        resize.disconnect();
        cancelAnimationFrame(frame);
        controls.dispose();
        dispose(content);
        renderer.dispose();
        renderer.domElement.remove();
        engine.current = null;
      };
    } catch {
      queueMicrotask(() => setFailed(true));
    }
  }, []);
  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    dispose(e.content);
    e.content.clear();
    const evening = design.lighting === "evening";
    e.scene.background =
      view === "photo" && design.room.photo
        ? null
        : new THREE.Color(evening ? "#292d29" : "#eeeae2");
    e.renderer.toneMappingExposure = evening ? 1.35 : 1.2;
    e.content.add(
      new THREE.HemisphereLight(
        evening ? "#ffe0b3" : "#fff9ee",
        "#8d927e",
        evening ? 1.5 : 2.7,
      ),
    );
    const light = new THREE.DirectionalLight(
      evening ? "#ffcb91" : "#fff5e5",
      3,
    );
    light.position.set(3, 6, 4);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    Object.assign(light.shadow.camera, {
      left: -8,
      right: 8,
      top: 8,
      bottom: -8,
    });
    light.shadow.bias = -0.0003;
    e.content.add(light);
    if (view !== "photo") {
      const floor = mesh(
        new THREE.PlaneGeometry(cm(design.room.width), cm(design.room.depth)),
        mat(evening ? "#756b59" : "#d7d2c7"),
      );
      floor.rotation.x = -Math.PI / 2;
      e.content.add(floor);
    }
    if (view === "room") {
      const n = Math.min(quantity, 100),
        space = Math.max(
          2.5,
          cm(Math.max(design.surface.width, design.surface.depth)) + 1.15,
        ),
        cols = Math.max(1, Math.floor(cm(design.room.width) / space)),
        model = mergedModel(design);
      for (let i = 0; i < n; i++) {
        const g = model.clone();
        g.position.set(
          ((i % cols) - (Math.min(cols, n) - 1) / 2) * space,
          0,
          (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * space,
        );
        e.content.add(g);
      }
    } else e.content.add(tableModel(design, selected));
    let photo: HTMLImageElement | undefined;
    if (view === "photo" && design.room.photo) {
      photo = new Image();
      photo.crossOrigin = "anonymous";
      photo.src = design.room.photo;
    }
    onExportReady?.(() => {
      e.renderer.render(e.scene, e.camera);
      const render = e.renderer.domElement,
        out = document.createElement("canvas");
      out.width = render.width;
      out.height = render.height;
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("Image export unavailable.");
      if (photo) {
        if (!photo.complete || !photo.naturalWidth)
          throw new Error("The venue photo is still loading.");
        const w = (out.width * design.room.photoScale) / 100,
          h = (w * photo.naturalHeight) / photo.naturalWidth;
        ctx.fillStyle = "#e9ecdf";
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(
          photo,
          ((out.width - w) * design.room.photoX) / 100,
          ((out.height - h) * design.room.photoY) / 100,
          w,
          h,
        );
      }
      ctx.drawImage(render, 0, 0);
      ctx.fillStyle = "#fafaf5ee";
      ctx.fillRect(0, out.height - 36, out.width, 36);
      ctx.fillStyle = "#354d3c";
      ctx.font = "14px sans-serif";
      ctx.fillText(
        "Vowfolk Studio · dimension-based preview",
        14,
        out.height - 13,
      );
      return out.toDataURL("image/png");
    });
    e.draw();
    const a = setTimeout(e.draw, 600),
      b = setTimeout(e.draw, 1800);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [design, view, quantity, selected, onExportReady]);
  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    const h =
        design.surface.shape === "none" ? 1 : cm(design.surface.height) + 0.14,
      scale =
        design.surface.shape === "none"
          ? 1.5
          : Math.max(0.8, design.surface.width / 152);
    if (view === "room") {
      const size = Math.max(cm(design.room.width), cm(design.room.depth));
      e.camera.position.set(size * 0.65, size * 0.75, size * 0.8);
      e.controls.target.set(0, 0, 0);
    } else {
      e.camera.position.set(
        view === "eye" ? 0 : 2.4 * scale,
        view === "eye" ? 1.25 : 2.3 * scale,
        3.1 * scale,
      );
      e.controls.target.set(0, h, 0);
    }
    e.controls.update();
    e.draw();
  }, [
    view,
    design.surface.shape,
    design.surface.width,
    design.surface.height,
    design.room.width,
    design.room.depth,
  ]);
  return (
    <div
      className="studio-scene"
      style={
        view === "photo" && design.room.photo
          ? {
              backgroundImage: `url("${design.room.photo}")`,
              backgroundSize: `${design.room.photoScale}% auto`,
              backgroundPosition: `${design.room.photoX}% ${design.room.photoY}%`,
            }
          : undefined
      }
    >
      <div
        className="studio-webgl"
        ref={host}
        role="img"
        aria-label="Interactive 3D wedding design. Drag to orbit, scroll to zoom. Use measured plan and controls for keyboard editing."
      />
      {failed && (
        <div className="studio-render-fallback">
          3D is unavailable on this device. Use the measured plan to continue
          editing.
        </div>
      )}
      <span className="studio-scene-caption">
        {view === "room"
          ? `${Math.min(quantity, 100)} layouts shown · confirm venue spacing`
          : view === "photo"
            ? "Manual venue alignment · verify measurements"
            : "Interactive 3D · drag to orbit · scroll to zoom"}
      </span>
    </div>
  );
}
