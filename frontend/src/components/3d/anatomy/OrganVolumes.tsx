import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BIOLUMEN_PALETTE } from '../materials/holographicMaterial';

export interface OrganVolumesProps {
  selectedNodeId?: string;
}

export const OrganVolumes: React.FC<OrganVolumesProps> = ({ selectedNodeId }) => {
  // 1. Esophagus Tube Curve Geometry (from oral pharynx down to gastric cardia)
  const esophagusGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 1.85, 0.22),
      new THREE.Vector3(0.02, 1.55, 0.12),
      new THREE.Vector3(0.04, 1.25, 0.05),
      new THREE.Vector3(0.12, 0.98, 0.12),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.055, 12, false);
  }, []);

  // 2. Stomach J-Shape Curve Geometry
  const stomachJGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.98, 0.12), // Cardia entrance
      new THREE.Vector3(0.35, 0.92, 0.25), // Fundus top curve
      new THREE.Vector3(0.42, 0.65, 0.28), // Greater curvature body
      new THREE.Vector3(0.28, 0.45, 0.24), // Lower antrum turn
      new THREE.Vector3(0.08, 0.42, 0.22), // Pylorus exit
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.16, 16, false);
  }, []);

  // 3. Duodenal C-Loop (connecting Stomach pylorus to Small Intestine)
  const duodenumGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0.42, 0.22),
      new THREE.Vector3(0.02, 0.32, 0.25),
      new THREE.Vector3(0.18, 0.22, 0.26),
      new THREE.Vector3(0.05, 0.10, 0.28),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.07, 12, false);
  }, []);

  // 4. Systemic Aorta & Arterial Trunk
  const aortaGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 1.15, -0.05), // Aortic origin
      new THREE.Vector3(0.0, 1.38, -0.02), // Ascending arch
      new THREE.Vector3(-0.08, 1.42, -0.08), // Transverse arch
      new THREE.Vector3(-0.06, 0.8, -0.25), // Thoracic descending
      new THREE.Vector3(-0.04, -0.3, -0.28), // Abdominal aorta
      new THREE.Vector3(0.0, -0.85, -0.25), // Bifurcation
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.065, 12, false);
  }, []);

  // Highlight check helpers
  const isMouthSelected = selectedNodeId === 'node-oral-cavity';
  const isStomachSelected = selectedNodeId === 'node-stomach';
  const isIntestineSelected = selectedNodeId === 'node-small-intestine';
  const isLiverSelected = selectedNodeId === 'node-liver';
  const isSystemicSelected = selectedNodeId === 'node-systemic-circulation';

  return (
    <group name="OrganVolumes">
      {/* ========================================================
          1. ORAL CAVITY & PHARYNX (Mouth Entrance)
          ======================================================== */}
      <group position={[0, 1.95, 0.32]}>
        {/* Oral Cavity Vault */}
        <mesh>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.cyanPrimary}
            emissive={BIOLUMEN_PALETTE.cyanPrimary}
            emissiveIntensity={isMouthSelected ? 0.85 : 0.35}
            transparent
            opacity={isMouthSelected ? 0.65 : 0.45}
            roughness={0.2}
            transmission={0.6}
            depthWrite={false}
          />
        </mesh>
        {/* Entrance Ring Indicator */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.02, 8, 24]} />
          <meshBasicMaterial
            color={BIOLUMEN_PALETTE.cyanPrimary}
            transparent
            opacity={isMouthSelected ? 0.9 : 0.5}
          />
        </mesh>
      </group>

      {/* ========================================================
          2. ESOPHAGUS (Continuous Mediastinal Transit Tube)
          ======================================================== */}
      <mesh geometry={esophagusGeometry}>
        <meshPhysicalMaterial
          color={BIOLUMEN_PALETTE.cyanGlow}
          emissive={BIOLUMEN_PALETTE.cyanPrimary}
          emissiveIntensity={isMouthSelected || isStomachSelected ? 0.6 : 0.25}
          transparent
          opacity={0.4}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* ========================================================
          3. STOMACH (Anatomical J-Shaped Gastric Pouch)
          ======================================================== */}
      <group>
        {/* Primary J-Tube Gastric Cavity */}
        <mesh geometry={stomachJGeometry}>
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.amberGastric}
            emissive="#d97706"
            emissiveIntensity={isStomachSelected ? 0.9 : 0.3}
            transparent
            opacity={isStomachSelected ? 0.75 : 0.48}
            roughness={0.25}
            depthWrite={false}
          />
        </mesh>

        {/* Fundus Gastric Dome Volume */}
        <mesh position={[0.34, 0.82, 0.24]} scale={[1.2, 0.95, 1.1]}>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.amberGastric}
            emissive="#b45309"
            emissiveIntensity={isStomachSelected ? 0.75 : 0.25}
            transparent
            opacity={isStomachSelected ? 0.6 : 0.35}
            roughness={0.3}
            depthWrite={false}
          />
        </mesh>

        {/* Duodenal Pyloric Sphincter Exit */}
        <mesh geometry={duodenumGeometry}>
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.amberGastric}
            transparent
            opacity={0.45}
            roughness={0.3}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ========================================================
          4. LIVER (Right Hypochondriac Wedge & Hepatic Lobes)
          ======================================================== */}
      <group position={[-0.45, 0.75, 0.16]}>
        {/* Right Hepatic Lobe (Main Triangular Wedge) */}
        <mesh scale={[1.4, 0.9, 0.85]} rotation={[0.2, 0.3, -0.2]}>
          <coneGeometry args={[0.38, 0.75, 16]} />
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.coralHepatic}
            emissive="#e11d48"
            emissiveIntensity={isLiverSelected ? 0.9 : 0.3}
            transparent
            opacity={isLiverSelected ? 0.75 : 0.42}
            roughness={0.3}
            depthWrite={false}
          />
        </mesh>

        {/* Left Hepatic Lobe Extension */}
        <mesh position={[0.25, 0.05, 0.04]} scale={[0.9, 0.65, 0.6]} rotation={[0, 0, -0.4]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.coralHepatic}
            emissive="#be123c"
            emissiveIntensity={isLiverSelected ? 0.8 : 0.25}
            transparent
            opacity={isLiverSelected ? 0.65 : 0.38}
            depthWrite={false}
          />
        </mesh>

        {/* Hepatic Portal Vein Inflow Conduit */}
        <mesh position={[0.1, -0.25, 0.06]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.035, 0.04, 0.35, 10]} />
          <meshBasicMaterial
            color={BIOLUMEN_PALETTE.cyanGlow}
            transparent
            opacity={isLiverSelected ? 0.8 : 0.4}
          />
        </mesh>
      </group>

      {/* ========================================================
          5. SMALL INTESTINE (Duodenal Loop & Coiled Mesentery)
          ======================================================== */}
      <group position={[0.06, -0.15, 0.25]}>
        {/* Upper Jejunum Coils */}
        <mesh position={[-0.1, 0.12, 0.02]} rotation={[0.4, 0.2, 0.3]}>
          <torusGeometry args={[0.22, 0.08, 12, 24]} />
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.emeraldSecondary}
            emissive="#059669"
            emissiveIntensity={isIntestineSelected ? 0.85 : 0.3}
            transparent
            opacity={isIntestineSelected ? 0.75 : 0.45}
            depthWrite={false}
          />
        </mesh>

        {/* Central Mesenteric Convolutions */}
        <mesh position={[0.12, -0.05, 0.04]} rotation={[-0.3, 0.5, -0.2]}>
          <torusGeometry args={[0.26, 0.09, 12, 24]} />
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.emeraldSecondary}
            emissive="#047857"
            emissiveIntensity={isIntestineSelected ? 0.85 : 0.3}
            transparent
            opacity={isIntestineSelected ? 0.75 : 0.45}
            depthWrite={false}
          />
        </mesh>

        {/* Lower Ileal Loops */}
        <mesh position={[-0.05, -0.22, 0.02]} rotation={[0.2, -0.4, 0.5]}>
          <torusGeometry args={[0.24, 0.085, 12, 24]} />
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.emeraldSecondary}
            emissive="#059669"
            emissiveIntensity={isIntestineSelected ? 0.85 : 0.3}
            transparent
            opacity={isIntestineSelected ? 0.75 : 0.45}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ========================================================
          6. SYSTEMIC CIRCULATION (Aorta Trunk & Vascular Bed)
          ======================================================== */}
      <group>
        {/* Aorta Main Arterial Trunk */}
        <mesh geometry={aortaGeometry}>
          <meshPhysicalMaterial
            color={BIOLUMEN_PALETTE.vascularCyan}
            emissive="#00e5ff"
            emissiveIntensity={isSystemicSelected ? 0.9 : 0.35}
            transparent
            opacity={isSystemicSelected ? 0.8 : 0.45}
            depthWrite={false}
          />
        </mesh>

        {/* Peripheral Systemic Vascular Bed Glow */}
        <group position={[0, -1.05, 0.1]}>
          {/* Left Iliac/Femoral Branch */}
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.035, 0.02, 0.75, 10]} />
            <meshBasicMaterial
              color={BIOLUMEN_PALETTE.vascularCyan}
              transparent
              opacity={isSystemicSelected ? 0.85 : 0.45}
            />
          </mesh>
          {/* Right Iliac/Femoral Branch */}
          <mesh position={[-0.28, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.035, 0.02, 0.75, 10]} />
            <meshBasicMaterial
              color={BIOLUMEN_PALETTE.vascularCyan}
              transparent
              opacity={isSystemicSelected ? 0.85 : 0.45}
            />
          </mesh>
          {/* Capillary Target Perfusion Halo */}
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshPhysicalMaterial
              color={BIOLUMEN_PALETTE.vascularCyan}
              emissive="#00daf3"
              emissiveIntensity={isSystemicSelected ? 0.85 : 0.2}
              transparent
              opacity={isSystemicSelected ? 0.35 : 0.12}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
