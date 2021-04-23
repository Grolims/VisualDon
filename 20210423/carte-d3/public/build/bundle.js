
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
  'use strict';

  // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
  class Adder {
    constructor() {
      this._partials = new Float64Array(32);
      this._n = 0;
    }
    add(x) {
      const p = this._partials;
      let i = 0;
      for (let j = 0; j < this._n && j < 32; j++) {
        const y = p[j],
          hi = x + y,
          lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
        if (lo) p[i++] = lo;
        x = hi;
      }
      p[i] = x;
      this._n = i + 1;
      return this;
    }
    valueOf() {
      const p = this._partials;
      let n = this._n, x, y, lo, hi = 0;
      if (n > 0) {
        hi = p[--n];
        while (n > 0) {
          x = hi;
          y = p[--n];
          hi = x + y;
          lo = y - (hi - x);
          if (lo) break;
        }
        if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
          y = lo * 2;
          x = hi + y;
          if (y == x - hi) hi = x;
        }
      }
      return hi;
    }
  }

  function* flatten(arrays) {
    for (const array of arrays) {
      yield* array;
    }
  }

  function merge(arrays) {
    return Array.from(flatten(arrays));
  }

  var noop$1 = {value: () => {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get$1(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set$1(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection$1(subgroups, this._parents);
  }

  function array(x) {
    return typeof x === "object" && "length" in x
      ? x // Array, TypedArray, NodeList, array-like
      : Array.from(x); // Map, Set, iterable, string, or anything else
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function arrayAll(select) {
    return function() {
      var group = select.apply(this, arguments);
      return group == null ? [] : array(group);
    };
  }

  function selection_selectAll(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection$1(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  var find = Array.prototype.find;

  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }

  function childFirst() {
    return this.firstElementChild;
  }

  function selection_selectChild(match) {
    return this.select(match == null ? childFirst
        : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  var filter = Array.prototype.filter;

  function children() {
    return this.children;
  }

  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }

  function selection_selectChildren(match) {
    return this.selectAll(match == null ? children
        : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection$1(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = new Map,
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
        exit[i] = node;
      }
    }
  }

  function datum(node) {
    return node.__data__;
  }

  function selection_data(value, key) {
    if (!arguments.length) return Array.from(this, datum);

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant$1(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = array(value.call(parent, parent && parent.__data__, j, parents)),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection$1(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection) {
    if (!(selection instanceof Selection$1)) throw new Error("invalid merge");

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection$1(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection$1(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    return Array.from(this);
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    let size = 0;
    for (const node of this) ++size; // eslint-disable-line no-unused-vars
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove$1(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS$1(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant$1(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS$1(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction$1(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS$1(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
        : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove$1(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant$1(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction$1(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove$1 : typeof value === "function"
              ? styleFunction$1
              : styleConstant$1)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant$1(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction$1(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction$1
            : textConstant$1)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, options) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  function* selection_iterator() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  var root = [null];

  function Selection$1(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection$1([[document.documentElement]], root);
  }

  function selection_selection() {
    return this;
  }

  Selection$1.prototype = selection.prototype = {
    constructor: Selection$1,
    select: selection_select,
    selectAll: selection_selectAll,
    selectChild: selection_selectChild,
    selectChildren: selection_selectChildren,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    selection: selection_selection,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch,
    [Symbol.iterator]: selection_iterator
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
        : new Selection$1([[selector]], root);
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy: function(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "hsl(" : "hsla(")
          + (this.h || 0) + ", "
          + (this.s || 0) * 100 + "%, "
          + (this.l || 0) * 100 + "%"
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var constant = x => () => x;

  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
  }

  var interpolateRgb = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;

    return rgb$1;
  })(1);

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  var degrees$1 = 180 / Math.PI;

  var identity$1 = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };

  function decompose(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees$1,
      skewX: Math.atan(skewX) * degrees$1,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var svgNode;

  /* eslint-disable no-undef */
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity$1 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  function parseSvg(value) {
    if (value == null) return identity$1;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
    value = value.matrix;
    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  function interpolateTransform(parse, pxComma, pxParen, degParen) {

    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }

    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }

    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
        q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }

    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }

    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }

    return function(a, b) {
      var s = [], // string constants and placeholders
          q = []; // number interpolators
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null; // gc
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }

  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  var frame = 0, // is an animation frame pending?
      timeout$1 = 0, // is a timeout pending?
      interval = 0, // are any timers active?
      pokeDelay = 1000, // how frequently we check for clock skew
      taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = typeof performance === "object" && performance.now ? performance : Date,
      setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call =
    this._time =
    this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.
    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
      t = t._next;
    }
    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout$1 = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(), delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.
    if (timeout$1) timeout$1 = clearTimeout(timeout$1);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
    if (delay > 24) {
      if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  function timeout(callback, delay, time) {
    var t = new Timer;
    delay = delay == null ? 0 : +delay;
    t.restart(elapsed => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  var emptyOn = dispatch("start", "end", "cancel", "interrupt");
  var emptyTween = [];

  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;

  function schedule(node, name, id, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id in schedules) return;
    create(node, id, {
      name: name,
      index: index, // For context during callback.
      group: group, // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }

  function init(node, id) {
    var schedule = get(node, id);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }

  function set(node, id) {
    var schedule = get(node, id);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }

  function get(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    return schedule;
  }

  function create(node, id, self) {
    var schedules = node.__transition,
        tween;

    // Initialize the self timer when the transition is created.
    // Note the actual delay is not known until the first callback!
    schedules[id] = self;
    self.timer = timer(schedule, 0, self.time);

    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start, self.delay, self.time);

      // If the elapsed delay is less than our first sleep, start immediately.
      if (self.delay <= elapsed) start(elapsed - self.delay);
    }

    function start(elapsed) {
      var i, j, n, o;

      // If the state is not SCHEDULED, then we previously errored on start.
      if (self.state !== SCHEDULED) return stop();

      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;

        // While this element already has a starting transition during this frame,
        // defer starting an interrupting transition until that transition has a
        // chance to tick (and possibly end); see d3/d3-transition#54!
        if (o.state === STARTED) return timeout(start);

        // Interrupt the active transition, if any.
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }

        // Cancel any pre-empted transitions.
        else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }

      // Defer the first tick to end of the current frame; see d3/d3#1576.
      // Note the transition may be canceled after start and before the first tick!
      // Note this must be scheduled before the start event; see d3/d3-transition#16!
      // Assuming this is successful, subsequent callbacks go straight to tick.
      timeout(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });

      // Dispatch the start event.
      // Note this must be done before the tween are initialized.
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return; // interrupted
      self.state = STARTED;

      // Initialize the tween, deleting null tween.
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }

    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
          i = -1,
          n = tween.length;

      while (++i < n) {
        tween[i].call(node, t);
      }

      // Dispatch the end event.
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }

    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id];
      for (var i in schedules) return; // eslint-disable-line no-unused-vars
      delete node.__transition;
    }
  }

  function interrupt(node, name) {
    var schedules = node.__transition,
        schedule,
        active,
        empty = true,
        i;

    if (!schedules) return;

    name = name == null ? null : name + "";

    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }

    if (empty) delete node.__transition;
  }

  function selection_interrupt(name) {
    return this.each(function() {
      interrupt(this, name);
    });
  }

  function tweenRemove(id, name) {
    var tween0, tween1;
    return function() {
      var schedule = set(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }

      schedule.tween = tween1;
    };
  }

  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error;
    return function() {
      var schedule = set(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }

      schedule.tween = tween1;
    };
  }

  function transition_tween(name, value) {
    var id = this._id;

    name += "";

    if (arguments.length < 2) {
      var tween = get(this.node(), id).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }

    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }

  function tweenValue(transition, name, value) {
    var id = transition._id;

    transition.each(function() {
      var schedule = set(this, id);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });

    return function(node) {
      return get(node, id).value[name];
    };
  }

  function interpolate(a, b) {
    var c;
    return (typeof b === "number" ? interpolateNumber
        : b instanceof color ? interpolateRgb
        : (c = color(b)) ? (b = c, interpolateRgb)
        : interpolateString)(a, b);
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrConstantNS(fullname, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrFunction(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function attrFunctionNS(fullname, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function transition_attr(name, value) {
    var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
    return this.attrTween(name, typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
        : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
        : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
  }

  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }

  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }

  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_attrTween(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    var fullname = namespace(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  function delayFunction(id, value) {
    return function() {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }

  function delayConstant(id, value) {
    return value = +value, function() {
      init(this, id).delay = value;
    };
  }

  function transition_delay(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? delayFunction
            : delayConstant)(id, value))
        : get(this.node(), id).delay;
  }

  function durationFunction(id, value) {
    return function() {
      set(this, id).duration = +value.apply(this, arguments);
    };
  }

  function durationConstant(id, value) {
    return value = +value, function() {
      set(this, id).duration = value;
    };
  }

  function transition_duration(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? durationFunction
            : durationConstant)(id, value))
        : get(this.node(), id).duration;
  }

  function easeConstant(id, value) {
    if (typeof value !== "function") throw new Error;
    return function() {
      set(this, id).ease = value;
    };
  }

  function transition_ease(value) {
    var id = this._id;

    return arguments.length
        ? this.each(easeConstant(id, value))
        : get(this.node(), id).ease;
  }

  function easeVarying(id, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error;
      set(this, id).ease = v;
    };
  }

  function transition_easeVarying(value) {
    if (typeof value !== "function") throw new Error;
    return this.each(easeVarying(this._id, value));
  }

  function transition_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  function transition_merge(transition) {
    if (transition._id !== this._id) throw new Error;

    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Transition(merges, this._parents, this._name, this._id);
  }

  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }

  function onFunction(id, name, listener) {
    var on0, on1, sit = start(name) ? init : set;
    return function() {
      var schedule = sit(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

      schedule.on = on1;
    };
  }

  function transition_on(name, listener) {
    var id = this._id;

    return arguments.length < 2
        ? get(this.node(), id).on.on(name)
        : this.each(onFunction(id, name, listener));
  }

  function removeFunction(id) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id) return;
      if (parent) parent.removeChild(this);
    };
  }

  function transition_remove() {
    return this.on("end.remove", removeFunction(this._id));
  }

  function transition_select(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule(subgroup[i], name, id, i, subgroup, get(node, id));
        }
      }
    }

    return new Transition(subgroups, this._parents, name, id);
  }

  function transition_selectAll(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
            if (child = children[k]) {
              schedule(child, name, id, k, children, inherit);
            }
          }
          subgroups.push(children);
          parents.push(node);
        }
      }
    }

    return new Transition(subgroups, parents, name, id);
  }

  var Selection = selection.prototype.constructor;

  function transition_selection() {
    return new Selection(this._groups, this._parents);
  }

  function styleNull(name, interpolate) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function styleFunction(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          value1 = value(this),
          string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function styleMaybeRemove(id, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
    return function() {
      var schedule = set(this, id),
          on = schedule.on,
          listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

      schedule.on = on1;
    };
  }

  function transition_style(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
    return value == null ? this
        .styleTween(name, styleNull(name, i))
        .on("end.style." + name, styleRemove(name))
      : typeof value === "function" ? this
        .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
        .each(styleMaybeRemove(this._id, name))
      : this
        .styleTween(name, styleConstant(name, i, value), priority)
        .on("end.style." + name, null);
  }

  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }

  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }

  function transition_styleTween(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }

  function transition_text(value) {
    return this.tween("text", typeof value === "function"
        ? textFunction(tweenValue(this, "text", value))
        : textConstant(value == null ? "" : value + ""));
  }

  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }

  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_textTween(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, textTween(value));
  }

  function transition_transition() {
    var name = this._name,
        id0 = this._id,
        id1 = newId();

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit = get(node, id0);
          schedule(node, name, id1, i, group, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }

    return new Transition(groups, this._parents, name, id1);
  }

  function transition_end() {
    var on0, on1, that = this, id = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = {value: reject},
          end = {value: function() { if (--size === 0) resolve(); }};

      that.each(function() {
        var schedule = set(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }

        schedule.on = on1;
      });

      // The selection was empty, resolve end immediately
      if (size === 0) resolve();
    });
  }

  var id = 0;

  function Transition(groups, parents, name, id) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id;
  }

  function newId() {
    return ++id;
  }

  var selection_prototype = selection.prototype;

  Transition.prototype = {
    constructor: Transition,
    select: transition_select,
    selectAll: transition_selectAll,
    filter: transition_filter,
    merge: transition_merge,
    selection: transition_selection,
    transition: transition_transition,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: transition_on,
    attr: transition_attr,
    attrTween: transition_attrTween,
    style: transition_style,
    styleTween: transition_styleTween,
    text: transition_text,
    textTween: transition_textTween,
    remove: transition_remove,
    tween: transition_tween,
    delay: transition_delay,
    duration: transition_duration,
    ease: transition_ease,
    easeVarying: transition_easeVarying,
    end: transition_end,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  var defaultTiming = {
    time: null, // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };

  function inherit(node, id) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id} not found`);
      }
    }
    return timing;
  }

  function selection_transition(name) {
    var id,
        timing;

    if (name instanceof Transition) {
      id = name._id, name = name._name;
    } else {
      id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule(node, name, id, i, group, timing || inherit(node, id));
        }
      }
    }

    return new Transition(groups, this._parents, name, id);
  }

  selection.prototype.interrupt = selection_interrupt;
  selection.prototype.transition = selection_transition;

  var epsilon = 1e-6;
  var epsilon2 = 1e-12;
  var pi = Math.PI;
  var halfPi = pi / 2;
  var quarterPi = pi / 4;
  var tau = pi * 2;

  var degrees = 180 / pi;
  var radians = pi / 180;

  var abs = Math.abs;
  var atan = Math.atan;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var exp = Math.exp;
  var log = Math.log;
  var sin = Math.sin;
  var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
  var sqrt = Math.sqrt;
  var tan = Math.tan;

  function acos(x) {
    return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
  }

  function asin(x) {
    return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
  }

  function noop() {}

  function streamGeometry(geometry, stream) {
    if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
      streamGeometryType[geometry.type](geometry, stream);
    }
  }

  var streamObjectType = {
    Feature: function(object, stream) {
      streamGeometry(object.geometry, stream);
    },
    FeatureCollection: function(object, stream) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) streamGeometry(features[i].geometry, stream);
    }
  };

  var streamGeometryType = {
    Sphere: function(object, stream) {
      stream.sphere();
    },
    Point: function(object, stream) {
      object = object.coordinates;
      stream.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
    },
    LineString: function(object, stream) {
      streamLine(object.coordinates, stream, 0);
    },
    MultiLineString: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamLine(coordinates[i], stream, 0);
    },
    Polygon: function(object, stream) {
      streamPolygon(object.coordinates, stream);
    },
    MultiPolygon: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamPolygon(coordinates[i], stream);
    },
    GeometryCollection: function(object, stream) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) streamGeometry(geometries[i], stream);
    }
  };

  function streamLine(coordinates, stream, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    stream.lineStart();
    while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    stream.lineEnd();
  }

  function streamPolygon(coordinates, stream) {
    var i = -1, n = coordinates.length;
    stream.polygonStart();
    while (++i < n) streamLine(coordinates[i], stream, 1);
    stream.polygonEnd();
  }

  function geoStream(object, stream) {
    if (object && streamObjectType.hasOwnProperty(object.type)) {
      streamObjectType[object.type](object, stream);
    } else {
      streamGeometry(object, stream);
    }
  }

  function spherical(cartesian) {
    return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
  }

  function cartesian(spherical) {
    var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
    return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
  }

  function cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function cartesianCross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  // TODO return a
  function cartesianAddInPlace(a, b) {
    a[0] += b[0], a[1] += b[1], a[2] += b[2];
  }

  function cartesianScale(vector, k) {
    return [vector[0] * k, vector[1] * k, vector[2] * k];
  }

  // TODO return d
  function cartesianNormalizeInPlace(d) {
    var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l, d[1] /= l, d[2] /= l;
  }

  function compose(a, b) {

    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }

    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };

    return compose;
  }

  function rotationIdentity(lambda, phi) {
    return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
  }

  rotationIdentity.invert = rotationIdentity;

  function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
    return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
      : rotationLambda(deltaLambda))
      : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
      : rotationIdentity);
  }

  function forwardRotationLambda(deltaLambda) {
    return function(lambda, phi) {
      return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
    };
  }

  function rotationLambda(deltaLambda) {
    var rotation = forwardRotationLambda(deltaLambda);
    rotation.invert = forwardRotationLambda(-deltaLambda);
    return rotation;
  }

  function rotationPhiGamma(deltaPhi, deltaGamma) {
    var cosDeltaPhi = cos(deltaPhi),
        sinDeltaPhi = sin(deltaPhi),
        cosDeltaGamma = cos(deltaGamma),
        sinDeltaGamma = sin(deltaGamma);

    function rotation(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
        asin(k * cosDeltaGamma + y * sinDeltaGamma)
      ];
    }

    rotation.invert = function(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaGamma - y * sinDeltaGamma;
      return [
        atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
        asin(k * cosDeltaPhi - x * sinDeltaPhi)
      ];
    };

    return rotation;
  }

  function rotation(rotate) {
    rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
      return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
    }

    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
      return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
    };

    return forward;
  }

  // Generates a circle centered at [0°, 0°], with a given radius and precision.
  function circleStream(stream, radius, delta, direction, t0, t1) {
    if (!delta) return;
    var cosRadius = cos(radius),
        sinRadius = sin(radius),
        step = direction * delta;
    if (t0 == null) {
      t0 = radius + direction * tau;
      t1 = radius - step / 2;
    } else {
      t0 = circleRadius(cosRadius, t0);
      t1 = circleRadius(cosRadius, t1);
      if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
    }
    for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
      point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
      stream.point(point[0], point[1]);
    }
  }

  // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
  function circleRadius(cosRadius, point) {
    point = cartesian(point), point[0] -= cosRadius;
    cartesianNormalizeInPlace(point);
    var radius = acos(-point[1]);
    return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
  }

  function clipBuffer() {
    var lines = [],
        line;
    return {
      point: function(x, y, m) {
        line.push([x, y, m]);
      },
      lineStart: function() {
        lines.push(line = []);
      },
      lineEnd: noop,
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      },
      result: function() {
        var result = lines;
        lines = [];
        line = null;
        return result;
      }
    };
  }

  function pointEqual(a, b) {
    return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
  }

  function Intersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other; // another intersection
    this.e = entry; // is an entry?
    this.v = false; // visited
    this.n = this.p = null; // next & previous
  }

  // A generalized polygon clipping algorithm: given a polygon that has been cut
  // into its visible line segments, and rejoins the segments by interpolating
  // along the clip edge.
  function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
    var subject = [],
        clip = [],
        i,
        n;

    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n], x;

      if (pointEqual(p0, p1)) {
        if (!p0[2] && !p1[2]) {
          stream.lineStart();
          for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
          stream.lineEnd();
          return;
        }
        // handle degenerate cases by moving the point
        p1[0] += 2 * epsilon;
      }

      subject.push(x = new Intersection(p0, segment, null, true));
      clip.push(x.o = new Intersection(p0, null, x, false));
      subject.push(x = new Intersection(p1, segment, null, false));
      clip.push(x.o = new Intersection(p1, null, x, true));
    });

    if (!subject.length) return;

    clip.sort(compareIntersection);
    link(subject);
    link(clip);

    for (i = 0, n = clip.length; i < n; ++i) {
      clip[i].e = startInside = !startInside;
    }

    var start = subject[0],
        points,
        point;

    while (1) {
      // Find first unvisited intersection.
      var current = start,
          isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      stream.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, stream);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, stream);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      stream.lineEnd();
    }
  }

  function link(array) {
    if (!(n = array.length)) return;
    var n,
        i = 0,
        a = array[0],
        b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }

  function longitude(point) {
    if (abs(point[0]) <= pi)
      return point[0];
    else
      return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
  }

  function polygonContains(polygon, point) {
    var lambda = longitude(point),
        phi = point[1],
        sinPhi = sin(phi),
        normal = [sin(lambda), -cos(lambda), 0],
        angle = 0,
        winding = 0;

    var sum = new Adder();

    if (sinPhi === 1) phi = halfPi + epsilon;
    else if (sinPhi === -1) phi = -halfPi - epsilon;

    for (var i = 0, n = polygon.length; i < n; ++i) {
      if (!(m = (ring = polygon[i]).length)) continue;
      var ring,
          m,
          point0 = ring[m - 1],
          lambda0 = longitude(point0),
          phi0 = point0[1] / 2 + quarterPi,
          sinPhi0 = sin(phi0),
          cosPhi0 = cos(phi0);

      for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
        var point1 = ring[j],
            lambda1 = longitude(point1),
            phi1 = point1[1] / 2 + quarterPi,
            sinPhi1 = sin(phi1),
            cosPhi1 = cos(phi1),
            delta = lambda1 - lambda0,
            sign = delta >= 0 ? 1 : -1,
            absDelta = sign * delta,
            antimeridian = absDelta > pi,
            k = sinPhi0 * sinPhi1;

        sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
        angle += antimeridian ? delta + sign * tau : delta;

        // Are the longitudes either side of the point’s meridian (lambda),
        // and are the latitudes smaller than the parallel (phi)?
        if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
          var arc = cartesianCross(cartesian(point0), cartesian(point1));
          cartesianNormalizeInPlace(arc);
          var intersection = cartesianCross(normal, arc);
          cartesianNormalizeInPlace(intersection);
          var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
          if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
            winding += antimeridian ^ delta >= 0 ? 1 : -1;
          }
        }
      }
    }

    // First, determine whether the South pole is inside or outside:
    //
    // It is inside if:
    // * the polygon winds around it in a clockwise direction.
    // * the polygon does not (cumulatively) wind around it, but has a negative
    //   (counter-clockwise) area.
    //
    // Second, count the (signed) number of times a segment crosses a lambda
    // from the point to the South pole.  If it is zero, then the point is the
    // same side as the South pole.

    return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ (winding & 1);
  }

  function clip(pointVisible, clipLine, interpolate, start) {
    return function(sink) {
      var line = clipLine(sink),
          ringBuffer = clipBuffer(),
          ringSink = clipLine(ringBuffer),
          polygonStarted = false,
          polygon,
          segments,
          ring;

      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = merge(segments);
          var startInside = polygonContains(polygon, start);
          if (segments.length) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
          } else if (startInside) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
          }
          if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          sink.polygonStart();
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
          sink.polygonEnd();
        }
      };

      function point(lambda, phi) {
        if (pointVisible(lambda, phi)) sink.point(lambda, phi);
      }

      function pointLine(lambda, phi) {
        line.point(lambda, phi);
      }

      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }

      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }

      function pointRing(lambda, phi) {
        ring.push([lambda, phi]);
        ringSink.point(lambda, phi);
      }

      function ringStart() {
        ringSink.lineStart();
        ring = [];
      }

      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringSink.lineEnd();

        var clean = ringSink.clean(),
            ringSegments = ringBuffer.result(),
            i, n = ringSegments.length, m,
            segment,
            point;

        ring.pop();
        polygon.push(ring);
        ring = null;

        if (!n) return;

        // No intersections.
        if (clean & 1) {
          segment = ringSegments[0];
          if ((m = segment.length - 1) > 0) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
            sink.lineEnd();
          }
          return;
        }

        // Rejoin connected segments.
        // TODO reuse ringBuffer.rejoin()?
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

        segments.push(ringSegments.filter(validSegment));
      }

      return clip;
    };
  }

  function validSegment(segment) {
    return segment.length > 1;
  }

  // Intersections are sorted along the clip edge. For both antimeridian cutting
  // and circle clipping, the same comparison is used.
  function compareIntersection(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
         - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
  }

  var clipAntimeridian = clip(
    function() { return true; },
    clipAntimeridianLine,
    clipAntimeridianInterpolate,
    [-pi, -halfPi]
  );

  // Takes a line and cuts into visible segments. Return values: 0 - there were
  // intersections or the line was empty; 1 - no intersections; 2 - there were
  // intersections, and the first and last segments should be rejoined.
  function clipAntimeridianLine(stream) {
    var lambda0 = NaN,
        phi0 = NaN,
        sign0 = NaN,
        clean; // no intersections

    return {
      lineStart: function() {
        stream.lineStart();
        clean = 1;
      },
      point: function(lambda1, phi1) {
        var sign1 = lambda1 > 0 ? pi : -pi,
            delta = abs(lambda1 - lambda0);
        if (abs(delta - pi) < epsilon) { // line crosses a pole
          stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          stream.point(lambda1, phi0);
          clean = 0;
        } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
          if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
          if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
          phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          clean = 0;
        }
        stream.point(lambda0 = lambda1, phi0 = phi1);
        sign0 = sign1;
      },
      lineEnd: function() {
        stream.lineEnd();
        lambda0 = phi0 = NaN;
      },
      clean: function() {
        return 2 - clean; // if intersections, rejoin first and last segments
      }
    };
  }

  function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
    var cosPhi0,
        cosPhi1,
        sinLambda0Lambda1 = sin(lambda0 - lambda1);
    return abs(sinLambda0Lambda1) > epsilon
        ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
            - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
            / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
        : (phi0 + phi1) / 2;
  }

  function clipAntimeridianInterpolate(from, to, direction, stream) {
    var phi;
    if (from == null) {
      phi = direction * halfPi;
      stream.point(-pi, phi);
      stream.point(0, phi);
      stream.point(pi, phi);
      stream.point(pi, 0);
      stream.point(pi, -phi);
      stream.point(0, -phi);
      stream.point(-pi, -phi);
      stream.point(-pi, 0);
      stream.point(-pi, phi);
    } else if (abs(from[0] - to[0]) > epsilon) {
      var lambda = from[0] < to[0] ? pi : -pi;
      phi = direction * lambda / 2;
      stream.point(-lambda, phi);
      stream.point(0, phi);
      stream.point(lambda, phi);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  function clipCircle(radius) {
    var cr = cos(radius),
        delta = 6 * radians,
        smallRadius = cr > 0,
        notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

    function interpolate(from, to, direction, stream) {
      circleStream(stream, radius, delta, direction, from, to);
    }

    function visible(lambda, phi) {
      return cos(lambda) * cos(phi) > cr;
    }

    // Takes a line and cuts into visible segments. Return values used for polygon
    // clipping: 0 - there were intersections or the line was empty; 1 - no
    // intersections 2 - there were intersections, and the first and last segments
    // should be rejoined.
    function clipLine(stream) {
      var point0, // previous point
          c0, // code for previous point
          v0, // visibility of previous point
          v00, // visibility of first point
          clean; // no intersections
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(lambda, phi) {
          var point1 = [lambda, phi],
              point2,
              v = visible(lambda, phi),
              c = smallRadius
                ? v ? 0 : code(lambda, phi)
                : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
          if (!point0 && (v00 = v0 = v)) stream.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
              point1[2] = 1;
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              // outside going in
              stream.lineStart();
              point2 = intersect(point1, point0);
              stream.point(point2[0], point2[1]);
            } else {
              // inside going out
              point2 = intersect(point0, point1);
              stream.point(point2[0], point2[1], 2);
              stream.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            // If the codes for two points are different, or are both zero,
            // and there this segment intersects with the small circle.
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                stream.lineStart();
                stream.point(t[0][0], t[0][1]);
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
              } else {
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
                stream.lineStart();
                stream.point(t[0][0], t[0][1], 3);
              }
            }
          }
          if (v && (!point0 || !pointEqual(point0, point1))) {
            stream.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) stream.lineEnd();
          point0 = null;
        },
        // Rejoin first and last segments if there were intersections and the first
        // and last points were visible.
        clean: function() {
          return clean | ((v00 && v0) << 1);
        }
      };
    }

    // Intersects the great circle between a and b with the clip circle.
    function intersect(a, b, two) {
      var pa = cartesian(a),
          pb = cartesian(b);

      // We have two planes, n1.p = d1 and n2.p = d2.
      // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
      var n1 = [1, 0, 0], // normal
          n2 = cartesianCross(pa, pb),
          n2n2 = cartesianDot(n2, n2),
          n1n2 = n2[0], // cartesianDot(n1, n2),
          determinant = n2n2 - n1n2 * n1n2;

      // Two polar points.
      if (!determinant) return !two && a;

      var c1 =  cr * n2n2 / determinant,
          c2 = -cr * n1n2 / determinant,
          n1xn2 = cartesianCross(n1, n2),
          A = cartesianScale(n1, c1),
          B = cartesianScale(n2, c2);
      cartesianAddInPlace(A, B);

      // Solve |p(t)|^2 = 1.
      var u = n1xn2,
          w = cartesianDot(A, u),
          uu = cartesianDot(u, u),
          t2 = w * w - uu * (cartesianDot(A, A) - 1);

      if (t2 < 0) return;

      var t = sqrt(t2),
          q = cartesianScale(u, (-w - t) / uu);
      cartesianAddInPlace(q, A);
      q = spherical(q);

      if (!two) return q;

      // Two intersection points.
      var lambda0 = a[0],
          lambda1 = b[0],
          phi0 = a[1],
          phi1 = b[1],
          z;

      if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

      var delta = lambda1 - lambda0,
          polar = abs(delta - pi) < epsilon,
          meridian = polar || delta < epsilon;

      if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

      // Check that the first point is between a and b.
      if (meridian
          ? polar
            ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
            : phi0 <= q[1] && q[1] <= phi1
          : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
        var q1 = cartesianScale(u, (-w + t) / uu);
        cartesianAddInPlace(q1, A);
        return [q, spherical(q1)];
      }
    }

    // Generates a 4-bit vector representing the location of a point relative to
    // the small circle's bounding box.
    function code(lambda, phi) {
      var r = smallRadius ? radius : pi - radius,
          code = 0;
      if (lambda < -r) code |= 1; // left
      else if (lambda > r) code |= 2; // right
      if (phi < -r) code |= 4; // below
      else if (phi > r) code |= 8; // above
      return code;
    }

    return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
  }

  function clipLine(a, b, x0, y0, x1, y1) {
    var ax = a[0],
        ay = a[1],
        bx = b[0],
        by = b[1],
        t0 = 0,
        t1 = 1,
        dx = bx - ax,
        dy = by - ay,
        r;

    r = x0 - ax;
    if (!dx && r > 0) return;
    r /= dx;
    if (dx < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dx > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }

    r = x1 - ax;
    if (!dx && r < 0) return;
    r /= dx;
    if (dx < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dx > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }

    r = y0 - ay;
    if (!dy && r > 0) return;
    r /= dy;
    if (dy < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dy > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }

    r = y1 - ay;
    if (!dy && r < 0) return;
    r /= dy;
    if (dy < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dy > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }

    if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
    if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
    return true;
  }

  var clipMax = 1e9, clipMin = -clipMax;

  // TODO Use d3-polygon’s polygonContains here for the ring check?
  // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

  function clipRectangle(x0, y0, x1, y1) {

    function visible(x, y) {
      return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }

    function interpolate(from, to, direction, stream) {
      var a = 0, a1 = 0;
      if (from == null
          || (a = corner(from, direction)) !== (a1 = corner(to, direction))
          || comparePoint(from, to) < 0 ^ direction > 0) {
        do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
        while ((a = (a + direction + 4) % 4) !== a1);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function corner(p, direction) {
      return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
          : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
          : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
          : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
    }

    function compareIntersection(a, b) {
      return comparePoint(a.x, b.x);
    }

    function comparePoint(a, b) {
      var ca = corner(a, 1),
          cb = corner(b, 1);
      return ca !== cb ? ca - cb
          : ca === 0 ? b[1] - a[1]
          : ca === 1 ? a[0] - b[0]
          : ca === 2 ? a[1] - b[1]
          : b[0] - a[0];
    }

    return function(stream) {
      var activeStream = stream,
          bufferStream = clipBuffer(),
          segments,
          polygon,
          ring,
          x__, y__, v__, // first point
          x_, y_, v_, // previous point
          first,
          clean;

      var clipStream = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: polygonStart,
        polygonEnd: polygonEnd
      };

      function point(x, y) {
        if (visible(x, y)) activeStream.point(x, y);
      }

      function polygonInside() {
        var winding = 0;

        for (var i = 0, n = polygon.length; i < n; ++i) {
          for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
            a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
            if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
            else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
          }
        }

        return winding;
      }

      // Buffer geometry within a polygon and then clip it en masse.
      function polygonStart() {
        activeStream = bufferStream, segments = [], polygon = [], clean = true;
      }

      function polygonEnd() {
        var startInside = polygonInside(),
            cleanInside = clean && startInside,
            visible = (segments = merge(segments)).length;
        if (cleanInside || visible) {
          stream.polygonStart();
          if (cleanInside) {
            stream.lineStart();
            interpolate(null, null, 1, stream);
            stream.lineEnd();
          }
          if (visible) {
            clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
          }
          stream.polygonEnd();
        }
        activeStream = stream, segments = polygon = ring = null;
      }

      function lineStart() {
        clipStream.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }

      // TODO rather than special-case polygons, simply handle them separately.
      // Ideally, coincident intersection points should be jittered to avoid
      // clipping issues.
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferStream.rejoin();
          segments.push(bufferStream.result());
        }
        clipStream.point = point;
        if (v_) activeStream.lineEnd();
      }

      function linePoint(x, y) {
        var v = visible(x, y);
        if (polygon) ring.push([x, y]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
          }
        } else {
          if (v && v_) activeStream.point(x, y);
          else {
            var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
            if (clipLine(a, b, x0, y0, x1, y1)) {
              if (!v_) {
                activeStream.lineStart();
                activeStream.point(a[0], a[1]);
              }
              activeStream.point(b[0], b[1]);
              if (!v) activeStream.lineEnd();
              clean = false;
            } else if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }

      return clipStream;
    };
  }

  var identity = x => x;

  var areaSum = new Adder(),
      areaRingSum = new Adder(),
      x00$2,
      y00$2,
      x0$3,
      y0$3;

  var areaStream = {
    point: noop,
    lineStart: noop,
    lineEnd: noop,
    polygonStart: function() {
      areaStream.lineStart = areaRingStart;
      areaStream.lineEnd = areaRingEnd;
    },
    polygonEnd: function() {
      areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop;
      areaSum.add(abs(areaRingSum));
      areaRingSum = new Adder();
    },
    result: function() {
      var area = areaSum / 2;
      areaSum = new Adder();
      return area;
    }
  };

  function areaRingStart() {
    areaStream.point = areaPointFirst;
  }

  function areaPointFirst(x, y) {
    areaStream.point = areaPoint;
    x00$2 = x0$3 = x, y00$2 = y0$3 = y;
  }

  function areaPoint(x, y) {
    areaRingSum.add(y0$3 * x - x0$3 * y);
    x0$3 = x, y0$3 = y;
  }

  function areaRingEnd() {
    areaPoint(x00$2, y00$2);
  }

  var x0$2 = Infinity,
      y0$2 = x0$2,
      x1 = -x0$2,
      y1 = x1;

  var boundsStream = {
    point: boundsPoint,
    lineStart: noop,
    lineEnd: noop,
    polygonStart: noop,
    polygonEnd: noop,
    result: function() {
      var bounds = [[x0$2, y0$2], [x1, y1]];
      x1 = y1 = -(y0$2 = x0$2 = Infinity);
      return bounds;
    }
  };

  function boundsPoint(x, y) {
    if (x < x0$2) x0$2 = x;
    if (x > x1) x1 = x;
    if (y < y0$2) y0$2 = y;
    if (y > y1) y1 = y;
  }

  // TODO Enforce positive area for exterior, negative area for interior?

  var X0 = 0,
      Y0 = 0,
      Z0 = 0,
      X1 = 0,
      Y1 = 0,
      Z1 = 0,
      X2 = 0,
      Y2 = 0,
      Z2 = 0,
      x00$1,
      y00$1,
      x0$1,
      y0$1;

  var centroidStream = {
    point: centroidPoint,
    lineStart: centroidLineStart,
    lineEnd: centroidLineEnd,
    polygonStart: function() {
      centroidStream.lineStart = centroidRingStart;
      centroidStream.lineEnd = centroidRingEnd;
    },
    polygonEnd: function() {
      centroidStream.point = centroidPoint;
      centroidStream.lineStart = centroidLineStart;
      centroidStream.lineEnd = centroidLineEnd;
    },
    result: function() {
      var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
          : Z1 ? [X1 / Z1, Y1 / Z1]
          : Z0 ? [X0 / Z0, Y0 / Z0]
          : [NaN, NaN];
      X0 = Y0 = Z0 =
      X1 = Y1 = Z1 =
      X2 = Y2 = Z2 = 0;
      return centroid;
    }
  };

  function centroidPoint(x, y) {
    X0 += x;
    Y0 += y;
    ++Z0;
  }

  function centroidLineStart() {
    centroidStream.point = centroidPointFirstLine;
  }

  function centroidPointFirstLine(x, y) {
    centroidStream.point = centroidPointLine;
    centroidPoint(x0$1 = x, y0$1 = y);
  }

  function centroidPointLine(x, y) {
    var dx = x - x0$1, dy = y - y0$1, z = sqrt(dx * dx + dy * dy);
    X1 += z * (x0$1 + x) / 2;
    Y1 += z * (y0$1 + y) / 2;
    Z1 += z;
    centroidPoint(x0$1 = x, y0$1 = y);
  }

  function centroidLineEnd() {
    centroidStream.point = centroidPoint;
  }

  function centroidRingStart() {
    centroidStream.point = centroidPointFirstRing;
  }

  function centroidRingEnd() {
    centroidPointRing(x00$1, y00$1);
  }

  function centroidPointFirstRing(x, y) {
    centroidStream.point = centroidPointRing;
    centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
  }

  function centroidPointRing(x, y) {
    var dx = x - x0$1,
        dy = y - y0$1,
        z = sqrt(dx * dx + dy * dy);

    X1 += z * (x0$1 + x) / 2;
    Y1 += z * (y0$1 + y) / 2;
    Z1 += z;

    z = y0$1 * x - x0$1 * y;
    X2 += z * (x0$1 + x);
    Y2 += z * (y0$1 + y);
    Z2 += z * 3;
    centroidPoint(x0$1 = x, y0$1 = y);
  }

  function PathContext(context) {
    this._context = context;
  }

  PathContext.prototype = {
    _radius: 4.5,
    pointRadius: function(_) {
      return this._radius = _, this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._context.closePath();
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._context.moveTo(x, y);
          this._point = 1;
          break;
        }
        case 1: {
          this._context.lineTo(x, y);
          break;
        }
        default: {
          this._context.moveTo(x + this._radius, y);
          this._context.arc(x, y, this._radius, 0, tau);
          break;
        }
      }
    },
    result: noop
  };

  var lengthSum = new Adder(),
      lengthRing,
      x00,
      y00,
      x0,
      y0;

  var lengthStream = {
    point: noop,
    lineStart: function() {
      lengthStream.point = lengthPointFirst;
    },
    lineEnd: function() {
      if (lengthRing) lengthPoint(x00, y00);
      lengthStream.point = noop;
    },
    polygonStart: function() {
      lengthRing = true;
    },
    polygonEnd: function() {
      lengthRing = null;
    },
    result: function() {
      var length = +lengthSum;
      lengthSum = new Adder();
      return length;
    }
  };

  function lengthPointFirst(x, y) {
    lengthStream.point = lengthPoint;
    x00 = x0 = x, y00 = y0 = y;
  }

  function lengthPoint(x, y) {
    x0 -= x, y0 -= y;
    lengthSum.add(sqrt(x0 * x0 + y0 * y0));
    x0 = x, y0 = y;
  }

  function PathString() {
    this._string = [];
  }

  PathString.prototype = {
    _radius: 4.5,
    _circle: circle(4.5),
    pointRadius: function(_) {
      if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
      return this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._string.push("Z");
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._string.push("M", x, ",", y);
          this._point = 1;
          break;
        }
        case 1: {
          this._string.push("L", x, ",", y);
          break;
        }
        default: {
          if (this._circle == null) this._circle = circle(this._radius);
          this._string.push("M", x, ",", y, this._circle);
          break;
        }
      }
    },
    result: function() {
      if (this._string.length) {
        var result = this._string.join("");
        this._string = [];
        return result;
      } else {
        return null;
      }
    }
  };

  function circle(radius) {
    return "m0," + radius
        + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
        + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
        + "z";
  }

  function geoPath(projection, context) {
    var pointRadius = 4.5,
        projectionStream,
        contextStream;

    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        geoStream(object, projectionStream(contextStream));
      }
      return contextStream.result();
    }

    path.area = function(object) {
      geoStream(object, projectionStream(areaStream));
      return areaStream.result();
    };

    path.measure = function(object) {
      geoStream(object, projectionStream(lengthStream));
      return lengthStream.result();
    };

    path.bounds = function(object) {
      geoStream(object, projectionStream(boundsStream));
      return boundsStream.result();
    };

    path.centroid = function(object) {
      geoStream(object, projectionStream(centroidStream));
      return centroidStream.result();
    };

    path.projection = function(_) {
      return arguments.length ? (projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream, path) : projection;
    };

    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return path;
    };

    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };

    return path.projection(projection).context(context);
  }

  function transformer(methods) {
    return function(stream) {
      var s = new TransformStream;
      for (var key in methods) s[key] = methods[key];
      s.stream = stream;
      return s;
    };
  }

  function TransformStream() {}

  TransformStream.prototype = {
    constructor: TransformStream,
    point: function(x, y) { this.stream.point(x, y); },
    sphere: function() { this.stream.sphere(); },
    lineStart: function() { this.stream.lineStart(); },
    lineEnd: function() { this.stream.lineEnd(); },
    polygonStart: function() { this.stream.polygonStart(); },
    polygonEnd: function() { this.stream.polygonEnd(); }
  };

  function fit(projection, fitBounds, object) {
    var clip = projection.clipExtent && projection.clipExtent();
    projection.scale(150).translate([0, 0]);
    if (clip != null) projection.clipExtent(null);
    geoStream(object, projection.stream(boundsStream));
    fitBounds(boundsStream.result());
    if (clip != null) projection.clipExtent(clip);
    return projection;
  }

  function fitExtent(projection, extent, object) {
    return fit(projection, function(b) {
      var w = extent[1][0] - extent[0][0],
          h = extent[1][1] - extent[0][1],
          k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
          x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
          y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  function fitSize(projection, size, object) {
    return fitExtent(projection, [[0, 0], size], object);
  }

  function fitWidth(projection, width, object) {
    return fit(projection, function(b) {
      var w = +width,
          k = w / (b[1][0] - b[0][0]),
          x = (w - k * (b[1][0] + b[0][0])) / 2,
          y = -k * b[0][1];
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  function fitHeight(projection, height, object) {
    return fit(projection, function(b) {
      var h = +height,
          k = h / (b[1][1] - b[0][1]),
          x = -k * b[0][0],
          y = (h - k * (b[1][1] + b[0][1])) / 2;
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  var maxDepth = 16, // maximum depth of subdivision
      cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

  function resample(project, delta2) {
    return +delta2 ? resample$1(project, delta2) : resampleNone(project);
  }

  function resampleNone(project) {
    return transformer({
      point: function(x, y) {
        x = project(x, y);
        this.stream.point(x[0], x[1]);
      }
    });
  }

  function resample$1(project, delta2) {

    function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0,
          dy = y1 - y0,
          d2 = dx * dx + dy * dy;
      if (d2 > 4 * delta2 && depth--) {
        var a = a0 + a1,
            b = b0 + b1,
            c = c0 + c1,
            m = sqrt(a * a + b * b + c * c),
            phi2 = asin(c /= m),
            lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
            p = project(lambda2, phi2),
            x2 = p[0],
            y2 = p[1],
            dx2 = x2 - x0,
            dy2 = y2 - y0,
            dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > delta2 // perpendicular projected distance
            || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
            || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
        }
      }
    }
    return function(stream) {
      var lambda00, x00, y00, a00, b00, c00, // first point
          lambda0, x0, y0, a0, b0, c0; // previous point

      var resampleStream = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
        polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
      };

      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }

      function lineStart() {
        x0 = NaN;
        resampleStream.point = linePoint;
        stream.lineStart();
      }

      function linePoint(lambda, phi) {
        var c = cartesian([lambda, phi]), p = project(lambda, phi);
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }

      function lineEnd() {
        resampleStream.point = point;
        stream.lineEnd();
      }

      function ringStart() {
        lineStart();
        resampleStream.point = ringPoint;
        resampleStream.lineEnd = ringEnd;
      }

      function ringPoint(lambda, phi) {
        linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resampleStream.point = linePoint;
      }

      function ringEnd() {
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
        resampleStream.lineEnd = lineEnd;
        lineEnd();
      }

      return resampleStream;
    };
  }

  var transformRadians = transformer({
    point: function(x, y) {
      this.stream.point(x * radians, y * radians);
    }
  });

  function transformRotate(rotate) {
    return transformer({
      point: function(x, y) {
        var r = rotate(x, y);
        return this.stream.point(r[0], r[1]);
      }
    });
  }

  function scaleTranslate(k, dx, dy, sx, sy) {
    function transform(x, y) {
      x *= sx; y *= sy;
      return [dx + k * x, dy - k * y];
    }
    transform.invert = function(x, y) {
      return [(x - dx) / k * sx, (dy - y) / k * sy];
    };
    return transform;
  }

  function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
    if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
    var cosAlpha = cos(alpha),
        sinAlpha = sin(alpha),
        a = cosAlpha * k,
        b = sinAlpha * k,
        ai = cosAlpha / k,
        bi = sinAlpha / k,
        ci = (sinAlpha * dy - cosAlpha * dx) / k,
        fi = (sinAlpha * dx + cosAlpha * dy) / k;
    function transform(x, y) {
      x *= sx; y *= sy;
      return [a * x - b * y + dx, dy - b * x - a * y];
    }
    transform.invert = function(x, y) {
      return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
    };
    return transform;
  }

  function projection$1(project) {
    return projectionMutator(function() { return project; })();
  }

  function projectionMutator(projectAt) {
    var project,
        k = 150, // scale
        x = 480, y = 250, // translate
        lambda = 0, phi = 0, // center
        deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
        alpha = 0, // post-rotate angle
        sx = 1, // reflectX
        sy = 1, // reflectX
        theta = null, preclip = clipAntimeridian, // pre-clip angle
        x0 = null, y0, x1, y1, postclip = identity, // post-clip extent
        delta2 = 0.5, // precision
        projectResample,
        projectTransform,
        projectRotateTransform,
        cache,
        cacheStream;

    function projection(point) {
      return projectRotateTransform(point[0] * radians, point[1] * radians);
    }

    function invert(point) {
      point = projectRotateTransform.invert(point[0], point[1]);
      return point && [point[0] * degrees, point[1] * degrees];
    }

    projection.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
    };

    projection.preclip = function(_) {
      return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
    };

    projection.postclip = function(_) {
      return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
    };

    projection.clipAngle = function(_) {
      return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
    };

    projection.clipExtent = function(_) {
      return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
    };

    projection.scale = function(_) {
      return arguments.length ? (k = +_, recenter()) : k;
    };

    projection.translate = function(_) {
      return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
    };

    projection.center = function(_) {
      return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
    };

    projection.rotate = function(_) {
      return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
    };

    projection.angle = function(_) {
      return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
    };

    projection.reflectX = function(_) {
      return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
    };

    projection.reflectY = function(_) {
      return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
    };

    projection.precision = function(_) {
      return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
    };

    projection.fitExtent = function(extent, object) {
      return fitExtent(projection, extent, object);
    };

    projection.fitSize = function(size, object) {
      return fitSize(projection, size, object);
    };

    projection.fitWidth = function(width, object) {
      return fitWidth(projection, width, object);
    };

    projection.fitHeight = function(height, object) {
      return fitHeight(projection, height, object);
    };

    function recenter() {
      var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
          transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
      rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
      projectTransform = compose(project, transform);
      projectRotateTransform = compose(rotate, projectTransform);
      projectResample = resample(projectTransform, delta2);
      return reset();
    }

    function reset() {
      cache = cacheStream = null;
      return projection;
    }

    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return recenter();
    };
  }

  function mercatorRaw(lambda, phi) {
    return [lambda, log(tan((halfPi + phi) / 2))];
  }

  mercatorRaw.invert = function(x, y) {
    return [x, 2 * atan(exp(y)) - halfPi];
  };

  function geoMercator() {
    return mercatorProjection(mercatorRaw)
        .scale(961 / tau);
  }

  function mercatorProjection(project) {
    var m = projection$1(project),
        center = m.center,
        scale = m.scale,
        translate = m.translate,
        clipExtent = m.clipExtent,
        x0 = null, y0, x1, y1; // clip extent

    m.scale = function(_) {
      return arguments.length ? (scale(_), reclip()) : scale();
    };

    m.translate = function(_) {
      return arguments.length ? (translate(_), reclip()) : translate();
    };

    m.center = function(_) {
      return arguments.length ? (center(_), reclip()) : center();
    };

    m.clipExtent = function(_) {
      return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
    };

    function reclip() {
      var k = pi * scale(),
          t = m(rotation(m.rotate()).invert([0, 0]));
      return clipExtent(x0 == null
          ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
          ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
          : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
    }

    return reclip();
  }

  var arbres = [
  	[
  		6.6455191,
  		46.7828399
  	],
  	[
  		6.645151,
  		46.7823663
  	],
  	[
  		6.6453909,
  		46.7826772
  	],
  	[
  		6.6450192,
  		46.7822061
  	],
  	[
  		6.6452756,
  		46.7825226
  	],
  	[
  		6.6494323,
  		46.7813657
  	],
  	[
  		6.6487343,
  		46.7808696
  	],
  	[
  		6.6485238,
  		46.7816779
  	],
  	[
  		6.6481537,
  		46.7818066
  	],
  	[
  		6.6491989,
  		46.780624
  	],
  	[
  		6.6481966,
  		46.7815029
  	],
  	[
  		6.6486573,
  		46.7807624
  	],
  	[
  		6.6483517,
  		46.7816475
  	],
  	[
  		6.6492272,
  		46.7811897
  	],
  	[
  		6.6487924,
  		46.7812297
  	],
  	[
  		6.6477198,
  		46.7814861
  	],
  	[
  		6.6450713,
  		46.7798657
  	],
  	[
  		6.6455312,
  		46.7797952
  	],
  	[
  		6.6458667,
  		46.7794886
  	],
  	[
  		6.645527,
  		46.7796337
  	],
  	[
  		6.6456927,
  		46.7795632
  	],
  	[
  		6.6484258,
  		46.7819796
  	],
  	[
  		6.6483121,
  		46.7820201
  	],
  	[
  		6.6481653,
  		46.7820737
  	],
  	[
  		6.648048,
  		46.782115
  	],
  	[
  		6.6479059,
  		46.7821702
  	],
  	[
  		6.6477875,
  		46.7822156
  	],
  	[
  		6.6476619,
  		46.7822635
  	],
  	[
  		6.6475435,
  		46.782304
  	],
  	[
  		6.6474416,
  		46.7823421
  	],
  	[
  		6.6473113,
  		46.7823908
  	],
  	[
  		6.6468435,
  		46.7825619
  	],
  	[
  		6.6467097,
  		46.782609
  	],
  	[
  		6.6465829,
  		46.7826528
  	],
  	[
  		6.646455,
  		46.7826998
  	],
  	[
  		6.6463176,
  		46.7827493
  	],
  	[
  		6.646211,
  		46.7827858
  	],
  	[
  		6.6460973,
  		46.7828304
  	],
  	[
  		6.6459718,
  		46.7828725
  	],
  	[
  		6.6487954,
  		46.781845
  	],
  	[
  		6.6489138,
  		46.7818028
  	],
  	[
  		6.6490619,
  		46.7817517
  	],
  	[
  		6.6493177,
  		46.7816552
  	],
  	[
  		6.6494468,
  		46.7816106
  	],
  	[
  		6.6495688,
  		46.7815651
  	],
  	[
  		6.6496967,
  		46.7815197
  	],
  	[
  		6.6499869,
  		46.7815749
  	],
  	[
  		6.6497,
  		46.7813287
  	],
  	[
  		6.6451364,
  		46.7790111
  	],
  	[
  		6.6451926,
  		46.7790628
  	],
  	[
  		6.6474494,
  		46.7814683
  	],
  	[
  		6.6475075,
  		46.7814467
  	],
  	[
  		6.6474836,
  		46.7814153
  	],
  	[
  		6.6474238,
  		46.7814347
  	],
  	[
  		6.6475465,
  		46.7815705
  	],
  	[
  		6.6474477,
  		46.7816083
  	],
  	[
  		6.6475942,
  		46.7814971
  	],
  	[
  		6.6476148,
  		46.7815268
  	],
  	[
  		6.6476376,
  		46.7815542
  	],
  	[
  		6.6476552,
  		46.7815783
  	],
  	[
  		6.6477136,
  		46.7816437
  	],
  	[
  		6.6477349,
  		46.7816684
  	],
  	[
  		6.6477518,
  		46.7816903
  	],
  	[
  		6.6477749,
  		46.7817169
  	],
  	[
  		6.6478241,
  		46.7817798
  	],
  	[
  		6.6478407,
  		46.7817992
  	],
  	[
  		6.6478601,
  		46.78182
  	],
  	[
  		6.6478825,
  		46.7818439
  	],
  	[
  		6.6480298,
  		46.7819164
  	],
  	[
  		6.6480746,
  		46.7819541
  	],
  	[
  		6.6483938,
  		46.781649
  	],
  	[
  		6.6477441,
  		46.7813402
  	],
  	[
  		6.6478006,
  		46.7813195
  	],
  	[
  		6.6478568,
  		46.7812982
  	],
  	[
  		6.6477261,
  		46.7813119
  	],
  	[
  		6.6477776,
  		46.7812901
  	],
  	[
  		6.6450804,
  		46.7826318
  	],
  	[
  		6.645195,
  		46.7827906
  	],
  	[
  		6.6456091,
  		46.7824973
  	],
  	[
  		6.6451452,
  		46.7827224
  	],
  	[
  		6.6452519,
  		46.7828606
  	],
  	[
  		6.6452999,
  		46.7829184
  	],
  	[
  		6.649207,
  		46.7811923
  	],
  	[
  		6.6492837,
  		46.781165
  	],
  	[
  		6.6493113,
  		46.7811319
  	],
  	[
  		6.6493519,
  		46.7812653
  	],
  	[
  		6.6493008,
  		46.7812591
  	],
  	[
  		6.6487583,
  		46.7809725
  	],
  	[
  		6.6486403,
  		46.7809702
  	]
  ];

  var batiments = [
  	{
  		type: "Feature",
  		id: "relation/1200851",
  		properties: {
  			timestamp: "2017-03-19T19:29:54Z",
  			version: "2",
  			changeset: "46991517",
  			user: "hecktor",
  			uid: "465052",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			type: "multipolygon",
  			id: "relation/1200851"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6484326,
  						46.7820931
  					],
  					[
  						6.6488396,
  						46.7826323
  					],
  					[
  						6.648966,
  						46.7825876
  					],
  					[
  						6.6490962,
  						46.78276
  					],
  					[
  						6.6499935,
  						46.7824424
  					],
  					[
  						6.6499835,
  						46.7824291
  					],
  					[
  						6.6500474,
  						46.7824065
  					],
  					[
  						6.6495516,
  						46.7817496
  					],
  					[
  						6.6495666,
  						46.7817443
  					],
  					[
  						6.6495587,
  						46.7817337
  					],
  					[
  						6.6496937,
  						46.7816859
  					],
  					[
  						6.6496479,
  						46.7816252
  					],
  					[
  						6.649509,
  						46.7816744
  					],
  					[
  						6.6494975,
  						46.7816591
  					],
  					[
  						6.6493145,
  						46.7817239
  					],
  					[
  						6.6493832,
  						46.781815
  					],
  					[
  						6.6494411,
  						46.7817945
  					],
  					[
  						6.6495201,
  						46.7818992
  					],
  					[
  						6.6494742,
  						46.7819154
  					],
  					[
  						6.6495592,
  						46.782028
  					],
  					[
  						6.6493963,
  						46.7820856
  					],
  					[
  						6.6493588,
  						46.7820359
  					],
  					[
  						6.6492486,
  						46.7820749
  					],
  					[
  						6.6492854,
  						46.7821236
  					],
  					[
  						6.6489372,
  						46.7822468
  					],
  					[
  						6.6487151,
  						46.7819525
  					],
  					[
  						6.6485606,
  						46.7820072
  					],
  					[
  						6.6485847,
  						46.7820392
  					],
  					[
  						6.6484326,
  						46.7820931
  					]
  				],
  				[
  					[
  						6.6491318,
  						46.7826036
  					],
  					[
  						6.6489778,
  						46.7823981
  					],
  					[
  						6.6496282,
  						46.7821695
  					],
  					[
  						6.6497822,
  						46.7823751
  					],
  					[
  						6.6491318,
  						46.7826036
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79741526",
  		properties: {
  			timestamp: "2010-09-29T20:34:52Z",
  			version: "2",
  			changeset: "5915355",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79741526"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6488418,
  						46.7820181
  					],
  					[
  						6.6493261,
  						46.7818435
  					],
  					[
  						6.6492528,
  						46.7817525
  					],
  					[
  						6.6487729,
  						46.7819326
  					],
  					[
  						6.6488418,
  						46.7820181
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79745584",
  		properties: {
  			timestamp: "2010-09-29T20:34:52Z",
  			version: "2",
  			changeset: "5915355",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79745584"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6499289,
  						46.781961
  					],
  					[
  						6.6501203,
  						46.7822003
  					],
  					[
  						6.6502277,
  						46.78216
  					],
  					[
  						6.6500364,
  						46.7819207
  					],
  					[
  						6.6499289,
  						46.781961
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79745585",
  		properties: {
  			timestamp: "2010-09-29T20:34:53Z",
  			version: "2",
  			changeset: "5915355",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79745585"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6500027,
  						46.78183
  					],
  					[
  						6.6498675,
  						46.7816001
  					],
  					[
  						6.6497462,
  						46.7816335
  					],
  					[
  						6.649836,
  						46.7817863
  					],
  					[
  						6.649663,
  						46.781834
  					],
  					[
  						6.6497084,
  						46.7819112
  					],
  					[
  						6.6500027,
  						46.78183
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79757077",
  		properties: {
  			timestamp: "2020-08-05T09:08:43Z",
  			version: "3",
  			changeset: "88970821",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "5",
  			"addr:postcode": "1400",
  			"addr:street": "Rue de l'Ancien-Stand",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79757077"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6448217,
  						46.7826646
  					],
  					[
  						6.6447728,
  						46.7826796
  					],
  					[
  						6.6447888,
  						46.782704
  					],
  					[
  						6.6446901,
  						46.7827343
  					],
  					[
  						6.6446818,
  						46.7827216
  					],
  					[
  						6.6442819,
  						46.7828441
  					],
  					[
  						6.6443507,
  						46.7829495
  					],
  					[
  						6.6443887,
  						46.7829379
  					],
  					[
  						6.6444975,
  						46.7831045
  					],
  					[
  						6.6444831,
  						46.7831089
  					],
  					[
  						6.6445084,
  						46.7831476
  					],
  					[
  						6.6450324,
  						46.7829871
  					],
  					[
  						6.6448217,
  						46.7826646
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821637",
  		properties: {
  			timestamp: "2015-07-09T11:39:57Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "14",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821637"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6456065,
  						46.7824366
  					],
  					[
  						6.6457201,
  						46.7823941
  					],
  					[
  						6.6456725,
  						46.7823345
  					],
  					[
  						6.6455589,
  						46.782377
  					],
  					[
  						6.6456065,
  						46.7824366
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821640",
  		properties: {
  			timestamp: "2015-07-09T11:39:56Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "10",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821640"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6466038,
  						46.782459
  					],
  					[
  						6.6467475,
  						46.782408
  					],
  					[
  						6.6466868,
  						46.7823278
  					],
  					[
  						6.6465431,
  						46.7823788
  					],
  					[
  						6.6466038,
  						46.782459
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821642",
  		properties: {
  			timestamp: "2015-07-09T11:39:57Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "14b",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821642"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6457644,
  						46.7823429
  					],
  					[
  						6.6459083,
  						46.7822878
  					],
  					[
  						6.6459942,
  						46.782393
  					],
  					[
  						6.6460823,
  						46.7823592
  					],
  					[
  						6.6459469,
  						46.7821934
  					],
  					[
  						6.6457619,
  						46.7822643
  					],
  					[
  						6.6457149,
  						46.7822823
  					],
  					[
  						6.6457445,
  						46.7823185
  					],
  					[
  						6.6457644,
  						46.7823429
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821643",
  		properties: {
  			timestamp: "2017-07-12T18:24:02Z",
  			version: "3",
  			changeset: "50237487",
  			user: "imagoiq_",
  			uid: "1856092",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821643"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6460119,
  						46.7821661
  					],
  					[
  						6.64611,
  						46.7822923
  					],
  					[
  						6.646158,
  						46.7822748
  					],
  					[
  						6.64606,
  						46.7821486
  					],
  					[
  						6.6460119,
  						46.7821661
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821647",
  		properties: {
  			timestamp: "2015-07-09T11:39:58Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79821647"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6454135,
  						46.7825265
  					],
  					[
  						6.6455659,
  						46.7824722
  					],
  					[
  						6.6453543,
  						46.7821937
  					],
  					[
  						6.6452018,
  						46.7822481
  					],
  					[
  						6.6454135,
  						46.7825265
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821648",
  		properties: {
  			timestamp: "2015-07-09T11:39:58Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "8",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821648"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6464023,
  						46.7825349
  					],
  					[
  						6.6465265,
  						46.7824915
  					],
  					[
  						6.6464116,
  						46.7823372
  					],
  					[
  						6.6462874,
  						46.7823805
  					],
  					[
  						6.6464023,
  						46.7825349
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821652",
  		properties: {
  			timestamp: "2015-07-09T11:39:56Z",
  			version: "3",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "12",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821652"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6464864,
  						46.7816523
  					],
  					[
  						6.646307,
  						46.7817193
  					],
  					[
  						6.6465277,
  						46.7819965
  					],
  					[
  						6.6464051,
  						46.7820422
  					],
  					[
  						6.6464193,
  						46.78206
  					],
  					[
  						6.6463786,
  						46.7820752
  					],
  					[
  						6.6465133,
  						46.7822445
  					],
  					[
  						6.6466753,
  						46.782184
  					],
  					[
  						6.6466948,
  						46.7822085
  					],
  					[
  						6.6468003,
  						46.7821691
  					],
  					[
  						6.6468159,
  						46.7821887
  					],
  					[
  						6.6468464,
  						46.7821773
  					],
  					[
  						6.64681,
  						46.7821316
  					],
  					[
  						6.6468547,
  						46.7821149
  					],
  					[
  						6.6464864,
  						46.7816523
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821655",
  		properties: {
  			timestamp: "2020-01-26T16:22:04Z",
  			version: "5",
  			changeset: "80101538",
  			user: "ohusser70",
  			uid: "7500047",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "2",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "apartments",
  			"building:levels": "2",
  			"roof:levels": "0",
  			source: "Bing",
  			id: "way/79821655"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6455698,
  						46.7826078
  					],
  					[
  						6.6456493,
  						46.7827136
  					],
  					[
  						6.6458965,
  						46.7826264
  					],
  					[
  						6.6458406,
  						46.7825521
  					],
  					[
  						6.645817,
  						46.7825207
  					],
  					[
  						6.6455698,
  						46.7826078
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821657",
  		properties: {
  			timestamp: "2015-07-09T11:39:58Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "8b",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821657"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6462481,
  						46.7821951
  					],
  					[
  						6.6463329,
  						46.7821661
  					],
  					[
  						6.6462836,
  						46.7820983
  					],
  					[
  						6.6461987,
  						46.7821273
  					],
  					[
  						6.6462481,
  						46.7821951
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821660",
  		properties: {
  			timestamp: "2015-07-09T11:39:57Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "2b",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821660"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6458975,
  						46.7827162
  					],
  					[
  						6.6460058,
  						46.7826755
  					],
  					[
  						6.6459665,
  						46.7826261
  					],
  					[
  						6.6458582,
  						46.7826668
  					],
  					[
  						6.6458975,
  						46.7827162
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821662",
  		properties: {
  			timestamp: "2015-07-09T11:39:58Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "4",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821662"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6460647,
  						46.782654
  					],
  					[
  						6.6462073,
  						46.7826021
  					],
  					[
  						6.646167,
  						46.7825498
  					],
  					[
  						6.6460244,
  						46.7826017
  					],
  					[
  						6.6460647,
  						46.782654
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821668",
  		properties: {
  			timestamp: "2015-07-09T11:39:59Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/79821668"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6468326,
  						46.7823845
  					],
  					[
  						6.6468934,
  						46.7823606
  					],
  					[
  						6.6468117,
  						46.7822632
  					],
  					[
  						6.6467509,
  						46.7822871
  					],
  					[
  						6.6468326,
  						46.7823845
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821672",
  		properties: {
  			timestamp: "2020-03-25T21:26:24Z",
  			version: "7",
  			changeset: "82629256",
  			user: "Geonick",
  			uid: "6087",
  			building: "yes",
  			healthcare: "hospital",
  			"healthcare:speciality": "psychiatry",
  			name: "Centre de psychiatrie du Nord vaudois",
  			"toilets:wheelchair": "yes",
  			wheelchair: "yes",
  			id: "way/79821672"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6472635,
  						46.7822036
  					],
  					[
  						6.6474594,
  						46.7821317
  					],
  					[
  						6.6474218,
  						46.7820837
  					],
  					[
  						6.6476259,
  						46.7820087
  					],
  					[
  						6.6476701,
  						46.7820652
  					],
  					[
  						6.6478565,
  						46.7819967
  					],
  					[
  						6.6477978,
  						46.7819218
  					],
  					[
  						6.6475852,
  						46.7816504
  					],
  					[
  						6.6473903,
  						46.781722
  					],
  					[
  						6.6475056,
  						46.7818692
  					],
  					[
  						6.6473089,
  						46.7819414
  					],
  					[
  						6.6472201,
  						46.781828
  					],
  					[
  						6.6470253,
  						46.7818996
  					],
  					[
  						6.6472635,
  						46.7822036
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821674",
  		properties: {
  			timestamp: "2017-07-10T18:10:43Z",
  			version: "4",
  			changeset: "50183238",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:housenumber": "32",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79821674"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6488224,
  						46.7812074
  					],
  					[
  						6.6489276,
  						46.7811804
  					],
  					[
  						6.648997,
  						46.7811626
  					],
  					[
  						6.6489767,
  						46.7811256
  					],
  					[
  						6.6493752,
  						46.7810235
  					],
  					[
  						6.6495106,
  						46.7812712
  					],
  					[
  						6.6496552,
  						46.7812342
  					],
  					[
  						6.6495397,
  						46.7810227
  					],
  					[
  						6.6495062,
  						46.7810313
  					],
  					[
  						6.6493973,
  						46.7808321
  					],
  					[
  						6.6492618,
  						46.7808668
  					],
  					[
  						6.6492525,
  						46.7808497
  					],
  					[
  						6.648844,
  						46.7809544
  					],
  					[
  						6.6488781,
  						46.7810168
  					],
  					[
  						6.6487379,
  						46.7810527
  					],
  					[
  						6.6488224,
  						46.7812074
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821677",
  		properties: {
  			timestamp: "2015-07-09T11:39:59Z",
  			version: "2",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79821677"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6449636,
  						46.7819369
  					],
  					[
  						6.6451107,
  						46.7818847
  					],
  					[
  						6.645155,
  						46.781869
  					],
  					[
  						6.6450728,
  						46.7817603
  					],
  					[
  						6.6448814,
  						46.7818282
  					],
  					[
  						6.6449636,
  						46.7819369
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79821678",
  		properties: {
  			timestamp: "2020-01-26T16:22:17Z",
  			version: "7",
  			changeset: "80101747",
  			user: "ohusser70",
  			uid: "7500047",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "construction",
  			source: "Bing",
  			id: "way/79821678"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6456206,
  						46.78277
  					],
  					[
  						6.6456567,
  						46.7828114
  					],
  					[
  						6.6457041,
  						46.782792
  					],
  					[
  						6.645668,
  						46.7827506
  					],
  					[
  						6.6456206,
  						46.78277
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79827281",
  		properties: {
  			timestamp: "2019-07-02T20:21:51Z",
  			version: "2",
  			changeset: "71836699",
  			user: "FvGordon",
  			uid: "161619",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79827281"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6491068,
  						46.7791163
  					],
  					[
  						6.649336,
  						46.7790643
  					],
  					[
  						6.649324,
  						46.7790393
  					],
  					[
  						6.6493104,
  						46.7790112
  					],
  					[
  						6.6490813,
  						46.7790631
  					],
  					[
  						6.6490947,
  						46.7790911
  					],
  					[
  						6.6491068,
  						46.7791163
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79827282",
  		properties: {
  			timestamp: "2019-10-25T10:05:30Z",
  			version: "4",
  			changeset: "76198218",
  			user: "fredjunod",
  			uid: "84054",
  			"addr:housenumber": "85",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			"roof:shape": "gabled",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79827282"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6493679,
  						46.7788773
  					],
  					[
  						6.6495069,
  						46.7790267
  					],
  					[
  						6.6497336,
  						46.7792704
  					],
  					[
  						6.6499294,
  						46.7791844
  					],
  					[
  						6.6495636,
  						46.7787914
  					],
  					[
  						6.6493679,
  						46.7788773
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79827290",
  		properties: {
  			timestamp: "2017-07-06T19:36:17Z",
  			version: "3",
  			changeset: "50092730",
  			user: "Rémi Bovard",
  			uid: "129299",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "27",
  			"addr:postcode": "1400",
  			"addr:street": "Rue Saint-Roch",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79827290"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6461651,
  						46.7795951
  					],
  					[
  						6.6462715,
  						46.779559
  					],
  					[
  						6.6462195,
  						46.7794867
  					],
  					[
  						6.6461131,
  						46.7795228
  					],
  					[
  						6.6461651,
  						46.7795951
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79827293",
  		properties: {
  			timestamp: "2010-09-30T15:18:43Z",
  			version: "1",
  			changeset: "5920858",
  			user: "Rémi Bovard",
  			uid: "129299",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79827293"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6458735,
  						46.7796198
  					],
  					[
  						6.6459559,
  						46.7796524
  					],
  					[
  						6.6460821,
  						46.7795016
  					],
  					[
  						6.6459997,
  						46.7794691
  					],
  					[
  						6.6458735,
  						46.7796198
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79827294",
  		properties: {
  			timestamp: "2010-09-30T15:18:43Z",
  			version: "1",
  			changeset: "5920858",
  			user: "Rémi Bovard",
  			uid: "129299",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79827294"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6493501,
  						46.7800276
  					],
  					[
  						6.6498707,
  						46.7798952
  					],
  					[
  						6.6498355,
  						46.7798304
  					],
  					[
  						6.6503773,
  						46.7796926
  					],
  					[
  						6.6502834,
  						46.7795194
  					],
  					[
  						6.6495625,
  						46.7797027
  					],
  					[
  						6.6496107,
  						46.7797915
  					],
  					[
  						6.6493799,
  						46.7798502
  					],
  					[
  						6.6494151,
  						46.779915
  					],
  					[
  						6.6492306,
  						46.779962
  					],
  					[
  						6.6492565,
  						46.7800098
  					],
  					[
  						6.6493303,
  						46.779991
  					],
  					[
  						6.6493501,
  						46.7800276
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79827297",
  		properties: {
  			timestamp: "2012-10-08T20:04:45Z",
  			version: "2",
  			changeset: "13417749",
  			user: "Nzara",
  			uid: "481380",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/79827297"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6455587,
  						46.780149
  					],
  					[
  						6.6457453,
  						46.7800406
  					],
  					[
  						6.6456456,
  						46.7799601
  					],
  					[
  						6.6454589,
  						46.7800685
  					],
  					[
  						6.6454877,
  						46.7800917
  					],
  					[
  						6.6455303,
  						46.7801261
  					],
  					[
  						6.6455587,
  						46.780149
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80035320",
  		properties: {
  			timestamp: "2019-03-01T15:14:54Z",
  			version: "3",
  			changeset: "67689408",
  			user: "fredjunod",
  			uid: "84054",
  			"addr:housenumber": "24a",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80035320"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6448745,
  						46.7790157
  					],
  					[
  						6.6449496,
  						46.7791352
  					],
  					[
  						6.6451009,
  						46.7790865
  					],
  					[
  						6.6451349,
  						46.7790756
  					],
  					[
  						6.6450287,
  						46.7789626
  					],
  					[
  						6.6449983,
  						46.7789697
  					],
  					[
  						6.6448654,
  						46.7790008
  					],
  					[
  						6.6448745,
  						46.7790157
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80123110",
  		properties: {
  			timestamp: "2020-07-29T15:57:45Z",
  			version: "6",
  			changeset: "88687990",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "17",
  			"addr:postcode": "1400",
  			"addr:street": "Rue de l'Industrie",
  			building: "industrial",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80123110"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.647942,
  						46.7803205
  					],
  					[
  						6.6480223,
  						46.7804223
  					],
  					[
  						6.6482581,
  						46.780335
  					],
  					[
  						6.6482695,
  						46.7803495
  					],
  					[
  						6.6484491,
  						46.780283
  					],
  					[
  						6.6484371,
  						46.7802678
  					],
  					[
  						6.6486226,
  						46.7801992
  					],
  					[
  						6.6485534,
  						46.7801115
  					],
  					[
  						6.6482088,
  						46.7802391
  					],
  					[
  						6.6481982,
  						46.7802256
  					],
  					[
  						6.647942,
  						46.7803205
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975272",
  		properties: {
  			timestamp: "2016-10-14T12:27:10Z",
  			version: "5",
  			changeset: "42894995",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/81975272"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.647141,
  						46.7790848
  					],
  					[
  						6.6472514,
  						46.7790587
  					],
  					[
  						6.6471888,
  						46.7789177
  					],
  					[
  						6.64638,
  						46.7790926
  					],
  					[
  						6.6463296,
  						46.779125
  					],
  					[
  						6.646291,
  						46.7791701
  					],
  					[
  						6.6462805,
  						46.7792165
  					],
  					[
  						6.6462912,
  						46.7792517
  					],
  					[
  						6.6463103,
  						46.7792824
  					],
  					[
  						6.6463474,
  						46.7793099
  					],
  					[
  						6.6463884,
  						46.7793064
  					],
  					[
  						6.6464275,
  						46.7793668
  					],
  					[
  						6.6465724,
  						46.7793175
  					],
  					[
  						6.6465125,
  						46.7792235
  					],
  					[
  						6.6466937,
  						46.7791827
  					],
  					[
  						6.6468433,
  						46.7791513
  					],
  					[
  						6.647141,
  						46.7790848
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975273",
  		properties: {
  			timestamp: "2010-10-17T20:06:52Z",
  			version: "1",
  			changeset: "6071249",
  			user: "inetis",
  			uid: "138032",
  			building: "yes",
  			id: "way/81975273"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6450804,
  						46.7799316
  					],
  					[
  						6.6446775,
  						46.7801852
  					],
  					[
  						6.6448105,
  						46.7802843
  					],
  					[
  						6.6452134,
  						46.7800306
  					],
  					[
  						6.6450804,
  						46.7799316
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975277",
  		properties: {
  			timestamp: "2010-10-17T20:06:53Z",
  			version: "1",
  			changeset: "6071249",
  			user: "inetis",
  			uid: "138032",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/81975277"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6461428,
  						46.7796249
  					],
  					[
  						6.6460893,
  						46.7796383
  					],
  					[
  						6.6461096,
  						46.7796761
  					],
  					[
  						6.646163,
  						46.7796627
  					],
  					[
  						6.6461428,
  						46.7796249
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975278",
  		properties: {
  			timestamp: "2010-10-17T20:06:53Z",
  			version: "1",
  			changeset: "6071249",
  			user: "inetis",
  			uid: "138032",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/81975278"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6468012,
  						46.7796531
  					],
  					[
  						6.6465724,
  						46.7793175
  					],
  					[
  						6.6464275,
  						46.7793668
  					],
  					[
  						6.6466152,
  						46.7797125
  					],
  					[
  						6.6468012,
  						46.7796531
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975282",
  		properties: {
  			timestamp: "2017-07-06T19:37:44Z",
  			version: "3",
  			changeset: "50092730",
  			user: "Rémi Bovard",
  			uid: "129299",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "29",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/81975282"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6455672,
  						46.7792919
  					],
  					[
  						6.6454404,
  						46.7793236
  					],
  					[
  						6.6455163,
  						46.7794657
  					],
  					[
  						6.6456431,
  						46.7794339
  					],
  					[
  						6.6455672,
  						46.7792919
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975286",
  		properties: {
  			timestamp: "2017-07-06T19:37:44Z",
  			version: "3",
  			changeset: "50092730",
  			user: "Rémi Bovard",
  			uid: "129299",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "31",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			id: "way/81975286"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6455672,
  						46.7792919
  					],
  					[
  						6.6456431,
  						46.7794339
  					],
  					[
  						6.6457718,
  						46.7794016
  					],
  					[
  						6.6456959,
  						46.7792596
  					],
  					[
  						6.6455672,
  						46.7792919
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975290",
  		properties: {
  			timestamp: "2017-07-10T17:11:16Z",
  			version: "3",
  			changeset: "50181944",
  			user: "imagoiq_",
  			uid: "1856092",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/81975290"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6446991,
  						46.7796935
  					],
  					[
  						6.6448189,
  						46.779667
  					],
  					[
  						6.6447939,
  						46.779614
  					],
  					[
  						6.6450309,
  						46.7795615
  					],
  					[
  						6.6450126,
  						46.7795228
  					],
  					[
  						6.6449813,
  						46.7794567
  					],
  					[
  						6.6449767,
  						46.779447
  					],
  					[
  						6.6449104,
  						46.7794617
  					],
  					[
  						6.64462,
  						46.7795262
  					],
  					[
  						6.6446276,
  						46.7795423
  					],
  					[
  						6.6446991,
  						46.7796935
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975297",
  		properties: {
  			timestamp: "2017-07-10T17:11:15Z",
  			version: "2",
  			changeset: "50181944",
  			user: "imagoiq_",
  			uid: "1856092",
  			building: "yes",
  			id: "way/81975297"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6449699,
  						46.7796323
  					],
  					[
  						6.6450562,
  						46.779748
  					],
  					[
  						6.6451545,
  						46.7797136
  					],
  					[
  						6.6450682,
  						46.7795979
  					],
  					[
  						6.6450539,
  						46.779604
  					],
  					[
  						6.6450357,
  						46.7795768
  					],
  					[
  						6.6449738,
  						46.7795956
  					],
  					[
  						6.6449922,
  						46.7796256
  					],
  					[
  						6.6449699,
  						46.7796323
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975298",
  		properties: {
  			timestamp: "2019-08-14T12:50:12Z",
  			version: "4",
  			changeset: "73347616",
  			user: "swiss_knight",
  			uid: "10123181",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "29",
  			"addr:postcode": "1400",
  			"addr:street": "Rue Saint-Roch",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/81975298"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6459474,
  						46.780039
  					],
  					[
  						6.6460067,
  						46.7801256
  					],
  					[
  						6.6464419,
  						46.779986
  					],
  					[
  						6.6463289,
  						46.7798207
  					],
  					[
  						6.6464087,
  						46.7797951
  					],
  					[
  						6.6463406,
  						46.7796956
  					],
  					[
  						6.6459015,
  						46.7798364
  					],
  					[
  						6.645971,
  						46.779938
  					],
  					[
  						6.6462842,
  						46.7798376
  					],
  					[
  						6.6463493,
  						46.7799328
  					],
  					[
  						6.6460533,
  						46.7800277
  					],
  					[
  						6.6460406,
  						46.7800091
  					],
  					[
  						6.6460048,
  						46.7800206
  					],
  					[
  						6.6459474,
  						46.780039
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975301",
  		properties: {
  			timestamp: "2017-07-10T17:11:15Z",
  			version: "4",
  			changeset: "50181944",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "25",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			id: "way/81975301"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6450268,
  						46.7794626
  					],
  					[
  						6.6450131,
  						46.7794476
  					],
  					[
  						6.6449813,
  						46.7794567
  					],
  					[
  						6.6450126,
  						46.7795228
  					],
  					[
  						6.6450525,
  						46.7795118
  					],
  					[
  						6.6450827,
  						46.7795655
  					],
  					[
  						6.6452406,
  						46.7795252
  					],
  					[
  						6.6451847,
  						46.7794224
  					],
  					[
  						6.6450268,
  						46.7794626
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/82230883",
  		properties: {
  			timestamp: "2010-10-19T20:22:09Z",
  			version: "1",
  			changeset: "6103038",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/82230883"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6468433,
  						46.7791513
  					],
  					[
  						6.6466937,
  						46.7791827
  					],
  					[
  						6.6467136,
  						46.7792271
  					],
  					[
  						6.6468631,
  						46.7791957
  					],
  					[
  						6.6468433,
  						46.7791513
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/109928833",
  		properties: {
  			timestamp: "2015-04-30T12:16:55Z",
  			version: "2",
  			changeset: "30657898",
  			user: "fredjunod",
  			uid: "84054",
  			building: "greenhouse",
  			source: "Orthophoto Yverdon 2011 / R-Pod @ HEIG-VD",
  			id: "way/109928833"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6498555,
  						46.7808134
  					],
  					[
  						6.6499278,
  						46.7807861
  					],
  					[
  						6.6498031,
  						46.780631
  					],
  					[
  						6.6497308,
  						46.7806583
  					],
  					[
  						6.6498555,
  						46.7808134
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/109928835",
  		properties: {
  			timestamp: "2015-04-30T12:16:55Z",
  			version: "2",
  			changeset: "30657898",
  			user: "fredjunod",
  			uid: "84054",
  			building: "greenhouse",
  			source: "Orthophoto Yverdon 2011 / R-Pod @ HEIG-VD",
  			id: "way/109928835"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6501329,
  						46.7809632
  					],
  					[
  						6.6502959,
  						46.7809044
  					],
  					[
  						6.6503146,
  						46.7809287
  					],
  					[
  						6.6504119,
  						46.7808937
  					],
  					[
  						6.6503931,
  						46.7808693
  					],
  					[
  						6.650556,
  						46.7808105
  					],
  					[
  						6.6503999,
  						46.7806075
  					],
  					[
  						6.6499767,
  						46.7807602
  					],
  					[
  						6.6501329,
  						46.7809632
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/289564692",
  		properties: {
  			timestamp: "2014-06-25T17:03:11Z",
  			version: "2",
  			changeset: "23154363",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/289564692"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.647141,
  						46.7790848
  					],
  					[
  						6.6471902,
  						46.779195
  					],
  					[
  						6.6470728,
  						46.7792184
  					],
  					[
  						6.6471069,
  						46.7792858
  					],
  					[
  						6.6473348,
  						46.7792525
  					],
  					[
  						6.6472514,
  						46.7790587
  					],
  					[
  						6.647141,
  						46.7790848
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/341778085",
  		properties: {
  			timestamp: "2015-04-30T12:16:54Z",
  			version: "1",
  			changeset: "30657898",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			id: "way/341778085"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6489357,
  						46.7799578
  					],
  					[
  						6.6490839,
  						46.7799192
  					],
  					[
  						6.6490477,
  						46.7798541
  					],
  					[
  						6.6488995,
  						46.7798927
  					],
  					[
  						6.6489357,
  						46.7799578
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565600",
  		properties: {
  			timestamp: "2015-07-09T11:39:52Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "10",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565600"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6451787,
  						46.7819746
  					],
  					[
  						6.6450316,
  						46.7820268
  					],
  					[
  						6.6450976,
  						46.782114
  					],
  					[
  						6.6452446,
  						46.7820618
  					],
  					[
  						6.6451787,
  						46.7819746
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565601",
  		properties: {
  			timestamp: "2015-07-09T11:39:53Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "11",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565601"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6452018,
  						46.7822481
  					],
  					[
  						6.6453543,
  						46.7821937
  					],
  					[
  						6.6454261,
  						46.7821681
  					],
  					[
  						6.6453577,
  						46.7820781
  					],
  					[
  						6.6451334,
  						46.7821581
  					],
  					[
  						6.6452018,
  						46.7822481
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565602",
  		properties: {
  			timestamp: "2015-07-09T11:39:53Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "12",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565602"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6453577,
  						46.7820781
  					],
  					[
  						6.6454261,
  						46.7821681
  					],
  					[
  						6.6455967,
  						46.7821073
  					],
  					[
  						6.6455283,
  						46.7820173
  					],
  					[
  						6.6453577,
  						46.7820781
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565603",
  		properties: {
  			timestamp: "2015-07-09T11:39:53Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "13",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565603"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6455283,
  						46.7820173
  					],
  					[
  						6.6455967,
  						46.7821073
  					],
  					[
  						6.6456949,
  						46.7820723
  					],
  					[
  						6.6456265,
  						46.7819823
  					],
  					[
  						6.6455283,
  						46.7820173
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565604",
  		properties: {
  			timestamp: "2015-07-09T11:39:53Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "9",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565604"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6451107,
  						46.7818847
  					],
  					[
  						6.6449636,
  						46.7819369
  					],
  					[
  						6.6450316,
  						46.7820268
  					],
  					[
  						6.6451787,
  						46.7819746
  					],
  					[
  						6.6451107,
  						46.7818847
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565605",
  		properties: {
  			timestamp: "2015-07-09T11:39:53Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565605"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6452033,
  						46.7819647
  					],
  					[
  						6.645335,
  						46.7819217
  					],
  					[
  						6.6453178,
  						46.7818969
  					],
  					[
  						6.6451861,
  						46.7819399
  					],
  					[
  						6.6452033,
  						46.7819647
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565606",
  		properties: {
  			timestamp: "2015-07-09T11:39:54Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565606"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6457149,
  						46.7822823
  					],
  					[
  						6.6456584,
  						46.7823039
  					],
  					[
  						6.6456879,
  						46.7823401
  					],
  					[
  						6.6457445,
  						46.7823185
  					],
  					[
  						6.6457149,
  						46.7822823
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565608",
  		properties: {
  			timestamp: "2015-07-09T11:39:54Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565608"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6465354,
  						46.7824757
  					],
  					[
  						6.64657,
  						46.7824625
  					],
  					[
  						6.6465304,
  						46.7824137
  					],
  					[
  						6.6464958,
  						46.7824268
  					],
  					[
  						6.6465354,
  						46.7824757
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565609",
  		properties: {
  			timestamp: "2015-07-09T11:39:54Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565609"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6458965,
  						46.7826264
  					],
  					[
  						6.6459791,
  						46.7825973
  					],
  					[
  						6.6459232,
  						46.782523
  					],
  					[
  						6.6458406,
  						46.7825521
  					],
  					[
  						6.6458965,
  						46.7826264
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565610",
  		properties: {
  			timestamp: "2015-07-09T11:39:54Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565610"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6457149,
  						46.7822823
  					],
  					[
  						6.6457619,
  						46.7822643
  					],
  					[
  						6.6456628,
  						46.7821429
  					],
  					[
  						6.6456158,
  						46.7821609
  					],
  					[
  						6.6456812,
  						46.782241
  					],
  					[
  						6.6457149,
  						46.7822823
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565611",
  		properties: {
  			timestamp: "2015-07-09T11:39:54Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Rue des Pêcheurs",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565611"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6456812,
  						46.782241
  					],
  					[
  						6.6456158,
  						46.7821609
  					],
  					[
  						6.6456007,
  						46.7821424
  					],
  					[
  						6.6455672,
  						46.7821552
  					],
  					[
  						6.6456477,
  						46.7822538
  					],
  					[
  						6.6456812,
  						46.782241
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/359565612",
  		properties: {
  			timestamp: "2015-07-09T11:39:55Z",
  			version: "1",
  			changeset: "32516710",
  			user: "schnelli",
  			uid: "225842",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue des Sports",
  			building: "yes",
  			source: "Bing",
  			id: "way/359565612"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6464864,
  						46.7816523
  					],
  					[
  						6.6465032,
  						46.781646
  					],
  					[
  						6.6462975,
  						46.7813876
  					],
  					[
  						6.6460778,
  						46.7814696
  					],
  					[
  						6.6461644,
  						46.7815785
  					],
  					[
  						6.6461318,
  						46.7815906
  					],
  					[
  						6.6462509,
  						46.7817402
  					],
  					[
  						6.646307,
  						46.7817193
  					],
  					[
  						6.6464864,
  						46.7816523
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/460537617",
  		properties: {
  			timestamp: "2016-12-19T12:43:40Z",
  			version: "1",
  			changeset: "44515247",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			id: "way/460537617"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6497633,
  						46.7802236
  					],
  					[
  						6.6499213,
  						46.7801834
  					],
  					[
  						6.6498907,
  						46.780127
  					],
  					[
  						6.6497327,
  						46.7801672
  					],
  					[
  						6.6497633,
  						46.7802236
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/460537619",
  		properties: {
  			timestamp: "2017-07-10T18:10:44Z",
  			version: "2",
  			changeset: "50183238",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:housenumber": "20",
  			"addr:street": "Rue de l'Industrie",
  			building: "yes",
  			id: "way/460537619"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6494302,
  						46.7802031
  					],
  					[
  						6.6495273,
  						46.7801784
  					],
  					[
  						6.6494945,
  						46.7801179
  					],
  					[
  						6.6494539,
  						46.7800429
  					],
  					[
  						6.6493567,
  						46.7800676
  					],
  					[
  						6.6494302,
  						46.7802031
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/460537620",
  		properties: {
  			timestamp: "2017-07-10T18:10:44Z",
  			version: "2",
  			changeset: "50183238",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:housenumber": "28",
  			"addr:street": "Rue de l'Industrie",
  			building: "yes",
  			id: "way/460537620"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.649562,
  						46.7804299
  					],
  					[
  						6.6496188,
  						46.7805339
  					],
  					[
  						6.6497422,
  						46.7805023
  					],
  					[
  						6.6496854,
  						46.7803983
  					],
  					[
  						6.649562,
  						46.7804299
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/460537622",
  		properties: {
  			timestamp: "2017-07-10T18:10:44Z",
  			version: "2",
  			changeset: "50183238",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:housenumber": "26",
  			"addr:street": "Rue de l'Industrie",
  			building: "yes",
  			id: "way/460537622"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.649562,
  						46.7804299
  					],
  					[
  						6.6496854,
  						46.7803983
  					],
  					[
  						6.649637,
  						46.7803097
  					],
  					[
  						6.6495136,
  						46.7803413
  					],
  					[
  						6.649562,
  						46.7804299
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/460537624",
  		properties: {
  			timestamp: "2017-07-10T18:10:44Z",
  			version: "2",
  			changeset: "50183238",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:housenumber": "22",
  			"addr:street": "Rue de l'Industrie",
  			building: "yes",
  			id: "way/460537624"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6495349,
  						46.7802081
  					],
  					[
  						6.6495727,
  						46.7802778
  					],
  					[
  						6.6497023,
  						46.7802448
  					],
  					[
  						6.6496645,
  						46.7801751
  					],
  					[
  						6.6495349,
  						46.7802081
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/460537625",
  		properties: {
  			timestamp: "2017-07-10T18:10:44Z",
  			version: "2",
  			changeset: "50183238",
  			user: "imagoiq_",
  			uid: "1856092",
  			"addr:housenumber": "24",
  			"addr:street": "Rue de l'Industrie",
  			building: "yes",
  			id: "way/460537625"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6501452,
  						46.7801243
  					],
  					[
  						6.65011,
  						46.7800678
  					],
  					[
  						6.6499851,
  						46.7800984
  					],
  					[
  						6.6500228,
  						46.7801554
  					],
  					[
  						6.6501452,
  						46.7801243
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/466647269",
  		properties: {
  			timestamp: "2017-07-06T19:39:33Z",
  			version: "2",
  			changeset: "50092730",
  			user: "Rémi Bovard",
  			uid: "129299",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "27",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			id: "way/466647269"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6455163,
  						46.7794657
  					],
  					[
  						6.6454404,
  						46.7793236
  					],
  					[
  						6.645303,
  						46.7793581
  					],
  					[
  						6.645379,
  						46.7795001
  					],
  					[
  						6.6455163,
  						46.7794657
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/466647272",
  		properties: {
  			timestamp: "2017-07-06T19:39:33Z",
  			version: "2",
  			changeset: "50092730",
  			user: "Rémi Bovard",
  			uid: "129299",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "33",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			id: "way/466647272"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6457718,
  						46.7794016
  					],
  					[
  						6.6459018,
  						46.779369
  					],
  					[
  						6.6458259,
  						46.779227
  					],
  					[
  						6.6456959,
  						46.7792596
  					],
  					[
  						6.6457718,
  						46.7794016
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/466647275",
  		properties: {
  			timestamp: "2017-07-06T19:39:33Z",
  			version: "2",
  			changeset: "50092730",
  			user: "Rémi Bovard",
  			uid: "129299",
  			"addr:city": "Yverdon-les-Bains",
  			"addr:country": "CH",
  			"addr:housenumber": "35",
  			"addr:postcode": "1400",
  			"addr:street": "Avenue Haldimand",
  			building: "yes",
  			id: "way/466647275"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6459018,
  						46.779369
  					],
  					[
  						6.6460279,
  						46.7793374
  					],
  					[
  						6.6459519,
  						46.7791954
  					],
  					[
  						6.6458259,
  						46.779227
  					],
  					[
  						6.6459018,
  						46.779369
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/467902542",
  		properties: {
  			timestamp: "2017-01-23T07:56:39Z",
  			version: "1",
  			changeset: "45388605",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			id: "way/467902542"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6471888,
  						46.7789177
  					],
  					[
  						6.6472514,
  						46.7790587
  					],
  					[
  						6.6473348,
  						46.7792525
  					],
  					[
  						6.6478533,
  						46.7791257
  					],
  					[
  						6.6476946,
  						46.7788121
  					],
  					[
  						6.6471888,
  						46.7789177
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/467902543",
  		properties: {
  			timestamp: "2017-01-23T07:56:39Z",
  			version: "1",
  			changeset: "45388605",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			id: "way/467902543"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.647379,
  						46.7793431
  					],
  					[
  						6.6472159,
  						46.7793662
  					],
  					[
  						6.6473351,
  						46.7796619
  					],
  					[
  						6.6467399,
  						46.7798135
  					],
  					[
  						6.6468,
  						46.7799025
  					],
  					[
  						6.6475288,
  						46.7797203
  					],
  					[
  						6.647379,
  						46.7793431
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/467902544",
  		properties: {
  			timestamp: "2017-01-23T07:56:39Z",
  			version: "1",
  			changeset: "45388605",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			id: "way/467902544"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6483501,
  						46.7787905
  					],
  					[
  						6.6479136,
  						46.7789203
  					],
  					[
  						6.6479896,
  						46.779069
  					],
  					[
  						6.6482812,
  						46.7789856
  					],
  					[
  						6.6485079,
  						46.7793794
  					],
  					[
  						6.647617,
  						46.7795977
  					],
  					[
  						6.6476526,
  						46.7796894
  					],
  					[
  						6.6487139,
  						46.7794269
  					],
  					[
  						6.6483501,
  						46.7787905
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/506516210",
  		properties: {
  			timestamp: "2017-07-10T17:49:39Z",
  			version: "1",
  			changeset: "50182738",
  			user: "imagoiq_",
  			uid: "1856092",
  			building: "yes",
  			id: "way/506516210"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6458409,
  						46.7830208
  					],
  					[
  						6.6458137,
  						46.7830395
  					],
  					[
  						6.6458182,
  						46.7830612
  					],
  					[
  						6.6458364,
  						46.7830752
  					],
  					[
  						6.6458772,
  						46.7830721
  					],
  					[
  						6.6459,
  						46.7830535
  					],
  					[
  						6.6459,
  						46.7830239
  					],
  					[
  						6.6459181,
  						46.7829368
  					],
  					[
  						6.6458863,
  						46.7829368
  					],
  					[
  						6.6458704,
  						46.7830146
  					],
  					[
  						6.6458409,
  						46.7830208
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/506519623",
  		properties: {
  			timestamp: "2017-07-10T18:10:42Z",
  			version: "1",
  			changeset: "50183238",
  			user: "imagoiq_",
  			uid: "1856092",
  			building: "yes",
  			id: "way/506519623"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6494945,
  						46.7801179
  					],
  					[
  						6.6495273,
  						46.7801784
  					],
  					[
  						6.6501647,
  						46.7800165
  					],
  					[
  						6.6502076,
  						46.7801102
  					],
  					[
  						6.6507065,
  						46.7800037
  					],
  					[
  						6.6505134,
  						46.7797961
  					],
  					[
  						6.6501888,
  						46.7798586
  					],
  					[
  						6.6501995,
  						46.7798861
  					],
  					[
  						6.6495424,
  						46.7800478
  					],
  					[
  						6.6495719,
  						46.7800992
  					],
  					[
  						6.6494945,
  						46.7801179
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/887024618",
  		properties: {
  			timestamp: "2021-03-14T10:14:49Z",
  			version: "8",
  			changeset: "100982685",
  			user: "swiss_knight",
  			uid: "10123181",
  			building: "yes",
  			name: "Centre Saint-Roch",
  			short_name: "Centre St-Roch",
  			website: "https://www.st-roch.ch",
  			id: "way/887024618"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						6.6444828,
  						46.7812987
  					],
  					[
  						6.6445367,
  						46.7813675
  					],
  					[
  						6.6444908,
  						46.7813844
  					],
  					[
  						6.6447658,
  						46.7817352
  					],
  					[
  						6.6448269,
  						46.7817127
  					],
  					[
  						6.6448549,
  						46.7817484
  					],
  					[
  						6.6461579,
  						46.7812694
  					],
  					[
  						6.6463371,
  						46.7812035
  					],
  					[
  						6.6463513,
  						46.7812216
  					],
  					[
  						6.6463797,
  						46.7812579
  					],
  					[
  						6.6464123,
  						46.7812458
  					],
  					[
  						6.6467282,
  						46.7816437
  					],
  					[
  						6.6469104,
  						46.7815767
  					],
  					[
  						6.6473242,
  						46.7814246
  					],
  					[
  						6.6472934,
  						46.7813853
  					],
  					[
  						6.6473975,
  						46.7813471
  					],
  					[
  						6.6474913,
  						46.7813126
  					],
  					[
  						6.6475194,
  						46.7813485
  					],
  					[
  						6.6479396,
  						46.7811941
  					],
  					[
  						6.6479689,
  						46.7811833
  					],
  					[
  						6.6479993,
  						46.7811721
  					],
  					[
  						6.6480907,
  						46.781288
  					],
  					[
  						6.648263,
  						46.7812237
  					],
  					[
  						6.6480791,
  						46.7809927
  					],
  					[
  						6.6480688,
  						46.7809797
  					],
  					[
  						6.6480424,
  						46.780946
  					],
  					[
  						6.6480149,
  						46.780911
  					],
  					[
  						6.64796,
  						46.780841
  					],
  					[
  						6.6479322,
  						46.7808055
  					],
  					[
  						6.6479044,
  						46.78077
  					],
  					[
  						6.6478397,
  						46.7806875
  					],
  					[
  						6.647857,
  						46.7806812
  					],
  					[
  						6.6478439,
  						46.7806644
  					],
  					[
  						6.6478313,
  						46.7806484
  					],
  					[
  						6.6478165,
  						46.7806538
  					],
  					[
  						6.6478024,
  						46.780659
  					],
  					[
  						6.6477637,
  						46.7806097
  					],
  					[
  						6.6477288,
  						46.7805651
  					],
  					[
  						6.6476943,
  						46.7805211
  					],
  					[
  						6.6476572,
  						46.7805347
  					],
  					[
  						6.6475477,
  						46.780395
  					],
  					[
  						6.6474425,
  						46.7804336
  					],
  					[
  						6.6461319,
  						46.7809154
  					],
  					[
  						6.6462415,
  						46.7810552
  					],
  					[
  						6.6460463,
  						46.7811269
  					],
  					[
  						6.645801,
  						46.7808141
  					],
  					[
  						6.6444828,
  						46.7812987
  					]
  				]
  			]
  		}
  	}
  ];

  var routes = [
  	{
  		type: "Feature",
  		id: "way/22735309",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "11",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			cycleway: "lane",
  			highway: "residential",
  			maxspeed: "50",
  			name: "Rue de l'Industrie",
  			oneway: "yes",
  			sidewalk: "right",
  			surface: "asphalt",
  			id: "way/22735309"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6497981,
  					46.7810757
  				],
  				[
  					6.649897,
  					46.7811737
  				],
  				[
  					6.6499761,
  					46.7812571
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/22735315",
  		properties: {
  			timestamp: "2020-12-03T11:45:29Z",
  			version: "15",
  			changeset: "95222724",
  			user: "schnelli",
  			uid: "225842",
  			"cycleway:both": "no",
  			highway: "unclassified",
  			lanes: "2",
  			lit: "yes",
  			"maxspeed:type": "CH:urban",
  			name: "Rue Saint-Roch",
  			sidewalk: "no",
  			surface: "asphalt",
  			id: "way/22735315"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6466902,
  					46.7800193
  				],
  				[
  					6.646517,
  					46.7797478
  				],
  				[
  					6.6464283,
  					46.7796158
  				],
  				[
  					6.6460976,
  					46.7791238
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/23365462",
  		properties: {
  			timestamp: "2010-10-31T12:50:12Z",
  			version: "7",
  			changeset: "6237984",
  			user: "fredjunod",
  			uid: "84054",
  			highway: "service",
  			name: "Rue des Pêcheurs",
  			service: "parking_aisle",
  			id: "way/23365462"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6458444,
  					46.7807015
  				],
  				[
  					6.64436,
  					46.7812868
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/23365486",
  		properties: {
  			timestamp: "2020-02-25T10:12:45Z",
  			version: "23",
  			changeset: "81448755",
  			user: "schnelli",
  			uid: "225842",
  			highway: "tertiary",
  			lit: "yes",
  			name: "Avenue des Sports",
  			sidewalk: "both",
  			surface: "asphalt",
  			id: "way/23365486"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.64563,
  					46.7829435
  				],
  				[
  					6.6456791,
  					46.7829215
  				],
  				[
  					6.6458443,
  					46.7828588
  				],
  				[
  					6.6471642,
  					46.7823583
  				],
  				[
  					6.647335,
  					46.7822966
  				],
  				[
  					6.6486489,
  					46.781822
  				],
  				[
  					6.6487937,
  					46.7817697
  				],
  				[
  					6.6490062,
  					46.7816929
  				],
  				[
  					6.6491831,
  					46.781629
  				],
  				[
  					6.6495479,
  					46.7814973
  				],
  				[
  					6.6496344,
  					46.781466
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/23373607",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "8",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "yes",
  			id: "way/23373607"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6467201,
  					46.7818069
  				],
  				[
  					6.6467646,
  					46.7818616
  				],
  				[
  					6.6471354,
  					46.7823225
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/23373621",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "11",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/23373621"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6490062,
  					46.7816929
  				],
  				[
  					6.6489777,
  					46.7816567
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/23373633",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "8",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			oneway: "yes",
  			service: "parking_aisle",
  			sidewalk: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/23373633"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6487937,
  					46.7817697
  				],
  				[
  					6.6487637,
  					46.781732
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26496134",
  		properties: {
  			timestamp: "2020-12-10T10:00:51Z",
  			version: "17",
  			changeset: "95606100",
  			user: "schnelli",
  			uid: "225842",
  			highway: "unclassified",
  			lanes: "2",
  			lit: "yes",
  			maxspeed: "50",
  			name: "Rue de l'Ancien-Stand",
  			sidewalk: "both",
  			surface: "asphalt",
  			id: "way/26496134"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6452941,
  					46.783092
  				],
  				[
  					6.645205,
  					46.7829996
  				],
  				[
  					6.6448248,
  					46.7825068
  				],
  				[
  					6.644658,
  					46.7822622
  				],
  				[
  					6.6445082,
  					46.7820673
  				],
  				[
  					6.6444287,
  					46.7819514
  				],
  				[
  					6.6443806,
  					46.7818738
  				],
  				[
  					6.6439283,
  					46.7812288
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26661901",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "6",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "yes",
  			id: "way/26661901"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6491831,
  					46.781629
  				],
  				[
  					6.6492181,
  					46.7816757
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26713938",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "6",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/26713938"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6481391,
  					46.7806312
  				],
  				[
  					6.6487805,
  					46.7804443
  				],
  				[
  					6.6492983,
  					46.780286
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/32784073",
  		properties: {
  			timestamp: "2021-03-13T20:36:08Z",
  			version: "17",
  			changeset: "100968595",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "yes",
  			cycleway: "lane",
  			highway: "primary",
  			lit: "yes",
  			maxspeed: "50",
  			name: "Avenue Haldimand",
  			rcrc_ref: "401a",
  			ref: "5",
  			sidewalk: "both",
  			surface: "asphalt",
  			id: "way/32784073"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6442141,
  					46.7794219
  				],
  				[
  					6.6443556,
  					46.7793907
  				],
  				[
  					6.6444976,
  					46.7793595
  				],
  				[
  					6.6452041,
  					46.779204
  				],
  				[
  					6.645507,
  					46.7791373
  				],
  				[
  					6.6458285,
  					46.7790665
  				],
  				[
  					6.6460148,
  					46.7790255
  				],
  				[
  					6.6464014,
  					46.7789389
  				],
  				[
  					6.6470777,
  					46.7787875
  				],
  				[
  					6.6480559,
  					46.7785781
  				],
  				[
  					6.6481737,
  					46.778542
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/61323507",
  		properties: {
  			timestamp: "2010-06-06T19:26:49Z",
  			version: "1",
  			changeset: "4921554",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			highway: "service",
  			oneway: "yes",
  			id: "way/61323507"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6488065,
  					46.7790379
  				],
  				[
  					6.6493374,
  					46.778923
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79760612",
  		properties: {
  			timestamp: "2020-12-08T13:39:26Z",
  			version: "15",
  			changeset: "95490229",
  			user: "mnoverraz",
  			uid: "1554848",
  			bicycle: "yes",
  			cycleway: "lane",
  			highway: "residential",
  			lit: "yes",
  			"maxspeed:type": "CH:urban",
  			name: "Rue de l'Industrie",
  			oneway: "no",
  			sidewalk: "yes",
  			surface: "asphalt",
  			id: "way/79760612"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6489781,
  					46.7795722
  				],
  				[
  					6.6489441,
  					46.7794996
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/79760621",
  		properties: {
  			timestamp: "2021-03-13T07:52:13Z",
  			version: "9",
  			changeset: "100943832",
  			user: "JohEcu",
  			uid: "4403747",
  			highway: "residential",
  			layer: "-1",
  			lit: "yes",
  			maxheight: "4,0",
  			"maxspeed:type": "CH:urban",
  			name: "Rue de l'Industrie",
  			oneway: "no",
  			sidewalk: "yes",
  			surface: "asphalt",
  			tunnel: "yes",
  			id: "way/79760621"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6490703,
  					46.7797429
  				],
  				[
  					6.6489781,
  					46.7795722
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122124",
  		properties: {
  			timestamp: "2012-11-28T09:19:21Z",
  			version: "2",
  			changeset: "14070405",
  			user: "fredjunod",
  			uid: "84054",
  			highway: "service",
  			service: "parking_aisle",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122124"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6459935,
  					46.7816115
  				],
  				[
  					6.6454032,
  					46.7818326
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122127",
  		properties: {
  			timestamp: "2012-11-28T09:19:22Z",
  			version: "2",
  			changeset: "14070405",
  			user: "fredjunod",
  			uid: "84054",
  			highway: "service",
  			service: "parking_aisle",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122127"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6461752,
  					46.781839
  				],
  				[
  					6.6457457,
  					46.7819998
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122129",
  		properties: {
  			timestamp: "2012-11-28T09:19:21Z",
  			version: "2",
  			changeset: "14070405",
  			user: "fredjunod",
  			uid: "84054",
  			highway: "service",
  			service: "parking_aisle",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122129"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6459196,
  					46.7815189
  				],
  				[
  					6.6453309,
  					46.7817393
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122130",
  		properties: {
  			timestamp: "2012-11-28T09:19:22Z",
  			version: "2",
  			changeset: "14070405",
  			user: "fredjunod",
  			uid: "84054",
  			highway: "service",
  			service: "parking_aisle",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122130"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6460663,
  					46.7817027
  				],
  				[
  					6.6454644,
  					46.781928
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122133",
  		properties: {
  			timestamp: "2010-10-02T08:50:02Z",
  			version: "1",
  			changeset: "5934226",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			highway: "service",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122133"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6451212,
  					46.7816921
  				],
  				[
  					6.6452212,
  					46.7818154
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122134",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			service: "parking_aisle",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122134"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6458398,
  					46.7814179
  				],
  				[
  					6.6458593,
  					46.7814414
  				],
  				[
  					6.6459196,
  					46.7815189
  				],
  				[
  					6.6459935,
  					46.7816115
  				],
  				[
  					6.6460663,
  					46.7817027
  				],
  				[
  					6.6461752,
  					46.781839
  				],
  				[
  					6.6462807,
  					46.7819712
  				],
  				[
  					6.6458506,
  					46.7821322
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122831",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "6",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			highway: "footway",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122831"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6489384,
  					46.7816067
  				],
  				[
  					6.6490269,
  					46.7815763
  				],
  				[
  					6.6489514,
  					46.7812754
  				],
  				[
  					6.6489276,
  					46.7811804
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80122834",
  		properties: {
  			timestamp: "2019-12-17T15:24:25Z",
  			version: "5",
  			changeset: "78534163",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			highway: "footway",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80122834"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6487388,
  					46.7813665
  				],
  				[
  					6.6487714,
  					46.7813531
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80124184",
  		properties: {
  			timestamp: "2010-10-02T09:02:12Z",
  			version: "1",
  			changeset: "5934342",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			highway: "service",
  			oneway: "yes",
  			id: "way/80124184"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.649324,
  					46.7790393
  				],
  				[
  					6.6494007,
  					46.7790228
  				],
  				[
  					6.6493374,
  					46.778923
  				],
  				[
  					6.649204,
  					46.7787819
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80124185",
  		properties: {
  			timestamp: "2019-07-02T20:21:51Z",
  			version: "2",
  			changeset: "71836699",
  			user: "FvGordon",
  			uid: "161619",
  			highway: "service",
  			oneway: "yes",
  			tunnel: "building_passage",
  			id: "way/80124185"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6490947,
  					46.7790911
  				],
  				[
  					6.649324,
  					46.7790393
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/80253703",
  		properties: {
  			timestamp: "2010-10-03T14:44:58Z",
  			version: "1",
  			changeset: "5944734",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			highway: "service",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/80253703"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6493984,
  					46.7819176
  				],
  				[
  					6.6488605,
  					46.7821056
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/81975300",
  		properties: {
  			timestamp: "2010-10-17T20:07:00Z",
  			version: "1",
  			changeset: "6071249",
  			user: "inetis",
  			uid: "138032",
  			highway: "service",
  			service: "driveway",
  			id: "way/81975300"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6457876,
  					46.7799215
  				],
  				[
  					6.6458981,
  					46.7797914
  				],
  				[
  					6.6464283,
  					46.7796158
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/82310526",
  		properties: {
  			timestamp: "2010-10-20T19:50:48Z",
  			version: "1",
  			changeset: "6119377",
  			user: "Romain Aviolat [Xens]",
  			uid: "4786",
  			highway: "service",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/82310526"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.646517,
  					46.7797478
  				],
  				[
  					6.6469724,
  					46.7796302
  				],
  				[
  					6.6470316,
  					46.779595
  				],
  				[
  					6.6470634,
  					46.7795478
  				],
  				[
  					6.6470579,
  					46.7795072
  				],
  				[
  					6.6469684,
  					46.77932
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/82554104",
  		properties: {
  			timestamp: "2020-12-10T10:00:31Z",
  			version: "10",
  			changeset: "95606100",
  			user: "schnelli",
  			uid: "225842",
  			bridge: "yes",
  			highway: "tertiary",
  			lanes: "2",
  			layer: "1",
  			lit: "yes",
  			maxweight: "40",
  			name: "Avenue des Sports",
  			sidewalk: "both",
  			surface: "asphalt",
  			id: "way/82554104"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6454247,
  					46.7830323
  				],
  				[
  					6.64563,
  					46.7829435
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/83485229",
  		properties: {
  			timestamp: "2020-01-26T16:16:13Z",
  			version: "5",
  			changeset: "80101552",
  			user: "ohusser70",
  			uid: "7500047",
  			highway: "residential",
  			lit: "yes",
  			name: "Rue des Pêcheurs",
  			surface: "asphalt",
  			id: "way/83485229"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.64436,
  					46.7812868
  				],
  				[
  					6.6447593,
  					46.7818223
  				],
  				[
  					6.6456324,
  					46.7828656
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/109928267",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "2",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			source: "Orthophoto Yverdon 2011 / R-Pod @ HEIG-VD",
  			id: "way/109928267"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6467646,
  					46.7818616
  				],
  				[
  					6.6468073,
  					46.7818448
  				],
  				[
  					6.6470962,
  					46.7817313
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/341778087",
  		properties: {
  			timestamp: "2015-04-30T12:16:54Z",
  			version: "1",
  			changeset: "30657898",
  			user: "fredjunod",
  			uid: "84054",
  			highway: "service",
  			id: "way/341778087"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6447243,
  					46.779743
  				],
  				[
  					6.6450082,
  					46.779916
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/341778090",
  		properties: {
  			timestamp: "2020-03-23T18:32:29Z",
  			version: "4",
  			changeset: "82536742",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			id: "way/341778090"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6493963,
  					46.7811466
  				],
  				[
  					6.6494675,
  					46.7812761
  				],
  				[
  					6.6495325,
  					46.781452
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/341778091",
  		properties: {
  			timestamp: "2015-04-30T12:16:54Z",
  			version: "1",
  			changeset: "30657898",
  			user: "fredjunod",
  			uid: "84054",
  			highway: "service",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/341778091"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6479958,
  					46.7805012
  				],
  				[
  					6.6486631,
  					46.7802497
  				],
  				[
  					6.6487805,
  					46.7804443
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/448480914",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "5",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "tertiary",
  			junction: "roundabout",
  			lit: "yes",
  			sidewalk: "right",
  			surface: "asphalt",
  			id: "way/448480914"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6500727,
  					46.7812967
  				],
  				[
  					6.6500877,
  					46.7813171
  				],
  				[
  					6.6500948,
  					46.7813393
  				],
  				[
  					6.6500923,
  					46.7813669
  				],
  				[
  					6.6500779,
  					46.7813927
  				],
  				[
  					6.6500631,
  					46.7814069
  				],
  				[
  					6.6500447,
  					46.781419
  				],
  				[
  					6.6500111,
  					46.7814321
  				],
  				[
  					6.6499734,
  					46.7814381
  				],
  				[
  					6.6499379,
  					46.7814368
  				],
  				[
  					6.6499042,
  					46.7814291
  				],
  				[
  					6.6498747,
  					46.7814156
  				],
  				[
  					6.6498511,
  					46.7813967
  				],
  				[
  					6.6498358,
  					46.7813741
  				],
  				[
  					6.64983,
  					46.7813496
  				],
  				[
  					6.6498353,
  					46.781322
  				],
  				[
  					6.6498525,
  					46.7812968
  				],
  				[
  					6.6498801,
  					46.7812764
  				],
  				[
  					6.6499093,
  					46.7812643
  				],
  				[
  					6.649942,
  					46.7812578
  				],
  				[
  					6.6499761,
  					46.7812571
  				],
  				[
  					6.650016,
  					46.7812643
  				],
  				[
  					6.6500508,
  					46.7812796
  				],
  				[
  					6.6500727,
  					46.7812967
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/450188798",
  		properties: {
  			timestamp: "2016-10-30T09:28:20Z",
  			version: "1",
  			changeset: "43279853",
  			user: "JohEcu",
  			uid: "4403747",
  			highway: "service",
  			oneway: "no",
  			id: "way/450188798"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6487309,
  					46.7788773
  				],
  				[
  					6.6488065,
  					46.7790379
  				],
  				[
  					6.6488625,
  					46.7791416
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/450188801",
  		properties: {
  			timestamp: "2016-10-30T09:28:20Z",
  			version: "1",
  			changeset: "43279853",
  			user: "JohEcu",
  			uid: "4403747",
  			highway: "service",
  			oneway: "yes",
  			id: "way/450188801"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6488625,
  					46.7791416
  				],
  				[
  					6.6490947,
  					46.7790911
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/456768814",
  		properties: {
  			timestamp: "2020-11-27T07:52:13Z",
  			version: "3",
  			changeset: "94878945",
  			user: "schnelli",
  			uid: "225842",
  			highway: "footway",
  			lit: "no",
  			surface: "asphalt",
  			id: "way/456768814"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.646028,
  					46.7809283
  				],
  				[
  					6.6458444,
  					46.7807015
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/473333230",
  		properties: {
  			timestamp: "2020-12-21T10:20:54Z",
  			version: "2",
  			changeset: "96186563",
  			user: "imagoiq_",
  			uid: "1856092",
  			highway: "service",
  			id: "way/473333230"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6466902,
  					46.7800193
  				],
  				[
  					6.6467103,
  					46.7800145
  				],
  				[
  					6.6487658,
  					46.7795152
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/483951371",
  		properties: {
  			timestamp: "2021-03-05T22:07:39Z",
  			version: "4",
  			changeset: "100516456",
  			user: "JohEcu",
  			uid: "4403747",
  			bicycle: "yes",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "2",
  			id: "way/483951371"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6500434,
  					46.7792237
  				],
  				[
  					6.6490914,
  					46.7794435
  				],
  				[
  					6.6490006,
  					46.7794823
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/555310693",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "5",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			crossing: "marked",
  			"crossing:island": "yes",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/555310693"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6497742,
  					46.7814866
  				],
  				[
  					6.6497438,
  					46.7814513
  				],
  				[
  					6.6497133,
  					46.781416
  				],
  				[
  					6.6496945,
  					46.7813942
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/673902199",
  		properties: {
  			timestamp: "2021-03-13T21:02:34Z",
  			version: "3",
  			changeset: "100969432",
  			user: "swiss_knight",
  			uid: "10123181",
  			access: "private",
  			covered: "yes",
  			highway: "service",
  			motor_vehicle: "private",
  			service: "driveway",
  			surface: "asphalt",
  			tunnel: "building_passage",
  			id: "way/673902199"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6449983,
  					46.7789697
  				],
  				[
  					6.6451009,
  					46.7790865
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/701102981",
  		properties: {
  			timestamp: "2019-12-13T15:41:44Z",
  			version: "3",
  			changeset: "78382383",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "marked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "4",
  			id: "way/701102981"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6461921,
  					46.7791026
  				],
  				[
  					6.6460976,
  					46.7791238
  				],
  				[
  					6.6459886,
  					46.7791483
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/701102982",
  		properties: {
  			timestamp: "2019-12-13T15:41:44Z",
  			version: "5",
  			changeset: "78382383",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			highway: "footway",
  			id: "way/701102982"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6459886,
  					46.7791483
  				],
  				[
  					6.6458796,
  					46.7791728
  				],
  				[
  					6.6445923,
  					46.7794625
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/701102983",
  		properties: {
  			timestamp: "2021-03-13T20:36:08Z",
  			version: "5",
  			changeset: "100968595",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "2",
  			id: "way/701102983"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6458498,
  					46.7789684
  				],
  				[
  					6.6457883,
  					46.7789827
  				],
  				[
  					6.6455044,
  					46.7790489
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/722952661",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "5",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "marked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "2",
  			id: "way/722952661"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6482899,
  					46.7812136
  				],
  				[
  					6.6483382,
  					46.7811947
  				],
  				[
  					6.6484592,
  					46.7811479
  				],
  				[
  					6.6485447,
  					46.7811274
  				],
  				[
  					6.6485918,
  					46.7811239
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186488",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "6",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/738186488"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.644506,
  					46.7819664
  				],
  				[
  					6.6445558,
  					46.7820278
  				],
  				[
  					6.6446958,
  					46.7822128
  				],
  				[
  					6.6449466,
  					46.7825292
  				],
  				[
  					6.6452842,
  					46.7829732
  				],
  				[
  					6.6453031,
  					46.782989
  				],
  				[
  					6.6453146,
  					46.7829898
  				],
  				[
  					6.6453602,
  					46.7829806
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186489",
  		properties: {
  			timestamp: "2020-12-07T14:54:39Z",
  			version: "2",
  			changeset: "95429063",
  			user: "schnelli",
  			uid: "225842",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			id: "way/738186489"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6488785,
  					46.7795172
  				],
  				[
  					6.6489441,
  					46.7794996
  				],
  				[
  					6.6490006,
  					46.7794823
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186490",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "2",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			highway: "footway",
  			incline: "4%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "3",
  			id: "way/738186490"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6488492,
  					46.779498
  				],
  				[
  					6.6487658,
  					46.7795152
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186491",
  		properties: {
  			timestamp: "2020-11-27T07:40:57Z",
  			version: "4",
  			changeset: "94878945",
  			user: "schnelli",
  			uid: "225842",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/738186491"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6455976,
  					46.7828784
  				],
  				[
  					6.6456324,
  					46.7828656
  				],
  				[
  					6.6456737,
  					46.7828505
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186492",
  		properties: {
  			timestamp: "2020-01-26T16:20:07Z",
  			version: "4",
  			changeset: "80101552",
  			user: "ohusser70",
  			uid: "7500047",
  			bridge: "yes",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			layer: "1",
  			lit: "yes",
  			smoothness: "good",
  			surface: "concrete",
  			width: "2",
  			id: "way/738186492"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6453602,
  					46.7829806
  				],
  				[
  					6.645463,
  					46.7829363
  				],
  				[
  					6.6455976,
  					46.7828784
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186493",
  		properties: {
  			timestamp: "2019-11-04T11:27:34Z",
  			version: "2",
  			changeset: "76586471",
  			user: "swiss_knight",
  			uid: "10123181",
  			crossing: "marked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/738186493"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6470171,
  					46.7823667
  				],
  				[
  					6.6471354,
  					46.7823225
  				],
  				[
  					6.6471931,
  					46.782301
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186494",
  		properties: {
  			timestamp: "2019-12-06T14:23:15Z",
  			version: "6",
  			changeset: "78057413",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/738186494"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6471931,
  					46.782301
  				],
  				[
  					6.6473076,
  					46.7822594
  				],
  				[
  					6.6487035,
  					46.7817532
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186495",
  		properties: {
  			timestamp: "2020-12-07T14:54:42Z",
  			version: "3",
  			changeset: "95429063",
  			user: "schnelli",
  			uid: "225842",
  			footway: "sidewalk",
  			highway: "footway",
  			layer: "-1",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tunnel: "yes",
  			width: "1.5",
  			id: "way/738186495"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.649026,
  					46.7797557
  				],
  				[
  					6.6489394,
  					46.7795789
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186496",
  		properties: {
  			timestamp: "2021-03-05T22:07:39Z",
  			version: "5",
  			changeset: "100516456",
  			user: "JohEcu",
  			uid: "4403747",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/738186496"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6489394,
  					46.7795789
  				],
  				[
  					6.6488785,
  					46.7795172
  				],
  				[
  					6.6488492,
  					46.779498
  				],
  				[
  					6.6488011,
  					46.7794655
  				],
  				[
  					6.6487123,
  					46.77938
  				],
  				[
  					6.6484589,
  					46.7789449
  				],
  				[
  					6.6483084,
  					46.7786937
  				],
  				[
  					6.6482593,
  					46.7786468
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186499",
  		properties: {
  			timestamp: "2020-11-27T07:41:01Z",
  			version: "4",
  			changeset: "94878945",
  			user: "schnelli",
  			uid: "225842",
  			crossing: "marked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			id: "way/738186499"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6458729,
  					46.7828982
  				],
  				[
  					6.6458443,
  					46.7828588
  				],
  				[
  					6.6458038,
  					46.782803
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186500",
  		properties: {
  			timestamp: "2019-11-04T11:27:34Z",
  			version: "2",
  			changeset: "76586471",
  			user: "swiss_knight",
  			uid: "10123181",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/738186500"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.649251,
  					46.7816634
  				],
  				[
  					6.6492181,
  					46.7816757
  				],
  				[
  					6.6491777,
  					46.7816907
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186501",
  		properties: {
  			timestamp: "2019-11-04T11:27:34Z",
  			version: "2",
  			changeset: "76586471",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "2",
  			id: "way/738186501"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6491777,
  					46.7816907
  				],
  				[
  					6.6487219,
  					46.7818603
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186502",
  		properties: {
  			timestamp: "2019-11-04T11:27:34Z",
  			version: "2",
  			changeset: "76586471",
  			user: "swiss_knight",
  			uid: "10123181",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/738186502"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6487219,
  					46.7818603
  				],
  				[
  					6.6486872,
  					46.7818732
  				],
  				[
  					6.6486534,
  					46.7818857
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186503",
  		properties: {
  			timestamp: "2019-12-06T14:23:15Z",
  			version: "4",
  			changeset: "78057413",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "2",
  			id: "way/738186503"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6486534,
  					46.7818857
  				],
  				[
  					6.6484732,
  					46.7819528
  				],
  				[
  					6.6473805,
  					46.7823585
  				],
  				[
  					6.6471385,
  					46.7824484
  				],
  				[
  					6.6460214,
  					46.7828488
  				],
  				[
  					6.6458729,
  					46.7828982
  				],
  				[
  					6.6457991,
  					46.7829383
  				],
  				[
  					6.6457871,
  					46.7829885
  				],
  				[
  					6.6457976,
  					46.7830214
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186504",
  		properties: {
  			timestamp: "2019-10-24T10:24:14Z",
  			version: "1",
  			changeset: "76145659",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			id: "way/738186504"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6496059,
  					46.782196
  				],
  				[
  					6.6496799,
  					46.7822952
  				],
  				[
  					6.649142,
  					46.7824832
  				],
  				[
  					6.6490655,
  					46.7823806
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186505",
  		properties: {
  			timestamp: "2019-10-24T10:24:14Z",
  			version: "1",
  			changeset: "76145659",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			layer: "-1",
  			tunnel: "yes",
  			id: "way/738186505"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6494846,
  					46.7820332
  				],
  				[
  					6.6496059,
  					46.782196
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186506",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "2",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			id: "way/738186506"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6489504,
  					46.7822262
  				],
  				[
  					6.6488605,
  					46.7821056
  				],
  				[
  					6.6486872,
  					46.7818732
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738186507",
  		properties: {
  			timestamp: "2019-10-24T10:24:14Z",
  			version: "1",
  			changeset: "76145659",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			layer: "-1",
  			tunnel: "yes",
  			id: "way/738186507"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6490655,
  					46.7823806
  				],
  				[
  					6.6489504,
  					46.7822262
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738493584",
  		properties: {
  			timestamp: "2019-11-04T11:27:34Z",
  			version: "2",
  			changeset: "76586471",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.8",
  			id: "way/738493584"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6496072,
  					46.7805805
  				],
  				[
  					6.6496697,
  					46.7806974
  				],
  				[
  					6.6497084,
  					46.7807191
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738493586",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.8",
  			id: "way/738493586"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6498642,
  					46.7810066
  				],
  				[
  					6.6498892,
  					46.7810697
  				],
  				[
  					6.6499133,
  					46.7811207
  				],
  				[
  					6.6499374,
  					46.7811639
  				],
  				[
  					6.6499653,
  					46.7811914
  				],
  				[
  					6.6500173,
  					46.781217
  				],
  				[
  					6.6500867,
  					46.7812216
  				],
  				[
  					6.6501451,
  					46.7812166
  				],
  				[
  					6.6502176,
  					46.7812058
  				],
  				[
  					6.6512776,
  					46.7808251
  				],
  				[
  					6.6513801,
  					46.7807883
  				],
  				[
  					6.6514294,
  					46.7807832
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738493587",
  		properties: {
  			timestamp: "2019-11-04T11:27:34Z",
  			version: "2",
  			changeset: "76586471",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.2",
  			id: "way/738493587"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6497084,
  					46.7807191
  				],
  				[
  					6.6498642,
  					46.7810066
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738493588",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			crossing: "marked",
  			"crossing:island": "yes",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/738493588"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6499374,
  					46.7811639
  				],
  				[
  					6.649897,
  					46.7811737
  				],
  				[
  					6.6498222,
  					46.7811917
  				],
  				[
  					6.6497851,
  					46.7812007
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/739737473",
  		properties: {
  			timestamp: "2020-11-27T07:40:10Z",
  			version: "4",
  			changeset: "94878945",
  			user: "schnelli",
  			uid: "225842",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/739737473"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6448309,
  					46.7825819
  				],
  				[
  					6.645056,
  					46.7828659
  				],
  				[
  					6.6451522,
  					46.7829989
  				],
  				[
  					6.6451552,
  					46.7830163
  				],
  				[
  					6.6451575,
  					46.7830509
  				],
  				[
  					6.6451433,
  					46.7830817
  				],
  				[
  					6.6450992,
  					46.7831186
  				],
  				[
  					6.6444247,
  					46.7834964
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/739737479",
  		properties: {
  			timestamp: "2020-11-27T07:39:58Z",
  			version: "3",
  			changeset: "94878945",
  			user: "schnelli",
  			uid: "225842",
  			crossing: "marked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/739737479"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6452842,
  					46.7829732
  				],
  				[
  					6.645205,
  					46.7829996
  				],
  				[
  					6.6451552,
  					46.7830163
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/739737480",
  		properties: {
  			timestamp: "2020-11-27T07:40:26Z",
  			version: "3",
  			changeset: "94878945",
  			user: "schnelli",
  			uid: "225842",
  			crossing: "marked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/739737480"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6454294,
  					46.7831051
  				],
  				[
  					6.6453781,
  					46.7830536
  				],
  				[
  					6.6453146,
  					46.7829898
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/739743833",
  		properties: {
  			timestamp: "2021-03-05T22:07:39Z",
  			version: "4",
  			changeset: "100516456",
  			user: "JohEcu",
  			uid: "4403747",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "3",
  			id: "way/739743833"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6482593,
  					46.7786468
  				],
  				[
  					6.6481101,
  					46.7786806
  				],
  				[
  					6.6476351,
  					46.7787787
  				],
  				[
  					6.6461921,
  					46.7791026
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/741873164",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "2",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "2",
  			id: "way/741873164"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6509857,
  					46.7833494
  				],
  				[
  					6.6509335,
  					46.7831742
  				],
  				[
  					6.650139,
  					46.7817848
  				],
  				[
  					6.6499872,
  					46.7815411
  				],
  				[
  					6.6498795,
  					46.7814933
  				],
  				[
  					6.6497742,
  					46.7814866
  				],
  				[
  					6.6497193,
  					46.7814984
  				],
  				[
  					6.6496563,
  					46.7815127
  				],
  				[
  					6.649251,
  					46.7816634
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/741873167",
  		properties: {
  			timestamp: "2020-12-07T14:55:01Z",
  			version: "3",
  			changeset: "95429096",
  			user: "schnelli",
  			uid: "225842",
  			cycleway: "lane",
  			highway: "residential",
  			lanes: "2",
  			maxspeed: "50",
  			name: "Rue de l'Industrie",
  			oneway: "no",
  			sidewalk: "yes",
  			surface: "asphalt",
  			id: "way/741873167"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6497981,
  					46.7810757
  				],
  				[
  					6.6493476,
  					46.7802709
  				],
  				[
  					6.6490703,
  					46.7797429
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/741873168",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "residential",
  			maxspeed: "50",
  			name: "Rue de l'Industrie",
  			oneway: "yes",
  			sidewalk: "right",
  			surface: "asphalt",
  			id: "way/741873168"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6498525,
  					46.7812968
  				],
  				[
  					6.6498222,
  					46.7811917
  				],
  				[
  					6.6497981,
  					46.7810757
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/741873170",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "residential",
  			maxspeed: "30",
  			name: "Avenue de la Plage",
  			oneway: "yes",
  			sidewalk: "right",
  			surface: "asphalt",
  			id: "way/741873170"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6500974,
  					46.7815792
  				],
  				[
  					6.6500351,
  					46.7815271
  				],
  				[
  					6.6499936,
  					46.7814844
  				],
  				[
  					6.6499379,
  					46.7814368
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/741873171",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "tertiary",
  			maxspeed: "50",
  			name: "Avenue des Sports",
  			oneway: "yes",
  			sidewalk: "right",
  			surface: "asphalt",
  			id: "way/741873171"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6496344,
  					46.781466
  				],
  				[
  					6.6497133,
  					46.781416
  				],
  				[
  					6.6498353,
  					46.781322
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/741873172",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "4",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "tertiary",
  			lit: "yes",
  			maxspeed: "50",
  			name: "Avenue des Sports",
  			oneway: "yes",
  			sidewalk: "right",
  			surface: "asphalt",
  			id: "way/741873172"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6499042,
  					46.7814291
  				],
  				[
  					6.6497438,
  					46.7814513
  				],
  				[
  					6.6496344,
  					46.781466
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/741873176",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "2",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			crossing: "marked",
  			"crossing:island": "yes",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "good",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/741873176"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6501184,
  					46.7815027
  				],
  				[
  					6.6500869,
  					46.7815119
  				],
  				[
  					6.6500351,
  					46.7815271
  				],
  				[
  					6.6499872,
  					46.7815411
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398948",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "1",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "unclassified",
  			"maxspeed:type": "CH:urban",
  			name: "Rue Saint-Roch",
  			sidewalk: "yes",
  			surface: "asphalt",
  			id: "way/750398948"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6460976,
  					46.7791238
  				],
  				[
  					6.6460844,
  					46.7791042
  				],
  				[
  					6.6460148,
  					46.7790255
  				],
  				[
  					6.6459499,
  					46.7789447
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398951",
  		properties: {
  			timestamp: "2021-03-05T22:07:39Z",
  			version: "4",
  			changeset: "100516456",
  			user: "JohEcu",
  			uid: "4403747",
  			bicycle: "yes",
  			cycleway: "lane",
  			highway: "residential",
  			lit: "yes",
  			"maxspeed:type": "CH:urban",
  			name: "Rue de l'Industrie",
  			oneway: "no",
  			sidewalk: "both",
  			surface: "asphalt",
  			id: "way/750398951"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6489441,
  					46.7794996
  				],
  				[
  					6.6489234,
  					46.7794623
  				],
  				[
  					6.6487541,
  					46.7792551
  				],
  				[
  					6.6485505,
  					46.7789121
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398952",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "1",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "yes",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			id: "way/750398952"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6492983,
  					46.780286
  				],
  				[
  					6.6493476,
  					46.7802709
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398953",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "1",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/750398953"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6492983,
  					46.780286
  				],
  				[
  					6.6492867,
  					46.7802572
  				],
  				[
  					6.6491341,
  					46.7799628
  				],
  				[
  					6.6490484,
  					46.7798133
  				],
  				[
  					6.649033,
  					46.77977
  				],
  				[
  					6.649026,
  					46.7797557
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398954",
  		properties: {
  			timestamp: "2020-03-23T18:32:29Z",
  			version: "2",
  			changeset: "82536742",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			oneway: "yes",
  			service: "parking_aisle",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			surface: "asphalt",
  			id: "way/750398954"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6487637,
  					46.781732
  				],
  				[
  					6.6483564,
  					46.7812178
  				],
  				[
  					6.6483382,
  					46.7811947
  				],
  				[
  					6.6478408,
  					46.7805596
  				],
  				[
  					6.6479958,
  					46.7805012
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398955",
  		properties: {
  			timestamp: "2021-03-14T10:14:49Z",
  			version: "3",
  			changeset: "100982685",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "no",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			surface: "asphalt",
  			id: "way/750398955"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6489777,
  					46.7816567
  				],
  				[
  					6.6489384,
  					46.7816067
  				],
  				[
  					6.6487388,
  					46.7813665
  				],
  				[
  					6.6485576,
  					46.7811436
  				],
  				[
  					6.6485447,
  					46.7811274
  				],
  				[
  					6.6481391,
  					46.7806312
  				],
  				[
  					6.6479958,
  					46.7805012
  				],
  				[
  					6.6478412,
  					46.7803442
  				],
  				[
  					6.6477044,
  					46.7803148
  				],
  				[
  					6.6475194,
  					46.7803552
  				],
  				[
  					6.646028,
  					46.7809283
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398956",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "1",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "yes",
  			id: "way/750398956"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6495325,
  					46.781452
  				],
  				[
  					6.6495479,
  					46.7814973
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398957",
  		properties: {
  			timestamp: "2020-03-23T18:32:29Z",
  			version: "2",
  			changeset: "82536742",
  			user: "swiss_knight",
  			uid: "10123181",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/750398957"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6494968,
  					46.7814642
  				],
  				[
  					6.6495325,
  					46.781452
  				],
  				[
  					6.6495602,
  					46.7814426
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398958",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "1",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "yes",
  			id: "way/750398958"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6486872,
  					46.7818732
  				],
  				[
  					6.6486489,
  					46.781822
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750398959",
  		properties: {
  			timestamp: "2019-11-28T09:55:11Z",
  			version: "1",
  			changeset: "77673835",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			id: "way/750398959"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6492181,
  					46.7816757
  				],
  				[
  					6.6493984,
  					46.7819176
  				],
  				[
  					6.6494846,
  					46.7820332
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750416432",
  		properties: {
  			timestamp: "2019-11-28T11:08:04Z",
  			version: "1",
  			changeset: "77676510",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			tactile_paving: "no",
  			id: "way/750416432"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6451727,
  					46.7791235
  				],
  				[
  					6.6451399,
  					46.7791309
  				],
  				[
  					6.6451034,
  					46.7791391
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750416433",
  		properties: {
  			timestamp: "2021-03-13T20:36:08Z",
  			version: "3",
  			changeset: "100968595",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "2",
  			id: "way/750416433"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6451034,
  					46.7791391
  				],
  				[
  					6.6447244,
  					46.7792243
  				],
  				[
  					6.6443471,
  					46.7793017
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750416434",
  		properties: {
  			timestamp: "2021-03-13T21:02:34Z",
  			version: "2",
  			changeset: "100969432",
  			user: "swiss_knight",
  			uid: "10123181",
  			access: "private",
  			covered: "no",
  			highway: "service",
  			motor_vehicle: "private",
  			service: "driveway",
  			sidewalk: "yes",
  			surface: "asphalt",
  			id: "way/750416434"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6451009,
  					46.7790865
  				],
  				[
  					6.6451399,
  					46.7791309
  				],
  				[
  					6.6452041,
  					46.779204
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750432874",
  		properties: {
  			timestamp: "2020-11-24T10:53:18Z",
  			version: "3",
  			changeset: "94700041",
  			user: "schnelli",
  			uid: "225842",
  			highway: "residential",
  			lit: "yes",
  			name: "Rue des Pêcheurs",
  			sidewalk: "yes",
  			surface: "asphalt",
  			id: "way/750432874"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6456791,
  					46.7829215
  				],
  				[
  					6.6457676,
  					46.7830342
  				],
  				[
  					6.6469409,
  					46.7845285
  				],
  				[
  					6.6473457,
  					46.785055
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750432875",
  		properties: {
  			timestamp: "2020-11-27T07:40:34Z",
  			version: "2",
  			changeset: "94878945",
  			user: "schnelli",
  			uid: "225842",
  			highway: "residential",
  			lit: "yes",
  			name: "Rue des Pêcheurs",
  			sidewalk: "yes",
  			surface: "asphalt",
  			id: "way/750432875"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6456324,
  					46.7828656
  				],
  				[
  					6.6456791,
  					46.7829215
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750432876",
  		properties: {
  			timestamp: "2019-11-28T12:11:37Z",
  			version: "1",
  			changeset: "77678782",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/750432876"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6456737,
  					46.7828505
  				],
  				[
  					6.6458038,
  					46.782803
  				],
  				[
  					6.6461858,
  					46.7826706
  				],
  				[
  					6.6470171,
  					46.7823667
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750432877",
  		properties: {
  			timestamp: "2019-11-28T12:11:37Z",
  			version: "1",
  			changeset: "77678782",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/750432877"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6487035,
  					46.7817532
  				],
  				[
  					6.6487637,
  					46.781732
  				],
  				[
  					6.6489777,
  					46.7816567
  				],
  				[
  					6.6490943,
  					46.7816157
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/750432878",
  		properties: {
  			timestamp: "2020-03-23T18:32:29Z",
  			version: "2",
  			changeset: "82536742",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/750432878"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6490943,
  					46.7816157
  				],
  				[
  					6.6494968,
  					46.7814642
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/751514787",
  		properties: {
  			timestamp: "2020-12-07T14:54:26Z",
  			version: "3",
  			changeset: "95429063",
  			user: "schnelli",
  			uid: "225842",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/751514787"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6486568,
  					46.7789468
  				],
  				[
  					6.6489749,
  					46.7794334
  				],
  				[
  					6.6490006,
  					46.7794823
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/753314958",
  		properties: {
  			timestamp: "2019-12-06T14:23:15Z",
  			version: "1",
  			changeset: "78057413",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "marked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "3",
  			id: "way/753314958"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6473076,
  					46.7822594
  				],
  				[
  					6.647335,
  					46.7822966
  				],
  				[
  					6.6473805,
  					46.7823585
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/753316723",
  		properties: {
  			timestamp: "2019-12-06T14:30:33Z",
  			version: "1",
  			changeset: "78057948",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			sidewalk: "yes",
  			id: "way/753316723"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6471354,
  					46.7823225
  				],
  				[
  					6.6471642,
  					46.7823583
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/755242219",
  		properties: {
  			timestamp: "2019-12-13T15:41:44Z",
  			version: "1",
  			changeset: "78382383",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "marked",
  			"crossing:island": "yes",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "4",
  			id: "way/755242219"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6457883,
  					46.7789827
  				],
  				[
  					6.6458285,
  					46.7790665
  				],
  				[
  					6.6458796,
  					46.7791728
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/756284396",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			highway: "service",
  			name: "Rue du Nord",
  			oneway: "yes",
  			sidewalk: "yes",
  			source: "Survey, Orthophoto Yverdon 2007 / HEIG-VD",
  			surface: "asphalt",
  			id: "way/756284396"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6447593,
  					46.7818223
  				],
  				[
  					6.6448214,
  					46.7818
  				],
  				[
  					6.6451212,
  					46.7816921
  				],
  				[
  					6.6458398,
  					46.7814179
  				],
  				[
  					6.6461811,
  					46.7812924
  				],
  				[
  					6.6462745,
  					46.7812983
  				],
  				[
  					6.6463462,
  					46.7813294
  				],
  				[
  					6.6467201,
  					46.7818069
  				],
  				[
  					6.6467599,
  					46.7817914
  				],
  				[
  					6.6471297,
  					46.7816475
  				],
  				[
  					6.6473894,
  					46.7815501
  				],
  				[
  					6.6480365,
  					46.7813045
  				],
  				[
  					6.6480995,
  					46.7813141
  				],
  				[
  					6.6483564,
  					46.7812178
  				],
  				[
  					6.6485576,
  					46.7811436
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/756284397",
  		properties: {
  			timestamp: "2020-03-23T18:32:29Z",
  			version: "2",
  			changeset: "82536742",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "bad",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			width: "2",
  			id: "way/756284397"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6488011,
  					46.7813401
  				],
  				[
  					6.6489514,
  					46.7812754
  				],
  				[
  					6.6491716,
  					46.7812171
  				],
  				[
  					6.6493349,
  					46.7810581
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/756284398",
  		properties: {
  			timestamp: "2019-12-17T15:24:25Z",
  			version: "1",
  			changeset: "78534163",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			highway: "steps",
  			source: "Orthophoto Yverdon 2007 / HEIG-VD",
  			step_count: "4",
  			surface: "asphalt",
  			width: "3",
  			id: "way/756284398"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6487714,
  					46.7813531
  				],
  				[
  					6.6488011,
  					46.7813401
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/756284399",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "3",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "yes",
  			foot: "designated",
  			highway: "footway",
  			incline: "2%",
  			smoothness: "bad",
  			surface: "asphalt",
  			width: "2",
  			id: "way/756284399"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6485918,
  					46.7811239
  				],
  				[
  					6.6486787,
  					46.7810903
  				],
  				[
  					6.6487674,
  					46.7812503
  				],
  				[
  					6.6488067,
  					46.7812551
  				],
  				[
  					6.6488521,
  					46.781253
  				],
  				[
  					6.6489514,
  					46.7812754
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/783997352",
  		properties: {
  			timestamp: "2020-03-23T18:32:29Z",
  			version: "1",
  			changeset: "82536742",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "bad",
  			surface: "asphalt",
  			width: "2",
  			id: "way/783997352"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6491716,
  					46.7812171
  				],
  				[
  					6.6492902,
  					46.7811959
  				],
  				[
  					6.6494675,
  					46.7812761
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/783997353",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "2",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/783997353"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6495602,
  					46.7814426
  				],
  				[
  					6.6496945,
  					46.7813942
  				],
  				[
  					6.6497366,
  					46.7813689
  				],
  				[
  					6.649776,
  					46.7813125
  				],
  				[
  					6.6497985,
  					46.7812646
  				],
  				[
  					6.6498031,
  					46.7812354
  				],
  				[
  					6.6497851,
  					46.7812007
  				],
  				[
  					6.6497718,
  					46.781175
  				],
  				[
  					6.6497313,
  					46.7810985
  				],
  				[
  					6.649551,
  					46.7807712
  				],
  				[
  					6.6493438,
  					46.7803985
  				],
  				[
  					6.6492983,
  					46.780286
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/892599509",
  		properties: {
  			timestamp: "2021-01-06T19:18:38Z",
  			version: "2",
  			changeset: "97068087",
  			user: "imagoiq_",
  			uid: "1856092",
  			highway: "steps",
  			indoor: "yes",
  			level: "0;1;2;3;4",
  			id: "way/892599509"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6477774,
  					46.7806814
  				],
  				[
  					6.6478292,
  					46.7806627
  				],
  				[
  					6.6478432,
  					46.780681
  				],
  				[
  					6.6477917,
  					46.7806995
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916798348",
  		properties: {
  			timestamp: "2021-03-13T21:02:34Z",
  			version: "2",
  			changeset: "100969432",
  			user: "swiss_knight",
  			uid: "10123181",
  			access: "private",
  			covered: "no",
  			highway: "service",
  			motor_vehicle: "private",
  			service: "driveway",
  			surface: "asphalt",
  			width: "2.5",
  			id: "way/916798348"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6447033,
  					46.7779964
  				],
  				[
  					6.6446644,
  					46.7780345
  				],
  				[
  					6.6446455,
  					46.7780755
  				],
  				[
  					6.6446512,
  					46.7781112
  				],
  				[
  					6.6453857,
  					46.7788967
  				],
  				[
  					6.6454986,
  					46.7790265
  				],
  				[
  					6.6454906,
  					46.779052
  				],
  				[
  					6.645477,
  					46.7790957
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916798349",
  		properties: {
  			timestamp: "2021-03-13T21:02:34Z",
  			version: "2",
  			changeset: "100969432",
  			user: "swiss_knight",
  			uid: "10123181",
  			access: "private",
  			covered: "no",
  			highway: "service",
  			motor_vehicle: "private",
  			service: "driveway",
  			surface: "asphalt",
  			width: "3",
  			id: "way/916798349"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6448403,
  					46.778398
  				],
  				[
  					6.6453571,
  					46.7789312
  				],
  				[
  					6.6454517,
  					46.7790607
  				],
  				[
  					6.645477,
  					46.7790957
  				],
  				[
  					6.645507,
  					46.7791373
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916798350",
  		properties: {
  			timestamp: "2021-03-13T20:36:08Z",
  			version: "1",
  			changeset: "100968595",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "2",
  			id: "way/916798350"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6454279,
  					46.7790661
  				],
  				[
  					6.6451727,
  					46.7791235
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916798351",
  		properties: {
  			timestamp: "2021-03-13T20:36:08Z",
  			version: "1",
  			changeset: "100968595",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "2",
  			id: "way/916798351"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6455044,
  					46.7790489
  				],
  				[
  					6.6454906,
  					46.779052
  				],
  				[
  					6.6454735,
  					46.7790559
  				],
  				[
  					6.6454517,
  					46.7790607
  				],
  				[
  					6.6454279,
  					46.7790661
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912781",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			covered: "no",
  			highway: "service",
  			oneway: "yes",
  			service: "parking_aisle",
  			smoothness: "good",
  			surface: "asphalt",
  			id: "way/916912781"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6471297,
  					46.7816475
  				],
  				[
  					6.6471112,
  					46.7816228
  				],
  				[
  					6.6470639,
  					46.7815599
  				],
  				[
  					6.647074,
  					46.7815453
  				],
  				[
  					6.6472783,
  					46.7814686
  				],
  				[
  					6.6473348,
  					46.7814803
  				],
  				[
  					6.6473706,
  					46.7815257
  				],
  				[
  					6.6473894,
  					46.7815501
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912784",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/916912784"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6480934,
  					46.7812949
  				],
  				[
  					6.6482742,
  					46.7812268
  				],
  				[
  					6.6482899,
  					46.7812136
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912785",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "permissive",
  			"crossing:island": "no",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			lit: "yes",
  			smoothness: "intermediate",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "4",
  			id: "way/916912785"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6479689,
  					46.7811833
  				],
  				[
  					6.6479724,
  					46.7811877
  				],
  				[
  					6.6480527,
  					46.7812876
  				],
  				[
  					6.6480934,
  					46.7812949
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912786",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/916912786"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6471931,
  					46.782301
  				],
  				[
  					6.6468366,
  					46.7818618
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912787",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "permissive",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "4",
  			id: "way/916912787"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6474269,
  					46.7815049
  				],
  				[
  					6.6473561,
  					46.7814106
  				],
  				[
  					6.6473607,
  					46.7813895
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912788",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			access: "yes",
  			handrail: "no",
  			highway: "steps",
  			step_count: "6",
  			surface: "concrete",
  			tactile_paving: "no",
  			width: "10",
  			id: "way/916912788"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6473607,
  					46.7813895
  				],
  				[
  					6.6473975,
  					46.7813471
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912789",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			access: "yes",
  			handrail: "no",
  			highway: "steps",
  			step_count: "6",
  			surface: "concrete",
  			tactile_paving: "no",
  			width: "10",
  			id: "way/916912789"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6473975,
  					46.7813471
  				],
  				[
  					6.6474146,
  					46.7813685
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912790",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "permissive",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "4",
  			id: "way/916912790"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6479724,
  					46.7811877
  				],
  				[
  					6.6475049,
  					46.7813594
  				],
  				[
  					6.6474695,
  					46.7813472
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912791",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			access: "yes",
  			handrail: "no",
  			highway: "steps",
  			step_count: "6",
  			tactile_paving: "no",
  			width: "10",
  			id: "way/916912791"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6473975,
  					46.7813471
  				],
  				[
  					6.6474695,
  					46.7813472
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912792",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "permissive",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "4",
  			id: "way/916912792"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6474695,
  					46.7813472
  				],
  				[
  					6.6474146,
  					46.7813685
  				],
  				[
  					6.6473607,
  					46.7813895
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912793",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/916912793"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6473939,
  					46.7815171
  				],
  				[
  					6.6474269,
  					46.7815049
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912794",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/916912794"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6473426,
  					46.7815361
  				],
  				[
  					6.6473706,
  					46.7815257
  				],
  				[
  					6.6473939,
  					46.7815171
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912795",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/916912795"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6471344,
  					46.7816139
  				],
  				[
  					6.6473426,
  					46.7815361
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912796",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/916912796"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6470901,
  					46.7816309
  				],
  				[
  					6.6471112,
  					46.7816228
  				],
  				[
  					6.6471344,
  					46.7816139
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912800",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/916912800"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6467457,
  					46.7817612
  				],
  				[
  					6.6468154,
  					46.7817348
  				],
  				[
  					6.6470901,
  					46.7816309
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912801",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/916912801"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6468366,
  					46.7818618
  				],
  				[
  					6.6468073,
  					46.7818448
  				],
  				[
  					6.6467865,
  					46.7818329
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912802",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			footway: "sidewalk",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/916912802"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6467865,
  					46.7818329
  				],
  				[
  					6.6467693,
  					46.7818115
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912803",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			crossing: "unmarked",
  			"crossing:island": "no",
  			foot: "designated",
  			footway: "crossing",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			tactile_paving: "no",
  			width: "1.5",
  			id: "way/916912803"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6467693,
  					46.7818115
  				],
  				[
  					6.6467599,
  					46.7817914
  				],
  				[
  					6.6467457,
  					46.7817612
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/916912805",
  		properties: {
  			timestamp: "2021-03-14T09:17:59Z",
  			version: "1",
  			changeset: "100981042",
  			user: "swiss_knight",
  			uid: "10123181",
  			bicycle: "dismount",
  			foot: "designated",
  			highway: "footway",
  			incline: "0%",
  			smoothness: "good",
  			surface: "asphalt",
  			width: "1.5",
  			id: "way/916912805"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					6.6468154,
  					46.7817348
  				],
  				[
  					6.6467452,
  					46.7816472
  				],
  				[
  					6.6467253,
  					46.7816466
  				],
  				[
  					6.646415,
  					46.7812573
  				],
  				[
  					6.6463755,
  					46.7812644
  				],
  				[
  					6.6463427,
  					46.7812247
  				],
  				[
  					6.6463513,
  					46.7812216
  				]
  			]
  		}
  	}
  ];

  const WIDTH = 800;
  const HEIGHT = 450;

  const projection = geoMercator()
    .fitExtent(
      [[0, 0], [WIDTH, HEIGHT]],
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[6.646,46.7795], [6.649,46.7825]]}
        }
    );

  const pathGenerator = geoPath().projection(projection);

  const svg = select('#map').append('svg')
    .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

    svg.selectAll('path.routes')
    .data(routes)
    .enter()
    .append('path')
    .attr('class', 'routes')
    .attr('d', pathGenerator)
    .attr('stroke', 'lightgrey')
    .attr('fill', 'none')
    .attr('stroke-width', 5);

  svg.selectAll('path.batiments')
    .data(batiments)
    .enter()
    .append('path')
    .attr('class', 'batiments')
    .attr('d', pathGenerator)
    .attr('fill', 'grey');

  svg.selectAll('circle')
    .data(arbres)
    .enter()
    .append('circle')
    .attr('cx', d => projection(d)[0])
    .attr('cy', d => projection(d)[1])
    .attr('r', 10)
    .attr('fill', 'green');

}());
