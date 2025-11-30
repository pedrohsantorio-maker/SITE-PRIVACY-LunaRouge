
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

const videoLinks = [
    { url: "https://imgur.com/5aQcNxC.mp4", thumb: "https://imgur.com/5aQcNxC.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/FtqlSjE.mp4", thumb: "https://imgur.com/FtqlSjE.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/hYBO3Tc.mp4", thumb: "https://imgur.com/hYBO3Tc.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/KYuBB3L.mp4", thumb: "https://imgur.com/KYuBB3L.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/I0bj21v.mp4", thumb: "https://imgur.com/I0bj21v.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/tJsiuSK.mp4", thumb: "https://imgur.com/tJsiuSK.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/QhVLxjA.mp4", thumb: "https://imgur.com/QhVLxjA.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/hDuogvW.mp4", thumb: "https://imgur.com/hDuogvW.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/WQm1Aic.mp4", thumb: "https://imgur.com/WQm1Aic.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/VlneEoh.mp4", thumb: "https://imgur.com/VlneEoh.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/8yU3iRE.mp4", thumb: "https://imgur.com/8yU3iRE.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/7FImUoW.mp4", thumb: "https://imgur.com/7FImUoW.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/PZSiU0z.mp4", thumb: "https://imgur.com/PZSiU0z.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/Elx61bq.mp4", thumb: "https://imgur.com/Elx61bq.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/qnFXjmc.mp4", thumb: "https://imgur.com/qnFXjmc.jpeg", hint: "sensual video" },
    { url: "https://imgur.com/hZNMe94.mp4", thumb: "https://imgur.com/hZNMe94.jpeg", hint: "sensual video" }
];

export const modelData = {
  name: 'Luna Rouge',
  handle: 'luna__vipp',
  isVerified: true,
  avatarUrl: profileImage?.imageUrl || "https://picsum.photos/seed/elena/1080/1350",
  avatarHint: profileImage?.imageHint || "woman portrait",
  bannerUrl: "https://imgur.com/2lTvoZw.jpeg",
  bannerHint: "woman taking selfie",
  bio: 'Oi, meu amor! 🔥💦 Sou a Luna, e hoje vou revelar um lado meu que vai te deixar sem fôlego… vídeos gozando com meus ficantes, trisal com amigas safadas e momentos íntimos onde me entrego de corpo e alma. 😏 Cada centímetro do meu corpo é pura tentação e minhas fotos peladas são um convite exclusivo para você explorar seus desejos mais secretos tudo sem censura! Se você tem coragem de se perder nessa paixão sem limites, vem comigo... Estou te esperando para uma experiência única e irresistível.😈',
  stats: {
    posts: 121,
    videos: 267,
    likes: 265800,
    previews: 7,
    photos: 378,
  },
  socials: {
      instagram: "https://www.instagram.com/luna__vipp?igsh=MTA0dmFxdnE3bncwcQ%3D%3D&utm_source=qr",
  },
  subscriptions: [
    {
      id: 'monthly',
      name: '30 Dias',
      price: '14,90',
      paymentUrl: process.env.PAYMENT_MONTHLY,
      tags: [],
      isFeatured: true,
    },
  ],
  promotions: [
    {
      id: 'quarterly',
      name: '3 MESES',
      price: '19,90',
      paymentUrl: process.env.PAYMENT_QUARTERLY,
      tags: ['Mais popular'],
      icon: 'Crown',
    },
    {
      id: 'annual',
      name: '1 ANO',
      price: '49,90',
      paymentUrl: process.env.PAYMENT_ANNUAL,
      tags: ['Melhor oferta'],
    },
    {
      id: 'lifetime',
      name: 'VITALÍCIO',
      price: '89,90',
      paymentUrl: process.env.PAYMENT_LIFETIME,
      tags: ['Exclusivo'],
    },
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
  }),
  videos: videoLinks.map((video, index) => ({
      id: `video-${index + 1}`,
      url: video.url,
      thumbnailUrl: video.thumb,
      hint: video.hint,
      width: 600,
      height: 800,
  })),
};

    