import { defineConfig } from "vite";

export default defineConfig({
  // Direct build output into a production build directory
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          dashboard: [
            './js/components/LeadCRM.js',
            './js/components/OutreachStudio.js',
            './js/components/InsightsPage.js',
            './js/components/WebsiteAudit.js',
            './js/components/PromptGenerator.js',
            './js/components/TeamWorkspace.js'
          ],
          legal: [
            './js/components/LegalPages.js'
          ],
          checkout: [
            './js/components/CheckoutPage.js',
            './js/components/PreparationLoader.js',
            './js/components/InvoiceModal.js'
          ]
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
