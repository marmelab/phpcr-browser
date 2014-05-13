/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'services/node-factory'
], function (mocks) {
  'use strict';

  describe('Service: NodeFactory', function () {
    var NodeFactory,
        ApiFoundation,
        SmartPropertyFactory,
        workspace,
        ObjectMapper,
        $rootScope,
        nodeData = {  name: 'node',
                      path: '/parent/node',
                      hasChildren: true,
                      reducedTree: 'reducedTree' ,
                      children: [],
                      properties: {
                        property: {
                          type: 'string',
                          value: 'data'
                        }
                      }
                    };

    // load the service's module
    beforeEach(module('browserApp'));
    beforeEach(function() {
      ApiFoundation =  mocks.getApiFoundationMock();
      SmartPropertyFactory = mocks.getSmartPropertyFactoryMock();
      workspace = mocks.getWorkspaceMock();
      ObjectMapper = mocks.getObjectMapperMock();

      module(function ($provide) {
        $provide.value('mbApiFoundation', ApiFoundation);
        $provide.value('mbSmartPropertyFactory', SmartPropertyFactory);
      });
    });

    beforeEach(inject(function ($injector) {
      NodeFactory = $injector.get('mbNodeFactory');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should accept only valid data', function () {
      expect(NodeFactory.accept(nodeData)).toBe(true);
      expect(NodeFactory.accept({ name: 'node' })).toBe(false);
    });

    it('should call createNode on ApiFoundation when create is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      node.create();
      expect(ApiFoundation.createNode).toHaveBeenCalledWith(
        workspace.getRepository().getName(),
        workspace.getName(),
        '/parent',
        nodeData.name
      );
    });

    it('should create smart properties', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      expect(SmartPropertyFactory.accept).toHaveBeenCalledWith({ name: 'property', value: nodeData.properties.property.value, type: nodeData.properties.property.type });
      expect(SmartPropertyFactory.build).toHaveBeenCalledWith({ name: 'property', value: nodeData.properties.property.value, type: nodeData.properties.property.type }, node);
      expect(SmartPropertyFactory.build.calls.length).toBe(1);
    });

    it('should return node data with getter', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      expect(node.getName()).toBe(nodeData.name);
      expect(node.getPath()).toBe(nodeData.path);
      expect(node.getWorkspace()).toEqual(workspace);
      expect(node.hasChildren()).toBe(nodeData.hasChildren);
      expect(node.getRawData()).toEqual(nodeData);
      expect(node.getReducedTree()).toEqual(nodeData.reducedTree);
      expect(node.getSlug()).toBe('_parent_node');
    });

    it('should call moveNode on ApiFoundation when move is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      node.move('/dest');
      expect(ApiFoundation.moveNode).toHaveBeenCalledWith(
        workspace.getRepository().getName(),
        workspace.getName(),
        nodeData.path,
        '/dest/' + nodeData.name,
        { cache: false }
      );
    });

    it('should call deleteNode on ApiFoundation when delete is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      node.delete();
      expect(ApiFoundation.deleteNode).toHaveBeenCalledWith(
        workspace.getRepository().getName(),
        workspace.getName(),
        nodeData.path,
        { cache: false }
      );
    });

    it('should call find on ObjectMapper when getChildren is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      node.getChildren();
      expect(ObjectMapper.find).toHaveBeenCalledWith(
        '/' +
        workspace.getRepository().getName() + '/' +
        workspace.getName() +
        nodeData.path
      );
    });

    it('should call find on ObjectMapper when getParent is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      node.getParent();
      expect(ObjectMapper.find).toHaveBeenCalledWith(
        '/' +
        workspace.getRepository().getName() + '/' +
        workspace.getName() +
        '/parent'
      );
    });

    it('should call createNodeProperty on ApiFoundation when createProperty is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      var property = { name: 'number', value: 5, type: 'int' };

      node.createProperty(property.name, property.value, property.type);
      expect(ApiFoundation.createNodeProperty).toHaveBeenCalledWith(
        workspace.getRepository().getName(),
        workspace.getName(),
        nodeData.path,
        property.name,
        property.value,
        property.type,
        {cache: false}
      );

      expect(SmartPropertyFactory.build).toHaveBeenCalledWith(property, node);
      expect(SmartPropertyFactory.build.calls.length).toBe(2);
    });

    it('should call deleteNodeProperty on ApiFoundation when deleteProperty is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);
      node.deleteProperty('number');
      expect(ApiFoundation.deleteNodeProperty).toHaveBeenCalledWith(
        workspace.getRepository().getName(),
        workspace.getName(),
        nodeData.path,
        'number',
        {cache: false}
      );
    });

    it('should call getNode on ApiFoundation when getProperties is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);

      node.getProperties(false);
      expect(ApiFoundation.getNode).toHaveBeenCalledWith(
        workspace.getRepository().getName(),
        workspace.getName(),
        nodeData.path,
        {cache: false}
      );

      expect(SmartPropertyFactory.build).toHaveBeenCalledWith(nodeData.properties.property, node);
      expect(SmartPropertyFactory.build.calls.length).toBe(3); // 3 because node returns by the api has 2 properties (see fixture)
    });

    it('should call updateNodeProperty on ApiFoundation when updateProperty is called', function () {
      var node = NodeFactory.build(nodeData, workspace, ObjectMapper.find);

      node.setProperty('property', nodeData.properties.property.value, nodeData.properties.property.type);
      $rootScope.$apply();
      expect(ApiFoundation.updateNodeProperty).toHaveBeenCalledWith(
        workspace.getRepository().getName(),
        workspace.getName(),
        nodeData.path,
        'property',
        nodeData.properties.property.value,
        nodeData.properties.property.type,
        {cache: false}
      );

      expect(SmartPropertyFactory.build).toHaveBeenCalledWith(nodeData.properties.property, node);
      expect(SmartPropertyFactory.build.calls.length).toBe(1);
    });
  });
});
