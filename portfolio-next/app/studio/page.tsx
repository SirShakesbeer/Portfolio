import StudioEditor from '@/components/StudioEditor';
import { getPostTypes } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio - Portfolio',
  description: 'Content editor for portfolio posts',
};

export default function StudioPage() {
  const postTypes = getPostTypes();
  return <StudioEditor initialPostTypes={postTypes} />;
}
