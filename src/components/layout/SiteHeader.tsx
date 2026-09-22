import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";

export default function SiteHeader() {
  return (
    <div className="sticky top-0 z-50">
      <AnnouncementBar />
      <Navbar />
    </div>
  );
}
