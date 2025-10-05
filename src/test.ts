import { fetchDigimonDetails } from "./lib/grindosaur";

fetchDigimonDetails("birdramon").then((digimonList) => {
	console.log(digimonList);
});
