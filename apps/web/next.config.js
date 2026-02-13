/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: [
      // Flipkart
      'rukminim1.flixcart.com',
      'rukminim2.flixcart.com',
      // Amazon
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      // Tanishq/Titan
      'staticimg.titan.co.in',
      'www.tanishq.co.in',
      // Malabar Gold
      'www.malabargoldanddiamonds.com',
      // Kalyan / Candere
      'www.kalyanjewellers.net',
      'www.candere.com',
      // Tata CLiQ
      'assets.tatacliq.com',
      'www.tatacliq.com',
      // AJIO
      'assets.ajio.com',
      'www.ajio.com',
      // Myntra
      'assets.myntassets.com',
      'www.myntra.com',
      // PNG (P N Gadgil)
      'www.pngadgilandsons.com',
      // WHP (Waman Hari Pethe)
      'www.wamanharipithe.com',
      // Bhima
      'www.bhimagold.com',
      // CaratLane
      'www.caratlane.com',
      // Senco Gold
      'www.sencogoldanddiamonds.com',
      // Joyalukkas
      'www.joyalukkas.in',
      // PC Jeweller
      'www.pcjeweller.com',
      // TBZ
      'www.tbztheoriginal.com',
      // BlueStone
      'www.bluestone.com',
      // Placeholders
      'via.placeholder.com',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
