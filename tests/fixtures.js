/*global define*/
/* jshint indent:2 */

define('fixtures', [], function () {
  'use strict';

  var repositories = [
    {
      'name':'test',
      'factoryName':'jackalope.jackrabbit',
      'support':[
        'workspace.create',
        'node.property.create',
        'node.property.delete',
        'node.property.update',
        'node.delete',
        'node.create',
        'node.move'
      ]
    }
  ];

  var workspaces = [
    {
      name: 'default'
    },
    {
      name: 'security'
    }
  ];

  var node = {
    reducedTree: [
      {
        name: '/',
        path: '/',
        hasChildren: true,
        children: [
          {
            name: 'jcr:system',
            path: '/jcr:system',
            hasChildren: true,
            children: [ ]
          },
          {
            name: 'rep:policy',
            path: '/rep:policy',
            hasChildren: true,
            children: [ ]
          },
          {
            name: 'testnode1',
            path: '/testnode1',
            hasChildren: false,
            children: [ ]
          },
          {
            name: 'testnode2',
            path: '/testnode2',
            hasChildren: false,
            children: [ ]
          }
        ]
      }
    ],
    name: false,
    path: '/',
    repository: 'test',
    workspace: 'default',
    children: [
      {
        name: 'jcr:system',
        path: '/jcr:system',
        children: [],
        hasChildren: true
      },
      {
        name: 'rep:policy',
        path: '/rep:policy',
        children: [],
        hasChildren: true
      },
      {
        name: 'testnode1',
        path: '/testnode1',
        children: [],
        hasChildren: false
      },
      {
        name: 'testnode2',
        path: '/testnode2',
        children: [ ],
        hasChildren: false
      }
    ],
    hasChildren: true,
    properties: {
      'jcr:mixinTypes': {
        value: [
          'rep:AccessControllable'
        ],
        type: 7
      },
      'jcr:primaryType': {
        value: 'rep:root',
        type: 7
      }
    }
  };

  return {
    repositories: repositories,
    workspaces: workspaces,
    node: node
  };
});
