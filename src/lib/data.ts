import { PlaceHolderImages } from "./placeholder-images";

const profileImage = PlaceHolderImages.find(img => img.id === 'model-profile');
const postPreviewImage = PlaceHolderImages.find(img => img.id === 'post-preview-1');
const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-preview-'));

const videoUrlMap = {
  "https://i.imgur.com/SDWrcl3.mp4": "https://i.imgur.com/SDWrcl3.jpeg",
  "https://i.imgur.com/FpUhVzf.mp4": "https://i.imgur.com/FpUhVzf.jpeg"
};

const photoLinks = [
    "https://imgur.com/cQyrZ0C.jpeg", "https://imgur.com/4qqmR6y.jpeg", "https://imgur.com/x3ixO77.jpeg",
    "https://imgur.com/DhRJWeo.jpeg", "https://imgur.com/R6IHUbv.jpeg", "https://imgur.com/7Ba5TDZ.jpeg",
    "https://imgur.com/AbtcymH.jpeg", "https://imgur.com/SjTHtIg.jpeg", "https://imgur.com/fI2KgWQ.jpeg",
    "https://imgur.com/qqeoh7D.jpeg", "https://imgur.com/nkF3djB.jpeg", "https://imgur.com/cqsZgum.jpeg",
    "https://imgur.com/DLX2fqO.jpeg", "https://imgur.com/jQKKv9L.jpeg", "https://imgur.com/ISRj8Tw.jpeg",
    "https://imgur.com/PrIwXea.jpeg", "https://imgur.com/ks5MxtR.jpeg", "https://imgur.com/DlVJrB5.jpeg",
    "https://imgur.com/qzXIwdN.jpeg", "https://imgur.com/20IJ8Ww.jpeg", "https://imgur.com/i7kjDS1.jpeg",
    "https://imgur.com/5Ysodbo.jpeg", "https://imgur.com/mXSjdpb.jpeg", "https://imgur.com/cJ4bSlO.jpeg",
    "https://imgur.com/1iaOJXA.jpeg", "https://imgur.com/CUayEQa.jpeg", "https://imgur.com/lib0M69.jpeg",
    "https://imgur.com/FrZGgR5.jpeg", "https://imgur.com/zITfYaP.jpeg", "https://imgur.com/6fzLuzO.jpeg",
    "https://imgur.com/AUglX5n.jpeg", "https://imgur.com/BkIjaN1.jpeg", "https://imgur.com/a80At0v.jpeg",
    "https://imgur.com/NWLcgD8.jpeg", "https://imgur.com/zLrJjY6.jpeg", "https://imgur.com/v6QBwWZ.jpeg",
    "https://imgur.com/F3vTTvD.jpeg", "https://imgur.com/cHItk1i.jpeg", "https://imgur.com/4KrKuwn.jpeg",
    "https://imgur.com/LD60NNT.jpeg", "https://imgur.com/sdYzdTT.jpeg", "https://imgur.com/zVSSUlE.jpeg",
    "https://imgur.com/SqgRAjy.jpeg", "https://imgur.com/kv4JYgY.jpeg", "https://imgur.com/I2W22ct.jpeg",
    "https://imgur.com/VLDmmOb.jpeg", "https://imgur.com/XJIISUR.jpeg", "https://imgur.com/z9brvSK.jpeg",
    "https://imgur.com/q8VSlJS.jpeg", "https://imgur.com/4MgDvT3.jpeg", "https://imgur.com/9ISbk9c.jpeg",
    "https://imgur.com/4jqr1Hs.jpeg"
];

export const modelData = {
  name: 'Luna Rouge',
  handle: 'rouge_luna_',
  isVerified: true,
  avatarUrl: profileImage?.imageUrl || "https://picsum.photos/seed/elena/1080/1350",
  avatarHint: profileImage?.imageHint || "woman portrait",
  bannerUrl: "https://imgur.com/2lTvoZw.jpeg",
  bannerHint: "woman taking selfie",
  bio: 'aqui você vai INVESTIR um valor super ACESSÍVEL e vai encontrar mais de 800 VÍDEOS e FOTOS: Dando muuuito minha bucetinha rosinha no pelo com gozada dentro, fazendo oral bem babad...',
  stats: {
    posts: 121,
    media: 125,
    likes: 265800,
    previews: 7,
    photos: photoLinks.length,
  },
  socials: {
      instagram: "#",
  },
  subscriptions: [
    { name: '1 mês', price: '19,99', id: 'monthly' },
  ],
  promotions: [
    { name: '3 meses', price: '47,98', discount: '20% off', id: 'quarterly' },
    { name: '6 meses', price: '95,95', discount: '20% off', id: 'biannual' },
  ],
  photos: photoLinks.map((url, index) => ({
      id: `photo-${index + 1}`,
      url: url,
      hint: 'sensual photo',
      width: 600,
      height: 800,
  })),
  previewsGallery: galleryImages.map(img => {
    const isVideo = Object.keys(videoUrlMap).includes(img.imageUrl);
    return {
      id: img.id,
      url: img.imageUrl,
      thumbnailUrl: isVideo ? videoUrlMap[img.imageUrl as keyof typeof videoUrlMap] : img.imageUrl,
      hint: img.imageHint,
      width: 600,
      height: 600,
      type: isVideo ? 'video' : 'image',
    }
  })
};
