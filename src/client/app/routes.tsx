import SongList from "./views/song/list";
import SongUpload from "./views/song/upload";

const routes = [
  { path: "/song", exact: true, name: "Songs", component: SongList },
  { path: "/song/upload", exact: true, name: "Song Upload", component: SongUpload }
];

export default routes;
