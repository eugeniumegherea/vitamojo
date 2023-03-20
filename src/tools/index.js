async function run() {
  const orderStateMachine = await fetch("./order.json").then((res) =>
    res.json()
  );

  createDiagram(orderStateMachine);

  console.log("orderStateMachine", orderStateMachine);
}

async function createDiagram(config) {
  const allNodes = new Set();

  config.forEach(({ from, to }) => {
    allNodes.add(from);
    allNodes.add(to);
  });

  const nodes = new vis.DataSet(
    [...allNodes.values()].map((node) => ({
      id: node,
      label: node,
    }))
  );

  const edges = new vis.DataSet(
    config.map(({ from, to, name }) => ({
      from,
      to,
      label: name,
      arrows: "to",
    }))
  );

  // create a network
  var container = document.getElementById("mynetwork");

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
  var network = new vis.Network(container, data, options);

  window.network = network;
}

function exportNetwork() {
  var nodes = objectToArray(network.getPositions());

  nodes.forEach(addConnections);

  // pretty print node data
  var exportValue = JSON.stringify(nodes, undefined, 2);

  console.log(exportValue);
}

function addConnections(elem, index) {
  console.log("elem", elem, network.getConnectedNodes(elem.id));

  // need to replace this with a tree of the network, then get child direct children of the element
  const connections = network.getConnectedNodes(elem.id);

  elem.connections = connections
    .map((connection) => {
      const edge = network.getConnectedEdges(elem.id, connection)[0];
      // console.log('edge', network.getConnectedEdges(elem.id, connection));
      const edgeData = network.body.data.edges.get(edge);

      console.log("edgeData", edgeData, elem.id, connection);

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

window.export = exportNetwork;

function importConfig() {
  const conf = [
    {
      x: 295,
      y: 438,
      id: "pending",
      connections: ["confirmed", "cancelled", "in-production", "*"],
    },
    {
      x: 297,
      y: 333,
      id: "confirmed",
      connections: [
        "pending",
        "cancelled",
        "ready-to-collect",
        "in-production",
        "till-deleted",
        "*",
      ],
    },
    {
      x: -153,
      y: 113,
      id: "cancelled",
      connections: [
        "confirmed",
        "pending",
        "remake",
        "ready-to-collect",
        "in-production",
        "ready-for-bagging",
      ],
    },
    {
      x: 237,
      y: -232,
      id: "remake",
      connections: [
        "cancelled",
        "in-production",
        "ready-to-collect",
        "till-deleted",
      ],
    },
    {
      x: 461,
      y: -74,
      id: "ready-to-collect",
      connections: [
        "confirmed",
        "cancelled",
        "in-production",
        "ready-for-bagging",
        "collected",
        "remake",
        "till-deleted",
        "*",
      ],
    },
    {
      x: 322,
      y: 167,
      id: "in-production",
      connections: [
        "cancelled",
        "ready-to-collect",
        "ready-for-bagging",
        "confirmed",
        "pending",
        "remake",
        "*",
      ],
    },
    {
      x: -17,
      y: -218,
      id: "ready-for-bagging",
      connections: ["cancelled", "in-production", "ready-to-collect", "*"],
    },
    {
      x: -235,
      y: 410,
      id: "collected",
      connections: ["ready-to-collect", "*"],
    },
    {
      x: 606,
      y: 373,
      id: "till-deleted",
      connections: ["remake", "confirmed", "ready-to-collect"],
    },
    {
      x: -137,
      y: 262,
      id: "*",
      connections: [
        "pending",
        "confirmed",
        "ready-for-bagging",
        "in-production",
        "ready-to-collect",
        "collected",
        "integration-error",
      ],
    },
    {
      x: -284,
      y: 76,
      id: "integration-error",
      connections: ["*", "integration-error-corrected"],
    },
    {
      x: -303,
      y: -131,
      id: "integration-error-corrected",
      connections: ["integration-error"],
    },
  ];
}
