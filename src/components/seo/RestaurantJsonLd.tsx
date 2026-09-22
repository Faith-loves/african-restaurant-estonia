const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "African Restaurant Estonia",
  url: "https://africanrestaurant.ee/",
  image: "https://africanrestaurant.ee/images/hero/hero-food.png",
  description: "Authentic Nigerian and West African food in Tallinn, Estonia.",
  telephone: "+372 53078208",
  email: "africanrestaurantestonia@gmail.com",
  servesCuisine: ["Nigerian", "West African"],
  areaServed: "Tallinn, Estonia",
  address: {
    "@type": "PostalAddress",
    streetAddress: "NELGI 30",
    postalCode: "11213",
    addressLocality: "Tallinn",
    addressCountry: "EE",
  },
  sameAs: ["https://www.instagram.com/africanrestaurantestonia/"],
};

export default function RestaurantJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(restaurantSchema),
      }}
    />
  );
}
