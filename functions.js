const exec = require('child_process').exec;
const BrowserWindow = require('electron').remote.BrowserWindow // windowオブジェクト
const path = require('path')
const fs = require('fs')


window.jQuery = window.$ = require('./jquery-3.1.0.js')
sRed = function(str){ return '<span style="color:red;">'+str+'</span>'}
sCrimson = function(str){ return '<span style="color:Crimson;">'+str+'</span>'}
sPink = function(str){ return '<span style="color:pink;">'+str+'</span>'}
sBlue = function(str){ return '<span style="color:blue;">'+str+'</span>'}
sDodgerBlue = function(str){ return '<span style="color:dodgerBlue;">'+str+'</span>'}


sGray = function(str){ return '<span style="color:gray;">'+str+'</span>'}
sSilver = function(str){ return '<span style="color:silver;">'+str+'</span>'}

sBold= function(str){ return '<span style="font-weight:bold;">'+str+'</span>'}
//osコマンド非同期実行
osrun = function(command, cb){
  exec(command, (error, stdout, stderr) => {
    if (typeof cb == "function") cb(stdout)
  })
}
