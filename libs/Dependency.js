"use strict";

var Dependency  = function(name, hooks){
  this.name   = name;
  this.hooks  = hooks;
};


Dependency.prototype.isInstalled  = function(){
  return this.hooks.isInstalled ? this.hooks.isInstalled() : false;
};

Dependency.prototype.install  = function(){
  return this.hooks.install ? this.hooks.install() : false;
};

Dependency.prototype.setup  = function(){
  return this.hooks.setup ? this.hooks.setup() : false;
};
