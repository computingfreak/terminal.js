var myUtil = require('../util');
var inherits = require('util').inherits;
var HtmlOutput = require('./html.js');

function DomOutput(buffer, writer, target, opts) {
	this.html = new HtmlOutput(buffer, opts);
	target.innerHTML = "<div style='visibility:hidden;'></div>";
	this.spacer = target.firstChild;
	this.cursorView = null;
	DomOutput.super_.apply(this, arguments);
	this._opts.adhesiveCursor = true;
	this._updateHeight();
}
inherits(DomOutput, require('./live_base.js'));
module.exports = DomOutput;

DomOutput.prototype._detach = function(view, blk) {
	var parent = view.parentNode;
	var next = view.nextSibling;
	parent.removeChild(view);
	blk.call(this, view);
	if(next)
		parent.insertBefore(view, next);
	else
		parent.appendChild(view);
	return view;
};

DomOutput.prototype.createView = function() {
	var e = this.target.ownerDocument.createElement("div");
	return e;
};

DomOutput.prototype.removeLine = function(number, view) {
	this._updateHeight();
	return this.target.removeChild(view);
};

DomOutput.prototype.changeLine = function(number, view, line, cursor) {
	// replace a node with its modified clone ist much faster as setting innerHTML directly.
	// see: http://blog.stevenlevithan.com/archives/faster-than-innerhtml
	//view.innerHTML = this.html._renderLine(line, cursor);
	return this._detach(view, function(v) {
		v.innerHTML = this.html._renderLine(line, cursor);
		this.html._mkAttr(line.attr, {$line:true}, v);
	});
};

DomOutput.prototype.insertLine = function(number, view, line, cursor) {
	view.innerHTML = this.html._renderLine(line, cursor);
	this.html._mkAttr(line.attr, {$line:true}, view);
	this.target.insertBefore(view, this.target.childNodes[number]);
	this._updateHeight();
	return view;
};

DomOutput.prototype.changeLed = function(l1, l2, l3, l4) {

};

DomOutput.prototype.setCursor = function(x, y) {
};

DomOutput.prototype.resize = function(x, y) {
	this.target.lastChild.innerHTML = this.html._genWidthString();
};

DomOutput.prototype.commit = function() {

};
DomOutput.prototype._updateHeight = function() {
	var diff = this.buffer.height - this.buffer.getBufferHeight();

	var html = myUtil.repeat('&nbsp', this.buffer.width) +
		myUtil.repeat('<br />&nbsp', diff-1);

	this._detach(this.spacer, function(s) {
		s.innerHTML = html;
		s.lineHeight = diff === 0 ? '0' : 'inherit';
	});
};

DomOutput.canHandle = function(target) {
	// Test if target is some kind of DOM-Element
	return target !== null && typeof target === 'object' && 'ownerDocument' in target;
};
