import ModList from "./views/mod/list";
import ModUpload from "./views/mod/upload";
import Home from "./views/home";
import Settings from "./views/settings";
import ChangePassword from "./views/pages/ChangePassword";

const routes = [
    {
        path: "/",
        exact: true,
        name: "Home",
        component: Home
    },
    {
        path: "/mods",
        exact: true,
        name: "Mods",
        component: ModList
    },
    {
        path: "/mods/upload",
        exact: true,
        name: "Mod Upload",
        component: ModUpload
    },
    {
        path: "/changepassword",
        exact: true,
        name: "Change Password",
        component: ChangePassword
    },
    {
        path: "/settings",
        exact: true,
        name: "Settings",
        component: Settings
    }
];

export default routes;
