import React from 'react';
import {
  type GalleryDesign,
  GalleryGrid,
  GalleryPager,
  type PrintFabric
} from '../../../components/GalleryGrid.js';

interface PublicProfile {
  displayName: string;
  slug: string;
  studioName: string | null;
  bio: string | null;
  since: string | null;
}

export default function DesignerProfile({
  designerPublicProfile,
  designGallery,
  printFabrics,
  galleryUrl
}: {
  designerPublicProfile: PublicProfile | null;
  designGallery: { items: GalleryDesign[]; total: number; page: number; limit: number };
  printFabrics: PrintFabric[];
  galleryUrl: string;
}) {
  const profile = designerPublicProfile;
  if (!profile) {
    return null;
  }
  return (
    <div className="designer-profile py-8">
      <a className="text-sm text-muted-foreground hover:underline" href={galleryUrl}>
        ← All designs
      </a>
      <div className="mb-8 mt-3">
        <h1 className="text-3xl font-semibold tracking-tight">{profile.displayName}</h1>
        {profile.studioName && <div className="text-sm">{profile.studioName}</div>}
        {profile.since && (
          <div className="mt-1 text-xs text-muted-foreground">
            Designer since{' '}
            {new Date(profile.since).toLocaleDateString('en-IN', {
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}
        {profile.bio && (
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm">{profile.bio}</p>
        )}
      </div>
      {designGallery.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No designs on sale right now.</p>
      ) : (
        <>
          <GalleryGrid designs={designGallery.items} fabrics={printFabrics} showDesigner={false} />
          <GalleryPager
            page={designGallery.page}
            total={designGallery.total}
            limit={designGallery.limit}
            filters={{}}
          />
        </>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    designerPublicProfile(slug: getContextValue("designerSlug", ""))
    designGallery(designer: getContextValue("designerSlug", ""), page: getContextValue("galleryPage", 1))
    printFabrics
    galleryUrl: url(routeId: "designGallery")
  }
`;
