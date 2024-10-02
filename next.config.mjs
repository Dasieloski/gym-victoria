import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  images: {
    domains: ['yrhjeqezlmzpckjyhhuf.supabase.co'], // Asegúrate de que este sea el dominio correcto
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yrhjeqezlmzpckjyhhuf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Configuración adicional de Sentry si es necesaria
});