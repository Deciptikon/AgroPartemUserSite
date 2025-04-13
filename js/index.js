import { initTheme } from "./theme.js";
import { initAuth } from "./auth.js";
import { initNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initAuth();
  initNavbar();
});
