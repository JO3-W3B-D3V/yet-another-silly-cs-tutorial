// Neat code.
(function () {
  'use strict';

  // Let's create a really simple 
  // tree data structure to represent
  // a mathematical expression. For each 
  // expression wrapped in some brackets, 
  // we want to create a new node.
  function Node (expression) {
    var self = this;
    
    self.children = [];
    self.originalEquation = expression;
    self.resultEquation = expression;
    self.parent = null;
    self.answer = undefined;
    
    self.addChild = function (node) {
      self.children.push(node);
      node.parent = self;
    };

    self.getParent = function () {
      return self.parent;
    };

    self.hasParent = function () {
      return self.parent !== null && self.parent !== undefined;
    };

    self.isRoot = function () {
      return !self.hasParent();
    };

    self.calculate = function () {
      // The very first thing we must do is format the given expression. 
      var formattedExpression = self.resultEquation.trim();
      
      // In the event that this is a bracketed expression, we 
      // need to remove the brackets.
      if (formattedExpression[0] === '(') {
        formattedExpression = formattedExpression.substring(1, self.resultEquation.length - 1);
      }

      // Let's quickly do some very basic validation before we start, we need to make sure that 
      // the first character is a valid number, it is allowed to be a negative number though. 
      // We also need to make sure that the last character is a valid number too.
      if (isNaN(Number.parseInt(formattedExpression[0]) || formattedExpression[0] !== '-')) {
        throw new Error('Expression must start with a number');
      } else if (isNaN(Number.parseInt(formattedExpression[formattedExpression.length - 1]))) {
        console.log(formattedExpression);
        throw new Error('Expression must end with a number');
      }

      // Now that the basic validation is out of hte way with, let's 
      // specify some necessary variables. 
      var parts = [];
      var chunks = [];
      var operators = ['^', '/', '*', '+', '-'];
      var buffer = '';
      
      // Now that we've formatted the expression nicely, let's split the expression into 
      // an array of parts first, each number & each operation will be its own part.
      for (var i = 0; i < formattedExpression.length; i ++) {
        var current = formattedExpression[i];
        var next = formattedExpression[i + 1];

        // Just to help make the code a bit more readable,
        // let's store an array of different boolean values.
        var isCurrentNumeric = !isNaN(Number.parseInt(current));
        var isNextNumeric = !isNaN(Number.parseInt(next));
        var isBufferEmpty = buffer === '';
        var bufferIsNotEmpty = !isBufferEmpty;
        var isOperator = operators.includes(current);
        var isValidDecimalPlace = current === '.' && buffer.indexOf('.') === -1;
        var isInvalidDecimalPlace = current === '.' && buffer === '';
        var isNegativeNumber = (current === '-' && isBufferEmpty && isNextNumeric)
        var shouldAddCurrentToBuffer = isCurrentNumeric || isValidDecimalPlace || isNegativeNumber;

        if (current === ' ') {
          continue;
        } else if (i === formattedExpression.length - 1) {
          if (bufferIsNotEmpty && isCurrentNumeric) {
            buffer += current;
            parts.push(buffer);
          } else if (isCurrentNumeric) {
            parts.push(current);
          } else {
            throw new Error(`Invalid last character ${current} at position ${i}, the final character in the expression must be a number'}`);
          }
        } else if (shouldAddCurrentToBuffer) {
          buffer += current;
        } else if (isOperator) {
          parts.push(buffer);
          parts.push(current);
          buffer = '';
        } else if (isInvalidDecimalPlace) {
          throw new Error('Decimal place cannot be first character in number');
        } else if (current === '.' && buffer.indexOf('.') >= 0) {
          throw new Error('Decimal place already exists in number');
        } else {
          throw new Error(`Invalid character ${current} at position ${i}'}`);
        }
      }

      // Just to clear up the memory for the buffer, as it is no longer
      // needed.
      buffer = undefined;

      // Now that we have the expression in parts, we need to group them into chunks.
      for (var i = 0, j = 0; i < parts.length; i ++) {
        var part = parts[i];
        
        if (!Array.isArray(chunks[j])) {
          chunks[j] = [];
        }
    
        var chunk = chunks[j];
        chunk.push(part);
    
        if (i > 1 && i % 2 === 0) {
          if (i > 2) {
            var previous = chunks[j - 1];
            chunk.unshift(previous[previous.length - 1]);
          }
    
          j++;
        }
      }

      // Let's try to clear up some memory by removing the parts array.
      parts = undefined;
    
      // Now that we have the chunks, let's map them into a more usable format.
      var mappedChunks = chunks.map(function (chunk, index) {
        return {
          index: index,
          left: Number.parseFloat(chunk[0]),
          operator: chunk[1],
          right: Number.parseFloat(chunk[2])
        };
      });
    
      // Let's store the calculation beforehand.
      var calculation = 0;

      // We want to group some of the operators together, so we 
      // can calculate them in the correct order, keep in mind, 
      // from left to right, it's division and multiplication,
      // then addition and subtraction. The and being quite important.
      // For instance:
      //
      // 4 - 1 + 5 = 8
      //
      // Without the use of and, it would be -2:
      //
      // Step 1: 5+1 = 6
      // Step 2: 4-6 = -2
      //
      // Which as we know, -2 is incorrect for the above expression.
      var bodmasOperators = ['^', '/*', '+-']

      // Now that we have the order of operations, let's loop through them,
      // and calculate the answer for each of them.
      bodmasOperators.forEach(function (operator) {
        var matches = mappedChunks.filter(function (chunk) {
          return operator.includes(chunk.operator);
        });

        // Now that we have the matches, let's loop through them, and calculate
        // the answer for each of them.
        matches.forEach(function (match) {
          var answer = 0;
          switch (match.operator) {
            case '^':
              answer = Math.pow(match.left, match.right);
              break;
            case '/':
              answer = match.left / match.right;
              break;
            case '*':
              answer = match.left * match.right;
              break;
            case '+': 
              answer = match.left + match.right;
              break;
            case '-':
              answer = match.left - match.right;
              break;
            default:
              throw new Error(`Invalid operator ${match.operator}`); 
          }
    
          // Now let's check on the left and right of the match,
          // to see if we need to update the left or right values.
          var previous = mappedChunks[match.index - 1];
          var next = mappedChunks[match.index + 1];
          var hasPrevious = previous !== undefined && previous !== null;
          var hasNext = next !== undefined && next !== null;
    
          if (hasPrevious) {
            previous.right = answer;
          }
    
          if (hasNext) {
            next.left = answer;
          }

          calculation = answer;
        });
      });

      // Now to update the answer & the result equation.
      self.answer = calculation;

      // Now we want to update the result equation for all the
      // parent nodes, so that we can see the result of the
      // calculation in the original expression.
      var current = self;

      // Now we want to update the result equation for all the
      // child nodes, so that we can see the result of the
      // calculation in the original expression.
      return calculation;
    };
  };

  // Let's create a tree data structure to represent
  // a mathematical expression. This is the simple tree 
  // data structure that we'll use to represent the 
  // expression.
  function Tree (expression) {
    var self = this;
    
    // Naturally, the root would be the complete expression.
    var root = new Node(expression);

    // We want a current node to keep track of where we are
    // in the tree.
    var current = root;
    
    // Create a matrix of nodes to allow us to be lazy 
    // and not have to worry about traversing to the bottom 
    // of the tree first to get the most nested expression.
    var levels = [[root]];

    // Let's use a level counter to keep track of what level 
    // we're currently on within the tree. This will allow us 
    // to know where to add the next node to the matrix.
    var level = 0;

    // Let's build the tree.
    for (var i = 0; i < expression.length; i ++) {
      var char = expression[i];

      // Given we're opening a parenthesis, 
      // we want to create a new node.
      if (char === '(') {
        var remainder = expression.substring(i);
        var parenthesisCount = 1;
        var endIndex = 0;

        // Now that we know we've opened some parentheses,
        // we want to find the matching closing parenthesis.
        for (var j = 1; j < remainder.length; j ++) {
          const char = remainder[j];
          
          if (char === '(') {
            parenthesisCount ++;
          }

          if (char === ')') {
            parenthesisCount --;
          }

          // If we've found the matching closing parenthesis,
          // we want to break out of the nested loop.
          if (parenthesisCount === 0) {
            endIndex = j;
            break;
          }
        }

        // Now we want to take a substring of the expression
        // and create a new node with it.
        var equation = remainder.substring(0, endIndex + 1);
        var newNode = new Node(equation);

        // We want to add the new node to the current node
        // and then set the current node to the new node.
        current.addChild(newNode);
        current = newNode;
        level ++;

        // We want to ensure that the current level has an 
        // array, but we need to be sure, so let's check first.
        if (!Array.isArray(levels[level])) {
          levels[level] = [];
        }

        // Now we want to add the new node to the matrix.
        levels[level].push(newNode);
      } 
      
      // Given we're closing a parenthesis,
      // we want to move back up a level, as opposed to 
      // going deeper into the matrix. 
      else if (char === ')') {
        level --;

        // Now that we know we've gone up a level, 
        // we want to set the current node to the parent.
        current = current.getParent();
      }
    }

    // Let's add some getters to the tree object, 
    // so we can see what we've built.

    // We want to be able to see the matrix.
    Object.defineProperty(self, 'matrix', {
      get: function () {
        return [...levels];
      }
    });

    // We want to be able to see the root.
    Object.defineProperty(self, 'root', {
      get: function () {
        return {...root};
      }
    });

    // Now let's implement a simple calculated function for the entire tree.
    self.calculate = function () {
      var flippedLevels = [...levels].reverse();
      var answer = 0;

      // We want to work out the result of the expression
      // by working from the bottom of the tree up. Aka, working 
      // from the most nested brackets to the least nested brackets.
      flippedLevels.forEach(function (flippedNodes) {
        flippedNodes.forEach(function (flippedNode) {
          answer = flippedNode.calculate();
          
          // Now we want to update the result equation for all the
          // parent nodes, so that we can see the result of the
          // calculation in the original expression.
          levels.forEach(function (nodes) {
            nodes.forEach(function (node) {
              var replacement = flippedNode.answer;
              var placeholder = flippedNode.resultEquation;
              node.resultEquation = node.resultEquation.replace(placeholder, replacement);
            });
          });

        });
      });

      return answer;
    };
  };

  
  // Let's just wrap up our test code into a main function.
  function main () {
    var expression = '5 + (10 * 2) - (3 * 9 + (5 - 2 + (3 * 3 * (4 - 1 + (15 / 3))))) + 100 + (5 * 5)';
    var tree = new Tree(expression);
    var result = tree.calculate();
    console.log(result);
  };

  // Finally let's call the main function.
  main();
})();
