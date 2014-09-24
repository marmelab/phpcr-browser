define('mock/Injector', [
    'mock/Restangular',
    'mock/Graph',
    'mock/Progress',
    'mock/TreeFactory',
    'mock/State',
    'mock/Q',
    'angular',
    'angular-mocks'
], function(Restangular, Graph, Progress, TreeFactory, State, Q, angular) {
    'use strict';

    var spyExclusionList = [
        'callee',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        '__defineGetter__',
        '__lookupGetter__',
        '__defineSetter__',
        '__lookupSetter__'
    ].concat(Object.getOwnPropertyNames(Object.__proto__));

    function Injector() {
        this.$$injector = angular.injector(['ngMock']);
        this.instances = {
            '$injector': this
        };

        this.$$init();
    }

    Injector.prototype.$$init = function() {
        this.service('Restangular', Restangular);
        this.service('$graph', Graph);
        this.service('$progress', Progress);
        this.provider('$treeFactory', function() { this.$get = function() { return TreeFactory } });
        this.service('$state', State);
        this.service('$q', Q);
    };

    Injector.prototype.provider = function(name, value) {
        var instance = this.invoke(
            this.instantiate(value).$get,
            name
        );

        this.set(name, instance);
    };

    Injector.prototype.service = function(name, value) {
        var instance = this.instantiate(value)

        this.set(name, instance);
    };

    Injector.prototype.get = function(name) {
        if (this.instances[name]) {
            return this.instances[name];
        }

        var instance = this.$$injector.get(name);

        this.$$spyObject(instance, true);
        this.set(name, instance);

        return instance;
    };

    Injector.prototype.set = function(name, object) {
        this.instances[name] = object;

        return this;
    }

    Injector.prototype.invoke = function(callback, spyName) {
        if (!angular.isArray(callback)) {
            callback = [callback];
        }

        callback = angular.copy(callback);

        var constructor = callback.pop();

        var object = constructor.apply(constructor, this.$$resolve(callback));
        object = angular.extend(jasmine.createSpy(spyName).andCallFake(object), object);

        this.$$spyObject(object);

        return object;
    }

    Injector.prototype.instantiate = function(callback, dependencies) {
        dependencies = dependencies || {};

        var self = this;

        angular.forEach(dependencies, function(dependency, name) {
            self.set(name, dependency);
        });

        var args = callback.$inject ? angular.copy(callback.$inject) : [];

        return this.$$construct(callback, this.$$resolve(args));
    }

    Injector.prototype.$$construct = function(constructor, args) {
        function F() {
            return constructor.apply(this, args);
        }

        F.prototype = constructor.prototype;

        var instance = new F();
        this.$$spyObject(instance);

        return instance;
    }

    Injector.prototype.$$spyObject = function(object, ignorePrivate) {
        ignorePrivate = ignorePrivate !== undefined ? ignorePrivate : false;

        angular.forEach(Object.getOwnPropertyNames(object.__proto__), function(property) {;
            if (ignorePrivate && property.slice(0, 2) === '$$') {
                return;
            }

            if (spyExclusionList.indexOf(property) === -1 && typeof(object[property]) === 'function') {

                spyOn(object, property).andCallThrough();
            }
        });
    };

    Injector.prototype.$$resolve = function(dependencies) {
        var args = [],
            self = this
        ;

        angular.forEach(dependencies, function(dependencyName) {
            args.push(self.get(dependencyName));
        });

        return args;
    };

    return Injector;
});
