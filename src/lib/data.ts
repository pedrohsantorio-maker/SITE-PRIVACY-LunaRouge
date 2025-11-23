import { PlaceHolderImages } from "./placeholder-images";

const profileImage = PlaceHolderImages.find(img => img.id === 'model-profile');

export const modelData = {
  name: 'Elena',
  avatarUrl: profileImage?.imageUrl || "https://picsum.photos/seed/elena/1080/1350",
  avatarHint: profileImage?.imageHint || "woman portrait",
  bio_short: 'Bem-vindo ao meu mundo exclusivo! Aqui, compartilho um pouco mais de mim, dos meus ensaios e do meu dia a dia. Agradeço o seu apoio!',
  bio_long: 'Bem-vindo ao meu mundo exclusivo! Aqui, compartilho um pouco mais de mim, dos meus ensaios e do meu dia a dia. Agradeço o seu apoio! Sou uma modelo apaixonada por arte, fotografia e viagens. Este é o nosso espaço para nos conectarmos de uma forma mais profunda. Explore meu conteúdo e sinta-se em casa.',
  stats: {
    subscribers: 1234,
    likes: 56789,
    followers: 98765,
  },
  subscriptionPlans: [
    { name: '1 Mês', price: '39,90', discount: null, id: 'monthly' },
    { name: '3 Meses', price: '99,90', discount: '17% OFF', id: 'quarterly' },
    { name: '6 Meses', price: '149,90', discount: '38% OFF', id: 'biannual' },
  ],
};
