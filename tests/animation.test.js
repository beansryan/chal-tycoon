import test from 'node:test';
import assert from 'node:assert/strict';
import {characterFrame} from '../src/characters.js';
test('walking uses whole poses and appropriate direction',()=>{const c={id:0,x:5,y:5,state:'walk',path:[{x:5,y:6}]};assert.equal(characterFrame(c,0),8);assert.equal(characterFrame(c,1/7),9);assert.equal(characterFrame(c,3/7),10);c.path=[{x:5,y:4}];assert.equal(characterFrame(c,0),12);c.path=[{x:4,y:5}];assert.equal(characterFrame(c,0),14);c.path=[{x:6,y:5}];assert.equal(characterFrame(c,0),15)});
test('employee serving and reduced motion choose coherent complete frames',()=>{const c={id:1,state:'staff',action:true};assert.equal(characterFrame(c,.6,true),3);assert.equal(characterFrame(c,.6,true,true),0);const walk={id:0,x:0,y:0,state:'walk',path:[{x:0,y:1}]};assert.equal(characterFrame(walk,1/7,false,true),8)});
