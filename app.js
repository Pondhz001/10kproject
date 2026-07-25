// Entry point for Hostinger Shared Hosting (Phusion Passenger)
// Passenger expects an app.js or server.js at the root
import('./dist/server.cjs').catch(err => {
  console.error("Failed to start server. Please ensure you ran 'npm run build' first.", err);
});
