import type { Metadata } from 'next';
import MotionTemplate from './MotionTemplate';

export const metadata: Metadata = {
  title: 'Motion Template — De Toulouse à Tokyo',
  description: 'De Toulouse au Japon : un globe, des nuages, Littlest Tokyo, une visite du restaurant Inakaya et une carte du Kinkakuji en trois dimensions.',
};

export default function MotionTemplatePage() {
  return <MotionTemplate />;
}
