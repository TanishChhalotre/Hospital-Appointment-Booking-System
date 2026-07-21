import heroImg from "../assets/hero.png";

export default function HomeHeroBackground() {
  return (
    <div
      className="home-hero-bg"
      aria-hidden="true"
      style={{ backgroundImage: `url(${heroImg})` }}
    />
  );
}

