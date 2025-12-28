export function panel(title, subtitle, rightHtml, bodyHtml){
  return `
  <div class="panel">
    <div class="panelHead">
      <div>
        <h2 class="h2">${title}</h2>
        <p class="muted">${subtitle ?? ""}</p>
      </div>
      <div class="row">${rightHtml ?? ""}</div>
    </div>
    ${bodyHtml ?? ""}
  </div>`;
}

export function rarityTag(r){
  const cls = r==="Ultra"?"ultra":r==="Mythic"?"mythic":r==="Rare"?"rare":"common";
  return `<span class="tag ${cls}">${r.toUpperCase()}</span>`;
}
