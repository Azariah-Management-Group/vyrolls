import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { handle: string };
};

export async function generateMetadata(
  { params }: { params: Promise<{ handle: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const handle = resolvedParams.handle;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const formattedHandle = handle.startsWith('%40') ? handle.replace('%40', '@') : (handle.startsWith('@') ? handle : `@${handle}`);

  try {
    const res = await fetch(`${API_URL}/public_profile.php?handle=${encodeURIComponent(formattedHandle)}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const userName = data.user.name;
      const userBio = data.profile.bio || `Check out ${userName}'s garage and posts on Vyrolls!`;
      const userImage = data.profile.avatar_url || 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=2071&auto=format&fit=crop';

      return {
        title: `${userName} (${formattedHandle}) | Vyrolls`,
        description: userBio,
        openGraph: {
          title: `${userName} on Vyrolls`,
          description: userBio,
          url: `http://localhost:3000/${formattedHandle}`,
          siteName: 'Vyrolls',
          images: [
            {
              url: userImage,
              width: 800,
              height: 600,
              alt: `${userName}'s profile picture`,
            },
          ],
          type: 'profile',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${userName} on Vyrolls`,
          description: userBio,
          images: [userImage],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: 'Vyrolls Profile',
    description: 'Check out this profile on Vyrolls',
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
