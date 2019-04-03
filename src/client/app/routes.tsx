import ModList from "./views/mod/list";
import ModUpload from "./views/mod/upload";

const routes = [
  { path: "/mods", exact: true, name: "Mods", component: ModList },
  { path: "/mods/upload", exact: true, name: "Mod Upload", component: ModUpload }
];

export default routes;
