// ...
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Port untuk frontend
    proxy: {
      '/api': 'http://10.10.10.100:5000' // Proxy untuk backend
    }
  }
});