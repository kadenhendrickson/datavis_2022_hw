/** Class representing a Tree. */
class Tree {
  /**
   * Creates a Tree Object
   * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
   * @param {json[]} json - array of json objects with name and parent fields
   */
  constructor(json) {
    this.nodes = json.map(node => new Node(node["name"], node["parent"]));
    this.nodes.forEach(node => {
      node.parentNode = this.nodes.find(p_parent => p_parent.name == node.parentName);
    });
  }

  /**
   * Assign other required attributes for the nodes.
   */
  buildTree () {
    // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
    this.nodes.forEach(node => {
      if(node.parentName != 'root') {
        node.parentNode.addChild(node)
      }
    });
    var rootNode = this.nodes.find(node => node.parentName == 'root');
    this.assignLevel(rootNode, 0);
    this.assignPosition(rootNode, 0);
  }

  /**
   * Recursive function that assign levels to each node
   */
  assignLevel (node, level) {
    node.level = level;
    if(node.children.length === 0) {
      return;
    }
    node.children.forEach(child => {
      this.assignLevel(child, level+1);
    });
  }

  /**
   * Recursive function that assign positions to each node
   */
  assignPosition (node, position) {
    node.position = position;
    if(node.children.length === 0) {
      return;
    } 
   
    for(var i=0; i<node.children.length; i++) {
      var child = node.children[i];
      if(i === 0) {
        this.assignPosition(child, position);
      }
      else {        
        this.assignPosition(child, this.findLastPosition() + 1);
      }
    }
  }

  findLastPosition() {
    var largestPosition = 0;
    this.nodes.forEach(n => {
      if(n.position && n.position > largestPosition) {
        largestPosition = n.position;
      }
    });
    return largestPosition;
  }

  /**
   * Function that renders the tree
   */
  renderTree () {
    var w = 1200;
    var h = 1200;
    var r = 35;

    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h);
    
    svg.selectAll("line")
        .data(this.nodes)
        .enter()
        .append("line")
        .attr('x1', d => {
          if(d.parentName !== 'root') {
            return d.level * 100 + r; 
          }
        })
        .attr('y1', d => {
          if(d.parentName !== 'root') {
            return d.position * 100 + r;
          }
        } )
        .attr('x2', d => {
          if(d.parentName !== 'root') {
            return d.parentNode.level * 100 + r ;
          }
        })
        .attr('y2', d => {
          if(d.parentName !== 'root') {
            return d.parentNode.position * 100 + r;
          }
        });
    
    
    svg.selectAll('g')
        .data(this.nodes)
        .join(enter => {
          var enterGroup = enter.append('g')
                            .classed('nodeGroup', true)

          enterGroup.append('circle')
                    .attr('r', r)

          enterGroup.append('text')
                    .text(d => d.name)
                    .classed('label', true)

          return enterGroup;
        })
        .attr('transform', d => {
          return 'translate(' + d.level + r + ',' + d.position + r + ')';
        });
  }
}