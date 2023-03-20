window.vitamojo = (() => {
  function importGraph(config, layout) {
    // eslint-disable-next-line no-undef
    const edges = new vis.DataSet(
      config.map(({ from, to, name }) => ({
        from,
        to,
        label: name,
        arrows: "to",
      }))
    );

    const nodes = getNodeData(layout);

    var data = {
      nodes: nodes,
      edges: edges,
    };

    window.nodes = nodes;

    // eslint-disable-next-line no-undef
    window.network = new vis.Network(
      document.getElementById("networkcanvas"),
      data,
      {
        edges: {
          smooth: {
            type: "continuous",
          },
        },
        physics: false,
      }
    );
  }

  async function loadOrderStateMachine() {
    const config = await fetch("./src/order.json").then((res) => res.json());
    const savedPositions = await fetch("./src/order-layout.json").then((res) =>
      res.json()
    );

    importGraph(config, savedPositions);
    renderNodesOptions();
  }

  async function loadBundleStateMachine() {
    const config = await fetch("./src/bundle.json").then((res) => res.json());
    const savedPositions = await fetch("./src/bundle-layout.json").then((res) =>
      res.json()
    );

    importGraph(config, savedPositions);
    renderNodesOptions();
  }

  // utils
  function getNodeData(data) {
    var networkNodes = [];

    data.forEach(function (elem, index, array) {
      networkNodes.push({
        id: elem.id,
        label: elem.id,
        x: elem.x,
        y: elem.y,
      });
    });

    // eslint-disable-next-line no-undef
    return new vis.DataSet(networkNodes);
  }

  function onHide(ev) {
    const nodeId = ev.target.dataset.nodeId;
    const isHidden = window.nodes.get(nodeId).hidden;

    window.nodes.update([{ id: nodeId, hidden: !isHidden }]);
  }

  function renderNodesOptions() {
    const container = document.getElementById("optionsContainer");

    container.innerHTML = "";

    window.nodes.forEach((node) => {
      const div = document.createElement("div");
      const label = document.createElement("label");
      const input = document.createElement("input");

      input.type = "checkbox";
      input.dataset.nodeId = node.id;
      input.checked = !node.hidden;
      input.addEventListener("change", onHide);
      label.appendChild(input);
      label.appendChild(document.createTextNode(node.id));

      div.appendChild(label);
      container.appendChild(div);
      // container.appendChild(document.createElement("br"));
    });
  }

  return {
    loadOrderStateMachine,
    loadBundleStateMachine,
    onHide,
  };
})();

window.vitamojo.export = () => {
  const network = window.network;

  function addConnections(elem, index) {
    // need to replace this with a tree of the network, then get child direct children of the element
    const connections = network.getConnectedNodes(elem.id);

    elem.connections = connections
      .map((connection) => {
        const edge = network.getConnectedEdges(elem.id, connection)[0];
        // console.log('edge', network.getConnectedEdges(elem.id, connection));
        const edgeData = network.body.data.edges.get(edge);

        if (edgeData.from === elem.id && edgeData.to === connection) {
          return {
            id: connection,
            name: edgeData.label,
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;

      return obj[key];
    });
  }

  var nodes = objectToArray(network.getPositions());

  nodes.forEach(addConnections);

  // pretty print node data
  var exportValue = JSON.stringify(nodes);

  console.log(exportValue);
};
