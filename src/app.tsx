import classes from "./app.module.css";
import Viewer from "./components/viewer";

export default function App() {
  return (
    <div className={classes.root}>
      <Viewer />
    </div>
  );
}
