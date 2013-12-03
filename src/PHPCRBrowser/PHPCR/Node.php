<?php

/*
 * This file is part of the marmelab/phpcr-browser package
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace PHPCRBrowser\PHPCR;

use PHPCR\NodeInterface;

/**
 * Node is a wrapper for a PHPCR Node
 * Helps us to add metadata to it and provides more control possibilities
 *
 * @author  Robin Bressan <robin@bmarmelab.comn>
 *
 * @api
 */
class Node
{
    /**
     * PHPCR Node the session refers to
     *
     * @var \PHPCR\NodeInterface $session The PHPCR Session
     */
    private $node;

    /**
     * Node constructor
     *
     * @param \PHPCR\NodeInterface The wrapped node
     *
     * @api
     */
    public function __construct(NodeInterface $node)
    {
        $this->node = $node;
    }

    /**
    * @see \PHPCR\NodeInterface::getNode
    */
    public function getNode($path)
    {
        return new Node($this->node->getNode($path));
    }

    /**
    * @see \PHPCR\NodeInterface::getNodes
    */
    public function getNodes($filter = null)
    {
        $nodes = $this->node->getNodes($filter);
        foreach ($nodes as $name=>$node) {
            $nodes[$name] = new Node($node);
        }

        return $nodes;
    }

    /**
    * @see \PHPCR\NodeInterface::getParent
    */
    public function getParent(){
        return new Node($this->node->getParent());
    }

    /**
     * Call bridge with the wrapped PHPCR Node
     *
     * @param string $funcName Function's name
     * @param array  $args     Function's arguments
     */
    public function __call($funcName, $args)
    {
        return call_user_func_array(array($this->node, $funcName), $args);
    }

    /**
     * Return a the minimum tree to display for a node
     *
     * @param Node $node The target node
     *
     * @return array The tree
     *
     * @api
     */
    public static function getReducedTree(Node $node)
    {
        if($node->getPath() == '/'){
             return array( array( 
                'name'          =>  '/',
                'path'          =>  '/',
                'hasChildren'   =>  (count($node->getNodes()) > 0),
                'children'      =>  Node::processNodeForReducedTree($node, $node)
            ));
        }

        $parent = $node;
        do{
            $parent = $parent->getParent();
        }while($parent->getPath() != '/');
        return array( array( 
            'name'          =>  '/',
            'path'          =>  '/',
            'hasChildren'   =>  (count($parent->getNodes()) > 0),
            'children'      =>  Node::processNodeForReducedTree($parent, $node)
        ));
    }

    private static function processNodeForReducedTree(Node $node, Node $target){
        if(substr($target->getPath(),0, strlen($node->getPath())) != $node->getPath()){
            return array();
        }
        $tree = array();
        
        foreach($node->getNodes() as $child){
            $tree[] = array(
                'name'          =>  $child->getName(),
                'path'          =>  $child->getPath(),
                'hasChildren'   =>  (count($child->getNodes()) > 0),
                'children'      =>  Node::processNodeForReducedTree($child, $target)
            );
        }

        return $tree;
    }

    /**
     * Convert node's properties to array
     *
     * @return array Properties
     *
     * @api
     */
    public function getPropertiesToArray()
    {
        $array = array();

        foreach ($this->getProperties() as $property) {
            $array[sprintf('_node_prop_%s',$property->getName())] = $property->getValue();
        }

        return $array;
    }
}
