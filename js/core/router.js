import { render } from "../ui/render.js";

let currentRoute = "machine";

export function routerInit(){
  routeTo("machine");
}

export function routeTo(route){
  currentRoute = route;
  render();
}

export function getRoute(){ return currentRoute; }
