import SongList from "./views/song/list";

const routes = [
  { path: "/song", exact: true, name: "Songs", component: SongList }
];

export default routes;
