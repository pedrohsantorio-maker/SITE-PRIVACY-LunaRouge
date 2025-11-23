import { PlaceHolderImages } from "./placeholder-images";

const profileImage = PlaceHolderImages.find(img => img.id === 'model-profile');
const postPreviewImage = PlaceHolderImages.find(img => img.id === 'post-preview-1');
const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-preview-'));

export const modelData = {
  name: 'Luna Rouge',
  handle: 'rouge_luna_',
  isVerified: true,
  avatarUrl: profileImage?.imageUrl || "https://picsum.photos/seed/elena/1080/1350",
  avatarHint: profileImage?.imageHint || "woman portrait",
  bannerUrl: "https://i.imgur.com/8LrpTTd.jpeg",
  bannerHint: "woman taking selfie",
  bio: 'aqui você vai INVESTIR um valor super ACESSÍVEL e vai encontrar mais de 800 VÍDEOS e FOTOS: Dando muuuito minha bucetinha rosinha no pelo com gozada dentro, fazendo oral bem babad...',
  stats: {
    posts: 121,
    media: 125,
    likes: 265800,
    previews: 7,
  },
  socials: {
      instagram: "#",
      twitter: "#",
      tiktok: "#"
  },
  subscriptions: [
    { name: '1 mês', price: '19,99', id: 'monthly' },
  ],
  promotions: [
    { name: '3 meses', price: '47,98', discount: '20% off', id: 'quarterly' },
    { name: '6 meses', price: '95,95', discount: '20% off', id: 'biannual' },
  ],
  posts: [
      {
          id: 'post1',
          isLocked: true,
          stats: {
              images: 31,
              videos: 94,
              likes: 2200,
          }
      }
  ],
  previewsGallery: galleryImages.map(img => ({
    id: img.id,
    url: img.imageUrl,
    hint: img.imageHint,
    width: 600,
    height: 600,
  }))
};
