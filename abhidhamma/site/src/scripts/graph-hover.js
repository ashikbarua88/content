// Graphs marked data-hover: pointing at (or tabbing to) a box keeps it, its lines and the boxes
// they reach in full colour, and fades the rest.
document.querySelectorAll("svg.graph[data-hover]").forEach((svg) => {
  const nodes = [...svg.querySelectorAll(".gnode[data-id]")], edges = [...svg.querySelectorAll(".gedge")];
  const on = (id) => {
    const keep = new Set([id]);
    edges.forEach((e) => {
      const hit = e.dataset.a === id || e.dataset.b === id;
      e.classList.toggle("on", hit);
      if (hit) keep.add(e.dataset.a).add(e.dataset.b);
    });
    nodes.forEach((n) => n.classList.toggle("on", keep.has(n.dataset.id)));
    svg.classList.add("hl");
  };
  const off = () => svg.classList.remove("hl");
  nodes.forEach((n) => {
    n.addEventListener("pointerenter", () => on(n.dataset.id));
    n.addEventListener("pointerleave", off);
    n.addEventListener("focus", () => on(n.dataset.id));
    n.addEventListener("blur", off);
  });
});
