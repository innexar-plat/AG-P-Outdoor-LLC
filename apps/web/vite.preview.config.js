import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		{
			name: 'preview-cache-headers',
			configurePreviewServer(server) {
				server.middlewares.use((req, res, next) => {
					const path = (req.url || '').split('?')[0];

					if (path.startsWith('/assets/')) {
						res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
					} else if (path.startsWith('/thumbnail') || path.startsWith('/qr/')) {
						res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
					} else if (path === '/' || path.endsWith('.html')) {
						res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
					}

					next();
				});
			},
		},
	],
	preview: {
		allowedHosts: true,
	},
});
