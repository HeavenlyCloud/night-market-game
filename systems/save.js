window.Save = {
  load() {
    return JSON.parse(localStorage.getItem("gg_save") || "{}");
  },

  save(data) {
    localStorage.setItem("gg_save", JSON.stringify(data));
  }
};
