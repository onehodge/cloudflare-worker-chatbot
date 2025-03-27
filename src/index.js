/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
// Handle both API requests and serve frontend

// src/worker/index.js

import html from './index.html';
import css from './styles.css'; // Only if using CSS

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve HTML
    if (url.pathname === "/") {
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }
    
    // Serve CSS (if separate)
    if (url.pathname === "/styles.css") {
      return new Response(css, {
        headers: { "Content-Type": "text/css" }
      });
    }
    
    // API Endpoint
    if (url.pathname === "/chat") {
      try {
        const { message } = await request.json();
        // const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
		const DEEPSEEK_API_KEY = "sk-bfc087d0b32e4f3b8ad7d2f3545fcc59"
        
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: message || "Hello!" }],
            temperature: 0.7
          })
        });
        
        const data = await response.json();
        return new Response(JSON.stringify({ 
          reply: data.choices?.[0]?.message?.content || "No response"
        }));
      } catch (error) {
        return new Response(JSON.stringify({ 
          reply: `Error: ${error.message}`
        }), { status: 500 });
      }
    }
    
    return new Response("Not found", { status: 404 });
  }
}