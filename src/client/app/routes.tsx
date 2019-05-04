import ModList from "./views/mod/list";
import ModUpload from "./views/mod/upload";
import Home from "./views/home";

const routes = [
    { path: "/", exact: true, name: "Home", component: Home },
    { path: "/mods", exact: true, name: "Mods", component: ModList },
    {
        path: "/mods/upload",
        exact: true,
        name: "Mod Upload",
        component: ModUpload
    }
];

export default routes;
