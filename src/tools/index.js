async function run() {
  // change here bundle or order json file
  const stateMachine = await fetch("./src/bundle.json").then((res) =>
    res.json()
  );

  createDiagram(stateMachine);
}

async function createDiagram(config) {
  const allNodes = new Set();

  config.forEach(({ from, to }) => {
    allNodes.add(from);
    allNodes.add(to);
  });

  // eslint-disable-next-line no-undef
  const nodes = new vis.DataSet(
    [...allNodes.values()].map((node) => ({
      id: node,
      label: node,
    }))
  );

  // eslint-disable-next-line no-undef
  const edges = new vis.DataSet(
    config.map(({ from, to, name }) => ({
      from,
      to,
      label: name,
      arrows: "to",
    }))
  );

  // create a network
  var container = document.getElementById("networkcanvas");

  // provide the data in the vis format
  var data = {
    nodes: nodes,
    edges: edges,
  };

  var options = {
    edges: {
      smooth: {
        type: "continuous",
      },
    },
    physics: false,
  };

  // initialize your network!
  // eslint-disable-next-line no-undef
  var network = new vis.Network(container, data, options);

  window.network = network;
}

function exportNetwork() {
  var nodes = objectToArray(window.network.getPositions());

  nodes.forEach(addConnections);

  // pretty print node data
  var exportValue = JSON.stringify(nodes, undefined, 2);

  console.log(exportValue);
}

function addConnections(elem, index) {
  // need to replace this with a tree of the network, then get child direct children of the element
  const connections = window.network.getConnectedNodes(elem.id);

  elem.connections = connections.map((connection) => {
    const edge = window.network.getConnectedEdges(elem.id, connection)[0];
    const edgeData = window.network.body.data.edges.get(edge);

    return {
      id: connection,
      name: edgeData.label,
    };
  });
}

function objectToArray(obj) {
  return Object.keys(obj).map(function (key) {
    obj[key].id = key;

    return obj[key];
  });
}

run();
