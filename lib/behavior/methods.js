var extend = function (obj, props) {
  for(var prop in props) {
    if(props.hasOwnProperty(prop)) {
      obj[prop] = props[prop];
    }
  }
}


var getSelector = function() {
  var selector = {};
  var hasRootField = getOption.call(this, 'hasRootField');
  var includeSelector = getOption.call(this, 'includeSelector');

  if (hasRootField) {
    var rootFieldName = getOption.call(this, 'rootFieldName');
    selector[rootFieldName] = this[rootFieldName];
  }

  if (includeSelector) {
    extend(selector, includeSelector);
  }

  return selector;
};

var getOption = function(name) {
  // Find a class on which the behavior had been set.
  var classBehavior = this.constructor.getBehavior('sort')[0];
  var options = classBehavior.options;

  return options[name];
};

var getCollection = function() {
  return this.constructor.getCollection();
};

const methods = {};

methods.getTop = function() {
  var orderFieldName = getOption.call(this, 'orderFieldName');
  var selector = getSelector.call(this);
  var options = {};

  options.sort = {};
  options.sort[orderFieldName] = -1;

  return getCollection.call(this).findOne(selector, options);
};

methods.takeOut = function() {
  // We can only take out documents that are already in the collection.
  if (!this._id) {
    return false;
  }

  var orderFieldName = getOption.call(this, 'orderFieldName');
  var selector = getSelector.call(this);

  selector[orderFieldName] = {
    $gt: this[orderFieldName]
  };

  var modifier = {
    $inc: {
      [orderFieldName]: -1
    }
  };

  getCollection.call(this).update(selector, modifier, { multi: true });
  this.remove();

  return true;
};

methods.softTakeOut = function() {
  // We can only take out documents that are already in the collection.
  var orderFieldName = getOption.call(this, 'orderFieldName');
  var selector = getSelector.call(this);

  selector[orderFieldName] = {
    $gt: this[orderFieldName]
  };

  var modifier = {
    $inc: {
      [orderFieldName]: -1
    }
  };

  getCollection.call(this).update(selector, modifier, { multi: true });
  this.order = null;
  this.save();
};

methods.insertAt = function(position) {
  
  // OLD LOGIC:
  //
  // We can only insert documents that are not already in the collection.
  // If you want to move document to another sorted queue you have to take
  // it out first using `takeOut` function.
  //
  // NEW LOGIC:
  // 
  // We actually end up inserting documents that have an id, so let's skip this.
  // For example, doc.takeOut(), it's removed, but still has an _id, then doc.insertAt(index) to put it back

  /*
  if (this._id) {
    return false;
  }*/

  // Get order field name.
  var orderFieldName = getOption.call(this, 'orderFieldName');

  // Get top layer in the given sorting queue.
  var top = this.getTop();
  if (top) {
    // Document can be inserted at position equal to position of the highest
    // document incremented by one.
    position = Math.min(top[orderFieldName] + 1, position);

    // Check whether we are insterting at the top of the stack or in the
    // middle of it.
    if (position <= top[orderFieldName]) {
      var selector = getSelector.call(this);

      selector[orderFieldName] = {
        $gte: position
      };

      var modifier = {
        $inc: {
          [orderFieldName]: 1
        }
      }

      // Move documents down.
      getCollection.call(this).update(selector, modifier, { multi: true });
    }
  } else {
    // If there are no documents, insert this one at 0 position.
    position = 0;
  }

  this[orderFieldName] = position;
  // Return the _id
  return this.save();
};

methods.moveBy = function(shift) {
  // Get order field name.
  var orderFieldName = getOption.call(this, 'orderFieldName');
  return this.moveTo(this[orderFieldName] + shift);
};

methods.moveTo = function(position) {
  // We can only move documents that are already in the collection.
  if (!this._id) {
    return false;
  }

  // Get order field name.
  var orderFieldName = getOption.call(this, 'orderFieldName');
  // Get most top layer in the sorted queue.
  var top = this.getTop();
  // The document can be moved up to the position of the most top document and
  // not below the 0 position.
  position = Math.max(0, Math.min(top[orderFieldName], position));

  // If the document is at the position to which we are moving it, then we can
  // stop this function.
  if (this[orderFieldName] === position) {
    return false;
  }

  // Prepare selector and options object.
  var selector = getSelector.call(this);
  var modifier = {};

  // If new position is higher than the old one.
  if (position > this[orderFieldName]) {
    // Modify selector to move only certain documents.
    selector[orderFieldName] = {
      // Documents with the position higher than the old one and...
      $gt: this[orderFieldName],
      // ... lower or equal to the new one.
      $lte: position
    };

    modifier = {
      $inc: {
        [orderFieldName]: -1
      }
    }

    // Move documents down
    getCollection.call(this).update(selector, modifier, { multi: true });
    // If new position is lower than the old one.
  } else if (position < this[orderFieldName]) {
    // Modify selector to move only certain documents.
    selector[orderFieldName] = {
      // Documents with the position higher or equal to the new one and...
      $gte: position,
      // ... lower than old one.
      $lt: this[orderFieldName]
    };

    modifier = {
      $inc: {
        [orderFieldName]: 1
      }
    }

    // Move documents up.
    getCollection.call(this).update(selector, modifier, { multi: true });

    // If position have not changed, then stop execution.
  } else {
    return false;
  }

  this[orderFieldName] = position;
  this.save();
  return true;
};

methods.moveUp = function() {
  return this.moveBy(+1);
};

methods.moveDown = function() {
  return this.moveBy(-1);
};

methods.moveToTop = function() {
  var top = this.getTop();

  // Get order field name.
  var orderFieldName = getOption.call(this, 'orderFieldName');

  return this.moveTo(top[orderFieldName]);
};

methods.moveToBottom = function() {
  return this.moveTo(0);
};

export default methods;