import { DestinationsCollection } from "./collections/Destinations";
import { PlacesCollection } from "./collections/Places";
import { MediaCollection } from "./collections/Media";
import { PropertiesCollection } from "./collections/Properties";
import { ToursCollection } from "./collections/Tours";

export const payloadConfig = {
  admin: {
    user: "users",
  },
  collections: [
    DestinationsCollection,
    PlacesCollection,
    MediaCollection,
    PropertiesCollection,
    ToursCollection,
  ],
  typescript: {
    outputFile: "src/cms/payload-types.ts",
  },
};

export default payloadConfig;
