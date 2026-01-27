import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

    index("routes/zen-scan.tsx"),  // Zen Scan as main page
    route("/home", "routes/home.tsx"),  // Original home moved to /home
    route("/session", "routes/session.tsx"),
    route("/bot", "routes/bot.tsx"),
    route("/ok", "routes/healthcheck.tsx"),
    route("/api/analyze", "routes/app.api.analyze.ts"),  // Zen Scan AI analysis API
    route("/.well-known/appspecific/com.chrome.devtools.json", "routes/devtools.tsx")

] satisfies RouteConfig;
