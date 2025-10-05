import { fetchDigimonDetails, fetchDigimonList } from "./lib/grindosaur";

fetchDigimonDetails("birdramon").then((digimonList) => {
	console.log(digimonList);
});
