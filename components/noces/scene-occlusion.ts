import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/** Contact shading supplements the real sun shadows without an idle render loop. */
export function sceneOcclusion(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, mobile: boolean) {
  const composer = new EffectComposer(renderer);
  const color = new RenderPass(scene, camera);
  const occlusion = new SSAOPass(scene, camera, 1, 1, mobile ? 16 : 24);
  const output = new OutputPass();
  occlusion.kernelRadius = .55;
  // SSAOPass compares linear depth normalized by the camera's near/far span.
  occlusion.minDistance = .00008;
  occlusion.maxDistance = .008;
  composer.addPass(color); composer.addPass(occlusion); composer.addPass(output);
  return {
    render: () => composer.render(0),
    resize(width: number, height: number) {
      composer.setSize(width, height);
      // Only the contact/depth buffers use a lower resolution; color stays sharp.
      const ratio = renderer.getPixelRatio() * (mobile ? .65 : .8);
      occlusion.setSize(Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio)));
    },
    dispose() {
      // The installed SSAOPass doesn't dispose these two resources itself.
      occlusion.ssaoMaterial.dispose(); occlusion.noiseTexture.dispose();
      occlusion.dispose(); color.dispose(); output.dispose(); composer.dispose();
    },
  };
}
